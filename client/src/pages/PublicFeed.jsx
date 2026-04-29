/**
 * PublicFeed.jsx — Main public page showing all complaints transparently
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, Clock, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import ComplaintCard from '../components/ComplaintCard';
import './PublicFeed.css';

const CATEGORIES = ['All', 'Water Supply', 'Electricity', 'Agriculture', 'Sanitation', 'Infrastructure', 'Other'];

export default function PublicFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [villages, setVillages] = useState([]);
  const [category, setCategory] = useState('All');
  const [villageFilter, setVillageFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/complaints'),
      API.get('/villages')
    ]).then(([compRes, vilRes]) => {
      setComplaints(compRes.data);
      setVillages(vilRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter complaints
  const filtered = complaints.filter(c => {
    if (category !== 'All' && c.category !== category) return false;
    if (villageFilter !== 'all' && c.village_id !== parseInt(villageFilter)) return false;
    return true;
  });

  const totalIssues = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <img src="/logo.png" alt="ग्राम संवाद" className="hero-logo" />
        <h1 className="hero-title">ग्राम संवाद — Smart Gram Panchayat Portal</h1>
        <p className="hero-subtitle">A transparent platform for villages to submit and track civic complaints</p>
        {user?.role === 'admin' && (
          <button className="btn btn-gold" onClick={() => navigate('/admin')}>
            <Settings size={18} /> Open Admin Panel
          </button>
        )}
        {user?.role === 'villager' && (
          <button className="btn btn-gold" onClick={() => navigate('/dashboard')}>
            <Settings size={18} /> Open My Dashboard
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="page-container">
        <div className="stats-bar">
          <div className="stat-card">
            <Eye size={22} style={{color:'var(--text-muted)', marginBottom:'8px'}} />
            <div className="stat-number">{totalIssues}</div>
            <div className="stat-label">Total Issues</div>
          </div>
          <div className="stat-card">
            <CheckCircle size={22} style={{color:'var(--status-resolved)', marginBottom:'8px'}} />
            <div className="stat-number" style={{color:'var(--status-resolved)'}}>{resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card">
            <Clock size={22} style={{color:'var(--status-pending)', marginBottom:'8px'}} />
            <div className="stat-number" style={{color:'var(--status-pending)'}}>{inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="filter-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Village Filter + Count */}
        <div className="feed-filters">
          <select className="form-select" value={villageFilter} onChange={e => setVillageFilter(e.target.value)}>
            <option value="all">All Villages</option>
            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <span className="feed-count">{filtered.length} complaints found</span>
        </div>

        {/* Complaint Cards Grid */}
        <div className="grid-3">
          {filtered.map(c => (
            <ComplaintCard key={c.id} complaint={c} onClick={() => navigate(`/complaint/${c.id}`)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No complaints found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
