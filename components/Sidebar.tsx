'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const emptySubscribe = () => () => { };

const navItems = [
  { name: 'Panel', href: '/', icon: LayoutDashboard },
  { name: 'Calendario', href: '/calendar', icon: CalendarDays },
  { name: 'Auditor', href: '/auditor', icon: FileText },
  { name: 'Ajustes', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const pathname = usePathname();
  const { signOut, user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // Cerrar sidebar automáticamente cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!isClient) return null;

  const userIdentifier = user?.email || 'Usuario';
  const initials = userIdentifier.substring(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-40 brutal-btn bg-[var(--color-citrus-yellow)] p-3 shadow-brutal border-[3px] border-black"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6 text-black" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed md:sticky top-0 left-0 h-screen z-50 w-72 md:w-64 border-r-[4px] border-black bg-white flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]' : '-translate-x-full md:translate-x-0'
        }`}>
        <div className="p-6 border-b-[4px] border-black flex justify-between items-center bg-[var(--color-electric-cyan)] md:bg-white shrink-0">
          <div>
            <h1 className="font-display font-black text-2xl uppercase tracking-tighter leading-none">
              Work Life OS
            </h1>
            <p className="text-[10px] font-mono mt-1 text-black md:text-gray-500 font-bold uppercase tracking-widest">Cloud Edition</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 bg-white border-2 border-black rounded-xl shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-3 overflow-y-auto overflow-x-hidden pt-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 md:py-3 rounded-2xl font-black text-xs md:text-base transition-all border-[3px] border-transparent uppercase tracking-wide ${isActive
                    ? 'bg-[var(--color-citrus-yellow)] border-black shadow-brutal translate-x-[-4px] translate-y-[-4px]'
                    : 'hover:bg-gray-100 text-gray-700 hover:border-black/10'
                  }`}
              >
                <item.icon className={`w-5 h-5 md:w-5 md:h-5 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-[4px] border-black space-y-4 bg-gray-50 shrink-0 mb-4 md:mb-0">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center md:justify-start gap-3 px-4 py-4 md:py-3 font-black text-sm transition-all bg-white border-[3px] border-black rounded-2xl shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] text-[var(--color-neon-fuchsia)] tracking-widest uppercase"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>

          <div className="flex items-center gap-3 p-4 bg-white border-[3px] border-black rounded-2xl shadow-brutal-sm overflow-hidden">
            <div className="w-12 h-12 md:w-10 md:h-10 border-2 border-black bg-black rounded-full flex items-center justify-center text-white font-black text-xs md:text-[10px] text-center shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-[10px] md:text-xs truncate uppercase leading-tight">{userIdentifier}</p>
              <p className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Cloud Access</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
