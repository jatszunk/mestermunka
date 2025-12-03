import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

  function Nevjegy() {
    const navigate = useNavigate();
    return (
      <div className="maincenter" style={{ overflowX: "hidden" }}>
        <h2>Névjegy</h2>
        <div className="nevjegy-card">
          <p><b>Steam Mester Demo</b></p>
          <p>Készítette: Pacek Reactes</p>
          <p>Neon gamer webáruház mintaprojekt. Válassz játékot, böngéssz kategóriák szerint!</p>
          <p>Kapcsolat: <a style={{ color: "#ff41fa" }} href="mailto:valaki@email.hu">valaki@email.hu</a></p>
          <p>Verzió: Nincs</p>
          <button className="vissza-btn" style={{ marginTop: "21px" }} onClick={() => navigate('/')}>⬅ Vissza</button>
        </div>
      </div>
    );
  }
    export default Nevjegy;