import React, { useState } from 'react';
import {
  Search,
  Plus,
  Calendar,
  DollarSign,
  Printer,
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { Rental, RentalStatus } from '../types';
import { formatDateDMY, formatCurrency } from '../utils/dateUtils';

interface RentalsListProps {
  onOpenNewRental: () => void;
  onOpenReturn: (rental: Rental) => void;
  onOpenReceipt: (rental: Rental) => void;
  onOpenAddPayment: (rental: Rental) => void;
  onSelectDress: (dressId: string) => void;
  onSelectCustomer: (customerId: string) => void;
}

export const RentalsList: React.FC<RentalsListProps> = ({
  onOpenNewRental,
  onOpenReturn,
  onOpenReceipt,
  onOpenAddPayment,
  onSelectDress,
  onSelectCustomer,
}) => {
  const {
    rentals,
    getDressById,
    getCustomerById,
    updateRentalStatus,
    todayDate,
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Toutes' | RentalStatus>('Toutes');

  const filteredRentals = rentals.filter((rental) => {
    const dress = getDressById(rental.dressId);
    const customer = getCustomerById(rental.customerId);

    const matchesSearch =
      rental.rentalCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer?.phone || '').includes(searchQuery) ||
      (dress?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dress?.code || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'Toutes' || rental.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Titre & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-semibold tracking-tight">
            Locations & Réservations
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Suivi des contrats, retraits en cours, retours attendus et états financiers
          </p>
        </div>
        <button
          onClick={onOpenNewRental}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle réservation</span>
        </button>
      </div>

      {/* Barre de recherche et filtres de statut */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par code (ex. LOC-2026-103), nom de la mariée ou référence de robe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
          />
        </div>

        {/* Boutons de filtre */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 border-t border-neutral-100">
          {(['Toutes', 'Réservée', 'En cours', 'Terminée', 'Annulée'] as const).map(
            (status) => {
              const count =
                status === 'Toutes'
                  ? rentals.length
                  : rentals.filter((r) => r.status === status).length;
              const isActive = statusFilter === status;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`font-mono text-[11px] ${
                      isActive ? 'text-neutral-300' : 'text-neutral-400'
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Tableau des locations */}
      {filteredRentals.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900">Aucun dossier de location trouvé</h3>
          <p className="text-xs text-neutral-500 mt-1">Ajustez vos filtres ou créez une nouvelle réservation.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Code Contrat</th>
                  <th className="py-3 px-4">Mariée / Cliente</th>
                  <th className="py-3 px-4">Robe de mariée</th>
                  <th className="py-3 px-4">Période de location</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Bilan financier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {filteredRentals.map((rental) => {
                  const dress = getDressById(rental.dressId);
                  const customer = getCustomerById(rental.customerId);
                  const totalExpected =
                    rental.rentalPrice + rental.deposit + (rental.additionalCharges || 0);
                  const balanceDue = Math.max(0, totalExpected - rental.amountPaid);
                  const isDueToday = rental.returnDate === todayDate && rental.status === 'En cours';
                  const isOverdue = rental.returnDate < todayDate && rental.status === 'En cours';

                  return (
                    <tr
                      key={rental.id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-semibold text-neutral-900 whitespace-nowrap">
                        {rental.rentalCode}
                        <div className="text-[10px] text-neutral-400 font-normal">
                          Créé le {formatDateDMY(rental.createdAt)}
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => customer && onSelectCustomer(customer.id)}
                          className="font-medium text-neutral-900 hover:underline block text-left"
                        >
                          {customer?.name || 'Inconnue'}
                        </button>
                        <div className="font-mono text-neutral-500 text-[11px] mt-0.5">
                          {customer?.phone}
                        </div>
                      </td>

                      {/* Robe */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-11 rounded overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                            {dress?.imageUrl && (
                              <img
                                src={dress.imageUrl}
                                alt={dress.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => dress && onSelectDress(dress.id)}
                              className="font-medium text-neutral-900 hover:underline block truncate max-w-44 text-left"
                            >
                              {dress?.name}
                            </button>
                            <span className="font-mono text-neutral-500 text-[11px]">
                              {dress?.code} · {dress?.size}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-medium text-neutral-800">
                          {formatDateDMY(rental.rentalStartDate)} → {formatDateDMY(rental.returnDate)}
                        </div>
                        {isOverdue && (
                          <div className="text-rose-600 font-semibold text-[11px] mt-0.5">
                            ⚠️ Retour en retard
                          </div>
                        )}
                        {isDueToday && (
                          <div className="text-amber-700 font-medium text-[11px] mt-0.5">
                            À rendre aujourd'hui
                          </div>
                        )}
                        {rental.actualReturnDate && (
                          <div className="text-neutral-400 text-[11px] mt-0.5">
                            Rendue le {formatDateDMY(rental.actualReturnDate)}
                          </div>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            rental.status === 'En cours'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : rental.status === 'Réservée'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : rental.status === 'Terminée'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {rental.status}
                        </span>
                      </td>

                      {/* Bilan financier */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                        <div className="font-semibold text-neutral-900 tabular-nums">
                          {formatCurrency(totalExpected)}
                        </div>
                        {balanceDue > 0 ? (
                          <div className="text-amber-800 font-medium text-[11px] tabular-nums mt-0.5">
                            Reste : {formatCurrency(balanceDue)}
                          </div>
                        ) : (
                          <div className="text-emerald-700 text-[11px] mt-0.5">
                            Payé intégralement
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Traiter le retour */}
                          {rental.status === 'En cours' && (
                            <button
                              onClick={() => onOpenReturn(rental)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors shadow-2xs"
                            >
                              Retour
                            </button>
                          )}

                          {/* Retrait */}
                          {rental.status === 'Réservée' && (
                            <button
                              onClick={() => updateRentalStatus(rental.id, 'En cours')}
                              className="px-2.5 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                            >
                              Retrait
                            </button>
                          )}

                          {/* Encaisser le solde */}
                          {balanceDue > 0 && rental.status !== 'Annulée' && (
                            <button
                              onClick={() => onOpenAddPayment(rental)}
                              title="Encaisser le solde restant"
                              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                            >
                              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                          )}

                          {/* Imprimer contrat / reçu */}
                          <button
                            onClick={() => onOpenReceipt(rental)}
                            title="Imprimer le contrat et reçu"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
