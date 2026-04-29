/**
 * App.jsx — Main Application with Router
 * Smart Gram Panchayat Portal
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PublicFeed from './pages/PublicFeed';
import Villages from './pages/Villages';
import AdminPanel from './pages/AdminPanel';
import VillagerDashboard from './pages/VillagerDashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<PublicFeed />} />
          <Route path="/villages" element={<Villages />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/dashboard" element={<VillagerDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/submit-complaint" element={<SubmitComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
