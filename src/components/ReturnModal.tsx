import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { Rental, ReturnInspectionData, DressStatus } from '../types';
import { formatCurrency, formatDateDMY } from '../utils/dateUtils';

interface ReturnModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  rental,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { todayDate, getDressById, getCustomerById, processReturn } = useRental();

  if (!isOpen || !rental) return null;

  const dress = getDressById(rental.dressId);
  const customer = getCustomerById(rental.customerId);

  const [returnDate, setReturnDate] = useState(todayDate);
  const [conditionStatus, setConditionStatus] = useState<'impeccable' | 'tache_mineure' | 'endommagee'>('impeccable');
  const [damageNotes, setDamageNotes] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [depositRefundAmount, setDepositRefundAmount] = useState(rental.deposit);
  const [nextDressStatus, setNextDressStatus] = useState<DressStatus>('Nettoyage');

  const handleConditionChange = (condition: 'impeccable' | 'tache_mineure' | 'endommagee') => {
    setConditionStatus(condition);
    if (condition === 'impeccable') {
      setAdditionalCharges(0);
      setDepositRefundAmount(rental.deposit);
      setNextDressStatus('Nettoyage'); // Pressing standard après chaque mariage
    } else if (condition === 'tache_mineure') {
      setAdditionalCharges(4000); // 4 000 DA pressing lourd
      setDepositRefundAmount(Math.max(0, rental.deposit - 4000));
      setNextDressStatus('Nettoyage');
      if (!damageNotes) setDamageNotes('Traces de maquillage au col / bas de traîne sali');
    } else if (condition === 'endommagee') {
      setAdditionalCharges(10000); // 10 000 DA réparation
      setDepositRefundAmount(Math.max(0, rental.deposit - 10000));
      setNextDressStatus('Maintenance');
      if (!damageNotes) setDamageNotes('Déchirure tulle inférieur / perlage décousu');
    }
  };

  const handleDepositSettlementChange = (mode: 'full' | 'keep_damage' | 'keep_all') => {
    if (mode === 'full') {
      setDepositRefundAmount(rental.deposit);
    } else if (mode === 'keep_damage') {
      setDepositRefundAmount(Math.max(0, rental.deposit - additionalCharges));
    } else if (mode === 'keep_all') {
      setDepositRefundAmount(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const returnData: ReturnInspectionData = {
      rentalId: rental.id,
      returnDate,
      conditionStatus,
      damageNotes,
      additionalCharges,
      depositRefundAmount,
      nextDressStatus: nextDressStatus as 'Disponible' | 'Nettoyage' | 'Maintenance',
    };

    processReturn(returnData);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-xl w-full max-h-[92vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-neutral-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-neutral-800" />
            <div>
              <h2 className="font-serif text-lg font-semibold text-neutral-900">
                Traitement du Retour & Inspection
              </h2>
              <p className="text-xs text-neutral-500 font-mono">
                {rental.rentalCode} · Prévu le {formatDateDMY(rental.returnDate)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Fiche récapitulative Robe & Mariée */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200/80 flex items-center gap-4">
            <div className="w-14 h-20 rounded overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200">
              {dress?.imageUrl && (
                <img
                  src={dress.imageUrl}
                  alt={dress.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-neutral-900 text-sm truncate">
                  {dress?.name}
                </h4>
                <span className="font-mono text-xs text-neutral-500">{dress?.code}</span>
              </div>
              <div className="text-neutral-600 mt-1">
                Mariée : <span className="font-medium text-neutral-900">{customer?.name}</span> ({customer?.phone})
              </div>
              <div className="text-neutral-500 font-mono mt-1">
                Période : {formatDateDMY(rental.rentalStartDate)} → {formatDateDMY(rental.returnDate)}
              </div>
              <div className="text-neutral-500 font-mono mt-1">
                Caution bloquée : <span className="font-semibold text-neutral-900">{formatCurrency(rental.deposit)}</span>
              </div>
            </div>
          </div>

          {/* Date effective de restitution */}
          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              Date effective de retour *
            </label>
            <input
              type="date"
              required
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
            />
          </div>

          {/* Contrôle de l'état de la robe (Check for damage) */}
          <div>
            <label className="block text-neutral-700 font-medium mb-2">
              Contrôle de conformité & État physique
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleConditionChange('impeccable')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  conditionStatus === 'impeccable'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Impeccable</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Usure normale, propre, aucune déchirure
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleConditionChange('tache_mineure')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  conditionStatus === 'tache_mineure'
                    ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Taches</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Nécessite pressing spécialisé intensif
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleConditionChange('endommagee')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  conditionStatus === 'endommagee'
                    ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-600'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Endommagée</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Accroc, perlage manquant, retouche requise
                </p>
              </button>
            </div>
          </div>

          {/* Notes d'inspection */}
          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              Rapport d'inspection / Détails des dégradations
            </label>
            <textarea
              rows={2}
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              placeholder="Précisez l'état de l'ourlet, boutons, doublure..."
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
            />
          </div>

          {/* Règlement financier : Frais supplémentaires & Restitution de caution */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
            <h4 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">
              Décompte de Sortie & Restitution de Caution (DA)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Frais supplémentaires (DA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={additionalCharges}
                  onChange={(e) => {
                    const charge = Number(e.target.value);
                    setAdditionalCharges(charge);
                    setDepositRefundAmount(Math.max(0, rental.deposit - charge));
                  }}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md focus:outline-none font-mono"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  (Pressing intensif, retard, retouche)
                </span>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Caution restituée à la mariée (DA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  max={rental.deposit}
                  value={depositRefundAmount}
                  onChange={(e) => setDepositRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md focus:outline-none font-mono"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Caution initiale : {formatCurrency(rental.deposit)}
                </span>
              </div>
            </div>

            {/* Raccourcis pour la caution */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-neutral-500">Raccourcis :</span>
              <button
                type="button"
                onClick={() => handleDepositSettlementChange('full')}
                className="px-2 py-0.5 text-[11px] bg-white border border-neutral-200 rounded hover:bg-neutral-100"
              >
                Restituer 100% ({formatCurrency(rental.deposit)})
              </button>
              <button
                type="button"
                onClick={() => handleDepositSettlementChange('keep_damage')}
                className="px-2 py-0.5 text-[11px] bg-white border border-neutral-200 rounded hover:bg-neutral-100"
              >
                Déduire frais ({formatCurrency(Math.max(0, rental.deposit - additionalCharges))})
              </button>
              <button
                type="button"
                onClick={() => handleDepositSettlementChange('keep_all')}
                className="px-2 py-0.5 text-[11px] bg-white border border-neutral-200 rounded hover:bg-neutral-100"
              >
                Retenir tout (0 DA)
              </button>
            </div>
          </div>

          {/* Nouveau statut de la robe */}
          <div>
            <label className="block text-neutral-700 font-medium mb-1">
              Statut de la robe réintégrée au stock *
            </label>
            <select
              value={nextDressStatus}
              onChange={(e) => setNextDressStatus(e.target.value as DressStatus)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
            >
              <option value="Disponible">Disponible (Prête immédiatement pour les essayages)</option>
              <option value="Nettoyage">Nettoyage (Envoyée au pressing écologique spécialisé)</option>
              <option value="Maintenance">Maintenance (En atelier pour retouches / couture)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
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
              Valider le retour & réintégrer au stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
