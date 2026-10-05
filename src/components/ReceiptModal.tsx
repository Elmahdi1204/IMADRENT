import React from 'react';
import { Printer, X } from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { Rental } from '../types';
import { formatDateDMY, formatCurrency } from '../utils/dateUtils';

interface ReceiptModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  rental,
  isOpen,
  onClose,
}) => {
  const { getDressById, getCustomerById, getPaymentsForRental } = useRental();

  if (!isOpen || !rental) return null;

  const dress = getDressById(rental.dressId);
  const customer = getCustomerById(rental.customerId);
  const payments = getPaymentsForRental(rental.id);

  const totalCharges =
    rental.rentalPrice + rental.deposit + (rental.additionalCharges || 0);
  const remainingDue = Math.max(0, totalCharges - rental.amountPaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* Barre d'action supérieure (masquée à l'impression) */}
        <div className="no-print sticky top-0 bg-white px-6 py-4 border-b border-neutral-200 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-lg font-semibold text-neutral-900">
              Contrat de Location & Reçu
            </h2>
            <p className="text-xs text-neutral-500 font-mono">{rental.rentalCode}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le contrat</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps du document imprimable */}
        <div className="p-8 sm:p-10 space-y-6 text-neutral-800 bg-white">
          {/* En-tête de la boutique */}
          <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
                Aura Mariée Atelier
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Location de Robes de Mariée de Haute Confection & Stylisme
              </p>
              <p className="text-xs text-neutral-500 font-mono">
                Alger, Algérie · contact@auramariee.dz · +213 (0) 550 00 11 22
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-neutral-900 block">
                {rental.rentalCode}
              </span>
              <span className="text-xs text-neutral-500 font-mono block mt-0.5">
                Date : {formatDateDMY(rental.createdAt)}
              </span>
              <span className="inline-block mt-2 px-2.5 py-0.5 text-[11px] font-semibold rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                Statut : {rental.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Fiches cliente et calendrier */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="bg-neutral-50 p-4 rounded border border-neutral-200/80">
              <span className="text-neutral-400 uppercase font-semibold text-[10px] block mb-1">
                Mariée / Cliente
              </span>
              <div className="font-semibold text-neutral-900 text-sm">
                {customer?.name || 'Cliente'}
              </div>
              <div className="text-neutral-600 font-mono mt-1">{customer?.phone}</div>
              <div className="text-neutral-600 mt-0.5">{customer?.email}</div>
              <div className="text-neutral-500 mt-1">{customer?.address}</div>
            </div>

            <div className="bg-neutral-50 p-4 rounded border border-neutral-200/80">
              <span className="text-neutral-400 uppercase font-semibold text-[10px] block mb-1">
                Période de location
              </span>
              <div className="flex justify-between mt-1">
                <span className="text-neutral-500">Date de retrait :</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {formatDateDMY(rental.rentalStartDate)}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-neutral-500">Retour prévu le :</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {formatDateDMY(rental.returnDate)}
                </span>
              </div>
              {rental.actualReturnDate && (
                <div className="flex justify-between mt-1 pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500">Retour effectif :</span>
                  <span className="font-mono text-emerald-700">
                    {formatDateDMY(rental.actualReturnDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Détail de la robe louée */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 mb-2">
              Désignation de la Robe Louée
            </h3>
            <table className="w-full text-left text-xs border border-neutral-200 rounded overflow-hidden">
              <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
                <tr>
                  <th className="p-3">Référence</th>
                  <th className="p-3">Description du modèle</th>
                  <th className="p-3">Couleur / Taille</th>
                  <th className="p-3 text-right">Location (DA)</th>
                  <th className="p-3 text-right">Caution (DA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="p-3 font-mono font-semibold text-neutral-900">
                    {dress?.code || 'WD-101'}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-neutral-900">{dress?.name}</div>
                    <div className="text-neutral-500 text-[11px]">Silhouette : {dress?.silhouette}</div>
                  </td>
                  <td className="p-3 text-neutral-600">
                    {dress?.color} · {dress?.size}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-neutral-900">
                    {formatCurrency(rental.rentalPrice)}
                  </td>
                  <td className="p-3 text-right font-mono text-neutral-700">
                    {formatCurrency(rental.deposit)}
                  </td>
                </tr>
                {rental.additionalCharges > 0 && (
                  <tr className="bg-amber-50/50">
                    <td className="p-3 font-mono text-neutral-500">FRAIS</td>
                    <td colSpan={3} className="p-3 text-amber-900">
                      Frais supplémentaires : {rental.damageNotes || 'Ajustements contrôle de retour'}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-amber-900">
                      {formatCurrency(rental.additionalCharges)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Décompte financier */}
          <div className="flex justify-end text-xs">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Montant de la location :</span>
                <span className="font-mono">{formatCurrency(rental.rentalPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Caution de garantie :</span>
                <span className="font-mono">{formatCurrency(rental.deposit)}</span>
              </div>
              {rental.additionalCharges > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Frais supplémentaires :</span>
                  <span className="font-mono">{formatCurrency(rental.additionalCharges)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-neutral-900 border-t border-neutral-200 pt-2">
                <span>Total du contrat :</span>
                <span className="font-mono">{formatCurrency(totalCharges)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Total réglé à ce jour :</span>
                <span className="font-mono">-{formatCurrency(rental.amountPaid)}</span>
              </div>
              {rental.depositReturned > 0 && (
                <div className="flex justify-between text-neutral-500 font-medium">
                  <span>Caution restituée :</span>
                  <span className="font-mono">+{formatCurrency(rental.depositReturned)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-neutral-900 border-t-2 border-neutral-900 pt-2">
                <span>Reste à payer :</span>
                <span className="font-mono text-amber-800 tabular-nums">
                  {formatCurrency(remainingDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Historique des paiements */}
          {payments.length > 0 && (
            <div className="pt-2 border-t border-neutral-200">
              <h4 className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider mb-2">
                Historique des versements
              </h4>
              <div className="space-y-1 text-xs font-mono">
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between text-neutral-600">
                    <span>
                      {formatDateDMY(p.date)} · {p.method} ({p.type})
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {p.type === 'Restitution de caution' ? `-${formatCurrency(p.amount)}` : formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditions générales de location */}
          <div className="bg-neutral-50 p-3.5 rounded text-[11px] text-neutral-600 space-y-1 border border-neutral-200/80">
            <div className="font-semibold text-neutral-900">Conditions du contrat de location :</div>
            <p>1. La robe louée doit être restituée avant 17h00 à la date de retour convenue.</p>
            <p>2. La caution de garantie est restituée dans sa totalité après contrôle de conformité à l'état impeccable.</p>
            <p>3. Il est strictement interdit de laver ou repasser la robe soi-même ; l'atelier se charge du pressing spécialisé.</p>
            <p>4. Tout accroc ou tache tenace pourra faire l'objet d'une retenue sur la caution selon devis de retouche.</p>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="border-b border-neutral-300 pb-8" />
              <div className="mt-2 text-neutral-700 font-medium">Signature de la mariée</div>
              <div className="text-[10px] text-neutral-400">Lu et approuvé, bon pour accord</div>
            </div>
            <div>
              <div className="border-b border-neutral-300 pb-8" />
              <div className="mt-2 text-neutral-700 font-medium">Pour l'Atelier Aura Mariée</div>
              <div className="text-[10px] text-neutral-400">Cachet & signature autorisée</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
