import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { Payment, PaymentMethod, PaymentType, Rental } from '../types';
import { formatCurrency, formatDateDMY } from '../utils/dateUtils';

interface PaymentsListProps {
  onOpenReceipt: (rental: Rental) => void;
  targetRentalForPayment?: Rental | null;
  onClearTargetRental?: () => void;
}

export const PaymentsList: React.FC<PaymentsListProps> = ({
  onOpenReceipt,
  targetRentalForPayment,
  onClearTargetRental,
}) => {
  const {
    payments,
    rentals,
    addPayment,
    getCustomerById,
    getDressById,
    todayDate,
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('Toutes');
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(
    !!targetRentalForPayment
  );

  const [selectedRentalId, setSelectedRentalId] = useState(
    targetRentalForPayment ? targetRentalForPayment.id : ''
  );
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [paymentType, setPaymentType] = useState<PaymentType>('Frais de location');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayDate);

  React.useEffect(() => {
    if (targetRentalForPayment) {
      setSelectedRentalId(targetRentalForPayment.id);
      const total =
        targetRentalForPayment.rentalPrice +
        targetRentalForPayment.deposit +
        (targetRentalForPayment.additionalCharges || 0);
      const remaining = Math.max(0, total - targetRentalForPayment.amountPaid);
      setPaymentAmount(remaining);
      setIsAddPaymentModalOpen(true);
    }
  }, [targetRentalForPayment]);

  const handleOpenAddPayment = (rental?: Rental) => {
    if (rental) {
      setSelectedRentalId(rental.id);
      const total = rental.rentalPrice + rental.deposit + (rental.additionalCharges || 0);
      const remaining = Math.max(0, total - rental.amountPaid);
      setPaymentAmount(remaining);
    } else {
      const firstUnpaid = rentals.find((r) => {
        const total = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
        return total > r.amountPaid && r.status !== 'Annulée';
      });
      if (firstUnpaid) {
        setSelectedRentalId(firstUnpaid.id);
        const total = firstUnpaid.rentalPrice + firstUnpaid.deposit + (firstUnpaid.additionalCharges || 0);
        setPaymentAmount(Math.max(0, total - firstUnpaid.amountPaid));
      } else if (rentals.length > 0) {
        setSelectedRentalId(rentals[0].id);
        setPaymentAmount(10000);
      }
    }
    setPaymentDate(todayDate);
    setIsAddPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalId || paymentAmount <= 0) return;

    addPayment({
      rentalId: selectedRentalId,
      amount: paymentAmount,
      date: paymentDate,
      method: paymentMethod,
      type: paymentType,
      notes: paymentNotes || 'Paiement enregistré',
    });

    setIsAddPaymentModalOpen(false);
    onClearTargetRental?.();
    setPaymentNotes('');
  };

  // Indicateurs financiers
  const totalRentalValue = rentals.reduce((sum, r) => {
    if (r.status === 'Annulée') return sum;
    return sum + r.rentalPrice;
  }, 0);

  const totalCollected = payments.reduce((sum, p) => {
    if (p.type === 'Restitution de caution') return sum;
    return sum + p.amount;
  }, 0);

  const totalOutstanding = rentals.reduce((sum, r) => {
    if (r.status === 'Annulée') return sum;
    const total = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
    return sum + Math.max(0, total - r.amountPaid);
  }, 0);

  const filteredPayments = payments.filter((p) => {
    const rental = rentals.find((r) => r.id === p.rentalId);
    const cust = rental ? getCustomerById(rental.customerId) : null;

    const matchesSearch =
      (rental?.rentalCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'Toutes' || p.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Titre & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-semibold tracking-tight">
            Registre Financier & Paiements
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Suivi des encaissements en Dinar Algérien (DA), cautions et restitutions
          </p>
        </div>
        <button
          onClick={() => handleOpenAddPayment()}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un paiement</span>
        </button>
      </div>

      {/* Cartes d'indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>Valeur totale réservée</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-neutral-900">
            {formatCurrency(totalRentalValue)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Sur l'ensemble des contrats</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>Total encaissé</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-emerald-700">
            {formatCurrency(totalCollected)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Frais de location et cautions perçus</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>Solde restant à percevoir</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-amber-700">
            {formatCurrency(totalOutstanding)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Dû par les mariées avant ou au retrait</p>
        </div>
      </div>

      {/* Section 1 : Dossiers avec solde restant */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Dossiers avec solde restant dû
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Locations dont le paiement complet n'a pas encore été perçu
            </p>
          </div>
        </div>

        {rentals.filter((r) => {
          const tot = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
          return tot > r.amountPaid && r.status !== 'Annulée';
        }).length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Aucun compte en attente de règlement. Tout est payé !
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Code Contrat</th>
                  <th className="py-2.5 px-4">Mariée / Cliente</th>
                  <th className="py-2.5 px-4">Robe de mariée</th>
                  <th className="py-2.5 px-4 text-right">Total Contrat</th>
                  <th className="py-2.5 px-4 text-right">Déjà Versé</th>
                  <th className="py-2.5 px-4 text-right">Reste Dû</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {rentals
                  .filter((r) => {
                    const tot = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
                    return tot > r.amountPaid && r.status !== 'Annulée';
                  })
                  .map((r) => {
                    const customer = getCustomerById(r.customerId);
                    const dress = getDressById(r.dressId);
                    const total = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
                    const remaining = total - r.amountPaid;

                    return (
                      <tr key={r.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-semibold text-neutral-900 font-mono">
                          {r.rentalCode}
                        </td>
                        <td className="py-3 px-4 font-sans font-medium text-neutral-800">
                          {customer?.name}
                        </td>
                        <td className="py-3 px-4 font-sans text-neutral-600">
                          {dress?.code} · {dress?.name}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-neutral-700">
                          {formatCurrency(total)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-emerald-700">
                          {formatCurrency(r.amountPaid)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold text-amber-800">
                          {formatCurrency(remaining)}
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => handleOpenAddPayment(r)}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors"
                          >
                            Encaisser le solde
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2 : Historique des transactions */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Journal des transactions
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Historique des encaissements, cautions et restitutions
            </p>
          </div>

          {/* Recherche & Filtre par méthode */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher paiements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
              />
            </div>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
            >
              <option value="Toutes">Tous les modes</option>
              <option value="Espèces">Espèces</option>
              <option value="BaridiMob">BaridiMob</option>
              <option value="Carte bancaire (CIB)">Carte bancaire (CIB)</option>
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Chèque de caution">Chèque de caution</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-medium">
              <tr>
                <th className="py-2.5 px-4">Date de paiement</th>
                <th className="py-2.5 px-4">Contrat / Mariée</th>
                <th className="py-2.5 px-4">Type de paiement</th>
                <th className="py-2.5 px-4">Mode de règlement</th>
                <th className="py-2.5 px-4 text-right">Montant</th>
                <th className="py-2.5 px-4">Notes & Références</th>
                <th className="py-2.5 px-4 text-right">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPayments.map((payment) => {
                const rental = rentals.find((r) => r.id === payment.rentalId);
                const customer = rental ? getCustomerById(rental.customerId) : null;
                const isRefund = payment.type === 'Restitution de caution';

                return (
                  <tr key={payment.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-mono whitespace-nowrap text-neutral-700">
                      {formatDateDMY(payment.date)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-neutral-900">
                        {rental?.rentalCode || 'N/A'}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {customer?.name}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          isRefund
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : payment.type === 'Caution de garantie'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {payment.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                      {payment.method}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold tabular-nums">
                      <span className={isRefund ? 'text-rose-600' : 'text-neutral-900'}>
                        {isRefund ? `-${formatCurrency(payment.amount)}` : formatCurrency(payment.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-neutral-500 truncate max-w-xs">
                      {payment.notes || '—'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {rental && (
                        <button
                          onClick={() => onOpenReceipt(rental)}
                          className="text-xs text-neutral-600 hover:text-neutral-900 font-medium underline"
                        >
                          Voir le reçu
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale d'enregistrement de paiement */}
      {isAddPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-neutral-900">
                Enregistrer un paiement
              </h2>
              <button
                onClick={() => {
                  setIsAddPaymentModalOpen(false);
                  onClearTargetRental?.();
                }}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Sélectionner la réservation *
                </label>
                <select
                  required
                  value={selectedRentalId}
                  onChange={(e) => {
                    setSelectedRentalId(e.target.value);
                    const r = rentals.find((item) => item.id === e.target.value);
                    if (r) {
                      const total = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
                      const rem = Math.max(0, total - r.amountPaid);
                      setPaymentAmount(rem);
                    }
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choisir la réservation --</option>
                  {rentals.map((r) => {
                    const cust = getCustomerById(r.customerId);
                    const dress = getDressById(r.dressId);
                    const total = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
                    const remaining = Math.max(0, total - r.amountPaid);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.rentalCode} - {cust?.name} ({dress?.code}) — Reste : {formatCurrency(remaining)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Montant à verser (DA) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Date du paiement *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Mode de règlement *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="BaridiMob">BaridiMob</option>
                    <option value="Carte bancaire (CIB)">Carte bancaire (CIB)</option>
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Chèque de caution">Chèque de caution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Type d'opération *
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
                  >
                    <option value="Frais de location">Frais de location</option>
                    <option value="Caution de garantie">Caution de garantie</option>
                    <option value="Frais de dégradation / retard">Frais de dégradation / retard</option>
                    <option value="Restitution de caution">Restitution de caution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Référence du paiement / Reçu
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Numéro de reçu, transaction BaridiMob, etc."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPaymentModalOpen(false);
                    onClearTargetRental?.();
                  }}
                  className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50 text-neutral-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 font-medium shadow-2xs"
                >
                  Valider et enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
