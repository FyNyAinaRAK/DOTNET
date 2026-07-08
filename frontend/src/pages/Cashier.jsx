import { useEffect, useState } from 'react';
import { CreditCard, Banknote, User, Clock, CheckCircle } from 'lucide-react';
import './Cashier.css';

const API = 'http://localhost:5128';

export default function Cashier() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch(`${API}/api/orders`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    
    // Poll for updates if SignalR isn't hooked in Cashier directly, 
    // but we can rely on App.jsx passing down trigger or just poll for simplicity
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePay = async (id) => {
    if (!window.confirm('Confirmer le paiement pour cette table ?')) return;
    
    try {
      await fetch(`${API}/api/orders/${id}/pay`, { method: 'PUT' });
      fetchOrders();
      alert('Paiement validé avec succès !');
    } catch (err) {
      alert('Erreur lors du paiement.');
    }
  };

  // Only show unpaid orders (paymentStatus === 0)
  const unpaidOrders = orders.filter(o => o.paymentStatus === 0);

  return (
    <div className="cashier-page">
      <header className="cashier-header">
        <div>
          <h1 className="text-gradient">Caisse & Encaissement</h1>
          <p className="cashier-subtitle">Tables en attente de paiement</p>
        </div>
      </header>

      {loading ? (
        <div className="cashier-empty">
          <div className="spinner"></div>
          <p>Chargement des tables...</p>
        </div>
      ) : unpaidOrders.length === 0 ? (
        <div className="cashier-empty">
          <CheckCircle size={64} strokeWidth={1} style={{ color: 'var(--brand-primary)', opacity: 0.5 }} />
          <p>Aucun paiement en attente</p>
          <span className="cashier-empty-hint">Toutes les tables ont réglé leur addition</span>
        </div>
      ) : (
        <div className="cashier-grid">
          {unpaidOrders.map(order => (
            <div key={order.id} className="cashier-card">
              <div className="cashier-card-header">
                <div className="cashier-table">
                  Table {order.tableNumber || '?'}
                </div>
                <div className="cashier-order-id">
                  Commande #{String(order.id).padStart(4, '0')}
                </div>
              </div>

              <div className="cashier-card-body">
                <div className="cashier-info">
                  <User size={16} /> Serveur: {order.customerName || 'Inconnu'}
                </div>
                <div className="cashier-info">
                  <Clock size={16} /> {new Date(order.orderDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                <div className="cashier-items">
                  {(order.items || []).map(it => (
                    <div key={it.id} className="cashier-item-row">
                      <span>{it.quantity}× {it.product?.name}</span>
                      <span>{(it.unitPrice * it.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cashier-card-footer">
                <div className="cashier-total">
                  <span>Total à payer</span>
                  <span className="amount">{order.totalAmount.toFixed(2)} €</span>
                </div>
                <button className="btn btn-primary btn-pay" onClick={() => handlePay(order.id)}>
                  <Banknote size={20} />
                  Encaisser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
