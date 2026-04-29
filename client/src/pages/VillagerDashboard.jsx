/**
 * VillagerDashboard.jsx — Dashboard for villagers to see their own submitted complaints
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Droplets, Zap, Wheat, Trash2, Building2, MoreHorizontal, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './AdminPanel.css'; // Reusing admin panel styles for list

const catIcons = {
  'Water Supply': <Droplets size={18} />, 'Electricity': <Zap size={18} />,
  'Agriculture': <Wheat size={18} />, 'Sanitation': <Trash2 size={18} />,
  'Infrastructure': <Building2 size={18} />, 'Other': <MoreHorizontal size={18} />
};
const catColors = {
  'Water Supply': '#dbeafe', 'Electricity': '#fef3c7', 'Agriculture': '#dcfce7',
  'Sanitation': '#fee2e2', 'Infrastructure': '#ede9fe', 'Other': '#f3f4f6'
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function VillagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      API.get(`/complaints?user_id=${user.id}`)
        .then((res) => setComplaints(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  if (!user || user.role !== 'villager') return (
    <div className="page-container"><div className="empty-state"><p>Access Denied. Only Villagers can access this dashboard.</p></div></div>
  );

  return (
    <div className="page-container">
      <div className="admin-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <h1><User size={24} /> My Dashboard</h1>
          <span className="admin-count">{complaints.length} complaints</span>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/submit-complaint')}>
          <Plus size={16} /> Submit New Complaint
        </button>
      </div>

      <div className="admin-list">
        {complaints.map(c => (
          <div key={c.id} className="admin-item" onClick={() => navigate(`/complaint/${c.id}`)} style={{ cursor: 'pointer' }}>
            <div className="admin-item-icon" style={{background: catColors[c.category] || '#f3f4f6'}}>
              {catIcons[c.category] || catIcons['Other']}
            </div>
            <div className="admin-item-info">
              <div className="admin-item-title">{c.title}</div>
              <div className="admin-item-sub">{c.village_name}</div>
              <div className="admin-item-badges">
                <span className={`badge ${c.status === 'Pending' ? 'badge-pending' : c.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}`}>{c.status}</span>
                <span className={`badge ${c.priority === 'Urgent' ? 'badge-urgent' : c.priority === 'Medium' ? 'badge-medium' : 'badge-low'}`}>{c.priority}</span>
              </div>
              {c.admin_response && <div className="admin-item-response" style={{ color: 'var(--primary)', fontWeight: 600 }}>New Officer Response!</div>}
            </div>
            <div className="admin-item-date">{formatDate(c.created_at)}</div>
          </div>
        ))}
      </div>

      {complaints.length === 0 && (
        <div className="empty-state">
          <p>You haven't submitted any complaints yet.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/submit-complaint')}>Submit your first complaint</button>
        </div>
      )}
    </div>
  );
}
