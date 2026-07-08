import { useState, useEffect } from 'react';
import { 
  Home, LayoutGrid, Receipt, BarChart2, Settings, Search, Plus, Minus, ChevronRight, Trash2,
  Pizza, Coffee, CupSoda, IceCream, Flame, Soup, Leaf, Utensils, Drumstick, Banknote, Bell, XCircle
} from 'lucide-react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import Orders from './pages/Orders';
import Stats from './pages/Stats';
import MenuManagement from './pages/MenuManagement';
import Cashier from './pages/Cashier';
import './App.css';
import './Toast.css';

const API = 'http://localhost:5128';

function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Setup SignalR
    const connection = new HubConnectionBuilder()
      .withUrl(`${API}/orderhub`)
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    connection.on("OrderStatusChanged", (id, status, table) => {
      if (status === 2) { // 2 = Ready (Prête)
        setNotifications(prev => [...prev, { id: Date.now(), msg: `Le plat de la Table ${table || '?'} est prêt ! 🛎️` }]);
      }
    });

    return () => {
      connection.stop();
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API}/api/categories`).catch(() => null),
          fetch(`${API}/api/products`).catch(() => null)
        ]);

        if (catRes && catRes.ok && prodRes && prodRes.ok) {
          const cats = await catRes.json();
          const prods = await prodRes.json();
          setCategories(cats);
          setProducts(prods);
          if (cats.length > 0) setActiveCategory(cats[0].id);
        } else {
          // Mock data if backend is down
          setCategories([
            { id: 1, name: 'Burgers', icon: '🍔' },
            { id: 2, name: 'Poulet Frit', icon: '🍗' },
            { id: 3, name: 'Boissons', icon: '🥤' },
            { id: 4, name: 'Desserts', icon: '🍦' },
          ]);
          setProducts([
            { id: 1, name: 'Mega Burger', description: 'Double viande, fromage, bacon', price: 8.5, categoryId: 1 },
            { id: 2, name: 'Bucket Poulet 10 pcs', description: 'Morceaux de poulet croustillants', price: 15.0, categoryId: 2 },
            { id: 3, name: 'Frites Moyennes', description: 'Frites dorées et croustillantes', price: 3.0, categoryId: 2 },
            { id: 4, name: 'Cola Moyen', description: 'Boisson gazeuse', price: 2.5, categoryId: 3 },
          ]);
          setActiveCategory(1);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryIcon = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'burgers':
        return <Utensils size={20} />;
      case 'pizzas':
        return <Pizza size={20} />;
      case 'poulets':
      case 'poulet frit':
        return <Drumstick size={20} />;
      case 'steaks':
        return <Flame size={20} />;
      case 'spaghettis':
        return <Soup size={20} />;
      case 'entrées & salades':
        return <Leaf size={20} />;
      case 'boissons':
        return <CupSoda size={20} />;
      case 'desserts & glaces':
      case 'desserts':
        return <IceCream size={20} />;
      case 'fritures':
        return <Utensils size={20} />;
      case 'grillades':
        return <Flame size={20} />;
      default:
        return <Utensils size={20} />;
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: newQ };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const filteredProducts = products.filter(p =>
    (activeCategory ? p.categoryId === activeCategory : true) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!tableNumber) {
      alert("Veuillez saisir un numéro de table avant d'envoyer la commande.");
      return;
    }
    const order = {
      customerName: 'Serveur 1',
      tableNumber: tableNumber,
      totalAmount: cartTotal,
      status: 0,
      paymentStatus: 0, // Pending
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price
      }))
    };
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        setCart([]);
        setTableNumber('');
        alert('✅ Commande envoyée en cuisine !');
      }
    } catch (err) {
      alert('❌ Erreur lors de l\'envoi de la commande');
    }
  };

  // Render the POS content
  const renderPOS = () => (
    <>
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-gradient">Nouvelle Commande</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="search-bar">
            <Search size={20} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Categories Carousel */}
        <div className="categories">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="category-icon">{getCategoryIcon(cat.name)}</span>
              <span style={{ fontWeight: 600 }}>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div className="product-grid">
          {loading ? (
            <p>Chargement du menu...</p>
          ) : (
            filteredProducts.map(product => {
              const cartItem = cart.find(item => item.product.id === product.id);
              const qty = cartItem ? cartItem.quantity : 0;
              return (
                <div
                  key={product.id}
                  className={`product-card ${qty > 0 ? 'selected' : ''}`}
                  onClick={() => addToCart(product)}
                >
                  {qty > 0 && <span className="product-qty-badge">{qty}</span>}
                  <div className="product-image">
                    {getCategoryIcon(categories.find(c => c.id === product.categoryId)?.name)}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-price">{product.price.toFixed(2)} €</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Cart Panel */}
      <aside className="cart-panel">
        <div className="cart-header">
          <h2>Commande en cours</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Table :</span>
            <input 
              type="text" 
              placeholder="Ex: 12" 
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', width: '80px', fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
              <Receipt size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>Le panier est vide</p>
              <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '8px' }}>Cliquez sur un produit pour l'ajouter</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-img">
                  {getCategoryIcon(categories.find(c => c.id === item.product.categoryId)?.name)}
                </div>
                <div className="cart-item-info">
                  <h4>{item.product.name}</h4>
                  <p style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>
                    {(item.product.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, -1); }}><Minus size={16} /></button>
                  <span>{item.quantity}</span>
                  <button className="qty-btn" onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, 1); }}><Plus size={16} /></button>
                </div>
                <button className="qty-btn delete-item-btn" style={{ marginLeft: '8px', color: '#EF4444' }} onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.id); }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer glass-panel">
          <div className="cart-total">
            <span>Total</span>
            <span style={{ color: 'var(--brand-primary)' }}>{cartTotal.toFixed(2)} €</span>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', height: '56px', fontSize: '18px' }}
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Envoyer en Cuisine <ChevronRight size={20} />
          </button>
        </div>
      </aside>
    </>
  );

  // Render full-width page content (Orders, Stats, Menu)
  const renderFullPage = () => {
    switch (activeTab) {
      case 'orders': return <div className="full-page-content"><Orders /></div>;
      case 'cashier': return <div className="full-page-content"><Cashier /></div>;
      case 'stats': return <div className="full-page-content"><Stats /></div>;
      case 'menu': return <div className="full-page-content"><MenuManagement /></div>;
      default: return null;
    }
  };

  return (
    <div className={`app-container ${activeTab !== 'pos' ? 'full-layout' : ''}`}>
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div className={`nav-item ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')} title="Serveur (POS)">
          <Home size={24} />
        </div>
        <div className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} title="Cuisine">
          <Receipt size={24} />
        </div>
        <div className={`nav-item ${activeTab === 'cashier' ? 'active' : ''}`} onClick={() => setActiveTab('cashier')} title="Caisse">
          <Banknote size={24} />
        </div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')} title="Statistiques">
          <BarChart2 size={24} />
        </div>
        <div className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')} title="Gestion Menu">
          <LayoutGrid size={24} />
        </div>
        <div className="nav-item" style={{ marginTop: 'auto' }} title="Paramètres">
          <Settings size={24} />
        </div>
      </nav>

      {/* Notifications Toast */}
      <div className="toast-container">
        {notifications.map(n => (
          <div key={n.id} className="toast" onClick={() => removeNotification(n.id)}>
            <Bell size={18} color="#10B981" />
            <span>{n.msg}</span>
            <XCircle size={16} style={{ marginLeft: 'auto', cursor: 'pointer', opacity: 0.5 }} />
          </div>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === 'pos' ? renderPOS() : renderFullPage()}
    </div>
  );
}

export default App;
