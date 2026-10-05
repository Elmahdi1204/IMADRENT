export type DressStatus = 'Disponible' | 'Louée' | 'Nettoyage' | 'Maintenance';

export interface Dress {
  id: string;
  code: string; // ex. "WD-101"
  name: string; // ex. "Robe Céleste Trapèze en Dentelle"
  silhouette: string; // "Trapèze (A-Line)", "Sirène", "Princesse / Bal", "Bohème fluide", "Fourreau"
  size: string; // "36 (FR)", "38 (FR)", "40 (FR)", "42 (FR)", "44 (FR)"
  color: string; // "Ivoire", "Champagne", "Blanc Pur", "Nude poudré"
  rentalPrice: number; // en DZD (DA)
  deposit: number; // caution en DZD (DA)
  status: DressStatus;
  imageUrl: string;
  notes?: string;
  fabric?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  weddingDate?: string;
  createdAt: string;
}

export type RentalStatus = 'Réservée' | 'En cours' | 'Terminée' | 'Annulée';

export interface Rental {
  id: string;
  rentalCode: string; // ex. "LOC-2026-101"
  customerId: string;
  dressId: string;
  rentalStartDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  actualReturnDate?: string;
  rentalPrice: number; // en DZD
  deposit: number; // caution en DZD
  amountPaid: number; // montant payé en DZD
  additionalCharges: number; // Frais supplémentaires (dégâts, retard, nettoyage lourd) en DZD
  damageNotes?: string;
  depositReturned: number; // caution restituée en DZD
  status: RentalStatus;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod =
  | 'Espèces'
  | 'BaridiMob'
  | 'Carte bancaire (CIB)'
  | 'Virement bancaire'
  | 'Chèque de caution';

export type PaymentType =
  | 'Frais de location'
  | 'Caution de garantie'
  | 'Frais de dégradation / retard'
  | 'Restitution de caution';

export interface Payment {
  id: string;
  rentalId: string;
  amount: number; // en DZD
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  type: PaymentType;
  notes?: string;
}

export interface ReturnInspectionData {
  rentalId: string;
  returnDate: string;
  conditionStatus: 'impeccable' | 'tache_mineure' | 'endommagee';
  damageNotes: string;
  additionalCharges: number; // en DZD
  depositRefundAmount: number; // en DZD
  nextDressStatus: 'Disponible' | 'Nettoyage' | 'Maintenance';
}
