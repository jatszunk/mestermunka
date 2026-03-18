import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user }) => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="GameVerse" className="logo" />
        </Link>
        
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Főoldal</Link>
          <Link to="/statistics" className="nav-link">Statisztikák</Link>
          <Link to="/faq" className="nav-link">GYIK</Link>
          <Link to="/nevjegy" className="nav-link">Névjegy</Link>
          {user ? (
            <>
              <Link to="/profile" className="nav-link">Profil</Link>
              {user.role === 'admin' && (
                <Link to="/admin-panel" className="nav-link">Admin Panel</Link>
              )}
              {user.role === 'gamedev' && (
                <>
                  <Link to="/gamedev-panel" className="nav-link">GameDev Panel</Link>
                  <Link to="/gamedev-upload" className="nav-link">Játék Feltöltés</Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Bejelentkezés</Link>
              <Link to="/register" className="nav-link">Regisztráció</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
