import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

export default function LandingPage() {
    return (
      <div className="landing-container">
        <h1>Üdvözöllek a Játéklistán 🎮</h1>
        <p>Kérlek, jelentkezz be vagy regisztrálj a folytatáshoz!</p>
        <div className="landing-buttons">
          <Link to="/login" className="btn">Bejelentkezés</Link>
          <Link to="/register" className="btn">Regisztráció</Link>
        </div>
      </div>
    );
  }