/**
 * ComplaintCard.jsx — Displays a single complaint in card or list form
 */
import { MapPin, Calendar, MessageCircle, Droplets, Zap, Wheat, Trash2, Building2, MoreHorizontal } from 'lucide-react';
import './ComplaintCard.css';

// Category icons
const categoryIcons = {
  'Water Supply': <Droplets size={18} />,
  'Electricity': <Zap size={18} />,
  'Agriculture': <Wheat size={18} />,
  'Sanitation': <Trash2 size={18} />,
  'Infrastructure': <Building2 size={18} />,
  'Other': <MoreHorizontal size={18} />
};

const categoryClass = {
  'Water Supply': 'water',
  'Electricity': 'electricity',
  'Agriculture': 'agriculture',
  'Sanitation': 'sanitation',
  'Infrastructure': 'infrastructure',
  'Other': 'other'
};

function getStatusClass(status) {
  if (status === 'Pending') return 'badge-pending';
  if (status === 'In Progress') return 'badge-progress';
  return 'badge-resolved';
}

function getPriorityClass(priority) {
  if (priority === 'Urgent') return 'badge-urgent';
  if (priority === 'Medium') return 'badge-medium';
  return 'badge-low';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ComplaintCard({ complaint, onClick }) {
  return (
    <div className="complaint-card" onClick={onClick}>
      <div className="complaint-card-header">
        <div className={`complaint-icon ${categoryClass[complaint.category] || 'other'}`}>
          {categoryIcons[complaint.category] || categoryIcons['Other']}
        </div>
        <div>
          <div className="complaint-title">{complaint.title}</div>
          <div className="complaint-village">{complaint.village_name}</div>
        </div>
      </div>

      <div className="complaint-desc">{complaint.description}</div>

      <div className="complaint-badges">
        <span className={`badge badge-category`}>{complaint.category}</span>
        <span className={`badge ${getStatusClass(complaint.status)}`}>{complaint.status}</span>
        <span className={`badge ${getPriorityClass(complaint.priority)}`}>{complaint.priority}</span>
      </div>

      <div className="complaint-meta">
        {complaint.location && (
          <span style={{display:'flex',alignItems:'center',gap:'3px'}}>
            <MapPin size={13} /> {complaint.location}
          </span>
        )}
        <span style={{display:'flex',alignItems:'center',gap:'3px'}}>
          <Calendar size={13} /> {formatDate(complaint.created_at)}
        </span>
      </div>

      {complaint.admin_response && (
        <div className="complaint-response">
          <MessageCircle size={13} /> Officer responded
        </div>
      )}
    </div>
  );
}
