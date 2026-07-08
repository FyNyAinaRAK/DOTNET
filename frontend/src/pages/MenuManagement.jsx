import { useEffect, useState } from 'react';
import { 
  Plus, Trash2, Package, X, Pizza, Coffee, CupSoda, IceCream, Flame, Soup, Leaf, Utensils, Drumstick
} from 'lucide-react';
import './MenuManagement.css';

const API = 'http://localhost:5128';

export default function MenuManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '' });

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

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${API}/api/products`).then(r => r.json()),
        fetch(`${API}/api/categories`).then(r => r.json())
      ]);
      setProducts(pRes);
      setCategories(cRes);
    } catch {
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const product = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      categoryId: parseInt(form.categoryId),
      imageUrl: ''
    };
    try {
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: '', description: '', price: '', categoryId: '' });
        fetchData();
      }
    } catch (err) {
      alert('Erreur lors de l\'ajout');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await fetch(`${API}/api/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="menu-page">
      <header className="menu-mgmt-header">
        <div>
          <h1 className="text-gradient">Gestion du Menu</h1>
          <p className="menu-subtitle">{products.length} produit{products.length > 1 ? 's' : ''} • {categories.length} catégorie{categories.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Ajouter un produit
        </button>
      </header>

      {loading ? (
        <div className="menu-empty"><div className="spinner"></div><p>Chargement...</p></div>
      ) : (
        <div className="menu-sections">
          {categories.map(cat => {
            const catProducts = products.filter(p => p.categoryId === cat.id);
            if (catProducts.length === 0) return null;
            return (
              <div key={cat.id} className="menu-section">
                <h2 className="section-title">
                  <span className="section-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {getCategoryIcon(cat.name)}
                  </span>
                  <span style={{ marginLeft: '8px' }}>{cat.name}</span>
                  <span className="section-count">{catProducts.length}</span>
                </h2>
                <div className="menu-table-wrap">
                  <table className="menu-table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Description</th>
                        <th>Prix</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {catProducts.map(p => (
                        <tr key={p.id}>
                          <td className="product-name-cell">
                            <div className="product-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {getCategoryIcon(cat.name)}
                            </div>
                            <span className="product-name-text">{p.name}</span>
                          </td>
                          <td className="product-desc">{p.description || '—'}</td>
                          <td className="product-price-cell">{p.price.toFixed(2)} €</td>
                          <td>
                            <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouveau produit</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="modal-form">
              <div className="form-group">
                <label>Nom du produit</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Bucket Familial"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: 15 pièces de poulet croustillant"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="12.50"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Choisir...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                <Plus size={18} /> Ajouter au menu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
