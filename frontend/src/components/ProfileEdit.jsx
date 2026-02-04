import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileEdit = ({ user, onProfileUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    bio: '',
    avatar: '',
    favoriteGenres: [],
    preferredPlatforms: [],
    country: '',
    birthYear: '',
    discord: '',
    twitter: '',
    youtube: '',
    twitch: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        favoriteGenres: user.favoriteGenres || [],
        preferredPlatforms: user.preferredPlatforms || [],
        country: user.country || '',
        birthYear: user.birthYear || '',
        discord: user.discord || '',
        twitter: user.twitter || '',
        youtube: user.youtube || '',
        twitch: user.twitch || ''
      });
    }
  }, [user]);

  const genres = [
    'Akció', 'Kaland', 'RPG', 'Stratégia', 'Sport', 'Verseny',
    'Horrort', 'Puzzle', 'Platformer', 'Shooter', 'MMO', 'Szimulátor',
    'Indie', 'Co-op', 'Battle Royale', 'MOBA', 'Taktikai', 'Barkochba'
  ];

  const platforms = [
    'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One',
    'Nintendo Switch', 'Mobil', 'VR', 'Steam', 'Epic Games', 'GOG'
  ];

  const countries = [
    'Magyarország', 'Ausztria', 'Németország', 'Szlovákia', 'Románia',
    'Egyesült Királyság', 'Egyesült Államok', 'Kanada', 'Franciaország', 'Olaszország',
    'Spanyolország', 'Lengyelország', 'Csehország', 'Horvátország', 'Szerbia'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      preferredPlatforms: prev.preferredPlatforms.includes(platform)
        ? prev.preferredPlatforms.filter(p => p !== platform)
        : [...prev.preferredPlatforms, platform]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Ellenőrizzük, hogy a formData és user létezik-e
      if (!formData || !user || !user.username) {
        setMessage('Hiányzó adatok vagy felhasználó!');
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      console.log('Profil mentés adatok:', formData);
      
      // A szerver kommunikációt az App.jsx handleProfileEdit függvénye végzi
      const result = await onProfileUpdate(formData);
      
      console.log('Profil mentés eredmény:', result);
      
      if (result && result.success) {
        setMessage('Profil sikeresen frissítve!');
        setMessageType('success');
        
        setTimeout(() => {
          onCancel();
        }, 2000);
      } else {
        console.error('Profil mentés hiba:', result);
        setMessage(result?.message || 'Hiba történt a frissítés során');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Profil frissítési hiba:', error);
      setMessage('Hiba történt a frissítés során');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <h2>📝 Profil Szerkesztése</h2>
        <button onClick={onCancel} className="close-btn">✖️</button>
      </div>

      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-edit-form">
        {/* Alap információk */}
        <div className="form-section">
          <h3>🔧 Alap Információk</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Teljes Név</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Add meg a teljes neved"
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Felhasználónév</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Egyedi felhasználónév"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Cím</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@pelda.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="avatar">Avatar URL</label>
              <input
                type="url"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="https://pelda.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bemutatkozás</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Mesélj magadról pár mondatban..."
              rows="4"
            />
          </div>
        </div>

        {/* Személyes adatok */}
        <div className="form-section">
          <h3>👤 Személyes Adatok</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Ország</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Válassz országot</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="birthYear">Születési Év</label>
              <select
                id="birthYear"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
              >
                <option value="">Válassz évet</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Játék preferenciák */}
        <div className="form-section">
          <h3>🎮 Játék Preferenciák</h3>
          <div className="form-group">
            <label>Kedvenc Műfajok</label>
            <div className="genre-select">
              {genres.map(genre => (
                <button
                  key={genre}
                  type="button"
                  className={`genre-checkbox ${formData.favoriteGenres.includes(genre) ? 'selected' : ''}`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Preferált Platformok</label>
            <div className="platform-select">
              {platforms.map(platform => (
                <button
                  key={platform}
                  type="button"
                  className={`platform-checkbox ${formData.preferredPlatforms.includes(platform) ? 'selected' : ''}`}
                  onClick={() => handlePlatformToggle(platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Közösségi média */}
        <div className="form-section">
          <h3>🌐 Közösségi Média</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="discord">Discord</label>
              <input
                type="text"
                id="discord"
                name="discord"
                value={formData.discord}
                onChange={handleChange}
                placeholder="Felhasználónév#1234"
              />
            </div>
            <div className="form-group">
              <label htmlFor="twitter">Twitter/X</label>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@felhasznalo"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="youtube">YouTube</label>
              <input
                type="text"
                id="youtube"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="Csatorna neve"
              />
            </div>
            <div className="form-group">
              <label htmlFor="twitch">Twitch</label>
              <input
                type="text"
                id="twitch"
                name="twitch"
                value={formData.twitch}
                onChange={handleChange}
                placeholder="Felhasználónév"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Mégse
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Mentés...' : 'Profil Mentése'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
