import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post('http://localhost:3001/forgot-password', { email });
      
      if (response.data.success) {
        setMessage(response.data.message);
        // 5 másodperc után visszairányítjuk a bejelentkezési oldalra
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        setError(response.data.message || 'Hiba történt a kérés feldolgozása során');
      }
    } catch (err) {
      console.error('Elfelejtett jelszó hiba:', err);
      setError(err.response?.data?.message || 'Hiba történt a kérés küldése közben');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="maincenter">
      <h2>Elfelejtett jelszó</h2>
      <p>Adja meg az e-mail címét, és küldünk egy linket a jelszó megváltoztatásához.</p>

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
          type="email"
          placeholder="E-mail cím"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="login-input"
          disabled={loading}
        />

        <button 
          type="submit" 
          className="login-btn" 
          disabled={loading}
        >
          {loading ? "Küldés..." : "Jelszó visszaállítási link küldése"}
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

export default ForgotPassword;
