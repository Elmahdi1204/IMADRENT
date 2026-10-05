import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  User,
  Shirt,
  X,
  Plus,
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { PaymentMethod, PaymentType } from '../types';
import { formatCurrency, formatDateDMY } from '../utils/dateUtils';

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDressId?: string;
  preselectedCustomerId?: string;
  onSuccess?: (rentalId: string) => void;
}

export const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  onClose,
  preselectedDressId,
  preselectedCustomerId,
  onSuccess,
}) => {
  const {
    todayDate,
    dresses,
    customers,
    createRental,
    checkDressConflict,
    addCustomer,
  } = useRental();

  const [customerId, setCustomerId] = useState(preselectedCustomerId || '');
  const [dressId, setDressId] = useState(preselectedDressId || '');
  const [rentalStartDate, setRentalStartDate] = useState(todayDate);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const [rentalPrice, setRentalPrice] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [notes, setNotes] = useState('');

  // Avertissement de double réservation
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Ajout rapide d'une cliente
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  useEffect(() => {
    if (preselectedDressId) {
      setDressId(preselectedDressId);
    }
  }, [preselectedDressId]);

  useEffect(() => {
    if (preselectedCustomerId) {
      setCustomerId(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);

  useEffect(() => {
    const selectedDress = dresses.find((d) => d.id === dressId);
    if (selectedDress) {
      setRentalPrice(selectedDress.rentalPrice);
      setDeposit(selectedDress.deposit);
    }
  }, [dressId, dresses]);

  // Détection en temps réel du chevauchement de dates
  useEffect(() => {
    if (!dressId || !rentalStartDate || !returnDate) {
      setConflictWarning(null);
      return;
    }

    if (rentalStartDate > returnDate) {
      setConflictWarning('La date de retour doit être égale ou postérieure à la date de début de location.');
      return;
    }

    const check = checkDressConflict(dressId, rentalStartDate, returnDate);
    if (check.hasConflict) {
      setConflictWarning(check.message || '⚠️ Conflit de réservation détecté pour cette robe.');
    } else {
      setConflictWarning(null);
    }
  }, [dressId, rentalStartDate, returnDate, checkDressConflict]);

  if (!isOpen) return null;

  const totalContractAmount = rentalPrice + deposit;
  const remainingAmount = Math.max(0, totalContractAmount - amountPaid);

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName) return;

    const created = addCustomer({
      name: newCustomerName,
      phone: newCustomerPhone,
      email: newCustomerEmail,
      address: '',
      notes: 'Inscrite lors de la réservation rapide',
    });

    setCustomerId(created.id);
    setIsAddingNewCustomer(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      alert('Veuillez sélectionner ou ajouter une cliente mariée.');
      return;
    }
    if (!dressId) {
      alert('Veuillez sélectionner une robe de mariée.');
      return;
    }
    if (conflictWarning && conflictWarning.startsWith('⚠️')) {
      const confirmProceed = window.confirm(
        `${conflictWarning}\n\nSouhaitez-vous quand même forcer et enregistrer cette réservation ?`
      );
      if (!confirmProceed) return;
    }

    const initialPayment =
      amountPaid > 0
        ? {
            amount: amountPaid,
            method: paymentMethod,
            type: 'Frais de location' as PaymentType,
            notes: 'Acompte / règlement initial de réservation',
          }
        : undefined;

    const res = createRental(
      {
        customerId,
        dressId,
        rentalStartDate,
        returnDate,
        rentalPrice,
        deposit,
        notes,
      },
      initialPayment
    );

    if (res.success && res.rental) {
      onSuccess?.(res.rental.id);
      onClose();
    } else {
      alert(res.error || 'Échec de l’enregistrement de la réservation.');
    }
  };

  const selectedDress = dresses.find((d) => d.id === dressId);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-neutral-200 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-lg font-semibold text-neutral-900">
              Nouvelle Réservation de Robe de Mariée
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Sélectionnez la mariée, la robe, les dates de contrat et le règlement
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Bannière d'avertissement de conflit (EXIGENCE DU CLIENT) */}
          {conflictWarning && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">{conflictWarning}</p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Cette robe n'est pas disponible sur cet intervalle. Veuillez choisir d'autres dates ou proposer un autre modèle similaire disponible dans la même taille.
                </p>
              </div>
            </div>
          )}

          {/* Choix de la Cliente */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-neutral-800 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span>Mariée / Cliente *</span>
              </label>
              {!isAddingNewCustomer && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewCustomer(true)}
                  className="text-neutral-900 font-medium hover:underline text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ajouter une cliente</span>
                </button>
              )}
            </div>

            {isAddingNewCustomer ? (
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-800">Enregistrement rapide</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCustomer(false)}
                    className="text-neutral-500 hover:text-neutral-800"
                  >
                    Annuler
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nom complet *"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Numéro de mobile *"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded text-xs focus:outline-none font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Adresse email (facultatif)"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-200 rounded text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddCustomer}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800"
                  >
                    Valider & Sélectionner
                  </button>
                </div>
              </div>
            ) : (
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
              >
                <option value="">-- Choisir la mariée --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Choix de la Robe */}
          <div className="space-y-2">
            <label className="text-neutral-800 font-medium flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5 text-neutral-400" />
              <span>Robe de mariée *</span>
            </label>
            <select
              required
              value={dressId}
              onChange={(e) => setDressId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer font-sans"
            >
              <option value="">-- Sélectionner dans l'inventaire --</option>
              {dresses.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name} ({d.size} · {d.color}) — {formatCurrency(d.rentalPrice)} [Statut : {d.status}]
                </option>
              ))}
            </select>

            {selectedDress && (
              <div className="flex items-center gap-3 p-2.5 rounded bg-neutral-50 border border-neutral-200">
                <div className="w-12 h-16 rounded overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                  <img
                    src={selectedDress.imageUrl}
                    alt={selectedDress.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-neutral-900">{selectedDress.name}</div>
                  <div className="text-neutral-500 font-mono mt-0.5">
                    {selectedDress.code} · {selectedDress.silhouette} · {selectedDress.size} · {selectedDress.color}
                  </div>
                  <div className="text-neutral-600 mt-1">
                    Location : <span className="font-mono font-semibold">{formatCurrency(selectedDress.rentalPrice)}</span> + Caution : <span className="font-mono font-semibold">{formatCurrency(selectedDress.deposit)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date de location & Date de retour */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Date de début de location (Retrait) *
              </label>
              <input
                type="date"
                required
                value={rentalStartDate}
                onChange={(e) => setRentalStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Format : {formatDateDMY(rentalStartDate)}
              </span>
            </div>

            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Date de retour prévue *
              </label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Format : {formatDateDMY(returnDate)}
              </span>
            </div>
          </div>

          {/* Détails financiers en DZD */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
            <h4 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">
              Décompte Financier (en Dinar Algérien DA)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Prix de location (DA) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={rentalPrice}
                  onChange={(e) => setRentalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Caution de garantie (DA) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Montant versé aujourd'hui (DA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  max={totalContractAmount}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Mode de règlement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  disabled={amountPaid <= 0}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="Espèces">Espèces</option>
                  <option value="BaridiMob">BaridiMob</option>
                  <option value="Carte bancaire (CIB)">Carte bancaire (CIB)</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                  <option value="Chèque de caution">Chèque de caution</option>
                </select>
              </div>
            </div>

            {/* Calcul du solde */}
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
              <span className="text-neutral-600">Total du contrat (Location + Caution) :</span>
              <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                {formatCurrency(totalContractAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-amber-800">Reste à payer (Solde dû) :</span>
              <span className="font-mono font-bold text-amber-800 text-sm tabular-nums">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              Notes de réservation & demandes particulières
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Heure prévue pour le retrait, accessoires et voile inclus, ajustement corset..."
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-[11px] text-neutral-500">
              {conflictWarning ? '⚠️ Vérifiez le conflit de dates avant de valider' : 'Prêt à valider'}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50 text-neutral-700 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 font-medium shadow-2xs"
              >
                Confirmer la réservation
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
