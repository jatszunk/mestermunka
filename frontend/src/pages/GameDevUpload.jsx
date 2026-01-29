import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GameDevUpload = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    developer: "",
    price: "",
    category: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          category: "",
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
      console.error("Feltöltés hiba:", error);
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
    <div className="maincenter">
      <div className="gamedev-upload-header">
        <h1>Játék Feltöltése</h1>
        <button
          onClick={() => navigate("/")}
          className="vissza-btn"
        >
          Vissza
        </button>
      </div>

      <div className="gamedev-upload-form">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Játék neve *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fejlesztő *</label>
                <input
                  type="text"
                  name="developer"
                  value={formData.developer}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ár *</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="pl: 4999 vagy Ingyenes"
                  required
                  className="login-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategória *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="pl: FPS, RPG, Stratégia"
                  required
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kép URL *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Megjelenés dátuma *</label>
                <input
                  type="text"
                  name="megjelenes"
                  value={formData.megjelenes}
                  onChange={handleChange}
                  placeholder="pl: 2024. január 15."
                  required
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Steam Link *</label>
                <input
                  type="url"
                  name="steamLink"
                  value={formData.steamLink}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Értékelés (0-10)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="login-input"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rövid leírás</label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              rows="3"
              className="neon-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Részletes leírás *</label>
            <textarea
              name="reszletesLeiras"
              value={formData.reszletesLeiras}
              onChange={handleChange}
              rows="6"
              required
              className="neon-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Játékélmény</label>
            <input
              type="text"
              name="jatekElmeny"
              value={formData.jatekElmeny}
              onChange={handleChange}
              placeholder="pl: Nagyon pozitív, Vegyes"
              className="login-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Minimum rendszerkövetelmények</label>
              <textarea
                name="minReq"
                value={formData.minReq}
                onChange={handleChange}
                rows="4"
                placeholder="OS: Windows 10&#10;Processor: Intel Core i5&#10;Memory: 8 GB RAM&#10;Graphics: GTX 1060"
                className="neon-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ajánlott rendszerkövetelmények</label>
              <textarea
                name="recReq"
                value={formData.recReq}
                onChange={handleChange}
                rows="4"
                placeholder="OS: Windows 11&#10;Processor: Intel Core i7&#10;Memory: 16 GB RAM&#10;Graphics: RTX 3070"
                className="neon-textarea"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Videók (YouTube linkek)</label>
            <div className="videos-section">
              {formData.videos.map((video, index) => (
                <div key={index} className="video-input-row">
                  <input
                    type="url"
                    value={video}
                    onChange={(e) => handleVideoChange(index, e.target.value)}
                    placeholder="https://youtu.be/..."
                    className="login-input"
                  />
                  {formData.videos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVideoField(index)}
                      className="remove-video-btn"
                    >
                      Törlés
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addVideoField}
                className="add-video-btn"
              >
                Videó hozzáadása
              </button>
            </div>
          </div>

          <div className="notice-box">
            <p>
              <strong>Fontos:</strong> A feltöltött játék először jóváhagyásra kerül az admin által, 
              csak ezután jelenik meg a felhasználók számára.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="vissza-btn"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? "Feltöltés..." : "Játék feltöltése"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameDevUpload;
