/**
 * ComplaintDetail.jsx — Single complaint view
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, MessageCircle } from 'lucide-react';
import API, { getMediaUrl } from '../utils/api';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/complaints/${id}`).then(res => setComplaint(res.data)).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!complaint) return null;

  const statusClass = complaint.status === 'Pending' ? 'badge-pending' : complaint.status === 'In Progress' ? 'badge-progress' : 'badge-resolved';
  const priorityClass = complaint.priority === 'Urgent' ? 'badge-urgent' : complaint.priority === 'Medium' ? 'badge-medium' : 'badge-low';

  return (
    <div className="page-container" style={{maxWidth:'720px',margin:'0 auto'}}>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{marginBottom:'16px'}}>
        <ArrowLeft size={16} /> Back
      </button>
      <div className="card slide-up" style={{padding:'32px'}}>
        <h1 style={{fontSize:'1.4rem',fontWeight:700,marginBottom:'8px'}}>{complaint.title}</h1>
        <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
          <span className="badge badge-category">{complaint.category}</span>
          <span className={`badge ${statusClass}`}>{complaint.status}</span>
          <span className={`badge ${priorityClass}`}>{complaint.priority}</span>
        </div>
        <p style={{color:'var(--text-secondary)',lineHeight:1.7,marginBottom:'20px'}}>{complaint.description}</p>

        {complaint.photo_url && (
          <img src={getMediaUrl(complaint.photo_url)} alt="Complaint" style={{width:'100%',borderRadius:'12px',marginBottom:'20px'}} />
        )}

        <div style={{display:'flex',flexDirection:'column',gap:'8px',fontSize:'0.85rem',color:'var(--text-muted)',borderTop:'1px solid #e5e7eb',paddingTop:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}><User size={15} /> {complaint.user_name}</div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}><MapPin size={15} /> {complaint.village_name} {complaint.location && `— ${complaint.location}`}</div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}><Calendar size={15} /> {new Date(complaint.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</div>
        </div>

        {complaint.admin_response && (
          <div style={{marginTop:'20px',background:'#f0fdf4',padding:'16px',borderRadius:'12px',borderLeft:'4px solid var(--primary)'}}>
            <div style={{fontWeight:600,fontSize:'0.9rem',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}>
              <MessageCircle size={16} /> Officer Response
            </div>
            <p style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>{complaint.admin_response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
