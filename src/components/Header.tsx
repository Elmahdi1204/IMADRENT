import React from 'react';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { useRental } from '../context/RentalContext';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewRental: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewRental,
}) => {
  const { todayDate, setTodayDate, resetToDemoData } = useRental();

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'dresses', label: 'Robes de mariée' },
    { id: 'customers', label: 'Clientes' },
    { id: 'rentals', label: 'Locations' },
    { id: 'calendar', label: 'Calendrier' },
    { id: 'payments', label: 'Paiements' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1 : Nom de marque (Wordmark pur en typographie display) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-left group flex items-baseline gap-2"
            >
              <span className="font-serif text-xl sm:text-2xl tracking-tight font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                Aura Mariée
              </span>
              <span className="text-xs text-neutral-500 font-sans tracking-widest uppercase hidden md:inline">
                Atelier
              </span>
            </button>
          </div>

          {/* Zone 2 : Liens de navigation textuels propres */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`text-sm font-medium transition-all relative py-1 ${
                    isActive
                      ? 'text-neutral-900 font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3 : Actions principales */}
          <div className="flex items-center gap-3">
            {/* Sélecteur de date système */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-neutral-600">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="text-neutral-500">Aujourd'hui :</span>
              <input
                type="date"
                value={todayDate}
                onChange={(e) => e.target.value && setTodayDate(e.target.value)}
                className="bg-transparent text-neutral-800 font-mono text-xs focus:outline-none cursor-pointer"
                title="Modifier la date système pour simuler les retraits et retours du jour"
              />
            </div>

            <button
              onClick={resetToDemoData}
              title="Réinitialiser les données de démonstration"
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewRental}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-2xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle location</span>
            </button>
          </div>
        </div>

        {/* Barre de navigation mobile */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 border-t border-neutral-100 gap-4 text-xs font-medium scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap px-2 py-1 rounded transition-colors ${
                activeTab === item.id
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
