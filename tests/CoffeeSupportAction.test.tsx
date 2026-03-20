import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoffeeSupportAction } from '../components/CoffeeSupportAction';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('CoffeeSupportAction Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ url: 'https://checkout.stripe.com/test' }),
        });
    });

    it('debe renderizar el mensaje de apoyo opcional', () => {
        render(<CoffeeSupportAction />);
        expect(screen.getByPlaceholderText(/¡Gracias por las herramientas!/i)).toBeInTheDocument();
    });

    it('debe enviar el mensaje personalizado en el payload de Stripe', async () => {
        render(<CoffeeSupportAction />);
        
        const textarea = screen.getByPlaceholderText(/¡Gracias por las herramientas!/i);
        const testMessage = 'Mensaje de prueba de la comunidad';
        
        fireEvent.change(textarea, { target: { value: testMessage } });
        
        const supportBtn = screen.getByText(/Invítame a 3 cafés/i);
        fireEvent.click(supportBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/checkout', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ quantity: 3, message: testMessage })
            }));
        });
    });

    it('debe manejar errores de red correctamente', async () => {
        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
        window.alert = vi.fn();
        
        render(<CoffeeSupportAction />);
        const supportBtn = screen.getByText(/Invítame a 1 café/i);
        fireEvent.click(supportBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Error de conexión.');
        });
    });
});
