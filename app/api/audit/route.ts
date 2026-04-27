import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let user = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('[Audit] Authorization header found, using createClient');
      const token = authHeader.substring(7);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (error) {
        console.warn('[Audit] Error from getUser with token:', error);
      }
      user = authUser;
    }

    if (!user) {
      console.log('[Audit] Falling back to cookies...');
      const cookieStore = await cookies();
      const supabaseServer = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              cookieStore.delete({ name, ...options })
            },
          },
        }
      );

      const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
      user = session?.user || null;
      
      if (!user) {
        console.warn('[Audit] getSession failed:', sessionError);
        const { data: { user: authUser }, error: userError } = await supabaseServer.auth.getUser();
        user = authUser || null;
        if (!user) {
          console.error('[Audit] getUser also failed:', userError);
          return NextResponse.json({ 
            error: 'No autorizado', 
            message: 'No se pudo encontrar una sesión activa. Por favor, intenta cerrar sesión y volver a entrar.' 
          }, { status: 401 });
        }
      }
    }

    const body = await req.json();
    const { fileData, mimeType, appTotal } = body;

    console.log('[Audit] Incoming request:', {
      mimeType,
      appTotal,
      dataLength: fileData?.length
    });

    if (!fileData || !mimeType) {
      return NextResponse.json({ error: 'Faltan datos del archivo o tipo mime' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith('YOUR_')) {
      return NextResponse.json({ error: 'Falta configurar GROQ_API_KEY en el servidor' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const cleanBase64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const imageUrl = `data:${mimeType};base64,${cleanBase64}`;

    const prompt = `Analiza esta nómina española con extrema precisión. Extrae los siguientes datos en un objeto JSON puro:
    - periodo: Mes y año (ej. "Marzo 2026")
    - empresa_cif: CIF de la empresa (formato A12345678)
    - total_devengado: Total bruto antes de impuestos
    - payslipTotal: El NETO A PERCIBIR (líquido total)
    - concepts: Un objeto con los importes de cada concepto (pon 0 si no se encuentra):
        - salario_base: Salario base
        - antiguedad: Antigüedad / Plus antigüedad
        - plus_puesto: Plus puesto de trabajo / Plus responsabilidad
        - horas_extras: Importe total de horas extraordinarias
        - plus_festivos: Pluses por festivos o domingos
        - plus_post_festivo: Pluses por día después de festivo
        - plus_toxico: Plus penosidad/toxicidad/peligrosidad
        - plus_convenio: Plus convenio
        - plus_transporte: Plus transporte / Plus distancia
        - plus_vestuario: Plus vestuario / Plus herramientas
        - incentivos: Otros incentivos, gratificaciones o bonus
    
    IMPORTANTE: Responde solo con el JSON. Asegúrate de que payslipTotal sea el importe final neto que el trabajador recibe.`;

    console.log('[Audit] Sending to Groq...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    console.log('[Audit] AI Content:', content);

    let extractedData;
    try {
      // Clean possible markdown artifacts if model ignored response_format
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      extractedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('[Audit] JSON Parse Error:', content);
      throw new Error('La IA no devolvió un formato válido. Inténtalo de nuevo con una imagen más clara.');
    }

    // Normalized extraction
    const payslipTotal = Number(extractedData.payslipTotal || 0);
    const difference = payslipTotal - appTotal;
    const status = Math.abs(difference) < 1.0 ? 'MATCH' : 'DISCREPANCY';

    return NextResponse.json({
      payslipTotal,
      appTotal,
      difference,
      status,
      details: status === 'MATCH' 
        ? '✅ ¡Auditoría correcta! Los importes coinciden.' 
        : `⚠️ Discrepancia detectada: Nómina ${payslipTotal.toFixed(2)}€ vs App ${appTotal.toFixed(2)}€`,
      extractedDetails: {
        periodo: extractedData.periodo || 'No detectado',
        empresa_cif: extractedData.empresa_cif || 'No detectado',
        total_devengado: extractedData.total_devengado || 0,
        concepts: extractedData.concepts || {}
      }
    });

  } catch (error: any) {
    console.error('[Audit] Error Crítico:', error);
    return NextResponse.json({
      error: 'Error en la Auditoría',
      message: error.message || 'Ocurrió un error inesperado al procesar la nómina.'
    }, { status: 500 });
  }
}
