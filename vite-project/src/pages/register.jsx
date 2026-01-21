import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import '../App.css'; // opcionális, ha kell
 
function RegisterPage({ handleRegister }) {
  const navigate = useNavigate();
 
  const [uname, setUname] = useState("");
  const [pass, setPass] = useState("");
  const [mail, setMail] = useState("");
 
  return (
    <div className="maincenter">
      <h2>Regisztráció</h2>
 
      <form
        className="login-form"
        onSubmit={e => {
          e.preventDefault();
          handleRegister(uname, mail, pass, () => navigate('/'));
        }}
      >
        <input
          type="text"
          placeholder="Felhasználónév"
          value={uname}
          onChange={e => setUname(e.target.value)}
          required
          className="login-input"
        />
 
        <input
          type="email"
          placeholder="Email"
          value={mail}
          onChange={e => setMail(e.target.value)}
          required
          className="login-input"
        />
 
        <input
          type="password"
          placeholder="Jelszó"
          value={pass}
          onChange={e => setPass(e.target.value)}
          required
          className="login-input"
        />
 
        <button className="login-btn" type="submit">Regisztráció</button>
      </form>
 
      <button className="vissza-btn" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
        ⬅ Vissza
      </button>
    </div>
  );
}
 
export default RegisterPage;