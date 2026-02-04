import React, { useState } from 'react';
import axios from 'axios';

const AdminGameUpload = ({ user }) => {
  const [formData, setFormData] = useState({
    title: "",
    developer: "",
    price: "",
    currency: "FT",
    category: "",
    image: "",
    description: "",
    rating: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/gamedev/upload-game", {
        ...formData,
        username: user.username
      });

      if (res.data.success) {
        alert("Játék sikeresen feltöltve, jóváhagyásra vár!");
        setFormData({
          title: "",
          developer: "",
          price: "",
          currency: "FT",
          category: "",
          image: "",
          description: "",
          rating: 0,
        });
      }
    } catch (error) {
      console.error("Játék feltöltési hiba:", error);
      alert("Hiba történt a játék feltöltése során!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Játék Feltöltése</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Játék neve *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Fejlesztő *</label>
          <input
            type="text"
            name="developer"
            value={formData.developer}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Ár *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Pénznem *</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="FT">HUF (Ft)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        
        <div>
          <label>Kategóriák *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="pl: FPS, RPG, Stratégia"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Kép URL *</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Értékelés (0-10)</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="10"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Leírás *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Feltöltés..." : "Játék feltöltése"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminGameUpload;
