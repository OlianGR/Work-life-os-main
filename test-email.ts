import { sendThankYouEmail } from './lib/email';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
    console.log('Sending test email...');
    try {
        // We'll try to send it to the developer's address if possible, 
        // or just a placeholder since onboarding@resend.dev should be able to send to the account owner.
        const res = await sendThankYouEmail(
            'onboarding@resend.dev', // Resend often allows sending to yourself for testing
            'Tester', 
            3, 
            '¡Mensaje de prueba desde Antigravity!'
        );
        console.log('Success:', res);
    } catch (e) {
        console.error('Error:', e);
    }
}

testEmail();
