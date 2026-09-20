import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ServicesView } from './components/ServicesView';
import { GalleryView } from './components/GalleryView';
import { PhotoEditorView } from './components/PhotoEditorView';
import { VideoEditingView } from './components/VideoEditingView';
import { MyBookingsView } from './components/MyBookingsView';
import { MyWorkView } from './components/MyWorkView';
import { UploadView } from './components/UploadView';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProfileView } from './components/ProfileView';
import { AboutContactView } from './components/AboutContactView';
import { AuthView } from './components/AuthView';
import { BookServiceModal } from './components/BookServiceModal';
import { InvoiceModal } from './components/InvoiceModal';
import { AdminPortal } from './components/AdminPortal';
import { ProofingPortalView } from './components/ProofingPortalView';
import { UserRecord, AppointmentRecord, WorkRecord, ShootBatchRecord, StudioShopProfile, EmployeeRecord } from './types';
import { INITIAL_SHOOT_BATCHES } from './data/shootBatches';
import { INITIAL_STUDIO_SHOP, INITIAL_STUDIO_EMPLOYEES, PRESEEDED_ACCOUNTS, StoredAuthAccount } from './data/studioData';

// Pre-seeded initial studio client state
const INITIAL_USER: UserRecord = {
  id: 101,
  name: 'Rohan Sharma',
  email: 'rohan.sharma@example.com',
  phone: '+91 98765 43210',
  address: 'Silver Sands, Juhu Beach Road, Mumbai',
  created_at: '2026-02-15',
};

const INITIAL_BOOKINGS: AppointmentRecord[] = [
  {
    id: 1001,
    user_id: 101,
    customer_name: 'Rohan Sharma',
    phone: '+91 98765 43210',
    address: 'Grand Hyatt, Bandra Kurla Complex, Mumbai',
    service: 'Wedding Shoot',
    appointment_date: '2026-04-18',
    appointment_time: '10:00 AM',
    message: 'Traditional sangeet and wedding ceremony coverage with aerial drone.',
    status: 'Approved',
    payment_status: 'Paid',
    payment_id: 501,
    amount: 9999,
    payment_method: 'UPI / Google Pay',
  },
  {
    id: 1002,
    user_id: 101,
    customer_name: 'Rohan Sharma',
    phone: '+91 98765 43210',
    address: 'Marine Drive & Studio 4, Mumbai',
    service: 'Pre-Wedding Shoot',
    appointment_date: '2026-05-02',
    appointment_time: '05:30 PM',
    message: 'Sunset romantic session along seafront and studio wardrobe changes.',
    status: 'Pending',
    payment_status: 'Pending',
    payment_id: 502,
    amount: 4999,
  },
];

const INITIAL_WORK_ITEMS: WorkRecord[] = [
  {
    id: 201,
    user_id: 101,
    customer_name: 'Rohan Sharma',
    appointment_id: 1001,
    service: 'Wedding Shoot',
    original_filename: 'ceremony_highlights_preview.jpg',
    file_type: 'Photo',
    description: 'High-contrast ceremony portraits color-graded with warm golden tones.',
    status: 'Completed',
    completed_filename: 'SnepStudio_Master_Ceremony_4K.jpg',
    created_at: '2026-03-01',
  },
  {
    id: 202,
    user_id: 101,
    customer_name: 'Rohan Sharma',
    appointment_id: 1001,
    service: 'Video Editing',
    original_filename: 'ring_exchange_4k_footage.mp4',
    file_type: 'Video',
    description: 'Cinematic 60fps slow-motion cut synced with romantic orchestral score.',
    status: 'In Progress',
    created_at: '2026-03-08',
  },
];

export default function App() {
  // Navigation
  const [activePage, setActivePage] = useState<string>('home');

  // Customer / Admin / Staff Session
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(INITIAL_USER);

  // Studio Business Details & Physical Address Profile
  const [shopProfile, setShopProfile] = useState<StudioShopProfile>(INITIAL_STUDIO_SHOP);

  // Studio Crew & Staff
  const [employees, setEmployees] = useState<EmployeeRecord[]>(INITIAL_STUDIO_EMPLOYEES);

  // Authentication Accounts & One-Time Login Enforcement Store
  const [accounts, setAccounts] = useState<StoredAuthAccount[]>(PRESEEDED_ACCOUNTS);

  // Studio Records
  const [bookings, setBookings] = useState<AppointmentRecord[]>(INITIAL_BOOKINGS);
  const [workItems, setWorkItems] = useState<WorkRecord[]>(INITIAL_WORK_ITEMS);
  const [shootBatches, setShootBatches] = useState<ShootBatchRecord[]>(INITIAL_SHOOT_BATCHES);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<string>('Photography');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<AppointmentRecord | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Handlers for Accounts, Studio Profile and Crew
  const handleRegisterAccount = (newAccount: StoredAuthAccount, updatedShop?: StudioShopProfile) => {
    setAccounts(prev => [...prev, newAccount]);
    if (updatedShop) {
      setShopProfile(updatedShop);
    }
  };

  const handleUpdateShopProfile = (updated: StudioShopProfile) => {
    setShopProfile(updated);
  };

  const handleAddEmployee = (newEmp: EmployeeRecord) => {
    setEmployees(prev => [newEmp, ...prev]);
  };

  // Handlers
  const handleOpenBookingModal = (service?: string) => {
    if (service) {
      setPreselectedService(service);
    }
    setIsBookingModalOpen(true);
  };

  const handleBookSuccess = (bookingData: {
    service: string;
    appointment_date: string;
    appointment_time: string;
    customer_name: string;
    phone: string;
    address: string;
    message: string;
    amount: number;
  }) => {
    const newBooking: AppointmentRecord = {
      id: Math.floor(Math.random() * 9000) + 1000,
      user_id: currentUser ? currentUser.id : 101,
      customer_name: bookingData.customer_name,
      phone: bookingData.phone,
      address: bookingData.address,
      service: bookingData.service,
      appointment_date: bookingData.appointment_date,
      appointment_time: bookingData.appointment_time,
      message: bookingData.message,
      status: 'Pending',
      payment_status: 'Pending',
      payment_id: Math.floor(Math.random() * 9000) + 500,
      amount: bookingData.amount,
    };

    setBookings(prev => [newBooking, ...prev]);

    // If user is logged in, optionally navigate to My Bookings
    if (currentUser) {
      setActivePage('my-bookings');
    }
  };

  const handleQueueWork = (filename: string, fileType: 'Photo' | 'Video', description: string) => {
    const newWork: WorkRecord = {
      id: Math.floor(Math.random() * 9000) + 200,
      user_id: currentUser ? currentUser.id : 101,
      customer_name: currentUser ? currentUser.name : 'Valued Client',
      service: fileType === 'Photo' ? 'Photo Editing' : 'Video Editing',
      original_filename: filename,
      file_type: fileType,
      description: description,
      status: 'Pending',
      created_at: new Date().toISOString().split('T')[0],
    };

    setWorkItems(prev => [newWork, ...prev]);
  };

  const handlePayBooking = (bookingId: number, method: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, payment_status: 'Paid', payment_method: method } : b))
    );
  };

  const handleUpdateBookingStatus = (id: number, status: AppointmentRecord['status']) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
  };

  const handleUpdateWorkStatus = (id: number, status: WorkRecord['status'], completedFilename?: string) => {
    setWorkItems(prev =>
      prev.map(w => (w.id === id ? { ...w, status, completed_filename: completedFilename || w.completed_filename } : w))
    );
  };

  const handleUpdateBatch = (updatedBatch: ShootBatchRecord) => {
    setShootBatches(prev => prev.map(b => (b.id === updatedBatch.id ? updatedBatch : b)));
  };

  const handleSendNewBatch = (newBatch: ShootBatchRecord) => {
    setShootBatches(prev => [newBatch, ...prev]);
  };

  const handleUpdateProfile = (updated: Partial<UserRecord>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updated });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('home');
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Studio Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        shopName={shopProfile.shop_name}
        onLogout={handleLogout}
        onOpenBookingModal={handleOpenBookingModal}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Studio Views */}
      <main className="flex-1 w-full">
        {activePage === 'home' && (
          <HomeView
            onNavigate={setActivePage}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenGalleryItem={() => setActivePage('gallery')}
          />
        )}

        {activePage === 'services' && (
          <ServicesView
            onOpenBookingModal={handleOpenBookingModal}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'gallery' && (
          <GalleryView />
        )}

        {activePage === 'about' && (
          <AboutContactView initialTab="about" shopProfile={shopProfile} />
        )}

        {activePage === 'contact' && (
          <AboutContactView initialTab="contact" shopProfile={shopProfile} />
        )}

        {activePage === 'edit-photos' && (
          <PhotoEditorView
            onQueueWork={handleQueueWork}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'video-editing' && (
          <VideoEditingView
            onQueueWork={handleQueueWork}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'my-bookings' && (
          <MyBookingsView
            bookings={currentUser ? bookings.filter(b => b.user_id === currentUser.id) : bookings}
            onOpenBookingModal={() => handleOpenBookingModal()}
            onPayBooking={handlePayBooking}
            onViewInvoice={(booking) => setSelectedInvoiceBooking(booking)}
          />
        )}

        {activePage === 'my-work' && (
          <MyWorkView
            workItems={currentUser ? workItems.filter(w => w.user_id === currentUser.id) : workItems}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'photo-selection' && (
          <ProofingPortalView
            currentUser={currentUser}
            shootBatches={currentUser ? shootBatches.filter(b => b.customer_id === currentUser.id) : shootBatches}
            onUpdateBatch={handleUpdateBatch}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'upload' && (
          <UploadView
            bookings={currentUser ? bookings.filter(b => b.user_id === currentUser.id) : bookings}
            onUploadSuccess={(data) => {
              handleQueueWork(data.filename, data.file_type, data.description);
            }}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'dashboard' && currentUser && (
          <CustomerDashboard
            currentUser={currentUser}
            bookings={bookings.filter(b => b.user_id === currentUser.id)}
            workItems={workItems.filter(w => w.user_id === currentUser.id)}
            shootBatches={shootBatches.filter(b => b.customer_id === currentUser.id)}
            onNavigate={setActivePage}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
        )}

        {activePage === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {(activePage === 'login' || activePage === 'register') && (
          <AuthView
            initialRole="customer"
            initialMode={activePage === 'login' ? 'login' : 'register'}
            accounts={accounts}
            shopProfile={shopProfile}
            onRegisterAccount={handleRegisterAccount}
            onLoginSuccess={(user, updatedAccounts) => {
              setCurrentUser(user);
              setAccounts(updatedAccounts);
              if (user.role === 'admin' || user.role === 'employee') {
                setIsAdminOpen(true);
              }
              setActivePage('home');
            }}
            onNavigate={setActivePage}
          />
        )}
      </main>

      {/* Booking Reservation Modal */}
      <BookServiceModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedService={preselectedService}
        currentUser={currentUser}
        onBookSuccess={handleBookSuccess}
      />

      {/* Tax Invoice Modal */}
      <InvoiceModal
        booking={selectedInvoiceBooking}
        onClose={() => setSelectedInvoiceBooking(null)}
      />

      {/* Discreet Studio Staff Admin Portal */}
      {isAdminOpen && (
        <AdminPortal
          bookings={bookings}
          workItems={workItems}
          shootBatches={shootBatches}
          shopProfile={shopProfile}
          employees={employees}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onUpdateWorkStatus={handleUpdateWorkStatus}
          onSendNewBatch={handleSendNewBatch}
          onUpdateShopProfile={handleUpdateShopProfile}
          onAddEmployee={handleAddEmployee}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Studio Footer */}
      <Footer
        onNavigate={setActivePage}
        onOpenAdmin={() => setIsAdminOpen(true)}
        shopProfile={shopProfile}
      />
    </div>
  );
}
