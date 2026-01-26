// Professzionális Játék Feltöltő Rendszer - Steam-szerű
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfessionalGameUpload.css';

const ProfessionalGameUpload = ({ user, onGameUploaded }) => {
  const navigate = useNavigate();
  
  // Form állapotok
  const [formData, setFormData] = useState({
    // Alap információk (kötelező)
    title: '',
    slug: '',
    description: '',
    detailedDescription: '',
    
    // Fejlesztő és kiadó (kötelező)
    developer: '',
    developerId: null,
    publisher: '',
    publisherId: null,
    
    // Árazás (kötelező)
    price: '',
    currency: 'HUF',
    salePrice: '',
    saleStart: '',
    saleEnd: '',
    
    // Megjelenés (kötelező)
    releaseDate: '',
    releaseStatus: 'released',
    
    // Kategóriák és platformok (kötelező)
    categories: [],
    platforms: [],
    
    // Rendszerkövetelmények (kötelező)
    minOS: '',
    minProcessor: '',
    minMemory: '',
    minGraphics: '',
    minDirectX: '',
    minStorage: '',
    recOS: '',
    recProcessor: '',
    recMemory: '',
    recGraphics: '',
    recDirectX: '',
    recStorage: '',
    
    // Média (kötelező)
    mainImage: '',
    screenshots: [],
    trailer: '',
    
    // Linkek (opcionális)
    steamLink: '',
    epicGamesLink: '',
    gogLink: '',
    officialWebsite: '',
    discordInvite: '',
    redditCommunity: '',
    facebookPage: '',
    twitterHashtag: '',
    
    // Nyelv és tartalom (opcionális)
    languages: [],
    subtitleLanguages: [],
    voiceLanguages: [],
    ageRating: '',
    contentWarnings: [],
    
    // Funkciók (opcionális)
    features: {
      multiplayer: false,
      co_op: false,
      online_multiplayer: false,
      lan_support: false,
      controller_support: false,
      vr_support: false,
      achievements: false,
      cloud_save: false,
      workshop_support: false,
      mod_support: false,
      trading_cards: false
    },
    
    // Címkék (opcionális)
    tags: [],
    
    // DLC és tartalom (opcionális)
    dlcCount: 0,
    expansionCount: 0,
    seasonPass: false,
    
    // Támogatás (opcionális)
    supportEmail: '',
    
    // Státusz
    status: 'draft'
  });

  // UI állapotok
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Validációs szabályok
  const requiredFields = {
    1: ['title', 'description', 'developer', 'publisher', 'price', 'releaseDate'],
    2: ['categories', 'platforms', 'mainImage'],
    3: ['minOS', 'minProcessor', 'minMemory', 'minGraphics', 'minStorage']
  };

  const totalSteps = 5;

  // Auto-save funkció
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title) {
        saveDraft();
      }
    }, 30000); // 30 másodperc

    return () => clearTimeout(timer);
  }, [formData]);

  // Slug generálás
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Form adatok kezelése
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto slug generálás
    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Hibák törlése
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Kép feltöltés kezelése
  const handleImageUpload = (type, files) => {
    const fileArray = Array.from(files);
    
    if (type === 'mainImage') {
      handleInputChange('mainImage', fileArray[0]);
    } else if (type === 'screenshots') {
      handleInputChange('screenshots', [...formData.screenshots, ...fileArray]);
    }
  };

  // Validáció
  const validateStep = (step) => {
    const stepErrors = {};
    const required = requiredFields[step] || [];

    required.forEach(field => {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        stepErrors[field] = 'Ez a mező kötelező';
      }
    });

    // Speciális validációk
    if (step === 1) {
      if (formData.price && isNaN(parseFloat(formData.price))) {
        stepErrors.price = 'Érvényes árat adjon meg';
      }
      if (formData.salePrice && isNaN(parseFloat(formData.salePrice))) {
        stepErrors.salePrice = 'Érvényes akciós árat adjon meg';
      }
    }

    if (step === 3) {
      // Rendszerkövetelmények validációja
      const reqFields = ['minOS', 'minProcessor', 'minMemory', 'minGraphics', 'minStorage'];
      reqFields.forEach(field => {
        if (!formData[field]) {
          stepErrors[field] = 'Minimum követelmény megadása kötelező';
        }
      });
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Lépés navigáció
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Vázlat mentése
  const saveDraft = async () => {
    try {
      setAutoSaveStatus('Mentés...');
      // API hívás a vázlat mentéséhez
      console.log('Vázlat mentése:', formData);
      setAutoSaveStatus('Elmentve');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } catch (error) {
      setAutoSaveStatus('Hiba');
      console.error('Vázlat mentési hiba:', error);
    }
  };

  // Játék feltöltése
  const handleSubmit = async (status = 'pending') => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Adatok előkészítése
      const submissionData = {
        ...formData,
        status,
        uploaded_by: user.idfelhasznalo,
        price: parseFloat(formData.price) || 0,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null
      };

      // API hívás szimuláció
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('Játék feltöltve:', submissionData);
      
      if (onGameUploaded) {
        onGameUploaded(submissionData);
      }

      navigate('/gamedev-upload?success=true');
    } catch (error) {
      console.error('Feltöltési hiba:', error);
      setErrors({ submit: 'Hiba történt a feltöltés során' });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Form renderelés lépésenként
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>📝 Alapinformációk</h3>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Játék címe *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Add meg a játék címét"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-group full-width">
                <label>Slug (URL barátságos név)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="jatek-cime"
                  className={errors.slug ? 'error' : ''}
                />
                {errors.slug && <span className="error-message">{errors.slug}</span>}
              </div>

              <div className="form-group full-width">
                <label>Rövid leírás *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Rövid leírás a játékról (max. 255 karakter)"
                  maxLength="255"
                  rows="3"
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="form-group full-width">
                <label>Részletes leírás</label>
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                  placeholder="Részletes leírás a játékról..."
                  rows="6"
                />
              </div>

              <div className="form-group">
                <label>Fejlesztő *</label>
                <input
                  type="text"
                  value={formData.developer}
                  onChange={(e) => handleInputChange('developer', e.target.value)}
                  placeholder="Fejlesztő neve"
                  className={errors.developer ? 'error' : ''}
                />
                {errors.developer && <span className="error-message">{errors.developer}</span>}
              </div>

              <div className="form-group">
                <label>Kiadó *</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                  placeholder="Kiadó neve"
                  className={errors.publisher ? 'error' : ''}
                />
                {errors.publisher && <span className="error-message">{errors.publisher}</span>}
              </div>

              <div className="form-group">
                <label>Ár (Ft) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={errors.price ? 'error' : ''}
                />
                {errors.price && <span className="error-message">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label>Akciós ár (Ft)</label>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', e.target.value)}
                  placeholder="Opcionális"
                  min="0"
                  step="0.01"
                  className={errors.salePrice ? 'error' : ''}
                />
                {errors.salePrice && <span className="error-message">{errors.salePrice}</span>}
              </div>

              <div className="form-group">
                <label>Megjelenés dátuma *</label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                  className={errors.releaseDate ? 'error' : ''}
                />
                {errors.releaseDate && <span className="error-message">{errors.releaseDate}</span>}
              </div>

              <div className="form-group">
                <label>Megjelenés állapota</label>
                <select
                  value={formData.releaseStatus}
                  onChange={(e) => handleInputChange('releaseStatus', e.target.value)}
                >
                  <option value="announced">Bejelentve</option>
                  <option value="early_access">Early Access</option>
                  <option value="released">Megjelent</option>
                  <option value="delisted">Kivezetve</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>🖼️ Média és platformok</h3>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Fő kép *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('mainImage', e.target.files)}
                    className={errors.mainImage ? 'error' : ''}
                  />
                  <div className="file-upload-label">
                    {formData.mainImage ? formData.mainImage.name : 'Kép kiválasztása'}
                  </div>
                </div>
                {errors.mainImage && <span className="error-message">{errors.mainImage}</span>}
              </div>

              <div className="form-group full-width">
                <label>Képernyőképek</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload('screenshots', e.target.files)}
                  />
                  <div className="file-upload-label">
                    Képek kiválasztása ({formData.screenshots.length} db)
                  </div>
                </div>
                {formData.screenshots.length > 0 && (
                  <div className="uploaded-files">
                    {formData.screenshots.map((file, index) => (
                      <div key={index} className="uploaded-file">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group full-width">
                <label>Trailer URL</label>
                <input
                  type="url"
                  value={formData.trailer}
                  onChange={(e) => handleInputChange('trailer', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="form-group full-width">
                <label>Platformok *</label>
                <div className="checkbox-group">
                  {['Windows', 'macOS', 'Linux', 'Steam Deck'].map(platform => (
                    <label key={platform} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('platforms', [...formData.platforms, platform]);
                          } else {
                            handleInputChange('platforms', formData.platforms.filter(p => p !== platform));
                          }
                        }}
                      />
                      <span>{platform}</span>
                    </label>
                  ))}
                </div>
                {errors.platforms && <span className="error-message">{errors.platforms}</span>}
              </div>

              <div className="form-group full-width">
                <label>Kategóriák *</label>
                <div className="checkbox-group">
                  {['Akció', 'Kaland', 'RPG', 'Stratégia', 'Sport', 'Verseny', 'Szimuláció', 'Logikai', 'FPS', 'TPS'].map(category => (
                    <label key={category} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('categories', [...formData.categories, category]);
                          } else {
                            handleInputChange('categories', formData.categories.filter(c => c !== category));
                          }
                        }}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
                {errors.categories && <span className="error-message">{errors.categories}</span>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>⚙️ Rendszerkövetelmények</h3>
            
            <div className="requirements-section">
              <h4>Minimum követelmények *</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Operációs rendszer *</label>
                  <input
                    type="text"
                    value={formData.minOS}
                    onChange={(e) => handleInputChange('minOS', e.target.value)}
                    placeholder="Windows 10 64-bit"
                    className={errors.minOS ? 'error' : ''}
                  />
                  {errors.minOS && <span className="error-message">{errors.minOS}</span>}
                </div>

                <div className="form-group">
                  <label>Processzor *</label>
                  <input
                    type="text"
                    value={formData.minProcessor}
                    onChange={(e) => handleInputChange('minProcessor', e.target.value)}
                    placeholder="Intel Core i3-6100"
                    className={errors.minProcessor ? 'error' : ''}
                  />
                  {errors.minProcessor && <span className="error-message">{errors.minProcessor}</span>}
                </div>

                <div className="form-group">
                  <label>Memória *</label>
                  <input
                    type="text"
                    value={formData.minMemory}
                    onChange={(e) => handleInputChange('minMemory', e.target.value)}
                    placeholder="8 GB RAM"
                    className={errors.minMemory ? 'error' : ''}
                  />
                  {errors.minMemory && <span className="error-message">{errors.minMemory}</span>}
                </div>

                <div className="form-group">
                  <label>Videokártya *</label>
                  <input
                    type="text"
                    value={formData.minGraphics}
                    onChange={(e) => handleInputChange('minGraphics', e.target.value)}
                    placeholder="NVIDIA GeForce GTX 970"
                    className={errors.minGraphics ? 'error' : ''}
                  />
                  {errors.minGraphics && <span className="error-message">{errors.minGraphics}</span>}
                </div>

                <div className="form-group">
                  <label>DirectX</label>
                  <input
                    type="text"
                    value={formData.minDirectX}
                    onChange={(e) => handleInputChange('minDirectX', e.target.value)}
                    placeholder="Version 11"
                  />
                </div>

                <div className="form-group">
                  <label>Tárhely *</label>
                  <input
                    type="text"
                    value={formData.minStorage}
                    onChange={(e) => handleInputChange('minStorage', e.target.value)}
                    placeholder="20 GB szabad hely"
                    className={errors.minStorage ? 'error' : ''}
                  />
                  {errors.minStorage && <span className="error-message">{errors.minStorage}</span>}
                </div>
              </div>
            </div>

            <div className="requirements-section">
              <h4>Ajánlott követelmények</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Operációs rendszer</label>
                  <input
                    type="text"
                    value={formData.recOS}
                    onChange={(e) => handleInputChange('recOS', e.target.value)}
                    placeholder="Windows 11 64-bit"
                  />
                </div>

                <div className="form-group">
                  <label>Processzor</label>
                  <input
                    type="text"
                    value={formData.recProcessor}
                    onChange={(e) => handleInputChange('recProcessor', e.target.value)}
                    placeholder="Intel Core i5-9400"
                  />
                </div>

                <div className="form-group">
                  <label>Memória</label>
                  <input
                    type="text"
                    value={formData.recMemory}
                    onChange={(e) => handleInputChange('recMemory', e.target.value)}
                    placeholder="16 GB RAM"
                  />
                </div>

                <div className="form-group">
                  <label>Videokártya</label>
                  <input
                    type="text"
                    value={formData.recGraphics}
                    onChange={(e) => handleInputChange('recGraphics', e.target.value)}
                    placeholder="NVIDIA GeForce RTX 2060"
                  />
                </div>

                <div className="form-group">
                  <label>DirectX</label>
                  <input
                    type="text"
                    value={formData.recDirectX}
                    onChange={(e) => handleInputChange('recDirectX', e.target.value)}
                    placeholder="Version 12"
                  />
                </div>

                <div className="form-group">
                  <label>Tárhely</label>
                  <input
                    type="text"
                    value={formData.recStorage}
                    onChange={(e) => handleInputChange('recStorage', e.target.value)}
                    placeholder="30 GB szabad hely"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>🔗 Linkek és funkciók</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Steam link</label>
                <input
                  type="url"
                  value={formData.steamLink}
                  onChange={(e) => handleInputChange('steamLink', e.target.value)}
                  placeholder="https://store.steampowered.com/app/..."
                />
              </div>

              <div className="form-group">
                <label>Epic Games link</label>
                <input
                  type="url"
                  value={formData.epicGamesLink}
                  onChange={(e) => handleInputChange('epicGamesLink', e.target.value)}
                  placeholder="https://store.epicgames.com/..."
                />
              </div>

              <div className="form-group">
                <label>GOG link</label>
                <input
                  type="url"
                  value={formData.gogLink}
                  onChange={(e) => handleInputChange('gogLink', e.target.value)}
                  placeholder="https://www.gog.com/..."
                />
              </div>

              <div className="form-group">
                <label>Hivatalos weboldal</label>
                <input
                  type="url"
                  value={formData.officialWebsite}
                  onChange={(e) => handleInputChange('officialWebsite', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="form-group">
                <label>Discord meghívó</label>
                <input
                  type="url"
                  value={formData.discordInvite}
                  onChange={(e) => handleInputChange('discordInvite', e.target.value)}
                  placeholder="https://discord.gg/..."
                />
              </div>

              <div className="form-group">
                <label>Támogatási email</label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>

              <div className="form-group full-width">
                <label>Játék funkciók</label>
                <div className="checkbox-group">
                  {Object.entries({
                    multiplayer: 'Többjátékos',
                    co_op: 'Kooperatív',
                    online_multiplayer: 'Online multiplayer',
                    lan_support: 'LAN támogatás',
                    controller_support: 'Controller támogatás',
                    vr_support: 'VR támogatás',
                    achievements: 'Achievements',
                    cloud_save: 'Felhő mentés',
                    workshop_support: 'Workshop támogatás',
                    mod_support: 'Mod támogatás',
                    trading_cards: 'Trading cards'
                  }).map(([key, label]) => (
                    <label key={key} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.features[key]}
                        onChange={(e) => handleInputChange('features', {
                          ...formData.features,
                          [key]: e.target.checked
                        })}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3>👀 Előnézet és jóváhagyás</h3>
            
            <div className="preview-section">
              <h4>Játék előnézet</h4>
              <div className="game-preview-card">
                <div className="preview-header">
                  <h3>{formData.title || 'Játék címe'}</h3>
                  <span className="preview-status">{formData.status}</span>
                </div>
                
                <div className="preview-content">
                  <p><strong>Fejlesztő:</strong> {formData.developer || 'Nincs megadva'}</p>
                  <p><strong>Kiadó:</strong> {formData.publisher || 'Nincs megadva'}</p>
                  <p><strong>Ár:</strong> {formData.price ? `${formData.price} Ft` : 'Nincs megadva'}</p>
                  <p><strong>Megjelenés:</strong> {formData.releaseDate || 'Nincs megadva'}</p>
                  <p><strong>Platformok:</strong> {formData.platforms.join(', ') || 'Nincs megadva'}</p>
                  <p><strong>Kategóriák:</strong> {formData.categories.join(', ') || 'Nincs megadva'}</p>
                  <p><strong>Leírás:</strong> {formData.description || 'Nincs megadva'}</p>
                </div>
              </div>

              <div className="final-checklist">
                <h4>Ellenőrzőlista</h4>
                <div className="checklist-items">
                  <div className={`checklist-item ${formData.title ? 'checked' : 'unchecked'}`}>
                    ✓ Játék címe megadva
                  </div>
                  <div className={`checklist-item ${formData.description ? 'checked' : 'unchecked'}`}>
                    ✓ Leírás megadva
                  </div>
                  <div className={`checklist-item ${formData.developer ? 'checked' : 'unchecked'}`}>
                    ✓ Fejlesztő megadva
                  </div>
                  <div className={`checklist-item ${formData.categories.length > 0 ? 'checked' : 'unchecked'}`}>
                    ✓ Kategóriák kiválasztva
                  </div>
                  <div className={`checklist-item ${formData.platforms.length > 0 ? 'checked' : 'unchecked'}`}>
                    ✓ Platformok kiválasztva
                  </div>
                  <div className={`checklist-item ${formData.mainImage ? 'checked' : 'unchecked'}`}>
                    ✓ Főkép feltöltve
                  </div>
                  <div className={`checklist-item ${formData.minOS ? 'checked' : 'unchecked'}`}>
                    ✓ Rendszerkövetelmények megadva
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="professional-game-upload">
      <div className="upload-header">
        <h1>🎮 Játék Feltöltése</h1>
        <p>Töltsd fel a játékodat a platformra</p>
        
        {/* Auto-save státusz */}
        {autoSaveStatus && (
          <div className={`auto-save-status ${autoSaveStatus === 'Elmentve' ? 'success' : autoSaveStatus === 'Hiba' ? 'error' : 'saving'}`}>
            {autoSaveStatus}
          </div>
        )}
      </div>

      {/* Lépésjelző */}
      <div className="step-indicator">
        <div className="steps">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i + 1}
              className={`step ${currentStep === i + 1 ? 'active' : currentStep > i + 1 ? 'completed' : ''}`}
              onClick={() => i + 1 < currentStep && setCurrentStep(i + 1)}
            >
              <div className="step-number">{i + 1}</div>
              <div className="step-label">
                {i === 0 && 'Alapinfók'}
                {i === 1 && 'Média'}
                {i === 2 && 'Követelmények'}
                {i === 3 && 'Linkek'}
                {i === 4 && 'Előnézet'}
              </div>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form tartalom */}
      <div className="upload-content">
        {renderStepContent()}
      </div>

      {/* Feltöltési folyamat */}
      {isSubmitting && (
        <div className="upload-progress">
          <div className="progress-modal">
            <h3>Játék feltöltése...</h3>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>{uploadProgress}%</p>
          </div>
        </div>
      )}

      {/* Navigációs gombok */}
      <div className="upload-navigation">
        <div className="nav-left">
          {currentStep > 1 && (
            <button 
              className="btn-secondary"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              ← Vissza
            </button>
          )}
        </div>

        <div className="nav-center">
          <button 
            className="btn-outline"
            onClick={saveDraft}
            disabled={isSubmitting}
          >
            💾 Vázlat mentése
          </button>
        </div>

        <div className="nav-right">
          {currentStep < totalSteps ? (
            <button 
              className="btn-primary"
              onClick={nextStep}
              disabled={isSubmitting}
            >
              Következő →
            </button>
          ) : (
            <>
              <button 
                className="btn-outline"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
              >
                Vázlat mentése
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleSubmit('pending')}
                disabled={isSubmitting}
              >
                Jóváhagyásra küldés
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hibák megjelenítése */}
      {errors.submit && (
        <div className="error-banner">
          {errors.submit}
        </div>
      )}
    </div>
  );
};

export default ProfessionalGameUpload;
