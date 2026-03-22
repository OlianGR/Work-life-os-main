import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendThankYouEmail(email: string, name: string = 'amigo', coffeeCount: number, personalMessage?: string) {
    try {
        const plural = coffeeCount > 1 ? 's' : '';
        const data = await resend.emails.send({
            from: 'Angel de Olianlabs <angel@olianlabs.com>', 
            to: [email],
            subject: `¡Gracias por el café, ${name}! ☕️`,
            html: `
                <div style="font-family: 'Courier New', Courier, monospace; background-color: #f0f0f0; padding: 40px; border: 4px solid #000;">
                    <h1 style="text-transform: uppercase; font-weight: 900; letter-spacing: -1px; margin-bottom: 20px;">OLIAN LABS / SOPORTE</h1>
                    <p style="font-size: 16px; font-weight: bold; line-height: 1.5;">
                        Hola <strong>${name}</strong>,<br><br>
                        Solo quería decirte gracias personalmente. Tu apoyo con <strong>${coffeeCount} café${plural}</strong> no es solo una propina, es lo que nos permite seguir creando herramientas libres de publicidad, independientes y obsesionadas con la utilidad.
                    </p>
                    
                    ${personalMessage ? `
                    <div style="margin: 30px 0; padding: 20px; background-color: #fff; border: 2px dashed #000;">
                        <p style="font-size: 12px; font-style: italic; margin-bottom: 5px;">Tu mensaje para nosotros:</p>
                        <p style="font-size: 16px; font-weight: bold; color: #000;">"${personalMessage}"</p>
                    </div>
                    ` : ''}

                    <p style="font-size: 14px; opacity: 0.7;">
                        Gracias por ayudarnos a que Olian siga creciendo como un estudio humano.
                    </p>
                    <div style="margin-top: 30px; padding: 20px; background-color: #000; color: #fff; display: inline-block;">
                        <a href="https://olian-labs.com" style="color: #fff; text-decoration: none; font-weight: 900; text-transform: uppercase;">Ir al Dashboard</a>
                    </div>
                    <p style="margin-top: 40px; font-size: 10px; opacity: 0.5; font-style: italic;">
                        Olian Labs © 2026 | Independiente • Sin Rastreo • Hecho para Personas
                    </p>
                </div>
            `,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
