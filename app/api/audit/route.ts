import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Audit API - Handles payroll image processing using Groq Vision
 * implements dual-validation: JWT (Header) with Cookie fallback
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let user = null;

    // 1. First validation attempt: JWT Authorization Header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && authUser) {
        console.log('[Audit] Authenticated via JWT Header:', authUser.email);
        user = authUser;
      } else {
        console.warn('[Audit] JWT validation failed:', authError?.message);
      }
    }

    // 2. Second validation attempt: Cookie Fallback (for browser direct calls)
    if (!user) {
      console.log('[Audit] Falling back to cookie validation...');
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
              try {
                cookieStore.set({ name, value, ...options });
              } catch (e) {
                // Ignore cookie sets in route handlers if not allowed
              }
            },
            remove(name: string, options: any) {
              try {
                cookieStore.delete({ name, ...options });
              } catch (e) {
                // Ignore cookie deletes in route handlers
              }
            },
          },
        }
      );

      // Using getUser() instead of getSession() for higher security (verifies with DB)
      const { data: { user: authUser }, error: userError } = await supabaseServer.auth.getUser();
      
      if (!userError && authUser) {
        console.log('[Audit] Authenticated via Cookies:', authUser.email);
        user = authUser;
      } else {
        console.error('[Audit] Cookie validation failed:', userError?.message);
        return NextResponse.json({ 
          error: 'No autorizado', 
          message: 'No se pudo encontrar una sesión activa. Por favor, intenta cerrar sesión y volver a entrar.' 
        }, { status: 401 });
      }
    }

    const body = await req.json();
    const { fileData, mimeType, appTotal } = body;

    console.log('[Audit] Processing audit request for:', user.email);

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

    // Prompts and logic remain similar but with improved model selection and parsing
    const prompt = `Analiza esta imagen de una nómina española y extrae los importes brutos de los conceptos indicados.
Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta:
{
  "concepts": {
    "salario_base": number,
    "antiguedad": number,
    "plus_toxico": number,
    "plus_convenio": number,
    "incentivos": number,
    "plus_puesto": number,
    "horas_extras": number,
    "plus_festivos": number,
    "plus_transporte": number,
    "plus_vestuario": number,
    "plus_post_festivo": number
  },
  "payslipTotal": number,
  "total_devengado": number,
  "metadata": {
    "month": string,
    "year": string,
    "company": string
  }
}

MAPEADO:
- salario_base: Salario/Sueldo Base.
- antiguedad: Antigüedad, Trienios, Plus Permanencia.
- plus_toxico: Tóxico, Penosidad, Peligrosidad.
- incentivos: Bonus, Variable, Diferencia, Complemento Salarial (SUMA TODOS LOS VARIABLES).
- plus_puesto: Plus Puesto, Responsabilidad, Función.
- plus_festivos: Festivos, Nocturnidad/Festividad.
- plus_transporte: Transporte, Distancia, KM.
- plus_vestuario: Vestuario, Ropa.
- plus_post_festivo: Relevo, Post-Festivo.

REGLAS:
1. Concepto no presente = 0.
2. Números decimales con punto (ej: 1250.50).
3. Suma conceptos repetidos de la misma categoría.
4. Ignora retenciones e impuestos, solo devengo bruto.
5. payslipTotal = Líquido a Percibir (Neto final).`;

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
    
    let extractedData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      extractedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('[Audit] JSON Parse Error:', content);
      throw new Error('La IA no devolvió un formato válido. Inténtalo de nuevo con una imagen más clara.');
    }

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
        periodo: extractedData.metadata?.month ? `${extractedData.metadata.month} ${extractedData.metadata.year || ''}` : 'No detectado',
        empresa: extractedData.metadata?.company || 'No detectada',
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

