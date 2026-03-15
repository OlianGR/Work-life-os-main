import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { fileData, mimeType, appTotal } = body;

    console.log('[Audit] Incoming request:', {
      mimeType,
      appTotal,
      dataLength: fileData?.length
    });

    if (!fileData || !mimeType) {
      console.error('[Audit] Missing fileData or mimeType');
      return NextResponse.json({ error: 'Faltan datos del archivo o tipo mime' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith('YOUR_')) {
      console.error('[Audit] Invalid Groq API Key');
      return NextResponse.json({ error: 'Falta configurar GROQ_API_KEY en el archivo .env' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // Handle potential data: prefix already present
    const cleanBase64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const imageUrl = `data:${mimeType};base64,${cleanBase64}`;

    const prompt = `Analiza esta nómina española. Extrae los siguientes datos en un objeto JSON:
    - periodo: Periodo liquidado (ej. "Marzo 2026")
    - empresa_cif: El CIF de la empresa
    - total_devengado: El bruto total (número float)
    - payslipTotal: El líquido a percibir o neto final (número float)
    
    Responde UNICAMENTE el objeto JSON. No añadas notas ni explicaciones.`;

    console.log('[Audit] Sending to Groq Llama-3.2...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      model: 'llama-3.2-11b-vision-preview',
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    let text = chatCompletion.choices[0]?.message?.content || '{}';
    console.log('[Audit] Groq Response:', text);

    let extractedData;
    try {
      extractedData = JSON.parse(text);
    } catch (e) {
      console.error('[Audit] JSON Parse Error:', text);
      throw new Error(`Error al parsear respuesta JSON de la IA: ${text.substring(0, 100)}`);
    }

    const { payslipTotal, periodo, empresa_cif, total_devengado } = extractedData;

    if (typeof payslipTotal !== 'number') {
      console.error('[Audit] payslipTotal is not a number:', payslipTotal);
      throw new Error('La IA no pudo extraer el importe total correctamente de la nómina.');
    }

    const difference = payslipTotal - appTotal;
    const status = Math.abs(difference) < 1.0 ? 'MATCH' : 'DISCREPANCY';

    const details = status === 'MATCH'
      ? '✅ ¡Auditoría correcta! Los importes coinciden.'
      : `⚠️ Discrepancia: Nómina indica ${payslipTotal.toFixed(2)}€ vs Registro ${appTotal.toFixed(2)}€ (Dif: ${Math.abs(difference).toFixed(2)}€).`;

    return NextResponse.json({
      payslipTotal,
      appTotal,
      difference,
      status,
      details,
      extractedDetails: {
        periodo: periodo || 'N/A',
        empresa_cif: empresa_cif || 'N/A',
        total_devengado: total_devengado || 0
      }
    });

  } catch (error: any) {
    console.error('[Audit] Server Error:', error);
    return NextResponse.json({
      error: 'Fallo en la Auditoría con Groq',
      message: error.message || 'Error desconocido del servidor'
    }, { status: 500 });
  }
}
