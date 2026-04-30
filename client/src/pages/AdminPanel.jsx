/**
 * AdminPanel.jsx — Admin complaint management with filters and update modal
 */
import { useState, useEffect } from 'react';
import { Settings, X, MapPin, Calendar, Droplets, Zap, Wheat, Trash2, Building2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './AdminPanel.css';

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

export default function AdminPanel() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'All', category: 'All', priority: 'All', village_id: 'all' });
  const [updateModal, setUpdateModal] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', priority: '', admin_response: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([API.get('/complaints'), API.get('/villages')])
      .then(([c, v]) => { setComplaints(Array.isArray(c.data) ? c.data : []); setVillages(Array.isArray(v.data) ? v.data : []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter(c => {
    if (filters.status !== 'All' && c.status !== filters.status) return false;
    if (filters.category !== 'All' && c.category !== filters.category) return false;
    if (filters.priority !== 'All' && c.priority !== filters.priority) return false;
    if (filters.village_id !== 'all' && c.village_id !== parseInt(filters.village_id)) return false;
    return true;
  });

  const openUpdate = (c) => {
    setUpdateModal(c);
    setUpdateForm({ status: c.status, priority: c.priority, admin_response: c.admin_response || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/complaints/${updateModal.id}`, updateForm);
      setComplaints(complaints.map(c => c.id === updateModal.id ? res.data.complaint : c));
      setUpdateModal(null);
      setToast('Complaint updated successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  if (!user || user.role !== 'admin') return (
    <div className="page-container"><div className="empty-state"><p>Access Denied. Only Admins can access this panel.</p></div></div>
  );

  return (
    <div className="page-container">
      {toast && <div className="toast success">✅ {toast}</div>}

      <div className="admin-header">
        <h1><Settings size={24} /> Admin Panel</h1>
        <span className="admin-count">{filtered.length} complaints</span>
      </div>

      <div className="admin-filters">
        <select className="form-select" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="All">All Status</option>
          <option>Pending</option><option>In Progress</option><option>Resolved</option>
        </select>
        <select className="form-select" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
          <option value="All">All Categories</option>
          <option>Water Supply</option><option>Electricity</option><option>Agriculture</option>
          <option>Sanitation</option><option>Infrastructure</option><option>Other</option>
        </select>
        <select className="form-select" value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
          <option value="All">All Priority</option>
          <option>Low</option><option>Medium</option><option>Urgent</option>
        </select>
        <select className="form-select" value={filters.village_id} onChange={e => setFilters({...filters, village_id: e.target.value})}>
          <option value="all">All Villages</option>
          {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      <div className="admin-list">
        {filtered.map(c => (
          <div key={c.id} className="admin-item">
            <div className="admin-item-icon" style={{background: catColors[c.category] || '#f3f4f6'}}>
              {catIcons[c.category] || catIcons['Other']}
            </div>
            <div className="admin-item-info">
              <div className="admin-item-title">{c.title}</div>
              <div className="admin-item-sub">{c.village_name} — {c.user_name}</div>
              <div className="admin-item-badges">
                <span className={`badge ${c.status === 'Pending' ? 'badge-pending' : c.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}`}>{c.status}</span>
                <span className={`badge ${c.priority === 'Urgent' ? 'badge-urgent' : c.priority === 'Medium' ? 'badge-medium' : 'badge-low'}`}>{c.priority}</span>
                {c.location && <span style={{fontSize:'0.75rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:'3px'}}><MapPin size={12} /> {c.location}</span>}
              </div>
              {c.admin_response && <div className="admin-item-response">Responded: {c.admin_response.slice(0,50)}...</div>}
            </div>
            <div className="admin-item-date">{formatDate(c.created_at)}</div>
            <div className="admin-item-actions">
              <button className="btn-update" onClick={() => openUpdate(c)}>Update</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty-state"><p>No complaints match the selected filters.</p></div>}

      {/* Update Modal */}
      {updateModal && (
        <div className="modal-overlay" onClick={() => setUpdateModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Update Complaint</h2>
              <button className="modal-close" onClick={() => setUpdateModal(null)}><X size={18} /></button>
            </div>
            <p style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'16px'}}>{updateModal.title}</p>
            <form className="update-form" onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={updateForm.status} onChange={e => setUpdateForm({...updateForm, status: e.target.value})}>
                  <option>Pending</option><option>In Progress</option><option>Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={updateForm.priority} onChange={e => setUpdateForm({...updateForm, priority: e.target.value})}>
                  <option>Low</option><option>Medium</option><option>Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Officer Response</label>
                <textarea className="form-textarea" value={updateForm.admin_response} onChange={e => setUpdateForm({...updateForm, admin_response: e.target.value})} placeholder="Write your response..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
