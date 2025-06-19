import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import AddProduct from './pages/AddProduct';
import GetProduct from './pages/GetProduct';
import AddVideo from './pages/AddVideo';
import GetVideo from './pages/GetVideo';
import Register from './pages/Register';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Tutorial from './pages/Tutorial';
import FAQ from './pages/FAQ';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders'; // Added MyOrders page for viewing orders
import ContactUs from './pages/ContactUs';

// Layout for authentication pages (with Header and Footer)
const AuthLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout for dashboard pages (with Sidebar only)
const DashboardLayout = () => (
  <div className="flex min-h-screen bg-gradient-to-r from-gray-50 to-gray-100">
    <Sidebar />
    <main className="flex-1 ml-64 p-8">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes with Header and Footer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Home />} />
          <Route path="/tutorials" element={<Tutorial />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} /> {/* Added MyOrders route */}
          <Route path="/contact-us" element={<ContactUs />} /> 
        </Route>
        {/* Dashboard routes with Sidebar only */}
        <Route element={<DashboardLayout />}>
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/products" element={<GetProduct />} />
          <Route path="/add-video" element={<AddVideo />} />
          <Route path="/videos" element={<GetVideo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;