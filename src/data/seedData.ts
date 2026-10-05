import { Dress, Customer, Rental, Payment } from '../types';

export const INITIAL_TODAY_DATE = '2026-10-05';

export const INITIAL_DRESSES: Dress[] = [
  {
    id: 'dress-1',
    code: 'WD-101',
    name: 'Robe Céleste Trapèze Dentelle de Calais',
    silhouette: 'Trapèze (A-Line)',
    size: '38 (FR)',
    color: 'Ivoire',
    rentalPrice: 55000,
    deposit: 25000,
    status: 'Louée',
    imageUrl: '/src/assets/images/dress_celeste_aline_1791186409677.jpg',
    notes: 'Décolleté cœur avec bustier en dentelle brodée main et traîne chapelle en organza.',
    fabric: 'Dentelle de Calais & Organza de soie'
  },
  {
    id: 'dress-2',
    code: 'WD-102',
    name: 'Robe Séraphina Sirène Crêpe de Soie',
    silhouette: 'Sirène',
    size: '36 (FR)',
    color: 'Champagne doux',
    rentalPrice: 48000,
    deposit: 20000,
    status: 'Louée',
    imageUrl: '/src/assets/images/dress_seraphina_mermaid_1791186421847.jpg',
    notes: 'Ligne épurée moderne avec dos bénitier plongeant et boutonnage délicat le long de la colonne.',
    fabric: 'Crêpe lourd de soie naturelle'
  },
  {
    id: 'dress-3',
    code: 'WD-103',
    name: 'Robe Aurélia Princesse Royale Perlée',
    silhouette: 'Princesse / Bal',
    size: '40 (FR)',
    color: 'Blanc Pur',
    rentalPrice: 65000,
    deposit: 30000,
    status: 'Disponible',
    imageUrl: '/src/assets/images/dress_aurelia_ballgown_1791186434251.jpg',
    notes: 'Corset structuré orné de micro-perles de nacre, jupe volumineuse en satin duchesse impérial.',
    fabric: 'Satin Duchesse & Perles fines'
  },
  {
    id: 'dress-4',
    code: 'WD-104',
    name: 'Robe Valentina Bohème Épaules Dénudées',
    silhouette: 'Bohème fluide',
    size: '38 (FR)',
    color: 'Ivoire chaud',
    rentalPrice: 52000,
    deposit: 25000,
    status: 'Disponible',
    imageUrl: '/src/assets/images/dress_valentina_boho_1791186454588.jpg',
    notes: 'Manches tombantes amovibles en dentelle florale, jupe fluide et vaporeuse en mousseline.',
    fabric: 'Dentelle florale & Mousseline de soie'
  },
  {
    id: 'dress-5',
    code: 'WD-105',
    name: 'Robe Geneviève Minimaliste Fourreau',
    silhouette: 'Fourreau',
    size: '42 (FR)',
    color: 'Champagne',
    rentalPrice: 42000,
    deposit: 20000,
    status: 'Nettoyage',
    imageUrl: '/src/assets/images/dress_seraphina_mermaid_1791186421847.jpg',
    notes: 'Encolure carrée avec fente latérale discrète. Envoyée au pressing écologique spécialisé le 4 oct.',
    fabric: 'Crêpe mat extensible'
  },
  {
    id: 'dress-6',
    code: 'WD-106',
    name: 'Robe Ophélia Romantique Tulle Brodé',
    silhouette: 'Trapèze (A-Line)',
    size: '44 (FR)',
    color: 'Ivoire rosé',
    rentalPrice: 58000,
    deposit: 25000,
    status: 'Disponible',
    imageUrl: '/src/assets/images/dress_celeste_aline_1791186409677.jpg',
    notes: 'Sous-jupe nuance rose poudré, pétales 3D appliqués à la main sur toute la traîne.',
    fabric: 'Tulle multicouche & Organza'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Sofia Miller',
    phone: '0550 23 89 01',
    email: 'sofia.m@example.com',
    address: 'Hydra, Alger',
    weddingDate: '2026-10-07',
    notes: 'Essayages validés. Retrait anticipé d’une journée pour la séance photo de la veille.',
    createdAt: '2026-09-15'
  },
  {
    id: 'cust-2',
    name: 'Inès Davis',
    phone: '0771 34 56 12',
    email: 'ines.d@example.com',
    address: 'Sidi Yahia, Alger',
    weddingDate: '2026-10-03',
    notes: 'Mariage en bord de mer. Doit ramener la robe aujourd’hui avant 17h00.',
    createdAt: '2026-09-10'
  },
  {
    id: 'cust-3',
    name: 'Amina Benali',
    phone: '0661 89 04 32',
    email: 'amina.benali@example.com',
    address: 'Dely Ibrahim, Alger',
    weddingDate: '2026-10-17',
    notes: 'A réservé la Robe Aurélia Princesse pour sa grande cérémonie. Solde à régler au retrait.',
    createdAt: '2026-09-22'
  },
  {
    id: 'cust-4',
    name: 'Chanez Martin',
    phone: '0555 78 90 12',
    email: 'chanez.m@example.com',
    address: 'Chéraga, Alger',
    weddingDate: '2026-10-24',
    notes: 'Mariage en plein air. A payé la totalité d’avance via BaridiMob.',
    createdAt: '2026-09-28'
  },
  {
    id: 'cust-5',
    name: 'Yasmine Kaci',
    phone: '0770 90 12 34',
    email: 'yasmine.kaci@example.com',
    address: 'El Biar, Alger',
    weddingDate: '2026-09-22',
    notes: 'Cliente fidèle. Robe retournée en état impeccable lors de sa dernière location.',
    createdAt: '2026-08-30'
  }
];

export const INITIAL_RENTALS: Rental[] = [
  {
    id: 'rental-1',
    rentalCode: 'LOC-2026-101',
    customerId: 'cust-1',
    dressId: 'dress-1', // Céleste Trapèze
    rentalStartDate: '2026-10-05', // Débute AUJOURD'HUI
    returnDate: '2026-10-08',
    rentalPrice: 55000,
    deposit: 25000,
    amountPaid: 80000,
    additionalCharges: 0,
    depositReturned: 0,
    status: 'En cours',
    notes: 'Récupérée ce matin pour la cérémonie du 7 octobre. Tous les frais sont réglés.',
    createdAt: '2026-09-15'
  },
  {
    id: 'rental-2',
    rentalCode: 'LOC-2026-102',
    customerId: 'cust-2',
    dressId: 'dress-2', // Séraphina Sirène
    rentalStartDate: '2026-10-02',
    returnDate: '2026-10-05', // Retour AUJOURD'HUI
    rentalPrice: 48000,
    deposit: 20000,
    amountPaid: 68000,
    additionalCharges: 0,
    depositReturned: 0,
    status: 'En cours',
    notes: 'La mariée ramène la robe cet après-midi. Inspection en attente.',
    createdAt: '2026-09-10'
  },
  {
    id: 'rental-3',
    rentalCode: 'LOC-2026-103',
    customerId: 'cust-3', // Amina Benali
    dressId: 'dress-3', // Aurélia Princesse (WD-103)
    rentalStartDate: '2026-10-15', // Réservée du 15/10/2026 au 18/10/2026 !
    returnDate: '2026-10-18',
    rentalPrice: 65000,
    deposit: 30000,
    amountPaid: 35000, // Acompte payé
    additionalCharges: 0,
    depositReturned: 0,
    status: 'Réservée',
    notes: 'Acompte de réservation versé. Reste 60 000 DA à régler au moment du retrait.',
    createdAt: '2026-09-22'
  },
  {
    id: 'rental-4',
    rentalCode: 'LOC-2026-104',
    customerId: 'cust-4',
    dressId: 'dress-4', // Valentina Bohème
    rentalStartDate: '2026-10-22',
    returnDate: '2026-10-26',
    rentalPrice: 52000,
    deposit: 25000,
    amountPaid: 77000,
    additionalCharges: 0,
    depositReturned: 0,
    status: 'Réservée',
    notes: 'Règlement intégral effectué via BaridiMob.',
    createdAt: '2026-09-28'
  },
  {
    id: 'rental-5',
    rentalCode: 'LOC-2026-095',
    customerId: 'cust-5',
    dressId: 'dress-1',
    rentalStartDate: '2026-09-20',
    returnDate: '2026-09-24',
    actualReturnDate: '2026-09-24',
    rentalPrice: 55000,
    deposit: 25000,
    amountPaid: 80000,
    additionalCharges: 0,
    depositReturned: 25000,
    status: 'Terminée',
    notes: 'Robe rendue en état impeccable. Caution restituée dans son intégralité.',
    createdAt: '2026-08-30'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    rentalId: 'rental-1',
    amount: 55000,
    date: '2026-09-15',
    method: 'Carte bancaire (CIB)',
    type: 'Frais de location',
    notes: 'Paiement des frais de location lors de la réservation'
  },
  {
    id: 'pay-2',
    rentalId: 'rental-1',
    amount: 25000,
    date: '2026-10-05',
    method: 'Espèces',
    type: 'Caution de garantie',
    notes: 'Caution de garantie déposée ce matin au retrait de la robe'
  },
  {
    id: 'pay-3',
    rentalId: 'rental-2',
    amount: 68000,
    date: '2026-09-10',
    method: 'BaridiMob',
    type: 'Frais de location',
    notes: 'Frais de location + caution de 20 000 DA réglés par BaridiMob'
  },
  {
    id: 'pay-4',
    rentalId: 'rental-3',
    amount: 35000,
    date: '2026-09-22',
    method: 'BaridiMob',
    type: 'Frais de location',
    notes: 'Acompte de confirmation de réservation'
  },
  {
    id: 'pay-5',
    rentalId: 'rental-4',
    amount: 77000,
    date: '2026-09-28',
    method: 'Virement bancaire',
    type: 'Frais de location',
    notes: 'Paiement intégral (52 000 DA location + 25 000 DA caution)'
  },
  {
    id: 'pay-6',
    rentalId: 'rental-5',
    amount: 80000,
    date: '2026-08-30',
    method: 'Espèces',
    type: 'Frais de location',
    notes: 'Frais de location et caution versés en espèces'
  },
  {
    id: 'pay-7',
    rentalId: 'rental-5',
    amount: 25000,
    date: '2026-09-24',
    method: 'Espèces',
    type: 'Restitution de caution',
    notes: 'Restitution intégrale de la caution après contrôle de conformité'
  }
];
