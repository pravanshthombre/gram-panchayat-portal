/**
 * Navbar.jsx — Main navigation bar
 * Dark green header with logo, links, notifications, and user menu
 */
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, MapPin, Settings, BarChart3, Bell, User, LogOut, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    if (user) {
      API.get('/notifications').then(res => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      }).catch(() => {});
    }
  }, [user]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = () => {
    API.put('/notifications/read').then(() => setUnreadCount(0)).catch(() => {});
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="navbar" ref={menuRef}>
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="ग्राम संवाद" className="navbar-logo-img" />
          <div className="navbar-brand-text">
            <span>ग्राम संवाद</span>
            <span>Gram Panchayat Smart Portal</span>
          </div>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} end>
            <Home size={16} /> Public Feed
          </NavLink>
          <NavLink to="/villages" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <MapPin size={16} /> Villages
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={16} /> Admin Panel
            </NavLink>
          )}
          {user?.role === 'villager' && (
            <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <User size={16} /> My Dashboard
            </NavLink>
          )}
          <NavLink to="/analytics" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={16} /> Analytics
          </NavLink>
        </div>

        <div className="navbar-right">
          {user && (
            <button className="navbar-bell" onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </button>
          )}

          {user ? (
            <button className="navbar-user" onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}>
              <User size={16} /> {user.name}
            </button>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/signup" className="auth-link signup">Sign Up</Link>
            </div>
          )}

          <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>🔔 Notifications</h4>
                {unreadCount > 0 && <button onClick={handleMarkRead} className="btn btn-sm btn-outline" style={{fontSize:'0.72rem',padding:'4px 10px'}}>Mark all read</button>}
              </div>
              {notifications.length === 0 && <div className="notif-item" style={{textAlign:'center',color:'var(--text-muted)'}}>No notifications</div>}
              {notifications.map(n => (
                <div key={n.id} className={`notif-item ${n.is_read ? '' : 'unread'}`}>{n.message}</div>
              ))}
            </div>
          )}

          {/* User dropdown */}
          {showUserMenu && (
            <div className="user-dropdown">
              <button onClick={() => { navigate('/submit-complaint'); setShowUserMenu(false); }}>
                <Plus size={16} /> New Complaint
              </button>
              <button onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <NavLink to="/" className="nav-link" onClick={() => setMobileOpen(false)}>
          <Home size={16} /> Public Feed
        </NavLink>
        <NavLink to="/villages" className="nav-link" onClick={() => setMobileOpen(false)}>
          <MapPin size={16} /> Villages
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className="nav-link" onClick={() => setMobileOpen(false)}>
            <Settings size={16} /> Admin Panel
          </NavLink>
        )}
        {user?.role === 'villager' && (
          <NavLink to="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>
            <User size={16} /> My Dashboard
          </NavLink>
        )}
        <NavLink to="/analytics" className="nav-link" onClick={() => setMobileOpen(false)}>
          <BarChart3 size={16} /> Analytics
        </NavLink>
        {user && (
          <NavLink to="/submit-complaint" className="nav-link" onClick={() => setMobileOpen(false)}>
            <Plus size={16} /> Submit Complaint
          </NavLink>
        )}
      </div>
    </>
  );
}
