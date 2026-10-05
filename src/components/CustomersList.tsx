import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  History,
  Edit2,
  Trash2,
  ChevronRight,
  X,
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { Customer } from '../types';
import { formatDateDMY, formatCurrency } from '../utils/dateUtils';

interface CustomersListProps {
  onBookForCustomer: (customerId: string) => void;
  selectedCustomerIdFromNav?: string | null;
  onClearSelectedCustomer?: () => void;
}

export const CustomersList: React.FC<CustomersListProps> = ({
  onBookForCustomer,
  selectedCustomerIdFromNav,
}) => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getRentalsForCustomer,
    getDressById,
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(() => {
    if (selectedCustomerIdFromNav) {
      return customers.find((c) => c.id === selectedCustomerIdFromNav) || null;
    }
    return null;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    weddingDate: '',
    notes: '',
  });

  const openAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      weddingDate: '',
      notes: '',
    });
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      weddingDate: cust.weddingDate || '',
      notes: cust.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      if (viewingCustomer?.id === editingCustomer.id) {
        setViewingCustomer({ ...viewingCustomer, ...formData });
      }
    } else {
      const created = addCustomer(formData);
      setViewingCustomer(created);
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (cust: Customer) => {
    if (window.confirm(`Confirmez-vous la suppression de la fiche cliente de "${cust.name}" ?`)) {
      deleteCustomer(cust.id);
      if (viewingCustomer?.id === cust.id) {
        setViewingCustomer(null);
      }
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Titre & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-semibold tracking-tight">
            Répertoire des Clientes
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Fiches mariées, coordonnées téléphoniques, date de cérémonie et historique des locations
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle cliente</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de la mariée, numéro de téléphone, email ou ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {/* Cartes Clientes */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <User className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900">Aucune cliente trouvée</h3>
          <p className="text-xs text-neutral-500 mt-1">Essayez un autre mot-clé ou ajoutez une nouvelle mariée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => {
            const customerRentals = getRentalsForCustomer(cust.id);

            return (
              <div
                key={cust.id}
                className="bg-white rounded-lg border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between hover:border-neutral-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        onClick={() => setViewingCustomer(cust)}
                        className="text-base font-semibold text-neutral-900 hover:underline cursor-pointer"
                      >
                        {cust.name}
                      </h3>
                      {cust.weddingDate && (
                        <div className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Mariage : {formatDateDMY(cust.weddingDate)}</span>
                        </div>
                      )}
                    </div>

                    <span className="font-mono text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                      {customerRentals.length} {customerRentals.length <= 1 ? 'location' : 'locations'}
                    </span>
                  </div>

                  {/* Coordonnées */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-mono">{cust.phone || 'Non renseigné'}</span>
                    </div>
                    {cust.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                    )}
                    {cust.address && (
                      <div className="flex items-start gap-2 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="truncate">{cust.address}</span>
                      </div>
                    )}
                  </div>

                  {cust.notes && (
                    <p className="mt-3 text-xs text-neutral-500 line-clamp-2 bg-neutral-50 p-2 rounded border border-neutral-100">
                      {cust.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingCustomer(cust)}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                  >
                    <span>Historique</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(cust)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onBookForCustomer(cust.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors shadow-2xs"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fiche détaillée de la cliente et historique de locations */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-neutral-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-700">
                  {viewingCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-neutral-900">
                    {viewingCustomer.name}
                  </h2>
                  <div className="text-xs text-neutral-500 font-mono">
                    Inscrite le {formatDateDMY(viewingCustomer.createdAt)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Coordonnées */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-500 block mb-0.5">Numéro de téléphone</span>
                  <span className="font-mono text-neutral-900 font-medium">
                    {viewingCustomer.phone || 'Non renseigné'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">Adresse email</span>
                  <span className="text-neutral-900 font-medium">
                    {viewingCustomer.email || 'Non renseignée'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">Adresse de résidence</span>
                  <span className="text-neutral-900">
                    {viewingCustomer.address || 'Non renseignée'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">Date prévue du mariage</span>
                  <span className="font-mono text-neutral-900 font-medium">
                    {viewingCustomer.weddingDate
                      ? formatDateDMY(viewingCustomer.weddingDate)
                      : 'Non spécifiée'}
                  </span>
                </div>
                {viewingCustomer.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-neutral-200">
                    <span className="text-neutral-500 block mb-0.5">Notes de style & mensurations</span>
                    <span className="text-neutral-700 italic">
                      "{viewingCustomer.notes}"
                    </span>
                  </div>
                )}
              </div>

              {/* Historique des locations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-neutral-500" />
                    <span>Historique des locations ({getRentalsForCustomer(viewingCustomer.id).length})</span>
                  </h3>
                  <button
                    onClick={() => {
                      onBookForCustomer(viewingCustomer.id);
                      setViewingCustomer(null);
                    }}
                    className="text-xs font-medium text-white bg-neutral-900 px-3 py-1.5 rounded hover:bg-neutral-800"
                  >
                    + Nouvelle réservation
                  </button>
                </div>

                {(() => {
                  const history = getRentalsForCustomer(viewingCustomer.id);
                  if (history.length === 0) {
                    return (
                      <div className="p-8 text-center bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-500">
                        Aucune location enregistrée pour cette cliente.
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
                      {history.map((rental) => {
                        const dress = getDressById(rental.dressId);
                        const total = rental.rentalPrice + rental.deposit + (rental.additionalCharges || 0);

                        return (
                          <div key={rental.id} className="p-4 bg-white flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-16 rounded overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
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
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-neutral-900">
                                    {dress?.name || 'Robe de mariée'}
                                  </span>
                                  <span className="font-mono text-xs text-neutral-500">
                                    ({dress?.code})
                                  </span>
                                </div>
                                <div className="text-xs font-mono text-neutral-500 mt-1">
                                  {formatDateDMY(rental.rentalStartDate)} → {formatDateDMY(rental.returnDate)}
                                </div>
                                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                                  Code : {rental.rentalCode}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  rental.status === 'Terminée'
                                    ? 'bg-neutral-100 text-neutral-700'
                                    : rental.status === 'En cours'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {rental.status}
                              </span>
                              <div className="font-mono text-xs font-semibold text-neutral-900 mt-1.5 tabular-nums">
                                {formatCurrency(total)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Actions de suppression et modification */}
              <div className="pt-4 border-t border-neutral-200 flex justify-between">
                <button
                  onClick={() => openEditModal(viewingCustomer)}
                  className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modifier la cliente</span>
                </button>
                <button
                  onClick={() => handleDelete(viewingCustomer)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer la fiche</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'ajout / modification de cliente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-neutral-900">
                {editingCustomer ? 'Modifier la fiche cliente' : 'Enregistrer une nouvelle cliente'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Nom complet de la mariée *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex. Amina Benali"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Téléphone (Mobile) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0550 00 00 00"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Date du mariage
                  </label>
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) =>
                      setFormData({ ...formData, weddingDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="mariee@example.com"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Adresse / Ville
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Commune, Ville (ex. Hydra, Alger)"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Notes & particularités de retouche
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Préférences de coupe, accessoires réservés, date des essayages..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50 text-neutral-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 font-medium shadow-2xs"
                >
                  {editingCustomer ? 'Mettre à jour' : 'Enregistrer la cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
