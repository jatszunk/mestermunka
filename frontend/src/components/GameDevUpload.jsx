import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GameDevUpload = ({ user, onGameUploaded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    developer: user?.username || '',
    publisher: '',
    releaseDate: '',
    price: '0',
    categories: [],
    platforms: [],
    images: [],
    videos: [],
    systemRequirements: {
      minimum: {
        os: '',
        cpu: '',
        gpu: '',
        ram: '',
        storage: '',
        directx: ''
      },
      recommended: {
        os: '',
        cpu: '',
        gpu: '',
        ram: '',
        storage: '',
        directx: ''
      }
    },
    features: [],
    languages: [],
    ageRating: '',
    multiplayer: false,
    gameMode: [],
    estimatedPlaytime: '',
    website: '',
    socialLinks: {
      discord: '',
      twitter: '',
      facebook: '',
      youtube: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    'Akció', 'Kaland', 'RPG', 'Stratégia', 'Sport', 'Verseny',
    'Horrort', 'Puzzle', 'Platformer', 'Shooter', 'MMO', 'Szimulátor',
    'Indie', 'Co-op', 'Battle Royale', 'MOBA', 'Taktikai', 'Barkochba',
    'Vizuális regény', 'Logikai', 'Arcade', 'Family', 'Educational'
  ];

  const platforms = [
    'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One',
    'Nintendo Switch', 'Mobil (iOS)', 'Mobil (Android)', 'VR', 'Steam', 'Epic Games'
  ];

  const features = [
    'Egyjátékos', 'Többjátékos', 'Co-op', 'PvP', 'Online multiplayer',
    'LAN multiplayer', 'Cross-platform', 'Achievements', 'Cloud saves',
    'Controller support', 'VR support', 'Modding support', 'Workshop support',
    'HDR', '4K support', '60 FPS', '120 FPS', 'Ray tracing', 'DLSS'
  ];

  const languages = [
    'Magyar', 'Angol', 'Német', 'Francia', 'Spanyol', 'Olasz',
    'Portugál', 'Orosz', 'Japán', 'Kínai (egyszerűsített)', 'Kínai (hagyományos)',
    'Koreai', 'Lengyel', 'Cseh', 'Horvát', 'Román', 'Svéd', 'Dán', 'Norvég', 'Finn'
  ];

  const gameModes = [
    'Egyjátékos', 'Többjátékos', 'Co-op', 'Verseny', 'Kooperatív',
    'Battle Royale', 'Survival', 'Sandbox', 'Story', 'Arcade'
  ];

  const ageRatings = [
    'PEGI 3', 'PEGI 7', 'PEGI 12', 'PEGI 16', 'PEGI 18',
    'ESRB Everyone', 'ESRB Everyone 10+', 'ESRB Teen', 'ESRB Mature 17+', 'ESRB Adults Only'
  ];

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        developer: user.username
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleGameModeToggle = (mode) => {
    setFormData(prev => ({
      ...prev,
      gameMode: prev.gameMode.includes(mode)
        ? prev.gameMode.filter(m => m !== mode)
        : [...prev.gameMode, mode]
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const newImages = [];
    
    Array.from(files).forEach(file => {
      if (validTypes.includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            url: e.target.result,
            name: file.name,
            size: file.size
          });
          
          if (newImages.length === files.length) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...newImages]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3001/games/upload', {
        ...formData,
        developer: user.username,
        status: 'pending'
      });

      if (response.data.success) {
        setMessage('Játék sikeresen feltöltve! Várj az admin jóváhagyására.');
        setMessageType('success');
        
        if (onGameUploaded) {
          onGameUploaded(response.data.game);
        }

        // Reset form
        setFormData({
          title: '',
          description: '',
          developer: user?.username || '',
          publisher: '',
          releaseDate: '',
          price: '0',
          categories: [],
          platforms: [],
          images: [],
          videos: [],
          systemRequirements: {
            minimum: {
              os: '',
              cpu: '',
              gpu: '',
              ram: '',
              storage: '',
              directx: ''
            },
            recommended: {
              os: '',
              cpu: '',
              gpu: '',
              ram: '',
              storage: '',
              directx: ''
            }
          },
          features: [],
          languages: [],
          ageRating: '',
          multiplayer: false,
          gameMode: [],
          estimatedPlaytime: '',
          website: '',
          socialLinks: {
            discord: '',
            twitter: '',
            facebook: '',
            youtube: ''
          }
        });
      } else {
        setMessage(response.data.message || 'Hiba történt a feltöltés során');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Játék feltöltési hiba:', error);
      setMessage('Hiba történt a szerverrel való kommunikáció során');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-upload-container">
      <div className="game-upload-header">
        <h1>🎮 Játék Feltöltése</h1>
        <p>Töltsd fel a játékodat a GameVerse platformra</p>
      </div>

      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="game-upload-form">
        {/* Alap információk */}
        <div className="form-section">
          <h3>📋 Alap Információk</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Játék Címe *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Add meg a játék címét"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="developer">Fejlesztő *</label>
              <input
                type="text"
                id="developer"
                name="developer"
                value={formData.developer}
                onChange={handleChange}
                placeholder="Fejlesztő neve"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="publisher">Kiadó</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="Kiadó neve (opcionális)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="releaseDate">Megjelenési Dátum</label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Ár (Ft) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0 (ingyenes)"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ageRating">Korhatár Besorolás</label>
              <select
                id="ageRating"
                name="ageRating"
                value={formData.ageRating}
                onChange={handleChange}
              >
                <option value="">Válassz korhatárt</option>
                {ageRatings.map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Leírás *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Részletes leírás a játékról..."
              rows="6"
              required
            />
          </div>
        </div>

        {/* Kategóriák és platformok */}
        <div className="form-section">
          <h3>🏷️ Kategóriák és Platformok</h3>
          <div className="form-group">
            <label>Kategóriák *</label>
            <div className="category-select">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  className={`category-checkbox ${formData.categories.includes(category) ? 'selected' : ''}`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Platformok *</label>
            <div className="platform-select">
              {platforms.map(platform => (
                <button
                  key={platform}
                  type="button"
                  className={`platform-checkbox ${formData.platforms.includes(platform) ? 'selected' : ''}`}
                  onClick={() => handlePlatformToggle(platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rendszerkövetelmények */}
        <div className="form-section">
          <h3>💻 Rendszerkövetelmények</h3>
          
          <div className="requirements-section">
            <h4>Minimum Követelmények</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minOs">Operációs Rendszer</label>
                <input
                  type="text"
                  id="minOs"
                  name="systemRequirements.minimum.os"
                  value={formData.systemRequirements.minimum.os}
                  onChange={handleChange}
                  placeholder="pl. Windows 10 64-bit"
                />
              </div>
              <div className="form-group">
                <label htmlFor="minCpu">Processzor</label>
                <input
                  type="text"
                  id="minCpu"
                  name="systemRequirements.minimum.cpu"
                  value={formData.systemRequirements.minimum.cpu}
                  onChange={handleChange}
                  placeholder="pl. Intel Core i3-3250"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minGpu">Videokártya</label>
                <input
                  type="text"
                  id="minGpu"
                  name="systemRequirements.minimum.gpu"
                  value={formData.systemRequirements.minimum.gpu}
                  onChange={handleChange}
                  placeholder="pl. NVIDIA GeForce GTX 660"
                />
              </div>
              <div className="form-group">
                <label htmlFor="minRam">Memória (RAM)</label>
                <input
                  type="text"
                  id="minRam"
                  name="systemRequirements.minimum.ram"
                  value={formData.systemRequirements.minimum.ram}
                  onChange={handleChange}
                  placeholder="pl. 4 GB RAM"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minStorage">Tárhely</label>
                <input
                  type="text"
                  id="minStorage"
                  name="systemRequirements.minimum.storage"
                  value={formData.systemRequirements.minimum.storage}
                  onChange={handleChange}
                  placeholder="pl. 10 GB szabad hely"
                />
              </div>
              <div className="form-group">
                <label htmlFor="minDirectx">DirectX</label>
                <input
                  type="text"
                  id="minDirectx"
                  name="systemRequirements.minimum.directx"
                  value={formData.systemRequirements.minimum.directx}
                  onChange={handleChange}
                  placeholder="pl. DirectX 11"
                />
              </div>
            </div>
          </div>

          <div className="requirements-section">
            <h4>Ajánlott Követelmények</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recOs">Operációs Rendszer</label>
                <input
                  type="text"
                  id="recOs"
                  name="systemRequirements.recommended.os"
                  value={formData.systemRequirements.recommended.os}
                  onChange={handleChange}
                  placeholder="pl. Windows 10 64-bit"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recCpu">Processzor</label>
                <input
                  type="text"
                  id="recCpu"
                  name="systemRequirements.recommended.cpu"
                  value={formData.systemRequirements.recommended.cpu}
                  onChange={handleChange}
                  placeholder="pl. Intel Core i5-6600K"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recGpu">Videokártya</label>
                <input
                  type="text"
                  id="recGpu"
                  name="systemRequirements.recommended.gpu"
                  value={formData.systemRequirements.recommended.gpu}
                  onChange={handleChange}
                  placeholder="pl. NVIDIA GeForce GTX 1060"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recRam">Memória (RAM)</label>
                <input
                  type="text"
                  id="recRam"
                  name="systemRequirements.recommended.ram"
                  value={formData.systemRequirements.recommended.ram}
                  onChange={handleChange}
                  placeholder="pl. 8 GB RAM"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recStorage">Tárhely</label>
                <input
                  type="text"
                  id="recStorage"
                  name="systemRequirements.recommended.storage"
                  value={formData.systemRequirements.recommended.storage}
                  onChange={handleChange}
                  placeholder="pl. 15 GB szabad hely"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recDirectx">DirectX</label>
                <input
                  type="text"
                  id="recDirectx"
                  name="systemRequirements.recommended.directx"
                  value={formData.systemRequirements.recommended.directx}
                  onChange={handleChange}
                  placeholder="pl. DirectX 12"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jellemzők és játékmódok */}
        <div className="form-section">
          <h3>⚡ Jellemzők és Játékmódok</h3>
          
          <div className="form-group">
            <label>Jellemzők</label>
            <div className="feature-select">
              {features.map(feature => (
                <button
                  key={feature}
                  type="button"
                  className={`feature-checkbox ${formData.features.includes(feature) ? 'selected' : ''}`}
                  onClick={() => handleFeatureToggle(feature)}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedPlaytime">Becsült Játékidő</label>
              <input
                type="text"
                id="estimatedPlaytime"
                name="estimatedPlaytime"
                value={formData.estimatedPlaytime}
                onChange={handleChange}
                placeholder="pl. 20-30 óra"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="multiplayer"
                  checked={formData.multiplayer}
                  onChange={handleChange}
                />
                Többjátékos mód
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Játékmódok</label>
            <div className="gamemode-select">
              {gameModes.map(mode => (
                <button
                  key={mode}
                  type="button"
                  className={`gamemode-checkbox ${formData.gameMode.includes(mode) ? 'selected' : ''}`}
                  onClick={() => handleGameModeToggle(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nyelvek és média */}
        <div className="form-section">
          <h3>🌍 Nyelvek és Média</h3>
          
          <div className="form-group">
            <label>Támogatott Nyelvek</label>
            <div className="language-select">
              {languages.map(language => (
                <button
                  key={language}
                  type="button"
                  className={`language-checkbox ${formData.languages.includes(language) ? 'selected' : ''}`}
                  onClick={() => handleLanguageToggle(language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Képek Feltöltése</label>
            <div 
              className={`image-upload ${dragActive ? 'dragover' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload" className="upload-label">
                <div className="image-upload-icon">📸</div>
                <div className="image-upload-text">
                  Kattints ide vagy húzd ide a képeket
                </div>
                <div className="image-upload-hint">
                  Támogatott formátumok: JPG, PNG, GIF, WebP
                </div>
              </label>
            </div>
            
            {formData.images.length > 0 && (
              <div className="image-preview">
                {formData.images.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={image.url} alt={image.name} />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => removeImage(index)}
                    >
                      ✖️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Közösségi linkek */}
        <div className="form-section">
          <h3>🔗 Közösségi Linkek</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="website">Weboldal</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://pelda.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="discord">Discord</label>
              <input
                type="text"
                id="discord"
                name="socialLinks.discord"
                value={formData.socialLinks.discord}
                onChange={handleChange}
                placeholder="discord.gg/pelda"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="twitter">Twitter/X</label>
              <input
                type="text"
                id="twitter"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                placeholder="@felhasznalo"
              />
            </div>
            <div className="form-group">
              <label htmlFor="youtube">YouTube</label>
              <input
                type="text"
                id="youtube"
                name="socialLinks.youtube"
                value={formData.socialLinks.youtube}
                onChange={handleChange}
                placeholder="YouTube csatorna linkje"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => window.history.back()}>
            Mégse
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Feltöltés...' : 'Játék Feltöltése'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameDevUpload;
