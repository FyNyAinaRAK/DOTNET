import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './Stats.css';

const API = 'http://localhost:5128';

export default function Stats() {
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/stats`)
      .then(r => r.ok ? r.json() : { totalSales: 0, orderCount: 0, orders: [] })
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgOrder = stats.orderCount > 0 ? (stats.totalSales / stats.orderCount) : 0;

  // Build hourly chart data from orders
  const hourlyData = Array(24).fill(0);
  (stats.orders || []).forEach(o => {
    const h = new Date(o.orderDate).getHours();
    hourlyData[h] += o.totalAmount;
  });
  const maxHourly = Math.max(...hourlyData, 1);

  return (
    <div className="stats-page">
      <header className="stats-header">
        <div>
          <h1 className="text-gradient">Tableau de Bord</h1>
          <p className="stats-subtitle">Statistiques du jour — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </header>

      {loading ? (
        <div className="stats-loading">
          <div className="spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(229, 0, 43, 0.1)', color: 'var(--brand-primary)' }}>
                <DollarSign size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Ventes du jour</span>
                <span className="kpi-value">{stats.totalSales.toFixed(2)} €</span>
              </div>
              <div className="kpi-trend up">
                <ArrowUpRight size={16} /> +12%
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <ShoppingBag size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Commandes</span>
                <span className="kpi-value">{stats.orderCount}</span>
              </div>
              <div className="kpi-trend up">
                <ArrowUpRight size={16} /> +8%
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <TrendingUp size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Panier moyen</span>
                <span className="kpi-value">{avgOrder.toFixed(2)} €</span>
              </div>
              <div className="kpi-trend down">
                <ArrowDownRight size={16} /> -3%
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(255, 184, 0, 0.1)', color: '#FFB800' }}>
                <Clock size={24} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Temps moyen</span>
                <span className="kpi-value">12 min</span>
              </div>
              <div className="kpi-trend up">
                <ArrowUpRight size={16} /> -5%
              </div>
            </div>
          </div>

          {/* Hourly Revenue Chart */}
          <div className="chart-section">
            <h2>Revenus par heure</h2>
            <div className="bar-chart">
              {hourlyData.map((val, i) => (
                <div key={i} className="bar-column">
                  <div
                    className="bar-fill"
                    style={{ height: `${(val / maxHourly) * 100}%` }}
                    title={`${val.toFixed(2)} €`}
                  ></div>
                  <span className="bar-label">{String(i).padStart(2, '0')}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="recent-section">
            <h2>Dernières commandes</h2>
            {(stats.orders || []).length === 0 ? (
              <p className="no-data">Aucune commande enregistrée aujourd'hui</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Heure</th>
                    <th>Statut</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.orders || []).slice(0, 10).map(o => (
                    <tr key={o.id}>
                      <td className="order-num">#{String(o.id).padStart(4, '0')}</td>
                      <td>{new Date(o.orderDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span className={`status-badge status-${o.status}`}>
                          {['En attente', 'Préparation', 'Prête', 'Terminée', 'Annulée'][o.status]}
                        </span>
                      </td>
                      <td className="amount">{o.totalAmount.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
