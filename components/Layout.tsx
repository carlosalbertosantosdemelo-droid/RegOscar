
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onBack }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-xl md:my-4 md:rounded-3xl overflow-hidden">
      <header className="bg-gradient-to-br from-blue-700 to-indigo-800 p-6 text-white text-center relative">
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
        <h1 className="text-2xl font-black mb-1">{title}</h1>
        <p className="text-blue-100 text-[11px] uppercase tracking-widest opacity-80">Assistente Pedagógico</p>
      </header>
      
      <main className="flex-1 p-5 overflow-y-auto bg-slate-50/50">
        {children}
      </main>

      <footer className="p-4 text-center text-[10px] font-bold text-slate-400 border-t bg-slate-50 uppercase tracking-widest">
        © {new Date().getFullYear()} RegOscar
      </footer>
    </div>
  );
};

export default Layout;
