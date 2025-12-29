
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-agro-gradient text-white py-6 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌾</span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AgroPlan</h1>
              <p className="text-sm opacity-90 font-medium">Inteligență în Agricultura de Mâine</p>
            </div>
          </div>
          <nav className="flex gap-6">
            <a href="#" className="hover:underline font-medium">Dashboard</a>
            <a href="#advisor" className="hover:underline font-medium">AgroAI Consultant</a>
            <a href="#seasons" className="hover:underline font-medium">Sezoane</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8">
        {children}
      </main>

      <footer className="bg-green-900 text-green-100 py-10 mt-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AgroPlan</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Misiunea noastră este să aducem cele mai noi tehnologii în mâinile fermierilor români, combinând tradiția cu inteligența artificială.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Link-uri utile</h4>
            <ul className="text-sm space-y-2 opacity-80">
              <li>Calendar Agricol 2025</li>
              <li>Ghidul Subvențiilor</li>
              <li>Analiza Solului</li>
              <li>Contactează un Expert</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <p className="text-sm opacity-80 mb-4">Abonează-te pentru sfaturi săptămânale.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email-ul tău" className="bg-green-800 border-none rounded-lg px-4 py-2 text-sm w-full outline-none focus:ring-2 ring-green-500" />
              <button className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors">OK</button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-green-800 mt-10 pt-6 text-center text-xs opacity-50">
          © 2025 AgroPlan Romania. Toate drepturile rezervate.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
