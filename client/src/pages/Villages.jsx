/**
 * Villages.jsx — Village listing and registration page
 */
import { useState, useEffect } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import VillageCard from '../components/VillageCard';
import './Villages.css';

export default function Villages() {
  const { user } = useAuth();
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', district: '', state: 'Maharashtra', pincode: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/villages')
      .then(res => setVillages(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/villages', form);
      setVillages([res.data.village, ...villages]);
      setShowModal(false);
      setForm({ name: '', district: '', state: 'Maharashtra', pincode: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register village.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page-container villages-page">
      <div className="page-header">
        <h1 className="page-title"><MapPin size={24} /> Registered Villages</h1>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Register Village
          </button>
        )}
      </div>

      <div className="grid-3">
        {villages.map(v => <VillageCard key={v.id} village={v} />)}
      </div>

      {villages.length === 0 && (
        <div className="empty-state"><p>No villages registered yet. Be the first!</p></div>
      )}

      {/* Register Village Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Register New Village</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div style={{color:'var(--priority-urgent)',marginBottom:'12px',fontSize:'0.85rem'}}>{error}</div>}
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Village Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g., Nagpur" />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input className="form-input" value={form.district} onChange={e => setForm({...form, district: e.target.value})} required placeholder="e.g., Wardha" />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="Maharashtra" />
              </div>
              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input className="form-input" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} required placeholder="e.g., 442001" />
              </div>
              <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Register Village</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
