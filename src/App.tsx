/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RentalProvider } from './context/RentalContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DressesList } from './components/DressesList';
import { CustomersList } from './components/CustomersList';
import { RentalsList } from './components/RentalsList';
import { CalendarView } from './components/CalendarView';
import { PaymentsList } from './components/PaymentsList';
import { RentalModal } from './components/RentalModal';
import { ReturnModal } from './components/ReturnModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Rental } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // États des modales
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [preselectedDressId, setPreselectedDressId] = useState<string | undefined>(undefined);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | undefined>(undefined);

  const [returnModalRental, setReturnModalRental] = useState<Rental | null>(null);
  const [receiptModalRental, setReceiptModalRental] = useState<Rental | null>(null);
  const [targetRentalForPayment, setTargetRentalForPayment] = useState<Rental | null>(null);

  // Robe / Cliente sélectionnée lors de la navigation
  const [navDressId, setNavDressId] = useState<string | null>(null);
  const [navCustomerId, setNavCustomerId] = useState<string | null>(null);

  const handleOpenNewRental = (dressId?: string, customerId?: string) => {
    setPreselectedDressId(dressId);
    setPreselectedCustomerId(customerId);
    setIsRentalModalOpen(true);
  };

  const handleOpenReturn = (rental: Rental) => {
    setReturnModalRental(rental);
  };

  const handleOpenReceipt = (rental: Rental) => {
    setReceiptModalRental(rental);
  };

  const handleOpenAddPayment = (rental: Rental) => {
    setTargetRentalForPayment(rental);
    setActiveTab('payments');
  };

  const handleSelectDress = (dressId: string) => {
    setNavDressId(dressId);
    setActiveTab('dresses');
  };

  const handleSelectCustomer = (customerId: string) => {
    setNavCustomerId(customerId);
    setActiveTab('customers');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 flex flex-col font-sans">
      {/* Barre de navigation principale */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setNavDressId(null);
          setNavCustomerId(null);
        }}
        onOpenNewRental={() => handleOpenNewRental()}
      />

      {/* Zone de contenu principale */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewRental={() => handleOpenNewRental()}
            onOpenReturn={handleOpenReturn}
            onSelectDress={handleSelectDress}
            onSelectCustomer={handleSelectCustomer}
          />
        )}

        {activeTab === 'dresses' && (
          <DressesList
            onBookDress={(dressId) => handleOpenNewRental(dressId)}
            selectedDressIdFromNav={navDressId}
            onClearSelectedDress={() => setNavDressId(null)}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersList
            onBookForCustomer={(customerId) => handleOpenNewRental(undefined, customerId)}
            selectedCustomerIdFromNav={navCustomerId}
            onClearSelectedCustomer={() => setNavCustomerId(null)}
          />
        )}

        {activeTab === 'rentals' && (
          <RentalsList
            onOpenNewRental={() => handleOpenNewRental()}
            onOpenReturn={handleOpenReturn}
            onOpenReceipt={handleOpenReceipt}
            onOpenAddPayment={handleOpenAddPayment}
            onSelectDress={handleSelectDress}
            onSelectCustomer={handleSelectCustomer}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            onOpenNewRentalWithParams={(dressId, date) => {
              setPreselectedDressId(dressId);
              setIsRentalModalOpen(true);
            }}
            onOpenReturn={handleOpenReturn}
            onOpenReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsList
            onOpenReceipt={handleOpenReceipt}
            targetRentalForPayment={targetRentalForPayment}
            onClearTargetRental={() => setTargetRentalForPayment(null)}
          />
        )}
      </main>

      {/* Pied de page */}
      <footer className="no-print mt-auto border-t border-neutral-200/80 bg-white py-6 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-neutral-800 text-sm">
              Aura Mariée Atelier
            </span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Système de Gestion de Location de Robes de Mariée</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Prévention des doubles réservations</span>
            <span aria-hidden="true" className="text-neutral-200">/</span>
            <span>Contrôle qualité des retours</span>
            <span aria-hidden="true" className="text-neutral-200">/</span>
            <span>Dinar Algérien (DZD)</span>
          </div>
        </div>
      </footer>

      {/* Modales globales */}
      <RentalModal
        isOpen={isRentalModalOpen}
        onClose={() => {
          setIsRentalModalOpen(false);
          setPreselectedDressId(undefined);
          setPreselectedCustomerId(undefined);
        }}
        preselectedDressId={preselectedDressId}
        preselectedCustomerId={preselectedCustomerId}
        onSuccess={() => {
          setActiveTab('rentals');
        }}
      />

      <ReturnModal
        isOpen={!!returnModalRental}
        rental={returnModalRental}
        onClose={() => setReturnModalRental(null)}
        onSuccess={() => {
          setActiveTab('rentals');
        }}
      />

      <ReceiptModal
        isOpen={!!receiptModalRental}
        rental={receiptModalRental}
        onClose={() => setReceiptModalRental(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <RentalProvider>
      <MainApp />
    </RentalProvider>
  );
}
