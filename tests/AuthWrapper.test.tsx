import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthWrapper } from '../components/AuthWrapper';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';

// Mock del store
vi.mock('@/store/useStore', () => ({
  useStore: () => ({
    user: null,
    setUser: vi.fn(),
    fetchUserData: vi.fn(),
    initHolidays2026: vi.fn(),
    loading: false,
  }),
}));

describe('AuthWrapper Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar mensaje de error genérico cuando las credenciales son inválidas', async () => {
    // Simulamos un error de credenciales de Supabase
    (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { status: 400, message: 'Invalid login credentials' },
    });

    render(<AuthWrapper><div>Content</div></AuthWrapper>);

    // Deberíamos estar en el landing, hacemos click para entrar
    const enterBtn = await screen.findByText(/Entrar al Sistema/i);
    fireEvent.click(enterBtn);

    // Llenamos el formulario (esperamos a que aparezca)
    const emailInput = await screen.findByPlaceholderText(/email@ejemplo.com/i);
    const passwordInput = await screen.findByPlaceholderText(/••••••••/i);
    const submitBtn = await screen.findByText(/Entrar al Panel/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Aceptamos términos
    const legalCheckbox = screen.getByRole('checkbox');
    fireEvent.click(legalCheckbox);
    
    fireEvent.click(submitBtn);


    // Verificamos que el mensaje sea el genérico "Acceso denegado"
    await waitFor(() => {
      expect(screen.getByText(/Acceso denegado/i)).toBeInTheDocument();
    });
  });

  it('debe proteger contra la enumeración de usuarios en el registro', async () => {
    (supabase.auth.signUp as any).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    render(<AuthWrapper><div>Content</div></AuthWrapper>);
    const enterBtn = await screen.findByText(/Entrar al Sistema/i);
    fireEvent.click(enterBtn);
    
    const registerLink = await screen.findByText(/Regístrate gratis/i);
    fireEvent.click(registerLink);

    const emailInput = await screen.findByPlaceholderText(/email@ejemplo.com/i);
    const passwordInput = await screen.findByPlaceholderText(/••••••••/i);
    const submitBtn = await screen.findByText(/Registrarme ahora/i);
    const form = emailInput.closest('form');

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Aceptamos términos
    const legalCheckbox = screen.getByRole('checkbox');
    fireEvent.click(legalCheckbox);
    
    // Disparamos el submit
    fireEvent.submit(form!);


    await waitFor(() => {
      expect(screen.getByText(/Se ha producido un error/i)).toBeInTheDocument();
    }, { timeout: 4000 });
  });
});
