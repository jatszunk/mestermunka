import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

  function Register() {
    const navigate = useNavigate();
    const [uname, setUname] = useState("");
    const [pass, setPass] = useState("");
    const [mail, setMail] = useState("");
    return (
      <div className="maincenter">
        <h2>Regisztráció</h2>
        <form className="login-form"
          onSubmit={e => {
            e.preventDefault();
            handleRegister(uname, mail, pass, () => navigate('/'));
          }}>
          <input type="text" placeholder="Felhasználónév" value={uname} onChange={e => setUname(e.target.value)} required className="login-input" />
          <input type="email" placeholder="Email" value={mail} onChange={e => setMail(e.target.value)} required className="login-input" />
          <input type="password" placeholder="Jelszó" value={pass} onChange={e => setPass(e.target.value)} required className="login-input" />
          <button type="submit" className="login-btn">Regisztráció</button>
        </form>
        <button className="vissza-btn" style={{ marginTop: 20 }} onClick={() => navigate('/')}>⬅ Vissza</button>
      </div>
    );
  }
  export default Register;