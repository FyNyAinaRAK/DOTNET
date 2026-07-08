import { useEffect, useState, useCallback } from 'react';
import { Clock, ChefHat, CheckCircle2, XCircle, Package } from 'lucide-react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import './Orders.css';

const API = 'http://localhost:5128';

const STATUS_CONFIG = {
  0: { label: 'En attente', icon: Clock, color: '#FFB800', bg: 'rgba(255, 184, 0, 0.1)' },
  1: { label: 'Préparation', icon: ChefHat, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  2: { label: 'Prête', icon: Package, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  3: { label: 'Terminée', icon: CheckCircle2, color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' },
  4: { label: 'Annulée', icon: XCircle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = useCallback(() => {
    fetch(`${API}/api/orders`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { 
    fetchOrders(); 
    
    // Setup SignalR for real-time order updates
    const connection = new HubConnectionBuilder()
      .withUrl(`${API}/orderhub`)
      .withAutomaticReconnect()
      .build();

    connection.start().catch(err => console.error(err));

    connection.on("OrderCreated", () => fetchOrders());
    connection.on("OrderStatusChanged", () => fetchOrders());
    connection.on("OrderPaid", () => fetchOrders());

    return () => connection.stop();
  }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/api/orders/${id}/status?status=${status}`, { method: 'PUT' });
    fetchOrders();
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === parseInt(filter));

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div>
          <h1 className="text-gradient">Gestion des Commandes</h1>
          <p className="orders-subtitle">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
        </div>
        <div className="order-filters">
          {[
            { key: 'all', label: 'Toutes' },
            { key: '0', label: 'En attente' },
            { key: '1', label: 'Préparation' },
            { key: '2', label: 'Prêtes' },
            { key: '3', label: 'Terminées' },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="orders-empty">
          <div className="spinner"></div>
          <p>Chargement des commandes...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <Package size={64} strokeWidth={1} style={{ opacity: 0.2 }} />
          <p>Aucune commande trouvée</p>
          <span className="orders-empty-hint">Les commandes passées via le POS apparaîtront ici</span>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG[0];
            const StatusIcon = cfg.icon;
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-id">
                    <span className="order-hash">#</span>{String(order.id).padStart(4, '0')}
                  </div>
                  <div className="order-status" style={{ color: cfg.color, background: cfg.bg }}>
                    <StatusIcon size={14} />
                    {cfg.label}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-date">
                    <Clock size={14} />
                    {new Date(order.orderDate).toLocaleString('fr-FR', {
                      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
                    })}
                  </div>

                  <div className="order-items-list">
                    {(order.items || []).map(it => (
                      <div key={it.id} className="order-item-row">
                        <span className="item-qty">{it.quantity}×</span>
                        <span className="item-name">{it.product?.name || 'Produit'}</span>
                        <span className="item-price">{(it.unitPrice * it.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                    {(!order.items || order.items.length === 0) && (
                      <div className="order-item-row">
                        <span className="item-name" style={{ opacity: 0.5 }}>Détails non disponibles</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span>Total</span>
                    <span className="order-total-amount">{order.totalAmount.toFixed(2)} €</span>
                  </div>
                  {order.status < 3 && (
                    <div className="order-actions">
                      {order.status === 0 && (
                        <button className="action-btn preparing" onClick={() => updateStatus(order.id, 1)}>
                          <ChefHat size={14} /> Préparer
                        </button>
                      )}
                      {order.status === 1 && (
                        <button className="action-btn ready" onClick={() => updateStatus(order.id, 2)}>
                          <Package size={14} /> Prête
                        </button>
                      )}
                      {order.status === 2 && (
                        <button className="action-btn complete" onClick={() => updateStatus(order.id, 3)}>
                          <CheckCircle2 size={14} /> Terminer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
