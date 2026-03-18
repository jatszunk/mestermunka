import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function FAQPage({ user }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [showGameDevModal, setShowGameDevModal] = useState(false);
  const [gameDevForm, setGameDevForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmittingGameDev, setIsSubmittingGameDev] = useState(false);
  const [gameDevStatus, setGameDevStatus] = useState('');

  const faqData = [
    {
      icon: '🎮',
      question: 'Mi az a GameVerse?',
      answer: 'A GameVerse egy vizsgához készült projektmunka, amely egy neon témájú gamer platformot valósít meg. Fő célja a videojátékok böngészése, keresése és értékelése egy modern, felhasználóbarát felületen.'
    },
    {
      icon: '🆓',
      question: 'Ingyenes a platform használata?',
      answer: 'Igen, a GameVerse platform teljesen ingyenesen használható viszont a regisztráció kötelező.'
    },
    {
      icon: '📝',
      question: 'Hogyan tudok játékot feltölteni? / Hogy lehetek GameDev?',
      answer: (
        <div>
          <p>Játékfeltöltéshez regisztrálnod kell és GameDev jogosultságot kell kérvényezned. A jogosultság megszerzése után a "Játék feltöltése" menüponton keresztül tudod megosztani a játékaidat, amelyeket aztán az adminisztrátorok jóváhagyása után mindenki láthat.</p>
          <button 
            className="game-dev-request-btn"
            onClick={() => setShowGameDevModal(true)}
          >
            📧 GameDev jogosultság kérvényezése
          </button>
        </div>
      )
    },
    {
      icon: '⭐',
      question: 'Működnek az értékelések?',
      answer: 'Az értékelések 1-10 skálán működnek, ahol 1 a legrosszabb és 10 a legjobb. Csak regisztrált felhasználók tudnak értékelni, és minden játékhoz csak egyszer lehet értékelést adni.'
    },
    {
      icon: '🔧',
      question: 'Hogyan lehet jelezni hibákat?',
      answer: 'Hibabejelentéshez használd a kapcsolati űrlapot a névjegy oldalon, vagy írj közvetlenül a gameverseprojekt@gmail.com e-mail címre. Írd le részletesen a problémát, és mi igyekszünk mihamarabb megoldani!'
    },
    {
      icon: '👥',
      question: 'Kik készítették az oldalt?',
      answer: 'A GameVerse-t Kiss Csaba és Kormos Levente készítette vizsgaprojektként. A célunk egy modern, gamer-közösség számára is vonzó platform létrehozása volt.'
    },
    {
      icon: '🔒',
      question: 'Biztonságos a platform?',
      answer: 'Igen, a platform biztonságos. Az adatok titkosítva vannak, és a regisztráció során megadott információkat nem adjuk ki harmadik félnek.'
    },
    {
      icon: '📱',
      question: 'Mobilról is elérhető?',
      answer: 'Igen, a GameVerse teljesen reszponzív, így mobiltelefonról és tabletről is kényelmesen használható.'
    },
    {
      icon: '🎯',
      question: 'Hogyan kereshetek játékokat?',
      answer: 'A főoldalon található kereső segítségével név szerint, vagy a szűrők segítségével kategória, platform, ár szerint kereshetsz játékokat.'
    },
    {
      icon: '💬',
      question: 'Lehet kommentelni a játékokat?',
      answer: 'Igen, regisztrált felhasználók értékelés mellett kommentet is fűzhetnek a játékokhoz. A kommenteknek tiszteletudatosnak kell lenniük és az adott tartalomra kell fókuszálniuk.'
    }
  ];

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleGameDevInputChange = (e) => {
    setGameDevForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGameDevSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingGameDev(true);
    setGameDevStatus('📤 Küldés...');

    try {
      const response = await fetch("http://localhost:3001/api/send-email", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: gameDevForm.email,
          name: gameDevForm.name,
          message: `GameDev jogosultság kérvényezése:\n\n${gameDevForm.message}\n\nFelhasználó: ${user?.username || 'Nem bejelentkezett'}\nEmail: ${gameDevForm.email}`,
          subject: `GameDev Kérvény: ${gameDevForm.name}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGameDevStatus('✅ Kérvény elküldve! Hamarosan felvesszük veled a kapcsolatot.');
        setGameDevForm({ name: '', email: '', message: '' });
        setTimeout(() => {
          setShowGameDevModal(false);
          setGameDevStatus('');
        }, 3000);
      } else {
        setGameDevStatus('❌ ' + (data.message || 'Ismeretlen hiba'));
      }
    } catch (error) {
      console.error(error);
      setGameDevStatus('❌ Backend nem elérhető!');
    }

    setIsSubmittingGameDev(false);
  };

  // Body scroll letiltása modal nyitáskor
  useEffect(() => {
    if (showGameDevModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
    }

    // Cleanup function - amikor a komponens megszűnik
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
    };
  }, [showGameDevModal]);

  return (
    <div className="maincenter">
      <div className="faq-page">
        {/* Fejléc */}
        <div className="faq-header">
          <h1 className="faq-title">
            ❓ Gyakran Ismételt Kérdések
          </h1>
          <p className="faq-subtitle">
            Itt találod a leggyakoribb kérdéseket és válaszokat a GameVerse platformról
          </p>
        </div>

        {/* GYIK elemek */}
        <div className="faq-container">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            >
              <div 
                className="faq-question"
                onClick={() => toggleQuestion(index)}
              >
                <span className="faq-icon">{item.icon}</span>
                <h3 className="faq-question-text">{item.question}</h3>
                <span className={`faq-toggle ${activeIndex === index ? 'open' : ''}`}>
                  {activeIndex === index ? '−' : '+'}
                </span>
              </div>
              <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigációs gombok */}
        <div className="faq-navigation">
          <button className="neon-button" onClick={() => navigate('/')}>
            🏠 Vissza a főoldalra
          </button>
          <Link to="/nevjegy" className="neon-button">
            📧 Névjegy és kapcsolat
          </Link>
        </div>

        {/* További segítség */}
        <div className="faq-help">
          <h3>🆘 Nem találtad meg, amit kerestél?</h3>
          <p>
            Ha további kérdéseid vannak, keress minket bizalommal a 
            <Link to="/nevjegy"> névjegy oldalon</Link> található kapcsolati űrlapon!
          </p>
        </div>
      </div>

      {/* GameDev Kérvényezési Modal */}
      {showGameDevModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🎮 GameDev Jogosultság Kérvényezése</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowGameDevModal(false);
                  setGameDevStatus('');
                  setGameDevForm({ name: '', email: '', message: '' });
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">
                Kérjük, írd le röviden, miért szeretnél GameDev jogosultságot, és milyen játékokat tervezsz feltölteni a platformra.
              </p>
              
              <form onSubmit={handleGameDevSubmit} className="game-dev-form">
                {/* Név */}
                <div className="form-group">
                  <label htmlFor="name">Neved:</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="neon-input"
                    placeholder="Pl. Kiss Csaba"
                    value={gameDevForm.name}
                    onChange={handleGameDevInputChange}
                    required
                    disabled={isSubmittingGameDev}
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">E-mail címed:</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="neon-input"
                    placeholder="te@email.hu"
                    value={gameDevForm.email}
                    onChange={handleGameDevInputChange}
                    required
                    disabled={isSubmittingGameDev}
                  />
                </div>

                {/* Üzenet */}
                <div className="form-group">
                  <label htmlFor="message">Kérvényezés indoklása:</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    className="neon-textarea"
                    placeholder="Írd le, miért szeretnél GameDev lenni, és milyen játékokat tervezel feltölteni..."
                    value={gameDevForm.message}
                    onChange={handleGameDevInputChange}
                    required
                    disabled={isSubmittingGameDev}
                  ></textarea>
                </div>

                {/* Küldés gomb */}
                <button
                  type="submit"
                  className="neon-submit-btn"
                  disabled={isSubmittingGameDev}
                >
                  {isSubmittingGameDev ? '📤 Küldés...' : '🚀 Kérvény küldése'}
                </button>

                {/* Státusz üzenet */}
                {gameDevStatus && (
                  <p
                    className="status-message"
                    style={{
                      background: gameDevStatus.includes('✅')
                        ? 'rgba(39,232,255,0.2)'
                        : 'rgba(255,65,250,0.2)',
                      color: gameDevStatus.includes('✅') ? '#19ffe3' : '#ff41fa',
                      border: `2px solid ${
                        gameDevStatus.includes('✅') ? '#27e8ff' : '#ff41fa'
                      }`,
                      textShadow: '0 0 8px currentColor',
                      padding: '1rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      marginTop: '1rem'
                    }}
                  >
                    {gameDevStatus}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FAQPage;
