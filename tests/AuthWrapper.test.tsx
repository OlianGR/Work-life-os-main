import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthWrapper } from '../components/AuthWrapper';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

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
    const emailInput = await screen.findByPlaceholderText(/tu@email.com/i);
    const passwordInput = await screen.findByPlaceholderText(/Tu contraseña/i);
    const submitBtn = await screen.findByText(/Entrar ahora/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Aceptamos términos (En modo login no hay checkbox de términos en este component, pero por si acaso lo dejamos si existe)
    const legalCheckbox = screen.queryByRole('checkbox');
    if (legalCheckbox) fireEvent.click(legalCheckbox);
    
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
    
    const registerLink = await screen.findByText(/Regístrate/i);
    fireEvent.click(registerLink);

    const emailInput = await screen.findByPlaceholderText(/tu@email.com/i);
    const passwordInput = await screen.findByPlaceholderText(/Mínimo 6 caracteres/i);
    const confirmPasswordInput = await screen.findByPlaceholderText(/Confirma tu contraseña/i);
    const submitBtn = await screen.findByText(/Crear mi cuenta/i);
    const form = emailInput.closest('form');

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Aceptamos términos (hay 2 checkboxes en registro)
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(cb => fireEvent.click(cb));
    
    // Disparamos el click en el botón de submit
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Se ha producido un error/i)).toBeInTheDocument();
    }, { timeout: 4000 });
  });
});
