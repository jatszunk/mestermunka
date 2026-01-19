import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

  function Nevjegy() {
    const navigate = useNavigate();
    return (
      <div className="maincenter" style={{ overflowX: "hidden" }}>
        <h2>Névjegy</h2>
        <div className="nevjegy-card">
          <p><b>Game Verse Projekt</b></p>
          <p>Készítette: Kiss Csaba, Kormos Levente 
          </p>
          <p>Game Verse Válassz játékot és böngéssz kategóriák szerint!</p>
          <p>Kapcsolat: <a style={{ color: "#ff41fa" }} href="mailto:gameverseprojekt@gmail.com">valaki@gmail.com</a></p>
          <p>Verzió: Nincs</p>
          <button className="vissza-btn" style={{ marginTop: "21px" }} onClick={() => navigate('/')}>⬅ Vissza</button>
        </div>
      </div>
    );
  }
    export default Nevjegy;