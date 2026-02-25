import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      setError('Érvénytelen visszaállítási link!');
      return;
    }
    
    setToken(urlToken);
    
    // Token validálása
    axios.post('http://localhost:3001/validate-reset-token', { token: urlToken })
      .then(response => {
        if (response.data.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(response.data.message || 'Érvénytelen vagy lejárt token!');
        }
      })
      .catch(err => {
        setTokenValid(false);
        setError('Token ellenőrzési hiba történt');
      });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('A jelszavak nem egyeznek!');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/reset-password', {
        token,
        newPassword
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        // 3 másodperc után visszairányítjuk a bejelentkezési oldalra
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Hiba történt a jelszó visszaállítása során');
      }
    } catch (err) {
      console.error('Jelszó visszaállítási hiba:', err);
      setError(err.response?.data?.message || 'Hiba történt a jelszó visszaállítása közben');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="maincenter">
        <h2>Token ellenőrzése...</h2>
        <div className="loading">Kérjük, várjon...</div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="maincenter">
        <h2>Hiba</h2>
        <div className="error-message" style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
        <button 
          className="vissza-btn" 
          onClick={() => navigate('/forgot-password')}
        >
          ⬅ Új jelszó kérése
        </button>
      </div>
    );
  }

  return (
    <div className="maincenter">
      <h2>Jelszó visszaállítása</h2>
      <p>Adja meg az új jelszavát!</p>

      {message && (
        <div className="success-message" style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          {message}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Új jelszó"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          className="login-input"
          disabled={loading}
          minLength="6"
        />

        <input
          type="password"
          placeholder="Új jelszó megerősítése"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          className="login-input"
          disabled={loading}
          minLength="6"
        />

        <button 
          type="submit" 
          className="login-btn" 
          disabled={loading}
        >
          {loading ? "Feldolgozás..." : "Jelszó megváltoztatása"}
        </button>
      </form>

      <button 
        className="vissza-btn" 
        style={{ marginTop: 20 }} 
        onClick={() => navigate('/login')}
        disabled={loading}
      >
        ⬅ Vissza a bejelentkezéshez
      </button>
    </div>
  );
}

export default ResetPassword;
