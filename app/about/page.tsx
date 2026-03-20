import { Metadata } from 'next';
import { Shield, Sparkles, Terminal, Heart, Coffee, Globe } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Olian Labs',
  description: 'Conoce la filosofía detrás de Work Life OS y Olian Labs. Herramientas independientes, seguras y sin publicidad.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-base-bg)] p-6 sm:p-12 font-mono">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
            <div className="inline-block bg-black text-white border-[3px] border-black px-6 py-2 font-black uppercase tracking-widest shadow-brutal-sm transform rotate-1">
                La Misión
            </div>
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase leading-none">
            Software <br />
            <span className="text-[var(--color-electric-cyan)] outline-text">HUMANO</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-bold uppercase tracking-tight">
            Creamos herramientas para personas, no para algoritmos. Sin publicidad, sin rastreo, sin compromiso.
          </p>
        </section>

        {/* Core Values - Psychology Hack: Independence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { 
                    icon: Shield, 
                    title: 'Independientes', 
                    desc: 'No dependemos de inversores ni publicidad. Esto nos permite priorizar tu privacidad sobre los beneficios.',
                    color: 'var(--color-electric-cyan)'
                },
                { 
                    icon: Globe, 
                    title: 'Abiertos', 
                    desc: 'Creemos en la transparencia del código y en dar el control total de los datos al usuario.',
                    color: 'var(--color-neon-fuchsia)'
                },
                { 
                    icon: Sparkles, 
                    title: 'Brutales', 
                    desc: 'Diseño honesto, funcionalidad directa y estética que rompe con lo genérico.',
                    color: 'var(--color-citrus-yellow)'
                }
            ].map((v, i) => (
                <div key={i} className="brutal-card p-6 bg-white border-[4px] border-black space-y-4 hover:-translate-y-2 transition-transform">
                    <v.icon className="w-10 h-10" style={{ color: v.color }} />
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{v.title}</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed">{v.desc}</p>
                </div>
            ))}
        </div>

        {/* CTA Section */}
        <div className="brutal-card p-10 bg-black text-white border-[4px] border-black relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <Terminal className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-6 max-w-lg">
                <h2 className="text-4xl font-display font-black uppercase leading-tight">¿Por qué Work Life OS?</h2>
                <p className="text-sm opacity-80 leading-relaxed font-bold">
                    Este proyecto nació de la necesidad de tener un control real sobre el equilibrio entre vida y trabajo. En Olian Labs, creemos que la tecnología debe ser tu aliada, no tu espía.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/apoyar-proyecto" className="brutal-btn bg-[var(--color-citrus-yellow)] text-black px-8 py-4 text-center font-black uppercase flex items-center justify-center gap-2 group">
                        <Coffee className="w-5 h-5 transition-transform group-hover:scale-125" />
                        Apoyar con un café
                    </Link>
                    <Link href="/" className="brutal-btn bg-white text-black px-8 py-4 text-center font-black uppercase">
                        Ir al Dashboard
                    </Link>
                </div>
            </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="pt-12 border-t-[4px] border-black text-center space-y-4">
            <p className="text-sm font-black uppercase opacity-40 italic">
                &quot;Hacemos lo que nos gusta para personas que aprecian el buen software.&quot;
            </p>
            <div className="flex justify-center gap-6">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-black">2026</span>
                    <span className="text-[9px] font-bold uppercase opacity-50">Establecido</span>
                </div>
                <div className="w-[2px] bg-black h-10 self-center opacity-20" />
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-black">∞</span>
                    <span className="text-[9px] font-bold uppercase opacity-50">Privacidad</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
