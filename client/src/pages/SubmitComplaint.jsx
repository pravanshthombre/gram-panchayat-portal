/**
 * SubmitComplaint.jsx — Complaint submission form
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './SubmitComplaint.css';

export default function SubmitComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [villages, setVillages] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'Water Supply', location: '', village_id: '' });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/villages').then(res => {
      setVillages(res.data);
      if (user?.village_id) setForm(f => ({ ...f, village_id: String(user.village_id) }));
    }).catch(() => {});
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('location', form.location);
      formData.append('village_id', form.village_id);
      if (photo) formData.append('photo', photo);

      await API.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="page-container"><div className="empty-state"><p>Please <a href="/login" style={{color:'var(--primary)',fontWeight:600}}>login</a> to submit a complaint.</p></div></div>
  );

  return (
    <div className="submit-page">
      <div className="submit-card slide-up">
        <h2 className="submit-title"><FileText size={22} /> Submit New Complaint</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Brief title of the issue" />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>Water Supply</option><option>Electricity</option><option>Agriculture</option>
              <option>Sanitation</option><option>Infrastructure</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Describe the issue in detail..." />
          </div>
          <div className="form-group">
            <label className="form-label">Village</label>
            <select className="form-select" value={form.village_id} onChange={e => setForm({...form, village_id: e.target.value})} required>
              <option value="">Select village</option>
              {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label"><MapPin size={14} style={{display:'inline'}} /> Location Tag</label>
            <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g., Near Main Market" />
          </div>
          <div className="form-group">
            <label className="form-label">Photo (Optional)</label>
            <label className={`file-upload ${photo ? 'has-file' : ''}`}>
              <Upload size={20} style={{marginBottom:'4px'}} />
              <div>{photo ? photo.name : 'Click to upload a photo'}</div>
              <input type="file" accept="image/*" style={{display:'none'}} onChange={e => setPhoto(e.target.files[0])} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px'}} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}
