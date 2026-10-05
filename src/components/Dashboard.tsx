import React from 'react';
import {
  CalendarDays,
  Clock,
  DollarSign,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { formatCurrency, formatDateDMY, parseDateToMidnight } from '../utils/dateUtils';
import { Rental, DressStatus } from '../types';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewRental: () => void;
  onOpenReturn: (rental: Rental) => void;
  onSelectDress: (dressId: string) => void;
  onSelectCustomer: (customerId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenNewRental,
  onOpenReturn,
  onSelectDress,
  onSelectCustomer,
}) => {
  const {
    todayDate,
    rentals,
    dresses,
    metrics,
    getDressById,
    getCustomerById,
    updateRentalStatus,
  } = useRental();

  // 1. Locations du jour (débutant aujourd'hui)
  const todayPickups = rentals.filter(
    (r) =>
      r.rentalStartDate === todayDate &&
      r.status !== 'Annulée' &&
      r.status !== 'Terminée'
  );

  // 2. Robes devant revenir aujourd'hui
  const todayReturns = rentals.filter(
    (r) =>
      r.returnDate === todayDate &&
      r.status === 'En cours'
  );

  // Retours en retard (date de retour antérieure à aujourd'hui et toujours En cours)
  const overdueReturns = rentals.filter(
    (r) =>
      r.returnDate < todayDate &&
      r.status === 'En cours'
  );

  // 3. Locations à venir (dans les 14 prochains jours)
  const upcomingRentals = rentals
    .filter((r) => {
      if (r.status === 'Annulée' || r.status === 'Terminée') return false;
      const startMs = parseDateToMidnight(r.rentalStartDate);
      const todayMs = parseDateToMidnight(todayDate);
      return startMs > todayMs;
    })
    .sort((a, b) => a.rentalStartDate.localeCompare(b.rentalStartDate));

  // 4. Locations avec solde impayé
  const unpaidRentals = rentals.filter((r) => {
    if (r.status === 'Annulée') return false;
    const totalExpected = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
    return totalExpected > r.amountPaid;
  });

  // Décompte des statuts d'inventaire
  const statusCounts: Record<DressStatus, number> = {
    Disponible: dresses.filter((d) => d.status === 'Disponible').length,
    Louée: dresses.filter((d) => d.status === 'Louée').length,
    Nettoyage: dresses.filter((d) => d.status === 'Nettoyage').length,
    Maintenance: dresses.filter((d) => d.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec contexte du jour */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-semibold tracking-tight">
            Tableau de bord de l'Atelier
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Planning des réservations, retours et gestion des comptes au{' '}
            <span className="font-mono text-neutral-800 font-medium">{formatDateDMY(todayDate)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('calendar')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>Planning des robes</span>
          </button>
          <button
            onClick={onOpenNewRental}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <span>+ Nouvelle location</span>
          </button>
        </div>
      </div>

      {/* 5 Cartes de Métriques Principales (Conforme au MVP recommandé) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Métrique 1 : Locations du jour */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs transition-all hover:border-neutral-300">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Locations du jour</span>
            <CalendarDays className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-neutral-900">
              {metrics.todayPickupsCount}
            </span>
            <span className="text-xs text-neutral-500">retraits</span>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {todayPickups.length > 0 ? 'Robes quittant l’atelier' : 'Aucun départ prévu'}
          </p>
        </div>

        {/* Métrique 2 : Retours prévus aujourd'hui */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs transition-all hover:border-neutral-300">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Retours aujourd'hui</span>
            <RotateCcw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-amber-700">
              {metrics.todayReturnsCount}
            </span>
            {overdueReturns.length > 0 && (
              <span className="text-xs text-rose-600 font-medium">
                +{overdueReturns.length} en retard
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {todayReturns.length > 0 ? 'Contrôle d’état à effectuer' : 'Tous les retours à jour'}
          </p>
        </div>

        {/* Métrique 3 : Locations à venir */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs transition-all hover:border-neutral-300">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Locations à venir</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-neutral-900">
              {metrics.upcomingRentalsCount}
            </span>
            <span className="text-xs text-neutral-500">réservées (14j)</span>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Contrats confirmés</p>
        </div>

        {/* Métrique 4 : Montants impayés */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs transition-all hover:border-neutral-300">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Montants impayés</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-amber-800">
              {formatCurrency(metrics.unpaidAmountsTotal)}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Sur {unpaidRentals.length} locations en attente de solde
          </p>
        </div>

        {/* Métrique 5 : Revenu total */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs transition-all hover:border-neutral-300">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Revenu total</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-neutral-900">
              {formatCurrency(metrics.totalRevenue)}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Frais de location encaissés</p>
        </div>
      </div>

      {/* Barre d'état du stock de robes */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-900">État du stock de robes</span>
          <span className="text-xs text-neutral-400">({dresses.length} au total)</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          <button
            onClick={() => onNavigateTab('dresses')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-neutral-600">Disponible :</span>
            <span className="font-mono font-semibold text-neutral-900">{statusCounts.Disponible}</span>
          </button>

          <button
            onClick={() => onNavigateTab('dresses')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-neutral-600">Louée :</span>
            <span className="font-mono font-semibold text-neutral-900">{statusCounts.Louée}</span>
          </button>

          <button
            onClick={() => onNavigateTab('dresses')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-neutral-600">Nettoyage :</span>
            <span className="font-mono font-semibold text-neutral-900">{statusCounts.Nettoyage}</span>
          </button>

          <button
            onClick={() => onNavigateTab('dresses')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-neutral-600">Maintenance :</span>
            <span className="font-mono font-semibold text-neutral-900">{statusCounts.Maintenance}</span>
          </button>
        </div>
      </div>

      {/* Grille principale : Retours à contrôler & Départs du jour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne A : Robes devant revenir aujourd'hui / En retard */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Retours nécessitant un contrôle d'état
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Robes attendues le {formatDateDMY(todayDate)} ou avant
              </p>
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
              {todayReturns.length + overdueReturns.length}
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {todayReturns.length === 0 && overdueReturns.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 font-medium">Aucun retour prévu aujourd'hui</p>
                <p className="text-xs text-neutral-400 mt-1">Toutes les locations en cours sont dans les délais.</p>
              </div>
            ) : (
              [...overdueReturns, ...todayReturns].map((rental) => {
                const dress = getDressById(rental.dressId);
                const customer = getCustomerById(rental.customerId);
                const isOverdue = rental.returnDate < todayDate;

                return (
                  <div
                    key={rental.id}
                    className="p-4 hover:bg-neutral-50/60 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-16 rounded overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                        {dress?.imageUrl ? (
                          <img
                            src={dress.imageUrl}
                            alt={dress.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                            Robe
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => dress && onSelectDress(dress.id)}
                            className="text-xs font-semibold text-neutral-900 hover:underline truncate"
                          >
                            {dress?.name || 'Robe de mariée'}
                          </button>
                          <span className="font-mono text-xs text-neutral-500">
                            {dress?.code}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>Mariée :</span>
                          <button
                            onClick={() => customer && onSelectCustomer(customer.id)}
                            className="font-medium text-neutral-800 hover:underline"
                          >
                            {customer?.name}
                          </button>
                          <span className="text-neutral-300">·</span>
                          <span className="text-neutral-500 font-mono">{customer?.phone}</span>
                        </div>
                        <div className="text-xs mt-1">
                          {isOverdue ? (
                            <span className="text-rose-600 font-medium">
                              ⚠️ En retard (prévu le {formatDateDMY(rental.returnDate)})
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">
                              À rendre aujourd'hui : {formatDateDMY(rental.returnDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => onOpenReturn(rental)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors shadow-2xs whitespace-nowrap"
                      >
                        Traiter le retour
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Colonne B : Départs et retraits prévus aujourd'hui */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Départs et retraits du jour
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Robes dont la location commence le {formatDateDMY(todayDate)}
              </p>
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
              {todayPickups.length}
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {todayPickups.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 font-medium">Aucun départ prévu aujourd'hui</p>
                <p className="text-xs text-neutral-400 mt-1">Consultez les réservations pour les prochains jours.</p>
              </div>
            ) : (
              todayPickups.map((rental) => {
                const dress = getDressById(rental.dressId);
                const customer = getCustomerById(rental.customerId);
                const totalDue = rental.rentalPrice + rental.deposit;
                const balance = Math.max(0, totalDue - rental.amountPaid);

                return (
                  <div
                    key={rental.id}
                    className="p-4 hover:bg-neutral-50/60 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-16 rounded overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                        {dress?.imageUrl ? (
                          <img
                            src={dress.imageUrl}
                            alt={dress.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                            Robe
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => dress && onSelectDress(dress.id)}
                            className="text-xs font-semibold text-neutral-900 hover:underline truncate"
                          >
                            {dress?.name || 'Robe'}
                          </button>
                          <span className="font-mono text-xs text-neutral-500">
                            {dress?.code}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>Mariée :</span>
                          <button
                            onClick={() => customer && onSelectCustomer(customer.id)}
                            className="font-medium text-neutral-800 hover:underline"
                          >
                            {customer?.name}
                          </button>
                          <span className="text-neutral-300">·</span>
                          <span className="font-mono">{customer?.phone}</span>
                        </div>
                        <div className="text-xs mt-1 text-neutral-500">
                          Période : {formatDateDMY(rental.rentalStartDate)} – {formatDateDMY(rental.returnDate)}
                          {balance > 0 && (
                            <span className="ml-2 font-mono text-amber-800 font-medium">
                              (Reste dû : {formatCurrency(balance)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {rental.status === 'Réservée' ? (
                        <button
                          onClick={() => updateRentalStatus(rental.id, 'En cours')}
                          className="px-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors whitespace-nowrap"
                        >
                          Marquer retirée
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-medium whitespace-nowrap">
                          ✓ Déjà retirée
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grille secondaire : Réservations à venir & Comptes clients avec solde */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Réservations à venir (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Prochaines réservations confirmées
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Prochains départs de robes inscrits au planning
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('rentals')}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {upcomingRentals.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-neutral-500">Aucune réservation future pour l'instant.</p>
                <button
                  onClick={onOpenNewRental}
                  className="mt-2 text-xs font-medium text-neutral-900 underline"
                >
                  Créer une première réservation
                </button>
              </div>
            ) : (
              upcomingRentals.slice(0, 5).map((rental) => {
                const dress = getDressById(rental.dressId);
                const customer = getCustomerById(rental.customerId);
                const balance = Math.max(
                  0,
                  rental.rentalPrice + rental.deposit - rental.amountPaid
                );

                return (
                  <div
                    key={rental.id}
                    className="p-4 hover:bg-neutral-50/60 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-14 rounded overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                        {dress?.imageUrl ? (
                          <img
                            src={dress.imageUrl}
                            alt={dress.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                            Robe
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-900 truncate">
                            {dress?.name}
                          </span>
                          <span className="font-mono text-xs text-neutral-400">
                            ({dress?.code})
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 mt-0.5">
                          Mariée : <span className="font-medium">{customer?.name}</span>
                        </div>
                        <div className="text-xs font-mono text-neutral-500 mt-0.5">
                          {formatDateDMY(rental.rentalStartDate)} → {formatDateDMY(rental.returnDate)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-semibold text-neutral-900 tabular-nums">
                        {formatCurrency(rental.rentalPrice)}
                      </div>
                      {balance > 0 ? (
                        <div className="text-xs text-amber-800 font-mono mt-0.5">
                          Reste : {formatCurrency(balance)}
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-700 font-mono mt-0.5">
                          Payé intégralement
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Montants impayés (1 col) */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Soldes en attente d'encaissement
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Règlements à percevoir
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('payments')}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              <span>Registre</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {unpaidRentals.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                Tous les dossiers sont entièrement réglés.
              </div>
            ) : (
              unpaidRentals.slice(0, 4).map((rental) => {
                const customer = getCustomerById(rental.customerId);
                const dress = getDressById(rental.dressId);
                const total = rental.rentalPrice + rental.deposit + (rental.additionalCharges || 0);
                const remaining = total - rental.amountPaid;

                return (
                  <div key={rental.id} className="p-4 hover:bg-neutral-50/60 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-900">
                        {customer?.name}
                      </span>
                      <span className="font-mono font-bold text-amber-800 tabular-nums">
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
                      <span className="truncate">{dress?.code} · {dress?.name}</span>
                      <span className="font-mono text-neutral-400">
                        Début {formatDateDMY(rental.rentalStartDate)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-mono">
                        Payé : {formatCurrency(rental.amountPaid)} / {formatCurrency(total)}
                      </span>
                      <button
                        onClick={() => onNavigateTab('payments')}
                        className="text-neutral-900 hover:underline font-medium text-xs"
                      >
                        Encaisser →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
