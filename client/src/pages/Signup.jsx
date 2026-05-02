/**
 * Signup.jsx — Registration page with role selection
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'villager', village_id: '' });
  const [villages, setVillages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/villages').then(res => setVillages(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup({ ...form, village_id: form.village_id ? parseInt(form.village_id) : null });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <img src="/logo.png" alt="ग्राम संवाद" className="auth-logo-img" />
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join ग्राम संवाद Portal</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="villager">Villager</option>
              <option value="admin">Admin / Panchayat Officer</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Village</label>
            <select className="form-select" value={form.village_id} onChange={e => setForm({...form, village_id: e.target.value})}>
              <option value="">Select your village</option>
              {villages.map(v => <option key={v.id} value={v.id}>{v.name} — {v.district}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px'}} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
