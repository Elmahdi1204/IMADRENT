import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Shirt,
  X,
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { Dress, DressStatus } from '../types';
import { formatCurrency, formatDateDMY } from '../utils/dateUtils';

interface DressesListProps {
  onBookDress: (dressId: string) => void;
  selectedDressIdFromNav?: string | null;
  onClearSelectedDress?: () => void;
}

export const DressesList: React.FC<DressesListProps> = ({
  onBookDress,
  selectedDressIdFromNav,
  onClearSelectedDress,
}) => {
  const {
    dresses,
    addDress,
    updateDress,
    deleteDress,
    getRentalsForDress,
    getCustomerById,
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Toutes' | DressStatus>('Toutes');
  const [sizeFilter, setSizeFilter] = useState<string>('Toutes');

  // Modale de détail & Modale d'ajout/modification
  const [viewingDress, setViewingDress] = useState<Dress | null>(() => {
    if (selectedDressIdFromNav) {
      return dresses.find((d) => d.id === selectedDressIdFromNav) || null;
    }
    return null;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDress, setEditingDress] = useState<Dress | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    silhouette: 'Trapèze (A-Line)',
    size: '38 (FR)',
    color: 'Ivoire',
    rentalPrice: 50000,
    deposit: 25000,
    status: 'Disponible' as DressStatus,
    imageUrl: '/src/assets/images/dress_celeste_aline_1791186409677.jpg',
    notes: '',
    fabric: '',
  });

  const openAddModal = () => {
    setFormData({
      code: `WD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      silhouette: 'Trapèze (A-Line)',
      size: '38 (FR)',
      color: 'Ivoire',
      rentalPrice: 50000,
      deposit: 25000,
      status: 'Disponible',
      imageUrl: '/src/assets/images/dress_celeste_aline_1791186409677.jpg',
      notes: '',
      fabric: '',
    });
    setEditingDress(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (dress: Dress) => {
    setEditingDress(dress);
    setFormData({
      code: dress.code,
      name: dress.name,
      silhouette: dress.silhouette,
      size: dress.size,
      color: dress.color,
      rentalPrice: dress.rentalPrice,
      deposit: dress.deposit,
      status: dress.status,
      imageUrl: dress.imageUrl,
      notes: dress.notes || '',
      fabric: dress.fabric || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveDress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;

    if (editingDress) {
      updateDress(editingDress.id, formData);
      if (viewingDress?.id === editingDress.id) {
        setViewingDress({ ...viewingDress, ...formData });
      }
    } else {
      const created = addDress(formData);
      setViewingDress(created);
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (dress: Dress) => {
    if (window.confirm(`Confirmez-vous la suppression de la robe "${dress.name}" (${dress.code}) ?`)) {
      deleteDress(dress.id);
      if (viewingDress?.id === dress.id) {
        setViewingDress(null);
      }
    }
  };

  // Filtrage
  const filteredDresses = dresses.filter((dress) => {
    const matchesSearch =
      dress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dress.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dress.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'Toutes' || dress.status === statusFilter;

    const matchesSize = sizeFilter === 'Toutes' || dress.size === sizeFilter;

    return matchesSearch && matchesStatus && matchesSize;
  });

  const uniqueSizes = Array.from(new Set(dresses.map((d) => d.size))).sort();

  const getStatusColor = (status: DressStatus) => {
    switch (status) {
      case 'Disponible':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Louée':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Nettoyage':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Maintenance':
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Titre & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-semibold tracking-tight">
            Collection de Robes de Mariée
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Gestion des références, tailles, statuts, tarifs de location et plannings
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une robe</span>
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher par nom de robe, référence (ex. WD-101), ou nuance de couleur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* Filtre par Taille */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-neutral-500">Taille :</span>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-700 focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="Toutes">Toutes les tailles</option>
              {uniqueSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Boutons d'onglets de statut */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5 border-t border-neutral-100">
          {(['Toutes', 'Disponible', 'Louée', 'Nettoyage', 'Maintenance'] as const).map(
            (status) => {
              const count =
                status === 'Toutes'
                  ? dresses.length
                  : dresses.filter((d) => d.status === status).length;
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

      {/* Grille des robes */}
      {filteredDresses.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <Shirt className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900">Aucune robe ne correspond aux critères</h3>
          <p className="text-xs text-neutral-500 mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('Toutes');
              setSizeFilter('Toutes');
            }}
            className="mt-3 text-xs font-medium text-neutral-900 underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDresses.map((dress) => {
            return (
              <div
                key={dress.id}
                className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden flex flex-col hover:border-neutral-300 transition-all group"
              >
                {/* Photo de la robe */}
                <div
                  onClick={() => setViewingDress(dress)}
                  className="relative aspect-3/4 bg-neutral-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={dress.imageUrl}
                    alt={dress.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Badge de statut */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border backdrop-blur-md ${getStatusColor(
                        dress.status
                      )}`}
                    >
                      {dress.status}
                    </span>
                  </div>

                  {/* Référence */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-neutral-900/80 text-white rounded backdrop-blur-xs">
                      {dress.code}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setViewingDress(dress)}
                      className="font-serif text-base font-semibold text-neutral-900 cursor-pointer hover:underline line-clamp-1"
                    >
                      {dress.name}
                    </h3>

                    {/* Métadonnées sans pilules (Discipline Zero-Pill) */}
                    <div className="text-xs text-neutral-500 mt-1.5 flex items-center gap-1.5">
                      <span>{dress.size}</span>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span>{dress.color}</span>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span>{dress.silhouette}</span>
                    </div>

                    {dress.notes && (
                      <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                        {dress.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-neutral-400">Location / Caution</div>
                      <div className="text-xs font-mono font-semibold text-neutral-900 tabular-nums">
                        {formatCurrency(dress.rentalPrice)}{' '}
                        <span className="text-neutral-400 font-normal">
                          (+{formatCurrency(dress.deposit)} ctn)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(dress)}
                        title="Modifier la robe"
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onBookDress(dress.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors"
                      >
                        Réserver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale de fiche détaillée de la robe */}
      {viewingDress && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* En-tête */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-neutral-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
                  {viewingDress.code}
                </span>
                <h2 className="font-serif text-lg font-semibold text-neutral-900">
                  {viewingDress.name}
                </h2>
              </div>
              <button
                onClick={() => setViewingDress(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo & Statut */}
              <div>
                <div className="aspect-3/4 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img
                    src={viewingDress.imageUrl}
                    alt={viewingDress.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Statut actuel :</span>
                    <select
                      value={viewingDress.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as DressStatus;
                        updateDress(viewingDress.id, { status: newStatus });
                        setViewingDress({ ...viewingDress, status: newStatus });
                      }}
                      className="text-xs font-medium bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-neutral-800 focus:outline-none cursor-pointer"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Louée">Louée</option>
                      <option value="Nettoyage">Nettoyage</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      onBookDress(viewingDress.id);
                      setViewingDress(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors shadow-2xs"
                  >
                    Réserver cette robe
                  </button>
                </div>
              </div>

              {/* Fiche technique & Calendrier des réservations */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-2">
                    Caractéristiques de la robe
                  </h3>
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Silhouette</span>
                      <span className="font-medium text-neutral-800">{viewingDress.silhouette}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Taille</span>
                      <span className="font-medium text-neutral-800">{viewingDress.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Nuance / Couleur</span>
                      <span className="font-medium text-neutral-800">{viewingDress.color}</span>
                    </div>
                    {viewingDress.fabric && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Tissu & Composition</span>
                        <span className="font-medium text-neutral-800">{viewingDress.fabric}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-neutral-200 pt-2">
                      <span className="text-neutral-500">Prix de location</span>
                      <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                        {formatCurrency(viewingDress.rentalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Caution exigée</span>
                      <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                        {formatCurrency(viewingDress.deposit)}
                      </span>
                    </div>
                  </div>
                </div>

                {viewingDress.notes && (
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-1">
                      Notes de confection & conseils
                    </h3>
                    <p className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200/80 leading-relaxed">
                      {viewingDress.notes}
                    </p>
                  </div>
                )}

                {/* Historique des réservations de cette robe */}
                <div>
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-2">
                    Planning des réservations
                  </h3>
                  {(() => {
                    const dressRentals = getRentalsForDress(viewingDress.id);
                    if (dressRentals.length === 0) {
                      return (
                        <p className="text-xs text-neutral-500 italic bg-neutral-50 p-3 rounded">
                          Aucune réservation enregistrée pour cette robe.
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {dressRentals.map((r) => {
                          const cust = getCustomerById(r.customerId);
                          return (
                            <div
                              key={r.id}
                              className="p-2.5 rounded border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-medium text-neutral-800">
                                  {cust?.name || 'Cliente'}
                                </div>
                                <div className="font-mono text-neutral-500 text-[11px] mt-0.5">
                                  {formatDateDMY(r.rentalStartDate)} → {formatDateDMY(r.returnDate)}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  r.status === 'En cours'
                                    ? 'bg-blue-100 text-blue-800'
                                    : r.status === 'Réservée'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-neutral-200 text-neutral-700'
                                }`}
                              >
                                {r.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between">
                  <button
                    onClick={() => openEditModal(viewingDress)}
                    className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier la robe</span>
                  </button>
                  <button
                    onClick={() => handleDelete(viewingDress)}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'ajout ou modification de robe */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-neutral-900">
                {editingDress ? 'Modifier la robe de mariée' : 'Ajouter une nouvelle robe'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDress} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Référence / Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="WD-101"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Nom du modèle *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Robe Céleste Trapèze"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Silhouette
                  </label>
                  <select
                    value={formData.silhouette}
                    onChange={(e) => setFormData({ ...formData, silhouette: e.target.value })}
                    className="w-full px-2 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
                  >
                    <option value="Trapèze (A-Line)">Trapèze (A-Line)</option>
                    <option value="Sirène">Sirène</option>
                    <option value="Princesse / Bal">Princesse / Bal</option>
                    <option value="Bohème fluide">Bohème fluide</option>
                    <option value="Fourreau">Fourreau</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Taille
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="38 (FR)"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Couleur
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Ivoire / Blanc Pur"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
                  />
                </div>
              </div>

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
                    value={formData.rentalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, rentalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Caution exigée (DA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.deposit}
                    onChange={(e) =>
                      setFormData({ ...formData, deposit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Statut initial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as DressStatus })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Louée">Louée</option>
                    <option value="Nettoyage">Nettoyage</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Composition / Tissu
                  </label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="Satin Duchesse, Dentelle de Calais..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Sélectionner la photo catalogue
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { label: 'Trapèze', path: '/src/assets/images/dress_celeste_aline_1791186409677.jpg' },
                    { label: 'Sirène', path: '/src/assets/images/dress_seraphina_mermaid_1791186421847.jpg' },
                    { label: 'Princesse', path: '/src/assets/images/dress_aurelia_ballgown_1791186434251.jpg' },
                    { label: 'Bohème', path: '/src/assets/images/dress_valentina_boho_1791186454588.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.path })}
                      className={`p-1 rounded border overflow-hidden text-center ${
                        formData.imageUrl === preset.path
                          ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.path}
                        alt={preset.label}
                        className="w-full aspect-3/4 object-cover rounded"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-neutral-600 block mt-1 truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Ou entrez une URL personnalisée"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Notes de retouche & description
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Détails traîne, longueur du voile conseillé, ajustements..."
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
                  {editingDress ? 'Enregistrer les modifications' : 'Créer la robe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
