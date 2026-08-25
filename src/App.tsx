import { useEffect, useState, type FC, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { PincodeCheckModal } from './components';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { MenuProvider } from './context/MenuContext';
import { SlotProvider } from './context/SlotContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MenuScreen } from './screens/MenuScreen';
import { CartScreen } from './screens/CartScreen';
import { SlotScreen } from './screens/SlotScreen';
import { AddressScreen } from './screens/AddressScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { ConfirmationScreen } from './screens/ConfirmationScreen';
import { TrackOrderScreen } from './screens/TrackOrderScreen';
import { YourOrdersScreen } from './screens/YourOrdersScreen';
import { AdminDashboardScreen } from './screens/admin/AdminDashboardScreen';
import { AdminLoginScreen } from './screens/admin/AdminLoginScreen';
import { DeliveryPortalScreen } from './screens/delivery/DeliveryPortalScreen';

// Helper component to scroll to top automatically on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

// Protected Route Guard for Admin Panel
const AdminAuthGuard: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAdminAuthenticated } = useAuth();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, selectedSlotId, selectedAddress } = useCart();
  const [showPincodeModal, setShowPincodeModal] = useState<boolean>(false);

  // Check if pincode verified on initial landing
  useEffect(() => {
    const isCustomerPage = location.pathname === '/' || location.pathname === '/menu';
    const savedPin = localStorage.getItem('apm_user_pincode');
    if (isCustomerPage && !savedPin) {
      setShowPincodeModal(true);
    }
  }, [location.pathname]);

  // Listen to manual pincode trigger events from Header
  useEffect(() => {
    const handleOpenModal = () => setShowPincodeModal(true);
    window.addEventListener('apm_open_pincode_modal', handleOpenModal);
    return () => window.removeEventListener('apm_open_pincode_modal', handleOpenModal);
  }, []);

  return (
    <>
      <ScrollToTop />
      {showPincodeModal && (
        <PincodeCheckModal
          canCloseWithoutSelect={Boolean(localStorage.getItem('apm_user_pincode'))}
          onClose={() => setShowPincodeModal(false)}
          onConfirmPincode={() => setShowPincodeModal(false)}
        />
      )}
      <Routes>
        {/* / or /menu -> Customer Menu Screen */}
        <Route
          path="/"
          element={
            <MenuScreen
              onViewCart={() => navigate('/cart')}
              onNavigateToAdmin={() => navigate('/admin')}
              onNavigateToTrack={() => navigate('/track')}
              onNavigateToOrders={() => navigate('/orders')}
            />
          }
        />
        <Route
          path="/menu"
          element={
            <MenuScreen
              onViewCart={() => navigate('/cart')}
              onNavigateToAdmin={() => navigate('/admin')}
              onNavigateToTrack={() => navigate('/track')}
              onNavigateToOrders={() => navigate('/orders')}
            />
          }
        />

        {/* /orders & /your-orders -> Customer Orders Screen */}
        <Route
          path="/orders"
          element={
            <YourOrdersScreen
              onBackToMenu={() => navigate('/')}
              onNavigateToTrack={(orderId) => navigate(orderId ? `/track?orderId=${orderId}` : '/track')}
              onNavigateToAdmin={() => navigate('/admin')}
              onNavigateToCart={() => navigate('/cart')}
            />
          }
        />
        <Route
          path="/your-orders"
          element={
            <YourOrdersScreen
              onBackToMenu={() => navigate('/')}
              onNavigateToTrack={(orderId) => navigate(orderId ? `/track?orderId=${orderId}` : '/track')}
              onNavigateToAdmin={() => navigate('/admin')}
              onNavigateToCart={() => navigate('/cart')}
            />
          }
        />

        {/* /cart -> Cart Screen */}
        <Route
          path="/cart"
          element={
            <CartScreen
              onBackToMenu={() => navigate('/')}
              onProceedToSlot={() => {
                if (totalItems > 0) {
                  navigate('/slot');
                }
              }}
            />
          }
        />

        {/* /slot -> Slot Selection Screen */}
        <Route
          path="/slot"
          element={
            <SlotScreen
              onBackToCart={() => navigate('/cart')}
              onBackToMenu={() => navigate('/')}
              onProceedToAddress={() => {
                if (selectedSlotId) {
                  navigate('/address');
                }
              }}
            />
          }
        />

        {/* /address -> Delivery Address Screen */}
        <Route
          path="/address"
          element={
            <AddressScreen
              onBackToSlot={() => navigate('/slot')}
              onBackToCart={() => navigate('/cart')}
              onBackToMenu={() => navigate('/')}
              onProceedToPayment={() => {
                if (selectedAddress) {
                  navigate('/payment');
                }
              }}
            />
          }
        />

        {/* /payment -> Review & Pay Screen */}
        <Route
          path="/payment"
          element={
            <PaymentScreen
              onBackToAddress={() => navigate('/address')}
              onBackToSlot={() => navigate('/slot')}
              onBackToCart={() => navigate('/cart')}
              onBackToMenu={() => navigate('/')}
              onPaymentSuccess={() => navigate('/confirmation')}
              onNavigateToAdmin={() => navigate('/admin')}
              onNavigateToTrack={(orderId) => navigate(orderId ? `/track?orderId=${orderId}` : '/track')}
            />
          }
        />

        {/* /confirmation -> Order Confirmation Screen */}
        <Route
          path="/confirmation"
          element={
            <ConfirmationScreen
              onStartNewOrder={() => navigate('/')}
              onRedirectToMenu={() => navigate('/')}
              onNavigateToTrack={(orderId) => navigate(orderId ? `/track?orderId=${orderId}` : '/track')}
              onNavigateToOrders={() => navigate('/orders')}
            />
          }
        />

        {/* /track -> Live Order Tracking Screen */}
        <Route
          path="/track"
          element={
            <TrackOrderScreen
              onBackToMenu={() => navigate('/')}
              onBackToCart={() => navigate('/cart')}
              onNavigateToAdmin={() => navigate('/admin')}
              onNavigateToOrders={() => navigate('/orders')}
            />
          }
        />

        {/* /admin/login -> Admin Login Screen */}
        <Route
          path="/admin/login"
          element={<AdminLoginScreen />}
        />

        {/* /admin -> Protected Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminAuthGuard>
              <AdminDashboardScreen
                onExitToStore={() => navigate('/')}
                onNavigateToTrackOrder={(orderId) => navigate(`/track?orderId=${orderId}`)}
              />
            </AdminAuthGuard>
          }
        />

        {/* /delivery & /rider -> Dedicated Delivery Personnel Portal */}
        <Route
          path="/delivery"
          element={
            <DeliveryPortalScreen
              onNavigateToStore={() => navigate('/')}
            />
          }
        />
        <Route
          path="/rider"
          element={
            <DeliveryPortalScreen
              onNavigateToStore={() => navigate('/')}
            />
          }
        />

        {/* Fallback wildcard route redirecting to Home */}
        <Route
          path="*"
          element={
            <MenuScreen
              onViewCart={() => navigate('/cart')}
              onNavigateToAdmin={() => navigate('/admin')}
              onNavigateToTrack={() => navigate('/track')}
            />
          }
        />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
          <SlotProvider>
            <OrderProvider>
              <CartProvider>
                <AppRoutes />
              </CartProvider>
            </OrderProvider>
          </SlotProvider>
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
