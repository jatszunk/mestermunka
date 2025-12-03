import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

  function Login() {
    const navigate = useNavigate();
    const [uname, setUname] = useState("");
    const [pass, setPass] = useState("");
    return (
      <div className="maincenter">
        <h2>Bejelentkezés</h2>
        <form className="login-form"
          onSubmit={e => {
            e.preventDefault();
            handleLogin(uname, pass, () => navigate('/'));
          }}>
          <input type="text" placeholder="Felhasználónév" value={uname} onChange={e => setUname(e.target.value)} required className="login-input" />
          <input type="password" placeholder="Jelszó" value={pass} onChange={e => setPass(e.target.value)} required className="login-input" />
          <button type="submit" className="login-btn">Belépés</button>
        </form>
        <button className="vissza-btn" style={{ marginTop: 20 }} onClick={() => navigate('/')}>⬅ Vissza</button>
      </div>
    );
  }
  function handleLogin(uname, pass, cb) {
    const found = users.find(u => u.username === uname && u.password === pass);
    if (!found) return alert("Hibás felhasználó vagy jelszó!");
    setUser(found);
    cb && cb();
  }
    export default Login;