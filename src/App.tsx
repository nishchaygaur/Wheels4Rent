import React from 'react';
import { Car, Booking, UserProfile } from './types';
import { fetchCars, fetchBookings, isSupabaseConfigured, supabase } from './lib/supabase';
import { getCurrentUserProfile, signOutUser } from './lib/authService';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FleetSection } from './components/FleetSection';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Footer } from './components/Footer';
import { CarDetailsModal } from './components/CarDetailsModal';
import { BookingModal } from './components/BookingModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { AuthModal } from './components/AuthModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

export function App() {
  const [cars, setCars] = React.useState<Car[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Modal & View States
  const [isAdminView, setIsAdminView] = React.useState(false);
  const [selectedCarForDetails, setSelectedCarForDetails] = React.useState<Car | null>(null);
  const [selectedCarForBooking, setSelectedCarForBooking] = React.useState<Car | null>(null);
  const [selectedBookingForEmail, setSelectedBookingForEmail] = React.useState<Booking | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authInitialTab, setAuthInitialTab] = React.useState<'signin' | 'signup' | 'forgot'>('signin');
  const [isResetPasswordOpen, setIsResetPasswordOpen] = React.useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = React.useState(false);

  // Search filter passed from Hero
  const [heroCategoryFilter, setHeroCategoryFilter] = React.useState('all');

  // Load initial data
  const loadData = React.useCallback(async () => {
    try {
      const [fetchedCars, fetchedBookings, profile] = await Promise.all([
        fetchCars(),
        fetchBookings(),
        getCurrentUserProfile(),
      ]);
      setCars(fetchedCars);
      setBookings(fetchedBookings);
      setCurrentUser(profile);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();

    // Check URL hash for Supabase auth email redirects
    if (window.location.hash.includes('reset-password') || window.location.hash.includes('type=recovery')) {
      setIsResetPasswordOpen(true);
    } else if (window.location.hash.includes('email-confirmed') || window.location.hash.includes('type=signup')) {
      alert('Your email has been confirmed by Supabase! Welcome to Wheels4Rent.');
      setIsAuthModalOpen(true);
      setAuthInitialTab('signin');
    } else if (window.location.hash.includes('magic-login') || window.location.hash.includes('type=magiclink')) {
      getCurrentUserProfile().then((u) => {
        if (u) setCurrentUser(u);
      });
    }

    // Listen to Supabase auth events if active
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsResetPasswordOpen(true);
        } else if (event === 'SIGNED_IN') {
          const profile = await getCurrentUserProfile();
          setCurrentUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [loadData]);

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setIsAdminView(false);
  };

  const handleHeroSearch = (filters: { location: string; category: string }) => {
    setHeroCategoryFilter(filters.category);
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    // Refresh cars to update stock counts
    fetchCars().then(setCars);
  };

  // User's own bookings
  const userBookings = React.useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter(
      (b) => b.user_id === currentUser.id || b.customer_email.toLowerCase() === currentUser.email.toLowerCase()
    );
  }, [bookings, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Loading Wheels4Rent Fleet & Invoicing Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col justify-between">
      
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={(tab = 'signin') => {
          setAuthInitialTab(tab);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenMyBookings={() => {
          if (!currentUser) {
            setAuthInitialTab('signin');
            setIsAuthModalOpen(true);
          } else {
            setIsMyBookingsOpen(true);
          }
        }}
        onOpenAdmin={() => setIsAdminView(true)}
        onOpenResetPassword={() => setIsResetPasswordOpen(true)}
        onOpenEmailCenter={() => {
          if (bookings.length > 0) {
            setSelectedBookingForEmail(bookings[0]);
          } else {
            alert('No bookings made yet to preview emails.');
          }
        }}
        isAdminView={isAdminView}
        onToggleAdminView={setIsAdminView}
        supabaseConnected={isSupabaseConfigured}
      />

      {/* Main View Router: Admin View vs Customer Store View */}
      {isAdminView ? (
        <AdminDashboard
          cars={cars}
          bookings={bookings}
          onRefreshData={loadData}
          onOpenEmailPreview={(booking) => setSelectedBookingForEmail(booking)}
          onCloseAdmin={() => setIsAdminView(false)}
        />
      ) : (
        <main>
          {/* Hero Section with Quick Search */}
          <HeroSection onSearch={handleHeroSearch} />

          {/* Curated Fleet Catalog */}
          <FleetSection
            cars={cars}
            initialCategory={heroCategoryFilter}
            onSelectCar={(car) => setSelectedCarForDetails(car)}
            onBookCar={(car) => setSelectedCarForBooking(car)}
          />

          {/* How It Works Section */}
          <HowItWorks />

          {/* Why Choose Us */}
          <WhyChooseUs />
        </main>
      )}

      {/* Footer */}
      <Footer onOpenAdmin={() => setIsAdminView(true)} />

      {/* MODALS */}

      {/* 1. Vehicle Details Modal */}
      <CarDetailsModal
        car={selectedCarForDetails}
        onClose={() => setSelectedCarForDetails(null)}
        onBookNow={(car) => {
          setSelectedCarForDetails(null);
          setSelectedCarForBooking(car);
        }}
      />

      {/* 2. Booking Modal (With PDF invoice & Supabase Email dispatch) */}
      <BookingModal
        car={selectedCarForBooking}
        currentUser={currentUser}
        onClose={() => setSelectedCarForBooking(null)}
        onBookingSuccess={handleBookingSuccess}
        onOpenEmailPreview={(booking) => {
          setSelectedCarForBooking(null);
          setSelectedBookingForEmail(booking);
        }}
      />

      {/* 3. My Bookings & Invoices Modal */}
      {isMyBookingsOpen && (
        <MyBookingsModal
          bookings={userBookings.length > 0 ? userBookings : bookings.slice(0, 3)}
          onClose={() => setIsMyBookingsOpen(false)}
          onOpenEmailPreview={(booking) => setSelectedBookingForEmail(booking)}
        />
      )}

      {/* 4. Supabase Email Delivery & Preview Modal */}
      <EmailPreviewModal
        booking={selectedBookingForEmail}
        onClose={() => setSelectedBookingForEmail(null)}
      />

      {/* 5. Auth Modal (Sign in, Sign up with confirmation email, Forgot Password, Magic Link / OTP) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenResetPassword={() => setIsResetPasswordOpen(true)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setIsAdminView(true);
          }
        }}
      />

      {/* 6. Password Reset Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />

    </div>
  );
}

export default App;
