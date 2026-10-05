import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Dress,
  Customer,
  Rental,
  Payment,
  RentalStatus,
  ReturnInspectionData,
  PaymentMethod,
  PaymentType,
} from '../types';
import {
  INITIAL_DRESSES,
  INITIAL_CUSTOMERS,
  INITIAL_RENTALS,
  INITIAL_PAYMENTS,
  INITIAL_TODAY_DATE,
} from '../data/seedData';
import { doDatesOverlap, formatDateDMY, parseDateToMidnight } from '../utils/dateUtils';

interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingRental?: Rental;
  message?: string;
}

interface RentalContextType {
  todayDate: string;
  setTodayDate: (date: string) => void;
  dresses: Dress[];
  customers: Customer[];
  rentals: Rental[];
  payments: Payment[];

  // Dress CRUD
  addDress: (dress: Omit<Dress, 'id'>) => Dress;
  updateDress: (id: string, updates: Partial<Dress>) => void;
  deleteDress: (id: string) => void;

  // Customer CRUD
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Conflict Checking
  checkDressConflict: (
    dressId: string,
    startDate: string,
    returnDate: string,
    excludeRentalId?: string
  ) => ConflictCheckResult;

  // Rental CRUD & Operations
  createRental: (
    data: {
      customerId: string;
      dressId: string;
      rentalStartDate: string;
      returnDate: string;
      rentalPrice: number;
      deposit: number;
      notes?: string;
    },
    initialPayment?: {
      amount: number;
      method: PaymentMethod;
      type: PaymentType;
      notes?: string;
    }
  ) => { success: boolean; rental?: Rental; error?: string };

  updateRentalStatus: (rentalId: string, status: RentalStatus) => void;
  processReturn: (data: ReturnInspectionData) => void;

  // Payment CRUD
  addPayment: (payment: Omit<Payment, 'id'>) => void;

  // Helpers
  getDressById: (id: string) => Dress | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getRentalsForDress: (dressId: string) => Rental[];
  getRentalsForCustomer: (customerId: string) => Rental[];
  getPaymentsForRental: (rentalId: string) => Payment[];

  // Quick stats
  metrics: {
    todayPickupsCount: number;
    todayReturnsCount: number;
    upcomingRentalsCount: number;
    unpaidAmountsTotal: number;
    totalRevenue: number;
  };

  resetToDemoData: () => void;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TODAY: 'aura_mariee_today',
  DRESSES: 'aura_mariee_dresses',
  CUSTOMERS: 'aura_mariee_customers',
  RENTALS: 'aura_mariee_rentals',
  PAYMENTS: 'aura_mariee_payments',
};

export const RentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todayDate, setTodayDateState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TODAY) || INITIAL_TODAY_DATE;
  });

  const [dresses, setDresses] = useState<Dress[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRESSES);
    return saved ? JSON.parse(saved) : INITIAL_DRESSES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [rentals, setRentals] = useState<Rental[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RENTALS);
    return saved ? JSON.parse(saved) : INITIAL_RENTALS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TODAY, todayDate);
  }, [todayDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRESSES, JSON.stringify(dresses));
  }, [dresses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RENTALS, JSON.stringify(rentals));
  }, [rentals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  const setTodayDate = (date: string) => {
    setTodayDateState(date);
  };

  const getDressById = (id: string) => dresses.find((d) => d.id === id);
  const getCustomerById = (id: string) => customers.find((c) => c.id === id);
  const getRentalsForDress = (dressId: string) =>
    rentals.filter((r) => r.dressId === dressId).sort((a, b) => b.rentalStartDate.localeCompare(a.rentalStartDate));
  const getRentalsForCustomer = (customerId: string) =>
    rentals.filter((r) => r.customerId === customerId).sort((a, b) => b.rentalStartDate.localeCompare(a.rentalStartDate));
  const getPaymentsForRental = (rentalId: string) =>
    payments.filter((p) => p.rentalId === rentalId).sort((a, b) => b.date.localeCompare(a.date));

  // Dress CRUD
  const addDress = (dressData: Omit<Dress, 'id'>): Dress => {
    const newDress: Dress = {
      ...dressData,
      id: `dress-${Date.now()}`,
    };
    setDresses((prev) => [newDress, ...prev]);
    return newDress;
  };

  const updateDress = (id: string, updates: Partial<Dress>) => {
    setDresses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const deleteDress = (id: string) => {
    setDresses((prev) => prev.filter((d) => d.id !== id));
  };

  // Customer CRUD
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      createdAt: todayDate,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Conflict Checking with exact user-requested French wording:
  // "⚠️ Cette robe est déjà réservée du 15/10/2026 au 18/10/2026."
  const checkDressConflict = (
    dressId: string,
    startDate: string,
    returnDate: string,
    excludeRentalId?: string
  ): ConflictCheckResult => {
    if (!dressId || !startDate || !returnDate) {
      return { hasConflict: false };
    }

    const activeRentalsForDress = rentals.filter(
      (r) =>
        r.dressId === dressId &&
        r.status !== 'Annulée' &&
        r.status !== 'Terminée' &&
        r.id !== excludeRentalId
    );

    for (const rental of activeRentalsForDress) {
      if (doDatesOverlap(startDate, returnDate, rental.rentalStartDate, rental.returnDate)) {
        const customer = getCustomerById(rental.customerId);
        const customerLabel = customer ? ` (par ${customer.name})` : '';
        const message = `⚠️ Cette robe est déjà réservée du ${formatDateDMY(rental.rentalStartDate)} au ${formatDateDMY(rental.returnDate)}${customerLabel}.`;
        return {
          hasConflict: true,
          conflictingRental: rental,
          message,
        };
      }
    }

    return { hasConflict: false };
  };

  // Create Rental
  const createRental = (
    data: {
      customerId: string;
      dressId: string;
      rentalStartDate: string;
      returnDate: string;
      rentalPrice: number;
      deposit: number;
      notes?: string;
    },
    initialPayment?: {
      amount: number;
      method: PaymentMethod;
      type: PaymentType;
      notes?: string;
    }
  ) => {
    const conflict = checkDressConflict(data.dressId, data.rentalStartDate, data.returnDate);
    if (conflict.hasConflict) {
      return {
        success: false,
        error: conflict.message || 'Conflit de date détecté pour cette robe de mariée.',
      };
    }

    const rentalId = `rental-${Date.now()}`;
    const rentalCode = `LOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const paid = initialPayment ? initialPayment.amount : 0;
    const isStartsTodayOrPast = data.rentalStartDate <= todayDate;
    const initialStatus: RentalStatus = isStartsTodayOrPast ? 'En cours' : 'Réservée';

    const newRental: Rental = {
      id: rentalId,
      rentalCode,
      customerId: data.customerId,
      dressId: data.dressId,
      rentalStartDate: data.rentalStartDate,
      returnDate: data.returnDate,
      rentalPrice: data.rentalPrice,
      deposit: data.deposit,
      amountPaid: paid,
      additionalCharges: 0,
      depositReturned: 0,
      status: initialStatus,
      notes: data.notes || '',
      createdAt: todayDate,
    };

    setRentals((prev) => [newRental, ...prev]);

    if (initialPayment && initialPayment.amount > 0) {
      const newPay: Payment = {
        id: `pay-${Date.now()}`,
        rentalId,
        amount: initialPayment.amount,
        date: todayDate,
        method: initialPayment.method,
        type: initialPayment.type,
        notes: initialPayment.notes || 'Paiement initial lors de la réservation',
      };
      setPayments((prev) => [newPay, ...prev]);
    }

    if (initialStatus === 'En cours') {
      updateDress(data.dressId, { status: 'Louée' });
    }

    return { success: true, rental: newRental };
  };

  const updateRentalStatus = (rentalId: string, status: RentalStatus) => {
    const target = rentals.find((r) => r.id === rentalId);
    if (!target) return;

    setRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status } : r))
    );

    if (status === 'En cours') {
      updateDress(target.dressId, { status: 'Louée' });
    } else if (status === 'Annulée') {
      const otherActive = rentals.find(
        (r) => r.id !== rentalId && r.dressId === target.dressId && r.status === 'En cours'
      );
      if (!otherActive) {
        updateDress(target.dressId, { status: 'Disponible' });
      }
    }
  };

  // Process Return
  const processReturn = (data: ReturnInspectionData) => {
    const rental = rentals.find((r) => r.id === data.rentalId);
    if (!rental) return;

    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === data.rentalId) {
          return {
            ...r,
            actualReturnDate: data.returnDate,
            status: 'Terminée',
            damageNotes: data.damageNotes,
            additionalCharges: data.additionalCharges,
            depositReturned: data.depositRefundAmount,
          };
        }
        return r;
      })
    );

    if (data.additionalCharges > 0) {
      const chargePay: Payment = {
        id: `pay-${Date.now()}`,
        rentalId: rental.id,
        amount: data.additionalCharges,
        date: data.returnDate,
        method: 'Espèces',
        type: 'Frais de dégradation / retard',
        notes: `Frais de contrôle de retour : ${data.damageNotes || 'Ajustements état robe'}`,
      };
      setPayments((prev) => [chargePay, ...prev]);
    }

    if (data.depositRefundAmount > 0) {
      const refundPay: Payment = {
        id: `pay-${Date.now() + 1}`,
        rentalId: rental.id,
        amount: data.depositRefundAmount,
        date: data.returnDate,
        method: 'Espèces',
        type: 'Restitution de caution',
        notes: `Caution restituée après vérification de l'état de la robe`,
      };
      setPayments((prev) => [refundPay, ...prev]);
    }

    updateDress(rental.dressId, { status: data.nextDressStatus });
  };

  // Add Payment
  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };

    setPayments((prev) => [newPayment, ...prev]);

    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === paymentData.rentalId) {
          if (paymentData.type === 'Restitution de caution') {
            return {
              ...r,
              depositReturned: (r.depositReturned || 0) + paymentData.amount,
            };
          } else {
            return {
              ...r,
              amountPaid: (r.amountPaid || 0) + paymentData.amount,
            };
          }
        }
        return r;
      })
    );
  };

  const resetToDemoData = () => {
    setTodayDateState(INITIAL_TODAY_DATE);
    setDresses(INITIAL_DRESSES);
    setCustomers(INITIAL_CUSTOMERS);
    setRentals(INITIAL_RENTALS);
    setPayments(INITIAL_PAYMENTS);
    localStorage.clear();
  };

  // Calculate Metrics
  const todayPickups = rentals.filter(
    (r) =>
      r.rentalStartDate === todayDate &&
      r.status !== 'Annulée' &&
      r.status !== 'Terminée'
  );

  const todayReturns = rentals.filter(
    (r) =>
      r.returnDate === todayDate &&
      r.status === 'En cours'
  );

  const upcomingRentals = rentals.filter((r) => {
    if (r.status === 'Annulée' || r.status === 'Terminée') return false;
    const daysUntilStart = parseDateToMidnight(r.rentalStartDate) - parseDateToMidnight(todayDate);
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;
    return daysUntilStart > 0 && daysUntilStart <= fourteenDays;
  });

  const unpaidAmountsTotal = rentals.reduce((sum, r) => {
    if (r.status === 'Annulée') return sum;
    const totalExpected = r.rentalPrice + r.deposit + (r.additionalCharges || 0);
    const balance = Math.max(0, totalExpected - r.amountPaid);
    return sum + balance;
  }, 0);

  const totalRevenue = payments.reduce((sum, p) => {
    if (p.type === 'Restitution de caution') {
      return sum;
    }
    if (p.type === 'Caution de garantie') {
      return sum; // caution conservée en dépôt de garantie
    }
    return sum + p.amount;
  }, 0);

  return (
    <RentalContext.Provider
      value={{
        todayDate,
        setTodayDate,
        dresses,
        customers,
        rentals,
        payments,
        addDress,
        updateDress,
        deleteDress,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        checkDressConflict,
        createRental,
        updateRentalStatus,
        processReturn,
        addPayment,
        getDressById,
        getCustomerById,
        getRentalsForDress,
        getRentalsForCustomer,
        getPaymentsForRental,
        metrics: {
          todayPickupsCount: todayPickups.length,
          todayReturnsCount: todayReturns.length,
          upcomingRentalsCount: upcomingRentals.length,
          unpaidAmountsTotal,
          totalRevenue,
        },
        resetToDemoData,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental doit être utilisé à l’intérieur de RentalProvider');
  }
  return context;
};
