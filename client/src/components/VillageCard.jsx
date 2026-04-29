/**
 * VillageCard.jsx — Displays a village with stats
 */
import { MapPin } from 'lucide-react';
import './VillageCard.css';

export default function VillageCard({ village }) {
  return (
    <div className="village-card">
      <div className="village-header">
        <div className="village-icon"><MapPin size={18} /></div>
        <div>
          <div className="village-name">{village.name}</div>
          <div className="village-location">
            {village.district}, {village.state}<br/>
            PIN: {village.pincode}
          </div>
        </div>
      </div>
      <div className="village-stats">
        <div>
          <div className="village-stat-value">{village.total_issues}</div>
          <div className="village-stat-label">Issues</div>
        </div>
        <div>
          <div className="village-stat-value green">{village.resolved}</div>
          <div className="village-stat-label">Resolved</div>
        </div>
        <div>
          <div className="village-stat-value">{village.resolution_rate}%</div>
          <div className="village-stat-label">Rate</div>
        </div>
      </div>
    </div>
  );
}
