import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/GameDevUpload.css";

const GameDevUpload = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    developer: "",
    price: "",
    currency: "FT",
    categories: [], // Tömb a kategóriáknak
    platforms: [], // Tömb a platformoknak
    image: "",
    minReq: "",
    recReq: "",
    desc: "",
    rating: 0,
    videos: [""],
    megjelenes: "",
    steamLink: "",
    jatekElmeny: "",
    reszletesLeiras: "",
  });

  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [categories, setCategories] = useState([]);

  // Platformok és kategóriák betöltése az adatbázisból
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [platformsResponse, categoriesResponse] = await Promise.all([
          axios.get('http://localhost:3001/platforms'),
          axios.get('http://localhost:3001/categories')
        ]);
        
        if (platformsResponse.data.success) {
          setPlatforms(platformsResponse.data.platforms);
        }
        
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories);
        }
      } catch (error) {
        console.error('Hiba az adatok betöltésekor:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      categories: selectedOptions
    }));
  };

  const handlePlatformChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      platforms: selectedOptions
    }));
  };

  const handleVideoChange = (index, value) => {
    const newVideos = [...formData.videos];
    newVideos[index] = value;
    setFormData(prev => ({
      ...prev,
      videos: newVideos
    }));
  };

  const addVideoField = () => {
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, ""]
    }));
  };

  const removeVideoField = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      videos: newVideos
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validáció - legalább egy kategóriát és platformot kötelező választani
    if (!formData.categories || formData.categories.length === 0) {
      alert('Kérlek, válassz legalább egy kategóriát!');
      setLoading(false);
      return;
    }

    if (!formData.platforms || formData.platforms.length === 0) {
      alert('Kérlek, válassz legalább egy platformot!');
      setLoading(false);
      return;
    }

    console.log('Küldött formData:', formData);

    try {
      const res = await axios.post("http://localhost:3001/gamedev/upload-game", {
        username: user.username,
        ...formData
      });
      
      if (res.data.success) {
        alert("Játék sikeresen feltöltve, jóváhagyásra vár!");
        setFormData({
          title: "",
          developer: "",
          price: "",
          currency: "FT",
          categories: [],
          platforms: [],
          image: "",
          minReq: "",
          recReq: "",
          desc: "",
          rating: "",
          videos: [""],
          megjelenes: "",
          steamLink: "",
          jatekElmeny: "",
          reszletesLeiras: ""
        });
      }
    } catch (error) {
      console.error('Játék feltöltési hiba:', error);
      const msg =
        error?.response?.data?.message ||
        (typeof error?.response?.data?.error === 'string' ? error.response.data.error : null) ||
        (error?.response?.status ? `HTTP ${error.response.status}` : null) ||
        "Hiba történt a feltöltés során!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-upload-page">
      
      <div className="cyber-upload-container">
        {/* Jövőbeállító Fejléc */}
        <div className="cyber-upload-header">
          <Link to="/" className="cyber-back-btn">
            ⬅ Vissza
          </Link>
          <h1>🚀 JÁTÉK FELTÖLTÉSE</h1>
          <p className="cyber-upload-subtitle">Töltsd fel a játékodat a GameVerse platformra</p>
        </div>

        {/* 1. Szekció: Alapinformációk */}
        <div className="cyber-section">
          <div className="cyber-section-header">
            <span className="cyber-section-icon">🎮</span>
            <h2 className="cyber-section-title">Alapinformációk</h2>
          </div>
          
          <div className="cyber-form-grid">
            <div className="cyber-form-row">
              <div className="cyber-input-group">
                <label className="cyber-input-label">Játék neve *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="cyber-input"
                  placeholder="Add meg a játék címét..."
                />
              </div>

              <div className="cyber-input-group">
                <label className="cyber-input-label">Fejlesztő *</label>
                <input
                  type="text"
                  name="developer"
                  value={formData.developer}
                  onChange={handleChange}
                  required
                  className="cyber-input"
                  placeholder="Fejlesztő neve..."
                />
              </div>
            </div>

            <div className="cyber-form-row">
              <div className="cyber-input-group">
                <label className="cyber-input-label">Ár *</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="pl: 4999 vagy Ingyenes"
                  required
                  className="cyber-input"
                />
              </div>

              <div className="cyber-input-group">
                <label className="cyber-input-label">Pénznem *</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="cyber-input"
                >
                  <option value="FT">HUF (Ft)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="cyber-form-row">
              <div className="cyber-input-group">
                <label className="cyber-input-label">Kategóriák *</label>
                <select
                  name="categories"
                  value={formData.categories}
                  onChange={handleCategoryChange}
                  className="cyber-input"
                  multiple
                  style={{ height: '120px' }}
                >
                  <option value="" disabled>Válassz kategóriákat...</option>
                  {categories.map(category => (
                    <option key={category.idkategoria} value={category.idkategoria}>
                      {category.nev}
                    </option>
                  ))}
                </select>
                <small className="cyber-hint">Tartsd lenyomva a Ctrl/Cmd gombot a többszörös választáshoz</small>
              </div>

              <div className="cyber-input-group">
                <label className="cyber-input-label">Platformok *</label>
                <select
                  name="platforms"
                  value={formData.platforms}
                  onChange={handlePlatformChange}
                  className="cyber-input"
                  multiple
                  style={{ height: '120px' }}
                >
                  <option value="" disabled>Válassz platformokat...</option>
                  {platforms.map(platform => (
                    <option key={platform.idplatform} value={platform.idplatform}>
                      {platform.nev}
                    </option>
                  ))}
                </select>
                <small className="cyber-hint">Tartsd lenyomva a Ctrl/Cmd gombot a többszörös választáshoz</small>
              </div>
            </div>

            <div className="cyber-form-row">
              <div className="cyber-input-group">
                <label className="cyber-input-label">Megjelenés dátuma *</label>
                <input
                  type="text"
                  name="megjelenes"
                  value={formData.megjelenes}
                  onChange={handleChange}
                  placeholder="pl: 2024. január 15."
                  required
                  className="cyber-input"
                />
              </div>

              <div className="cyber-input-group">
                <label className="cyber-input-label">Steam Link *</label>
                <input
                  type="url"
                  name="steamLink"
                  value={formData.steamLink}
                  onChange={handleChange}
                  required
                  className="cyber-input"
                  placeholder="https://store.steampowered.com/..."
                />
              </div>
            </div>

            <div className="cyber-form-row">
              <div className="cyber-input-group">
                <label className="cyber-input-label">Értékelés (0-10)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="cyber-input"
                  placeholder="0-10"
                />
              </div>

              <div className="cyber-input-group">
                <label className="cyber-input-label">Játékélmény</label>
                <input
                  type="text"
                  name="jatekElmeny"
                  value={formData.jatekElmeny}
                  onChange={handleChange}
                  placeholder="pl: Nagyon pozitív, Vegyes"
                  className="cyber-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Szekció: Média Feltöltés */}
        <div className="cyber-section">
          <div className="cyber-section-header">
            <span className="cyber-section-icon">🖼️</span>
            <h2 className="cyber-section-title">Média Feltöltés</h2>
          </div>
          
          <div className="cyber-input-group">
            <label className="cyber-input-label">Kép URL *</label>
            <div className="cyber-media-zone">
              <div className="cyber-media-icon">📸</div>
              <div className="cyber-media-text">Húzd ide a képet vagy add meg az URL-t</div>
              <div className="cyber-media-hint">Támogatott formátumok: JPG, PNG, GIF</div>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="cyber-input"
                placeholder="https://example.com/game-image.jpg"
                style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.1)' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Szekció: Leírások */}
        <div className="cyber-section">
          <div className="cyber-section-header">
            <span className="cyber-section-icon">📝</span>
            <h2 className="cyber-section-title">Leírások</h2>
          </div>
          
          <div className="cyber-input-group">
            <label className="cyber-input-label">Rövid leírás</label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              rows="3"
              className="cyber-input cyber-textarea"
              placeholder="Add meg a játék rövid leírását..."
            />
          </div>

          <div className="cyber-input-group">
            <label className="cyber-input-label">Részletes leírás *</label>
            <textarea
              name="reszletesLeiras"
              value={formData.reszletesLeiras}
              onChange={handleChange}
              rows="6"
              required
              className="cyber-input cyber-textarea"
              placeholder="Részletesen írd le a játékot..."
            />
          </div>
        </div>

        {/* 4. Szekció: Rendszerkövetelmények */}
        <div className="cyber-section">
          <div className="cyber-section-header">
            <span className="cyber-section-icon">⚙️</span>
            <h2 className="cyber-section-title">Rendszerkövetelmények</h2>
          </div>
          
          <div className="cyber-requirements-grid">
            <div className="cyber-req-card">
              <h3 className="cyber-req-title">Minimum Követelmények</h3>
              <textarea
                name="minReq"
                value={formData.minReq}
                onChange={handleChange}
                rows="6"
                className="cyber-input cyber-textarea"
                placeholder="OS: Windows 10&#10;Processor: Intel Core i5&#10;Memory: 8 GB RAM&#10;Graphics: GTX 1060&#10;DirectX: Version 12&#10;Storage: 50 GB available space"
              />
            </div>

            <div className="cyber-req-card">
              <h3 className="cyber-req-title">Ajánlott Követelmények</h3>
              <textarea
                name="recReq"
                value={formData.recReq}
                onChange={handleChange}
                rows="6"
                className="cyber-input cyber-textarea"
                placeholder="OS: Windows 11&#10;Processor: Intel Core i7&#10;Memory: 16 GB RAM&#10;Graphics: RTX 3070&#10;DirectX: Version 12&#10;Storage: 100 GB available space"
              />
            </div>
          </div>
        </div>

        {/* 5. Szekció: Videók */}
        <div className="cyber-section">
          <div className="cyber-section-header">
            <span className="cyber-section-icon">🎬</span>
            <h2 className="cyber-section-title">Videók</h2>
          </div>
          
          <div className="cyber-video-section">
            {formData.videos.map((video, index) => (
              <div key={index} className="cyber-video-item">
                <input
                  type="url"
                  value={video}
                  onChange={(e) => handleVideoChange(index, e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="cyber-input cyber-video-input"
                />
                {formData.videos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVideoField(index)}
                    className="cyber-remove-video-btn"
                  >
                    Törlés
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addVideoField}
              className="cyber-add-video-btn"
            >
              ➕ Videó hozzáadása
            </button>
          </div>
        </div>

        {/* Alert Box */}
        <div className="cyber-alert-box">
          <div className="cyber-alert-content">
            <strong>⚠️ Fontos információ:</strong> A feltöltött játék először jóváhagyásra kerül az admin által, 
            csak ezután jelenik meg a felhasználók számára a platformon.
          </div>
        </div>
        {/* Action Buttons */}
        <div className="cyber-actions">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="cyber-btn cyber-btn-cancel"
          >
            ❌ Mégse
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`cyber-btn cyber-btn-submit ${loading ? 'cyber-loading' : ''}`}
            onClick={handleSubmit}
          >
            {loading ? "⏳ Feltöltés..." : "🚀 Játék feltöltése"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameDevUpload;
