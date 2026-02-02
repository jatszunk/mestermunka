
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function NevjegyPage({ user }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('📤 Küldés...');

    try {
      const response = await fetch("http://localhost:3001/api/send-email", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: formData.email,
          name: formData.name,
          message: formData.message,
          subject: `GameVerse: ${formData.name}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('✅ Elküldve a fejlesztőknek!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('❌ ' + (data.message || 'Ismeretlen hiba'));
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Backend nem elérhető!');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="maincenter">
      {/* Navbar */}
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/statistics" className="nav-link">Statisztikák</Link>
        <Link to="/profile" className="nav-link">{user ? "Profil" : "Bejelentkezés"}</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">Admin Panel</Link>
        )}
        {(user?.role === 'gamedev' || user?.role === 'admin') && (
          <Link to="/gamedev-panel" className="nav-link">GameDev Panel</Link>
        )}
        {(user?.role === 'gamedev' || user?.role === 'admin') && (
          <Link to="/gamedev-upload" className="nav-link">Játék Feltöltés</Link>
        )}
      </nav>

      <h2>Névjegy</h2>

      {/* Felső információs doboz */}
      <section className="nevjegy-card" aria-labelledby="app-name">
        <h3 id="app-name" style={{ marginTop: 0 }}>
          <b>GameVerse</b>
        </h3>

        <p>
          A GameVerse egy vizsgához készült projektmunka, amely egy neon témájú gamer
          mintaprojektet valósít meg. Elsősorban videojátékok böngészésére,
          keresésére és értékelésére szolgál.
        </p>

        <div className="nvj-grid">
          <div className="nvj-block">
            <h4>👥 Készítők &amp; kapcsolat</h4>
            <ul>
              <li>Kiss Csaba</li>
              <li>Kormos Levente</li>
            </ul>

            <p>
              <strong>E-mail:</strong>{' '}
              <a href="mailto:gameverseprojekt@gmail.hu">
                gameverseprojekt@gmail.hu
              </a>
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 21,
            flexWrap: 'wrap'
          }}
        >
          <button className="vissza-btn" onClick={() => navigate('/')}>
            ⬅ Vissza
          </button>
        </div>
      </section>

      {/* Kapcsolatfelvételi űrlap */}
      <section className="contact-section">
        <h3
          style={{
            color: '#19ffe3',
            textShadow: '0 0 18px #1ef7ff, 0 0 32px #ff41fa',
            fontFamily: "'Orbitron', sans-serif",
            textAlign: 'center',
            marginBottom: '1rem'
          }}
        >
          📧 Írj nekünk!
        </h3>

        <p
          style={{
            color: '#fff',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}
        >
          Üzeneted azonnal elküldődik a gameverseprojekt@gmail.hu címre.
        </p>

        <form onSubmit={handleSubmit} className="contact-form">
          {/* Név */}
          <div className="form-group">
            <label
              htmlFor="name"
              style={{ color: '#27e8ff', fontWeight: 'bold' }}
            >
              Neved:
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="neon-input"
              placeholder="Pl. Valami Valaki"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label
              htmlFor="email"
              style={{ color: '#27e8ff', fontWeight: 'bold' }}
            >
              E-mail címed:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="neon-input"
              placeholder="te@email.hu"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Üzenet */}
          <div className="form-group">
            <label
              htmlFor="message"
              style={{ color: '#27e8ff', fontWeight: 'bold' }}
            >
              Üzeneted:
            </label>
            <textarea
              id="message"
              name="message"
              rows="5"
              className="neon-textarea"
              placeholder="Írd ide üzenetedet..."
              value={formData.message}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Küldés gomb */}
          <button
            type="submit"
            className="neon-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '📤 Küldés...' : '🚀 Azonnali küldés'}
          </button>

          {/* Státusz üzenet */}
          {status && (
            <p
              className="status-message"
              style={{
                background: status.includes('✅')
                  ? 'rgba(39,232,255,0.2)'
                  : 'rgba(255,65,250,0.2)',
                color: status.includes('✅') ? '#19ffe3' : '#ff41fa',
                border: `2px solid ${
                  status.includes('✅') ? '#27e8ff' : '#ff41fa'
                }`,
                textShadow: '0 0 8px currentColor',
                padding: '1rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: '1rem'
              }}
            >
              {status}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

export default NevjegyPage;
