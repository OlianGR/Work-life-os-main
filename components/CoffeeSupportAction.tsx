'use client';

import { useState } from 'react';
import { Coffee, Loader2 } from 'lucide-react';

export function CoffeeSupportAction() {
    const [loading, setLoading] = useState<number | null>(null);
    const [message, setMessage] = useState('');

    const handleSupport = async (quantity: number) => {
        setLoading(quantity);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity, message })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Error al procesar el pago. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Stripe error:', error);
            alert('Error de conexión.');
        } finally {
            setLoading(null);
        }
    };

    const options = [
        { qty: 1, text: 'Invítame a 1 café', price: '5€', color: 'var(--color-electric-cyan)' },
        { qty: 3, text: 'Invítame a 3 cafés', price: '15€', color: 'var(--color-neon-fuchsia)' },
        { qty: 5, text: 'Invítame a 5 cafés', price: '25€', color: 'var(--color-citrus-yellow)' }
    ];

    return (
        <div className="brutal-card p-10 bg-white border-[4px] border-black text-center space-y-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-2">
                <h2 className="text-4xl font-display font-black uppercase tracking-tighter">¿Nos pagas una ronda?</h2>
                <p className="font-black uppercase text-sm opacity-70 italic">Elige tu nivel de apoyo y déjanos un saludo</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest block text-left text-gray-500">Mensaje de apoyo (Opcional)</label>
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="¡Gracias por las herramientas! Sigue así..."
                    className="w-full brutal-input font-mono text-sm min-h-[100px] resize-none rotate-1 focus:rotate-0 transition-all rounded-2xl"
                    maxLength={300}
                />
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
                {options.map((option, idx) => (
                    <button 
                        key={idx}
                        disabled={loading !== null}
                        onClick={() => handleSupport(option.qty)}
                        style={{ backgroundColor: option.color }}
                        className="brutal-card px-8 py-8 text-xl font-black uppercase flex flex-col items-center gap-2 group hover:scale-105 transition-all transform hover:-rotate-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    >
                        {loading === option.qty ? (
                            <Loader2 className="w-12 h-12 animate-spin" />
                        ) : (
                            <Coffee className="w-12 h-12 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="leading-none">{option.text}</span>
                        <span className="text-sm border-t-[3px] border-black pt-2 mt-2 px-4 bg-white/20">{option.price}</span>
                    </button>
                ))}
            </div>

            <p className="font-mono text-[10px] font-bold uppercase max-w-md mx-auto opacity-50">
                * Transacción segura vía Stripe Encrypted Gateway.
            </p>
        </div>
    );
}
