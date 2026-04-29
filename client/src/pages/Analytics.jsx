/**
 * Analytics.jsx — Analytics dashboard with charts
 */
import { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import API from '../utils/api';
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CAT_COLORS = {
  'Water Supply': '#3b82f6', 'Electricity': '#f59e0b', 'Agriculture': '#22c55e',
  'Sanitation': '#ef4444', 'Infrastructure': '#8b5cf6', 'Other': '#6b7280'
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [villages, setVillages] = useState([]);
  const [villageFilter, setVillageFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = (vid) => {
    const params = vid !== 'all' ? `?village_id=${vid}` : '';
    API.get(`/analytics${params}`).then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    API.get('/villages').then(res => setVillages(res.data)).catch(console.error);
    fetchData('all');
  }, []);

  useEffect(() => { fetchData(villageFilter); }, [villageFilter]);

  if (loading || !data) return <div className="loading-container"><div className="spinner"></div></div>;

  const doughnutData = {
    labels: data.categories.map(c => c.category),
    datasets: [{
      data: data.categories.map(c => c.count),
      backgroundColor: data.categories.map(c => CAT_COLORS[c.category] || '#6b7280'),
      borderWidth: 0, hoverOffset: 8
    }]
  };

  const statusOrder = ['Pending', 'In Progress', 'Resolved'];
  const statusColors = ['#f59e0b', '#3b82f6', '#22c55e'];
  const barData = {
    labels: statusOrder,
    datasets: [{
      label: 'Complaints',
      data: statusOrder.map(s => { const found = data.statuses.find(x => x.status === s); return found ? found.count : 0; }),
      backgroundColor: statusColors,
      borderRadius: 6, barThickness: 40
    }]
  };

  return (
    <div className="page-container">
      <div className="analytics-header">
        <h1><BarChart3 size={24} /> Analytics Dashboard</h1>
        <select className="form-select" style={{width:'auto',minWidth:'160px'}} value={villageFilter} onChange={e => setVillageFilter(e.target.value)}>
          <option value="all">All Villages</option>
          {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      <div className="analytics-stats">
        <div className="analytics-stat">
          <div className="analytics-stat-label"><BarChart3 size={16} color="var(--primary)" /> Total</div>
          <div className="analytics-stat-number">{data.total}</div>
          <div className="analytics-stat-desc">Complaints</div>
        </div>
        <div className="analytics-stat">
          <div className="analytics-stat-label"><AlertCircle size={16} color="var(--status-pending)" /> Pending</div>
          <div className="analytics-stat-number" style={{color:'var(--status-pending)'}}>{data.pending}</div>
          <div className="analytics-stat-desc">Awaiting action</div>
        </div>
        <div className="analytics-stat">
          <div className="analytics-stat-label"><Clock size={16} color="var(--status-progress)" /> In Progress</div>
          <div className="analytics-stat-number" style={{color:'var(--status-progress)'}}>{data.in_progress}</div>
          <div className="analytics-stat-desc">Being handled</div>
        </div>
        <div className="analytics-stat">
          <div className="analytics-stat-label"><CheckCircle size={16} color="var(--status-resolved)" /> Resolved</div>
          <div className="analytics-stat-number" style={{color:'var(--status-resolved)'}}>{data.resolved}</div>
          <div className="analytics-stat-desc">{data.resolution_rate}% rate</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><TrendingUp size={18} /> Complaints by Category</h3>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } } }, cutout: '60%' }} />
          </div>
        </div>
        <div className="chart-card">
          <h3><BarChart3 size={18} /> Complaints by Status</h3>
          <div className="chart-container">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } } }} />
          </div>
        </div>
      </div>

      <div className="resolution-card">
        <div className="resolution-header">
          <h3>Resolution Rate</h3>
          <span style={{fontWeight:700,color:'var(--primary)'}}>{data.resolution_rate}%</span>
        </div>
        <div className="resolution-bar">
          <div className="resolution-fill" style={{width: `${data.resolution_rate}%`}}></div>
        </div>
      </div>
    </div>
  );
}
