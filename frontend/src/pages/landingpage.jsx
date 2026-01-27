// LandingPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "./LandingPage.css";

export default function LandingPage() {
  const [showLegal, setShowLegal] = useState(false);

  return (
    <div className="landing-root">
      <div className="landing-wrapper">
        <div className="landing-container">
          <h1>Üdvözöllek a Játéklistán 🎮</h1>
          <p>Kérlek, jelentkezz be vagy regisztrálj a folytatáshoz!</p>

          <div className="landing-buttons">
            <Link to="/login">
              <button>Bejelentkezés</button>
            </Link>
            <Link to="/register">
              <button>Regisztráció</button>
            </Link>
          </div>

          <button
            className="legal-toggle"
            onClick={() => setShowLegal(!showLegal)}
          >
            {showLegal
              ? "Jogi információk elrejtése"
              : "Felhasználási feltételek és adatvédelem"}
          </button>

          {showLegal && (
            <div className="legal-box">
              <h2 className="legal-title">Felhasználási feltételek</h2>
              <p className="legal-text">
                A szolgáltatás használatával a felhasználó elfogadja, hogy a
                platform kizárólag személyes, nem kereskedelmi célokra
                használható.
              </p>

              <h2 className="legal-title">Adatvédelmi tájékoztató</h2>
              <p className="legal-text">
                A regisztráció során megadott adatokat kizárólag a szolgáltatás
                működéséhez szükséges mértékben kezeljük. Harmadik félnek nem
                adjuk át.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
