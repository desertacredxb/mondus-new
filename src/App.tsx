import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { Landing } from "./pages/Landing";
import AgentDetail from "./pages/AgentDetail";
import AgentsSection from "./components/Agents";
import Buy from "./pages/Buy";
import BuyDetails from "./pages/BuyDetails";
import Rent from "./pages/Rent";
import RentDetails from "./pages/RentDetails";
import OffPlan from "./pages/OffPlan";
import Sell from "./pages/Sell";
import Blog from "./pages/Blog";
import OffPlanDetails from "./pages/OffPlanDetails";
import BlogDetails from "./pages/BlogDetails";
import CatalogSection from "./components/CatalogSection";
import Developers from "./pages/Developers";
import Contact from "./pages/Contact";
import Career from "./pages/Career";
import AreaGuide from "./pages/AreaGuide";
import AreaGuideDetails from "./pages/AreaGuideDetails";
import About from "./pages/About";
import NewsletterForm from "./pages/Newsletter";
import Emailer from "./pages/Emailer";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import NewsletterPage from "./pages/admin/AdminNewsletter";
import EmailerPage from "./pages/admin/AdminEmailer";
import AdminSubscriber from "./pages/admin/AdminSubscriber";
import AdminContactRequest from "./pages/admin/AdminContactRequest";
import AwardsPage from "./pages/AwardsPage";
import AdminNotify from "./pages/admin/AdminNotify";

import Chatbot from "./components/Chatbot";
import { FaWhatsapp } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import ChatbotLead from "./pages/admin/ChatbotLead";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminListings from "./pages/admin/Listing";
import Opportunity from "./pages/admin/Opportunity";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProtectedRoute from "./pages/admin/Adminprotectedroute";
import { Toaster } from "react-hot-toast";
import PropertyManagement from "./pages/admin/PropertyManagement";
import DeveloperManagement from "./pages/admin/DeveloperManagement";
import AddBlogPage from "./components/AddBlogPage";
import SEO from "./components/SEO";
import NotFound from "./components/NotFound";

function AppWrapper() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <Toaster position="bottom-center" />
      <SEO />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/buy/:idOrSlug" element={<BuyDetails />} />
        <Route path="/rent" element={<Rent />} />
        <Route path="/rent/:idOrSlug" element={<RentDetails />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/AgentsSection" element={<AgentsSection />} />
        <Route path="/offplan" element={<OffPlan />} />
        <Route path="/offplan/:slug" element={<OffPlanDetails />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/blogs" element={<Blog />} />
        <Route path="/blogs/:slug" element={<BlogDetails />} />
        <Route path="/catalogs" element={<CatalogSection />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Career />} />
        <Route path="/area-guides" element={<AreaGuide />} />
        <Route path="/area-guides/:title" element={<AreaGuideDetails />} />
        <Route path="/awards" element={<AwardsPage />} />

        <Route path="*" element={<NotFound />} />

        {/* Admin login page */}
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="newsletter" element={<NewsletterPage />} />
            <Route
              path="property-management"
              element={<PropertyManagement />}
            />
            <Route
              path="developer-management"
              element={<DeveloperManagement />}
            />
            <Route path="emailer" element={<EmailerPage />} />
            <Route path="subscriber" element={<AdminSubscriber />} />
            <Route path="contacts" element={<AdminContactRequest />} />
            <Route path="request" element={<AdminNotify />} />
            <Route path="chatleads" element={<ChatbotLead />} />
            <Route path="sendnewsletter" element={<NewsletterForm />} />
            <Route path="sendemailer" element={<Emailer />} />
            <Route path="blogs" element={<AdminBlog />} />
            <Route path="add" element={<AddBlogPage />} />
            <Route path="listing" element={<AdminListings />} />
            <Route path="opportunity" element={<Opportunity />} />
          </Route>
        </Route>
      </Routes>

      {/* ✅ Show chatbot only on non-admin routes */}
      {!isAdminRoute && <Chatbot />}

      {/* Whatsapp icon */}
      {!isAdminRoute && (
        <a
          href="https://wa.me/971521110795"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-[140px] right-6 p-4 hidden md:block rounded-full bg-[var(--primary-color)] text-white shadow-lg  hover:scale-105  transition z-50 items-center justify-center"
        >
          <FaWhatsapp size={22} />
        </a>
      )}

      {/* Sticky bottom bar on mobile (always shown) */}
      <div className="fixed bottom-0 left-0 w-full flex md:hidden z-[9999]">
        <div className="w-1/2 bg-[var(--primary-color)] text-white text-center py-3">
          <a
            href="tel:+971521110795"
            className="w-full flex items-center justify-center gap-2"
          >
            <FiPhone size={18} />
            Call Us
          </a>
        </div>
        <div className="w-1/2 bg-white text-green-500 text-center py-3 border-l border-white">
          <a
            href="https://wa.me/+971521110795"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2"
          >
            <FaWhatsapp size={18} />
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

// ✅ Main App entry using Router
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
