import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { formatDateDMY, FRENCH_MONTHS, FRENCH_DAYS_SHORT } from '../utils/dateUtils';
import { Rental } from '../types';

interface CalendarViewProps {
  onOpenNewRentalWithParams: (dressId?: string, date?: string) => void;
  onOpenReturn: (rental: Rental) => void;
  onOpenReceipt: (rental: Rental) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenNewRentalWithParams,
  onOpenReturn,
  onOpenReceipt,
}) => {
  const {
    todayDate,
    dresses,
    rentals,
    getCustomerById,
  } = useRental();

  // Année et mois sélectionnés (par défaut Octobre 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 9 = Octobre (0-indexé)
  const [selectedDressFilter, setSelectedDressFilter] = useState<string>('Toutes');
  const [viewMode, setViewMode] = useState<'timeline' | 'month'>('timeline');

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = FRENCH_MONTHS[currentMonth];

  const activeDresses = dresses.filter(
    (d) => selectedDressFilter === 'Toutes' || d.id === selectedDressFilter
  );

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getRentalsForDressAndDay = (dressId: string, day: number) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    return rentals.filter((r) => {
      if (r.dressId !== dressId) return false;
      if (r.status === 'Annulée') return false;
      return dateStr >= r.rentalStartDate && dateStr <= r.returnDate;
    });
  };

  const isTodayDay = (day: number) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return dateStr === todayDate;
  };

  return (
    <div className="space-y-6">
      {/* Titre & Contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-semibold tracking-tight">
            Calendrier & Planning des Disponibilités
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Visualisez les créneaux par robe pour éviter absolument toute double réservation
          </p>
        </div>

        {/* Boutons de bascule de vue */}
        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-100 p-1 rounded-md text-xs font-medium border border-neutral-200">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Planning par Robe
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Grille Mensuelle
            </button>
          </div>

          <button
            onClick={() => onOpenNewRentalWithParams()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Réserver une date</span>
          </button>
        </div>
      </div>

      {/* Navigateur de mois et filtres */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sélecteur de mois */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif text-lg font-semibold text-neutral-900 min-w-40 text-center">
              {monthName} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(9);
            }}
            className="text-xs text-neutral-500 hover:text-neutral-900 underline ml-2"
          >
            Revenir à Octobre 2026
          </button>
        </div>

        {/* Filtrage par robe & Légende */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Filtrer la robe :</span>
            <select
              value={selectedDressFilter}
              onChange={(e) => setSelectedDressFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="Toutes">Toutes les robes ({dresses.length})</option>
              {dresses.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Légende */}
          <div className="flex items-center gap-3 text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Location en cours</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Réservée</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
              <span>Terminée</span>
            </span>
          </div>
        </div>
      </div>

      {/* VUE 1 : Planning Gantt par Robe */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* En-tête des jours du mois */}
              <div className="flex border-b border-neutral-200 bg-neutral-50/90 text-xs">
                <div className="w-64 p-3 font-semibold text-neutral-700 shrink-0 border-r border-neutral-200">
                  Robe de Mariée
                </div>

                <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}>
                  {dayNumbers.map((day) => {
                    const isToday = isTodayDay(day);
                    return (
                      <div
                        key={day}
                        className={`text-center py-2.5 border-r border-neutral-200/60 font-mono text-[11px] ${
                          isToday
                            ? 'bg-neutral-900 text-white font-bold'
                            : 'text-neutral-600'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lignes pour chaque robe */}
              <div className="divide-y divide-neutral-200/80">
                {activeDresses.map((dress) => {
                  return (
                    <div key={dress.id} className="flex hover:bg-neutral-50/40 transition-colors">
                      {/* Robe */}
                      <div className="w-64 p-3 shrink-0 border-r border-neutral-200 flex items-center gap-2.5">
                        <div className="w-8 h-11 rounded overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                          {dress.imageUrl && (
                            <img
                              src={dress.imageUrl}
                              alt={dress.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-neutral-900 text-xs truncate">
                            {dress.name}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-500">
                            {dress.code} · {dress.size}
                          </div>
                        </div>
                      </div>

                      {/* Cellules par jour */}
                      <div
                        className="flex-1 grid relative py-2"
                        style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}
                      >
                        {dayNumbers.map((day) => {
                          const isToday = isTodayDay(day);
                          const dayRentals = getRentalsForDressAndDay(dress.id, day);
                          const hasBooking = dayRentals.length > 0;
                          const activeRental = dayRentals[0];
                          const customer = activeRental ? getCustomerById(activeRental.customerId) : null;

                          const formattedDay = String(day).padStart(2, '0');
                          const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                          const cellDate = `${currentYear}-${formattedMonth}-${formattedDay}`;

                          return (
                            <div
                              key={day}
                              onClick={() => {
                                if (hasBooking && activeRental) {
                                  onOpenReceipt(activeRental);
                                } else {
                                  onOpenNewRentalWithParams(dress.id, cellDate);
                                }
                              }}
                              title={
                                hasBooking && activeRental
                                  ? `${activeRental.rentalCode} - ${customer?.name} (du ${formatDateDMY(activeRental.rentalStartDate)} au ${formatDateDMY(activeRental.returnDate)})`
                                  : `Disponible le ${formatDateDMY(cellDate)} — Cliquez pour réserver`
                              }
                              className={`h-11 border-r border-neutral-100 cursor-pointer relative group flex items-center justify-center transition-colors ${
                                isToday ? 'bg-neutral-100/40' : ''
                              } ${
                                !hasBooking ? 'hover:bg-neutral-100/80' : ''
                              }`}
                            >
                              {hasBooking && activeRental && (
                                <div
                                  className={`w-full h-7 rounded mx-0.5 px-1.5 flex items-center justify-between text-[10px] font-medium transition-transform group-hover:scale-102 ${
                                    activeRental.status === 'En cours'
                                      ? 'bg-blue-600 text-white'
                                      : activeRental.status === 'Réservée'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-neutral-400 text-white'
                                  }`}
                                >
                                  <span className="truncate">
                                    {customer?.name?.split(' ')[0] || 'Mariée'}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-50/80 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Cliquez sur une case libre pour réserver cette robe. Cliquez sur un créneau réservé pour afficher le dossier.</span>
            </span>
            <span className="font-mono text-neutral-400">
              {activeDresses.length} robes suivies
            </span>
          </div>
        </div>
      )}

      {/* VUE 2 : Grille Mensuelle */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600 text-center py-2.5">
            {FRENCH_DAYS_SHORT.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 divide-x divide-y divide-neutral-200">
            {/* Jours vides avant le 1er du mois */}
            {Array.from({
              length: new Date(currentYear, currentMonth, 1).getDay(),
            }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-28 bg-neutral-50/50 p-2 text-neutral-300" />
            ))}

            {/* Jours du mois */}
            {dayNumbers.map((day) => {
              const formattedDay = String(day).padStart(2, '0');
              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const isToday = isTodayDay(day);

              const dayRentals = rentals.filter((r) => {
                if (r.status === 'Annulée') return false;
                if (selectedDressFilter !== 'Toutes' && r.dressId !== selectedDressFilter)
                  return false;
                return dateStr >= r.rentalStartDate && dateStr <= r.returnDate;
              });

              return (
                <div
                  key={day}
                  className={`min-h-28 p-2 flex flex-col justify-between hover:bg-neutral-50/60 transition-colors ${
                    isToday ? 'bg-neutral-50 ring-1 ring-neutral-900/20' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-medium ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold'
                          : 'text-neutral-700'
                      }`}
                    >
                      {day}
                    </span>

                    <button
                      onClick={() => onOpenNewRentalWithParams(undefined, dateStr)}
                      title={`Réserver à partir du ${formatDateDMY(dateStr)}`}
                      className="p-1 text-neutral-300 hover:text-neutral-900 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1 mt-1 overflow-y-auto max-h-20">
                    {dayRentals.map((r) => {
                      const dress = dresses.find((d) => d.id === r.dressId);
                      const cust = getCustomerById(r.customerId);
                      return (
                        <div
                          key={r.id}
                          onClick={() => onOpenReceipt(r)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-transform hover:scale-102 ${
                            r.status === 'En cours'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : r.status === 'Réservée'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                          title={`${dress?.code} - ${cust?.name} (du ${formatDateDMY(r.rentalStartDate)} au ${formatDateDMY(r.returnDate)})`}
                        >
                          <span className="font-semibold">{dress?.code}:</span> {cust?.name?.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
