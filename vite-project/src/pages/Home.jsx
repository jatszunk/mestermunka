
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SteamGameCard from '../components/SteamGameCard.jsx';
import AdvancedSearch from '../components/AdvancedSearch.jsx';
import GameComparison from '../components/GameComparison.jsx';

function Home({ user, games, comments, handleAddComment, handleDeleteComment }) {
  const [filteredGames, setFilteredGames] = useState(games);
  const [showComparison, setShowComparison] = useState(false);

  const handleFilterChange = (filtered) => {
    setFilteredGames(filtered);
  };

  return (
    <div className="maincenter">
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/statistics" className="nav-link">Statisztikák</Link>
        <Link to="/system-requirements" className="nav-link">Rendszerkövetelmények</Link>
        <Link to="/profile" className="nav-link">{user ? "Profil" : "Bejelentkezés"}</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">Admin Panel</Link>
        )}
        {(user?.role === 'gamedev' || user?.role === 'admin') && (
          <Link to="/gamedev-upload" className="nav-link">Játék Feltöltés</Link>
        )}
      </nav>

      <h1>Játéklista</h1>

      <div className="action-bar">
        <AdvancedSearch 
          games={games} 
          onFilterChange={handleFilterChange}
        />
        <button 
          className="comparison-toggle-btn"
          onClick={() => setShowComparison(true)}
        >
          🔄 Játékok Összehasonlítása
        </button>
      </div>

      <div className="steam-games-grid">
        {filteredGames.map(game => (
          <SteamGameCard
            key={game.id || game.idjatekok}
            game={game}
            onAddToWishlist={(game) => console.log('Added to wishlist:', game)}
            onQuickView={(game) => console.log('Quick view:', game)}
          />
        ))}
      </div>
      
      {filteredGames.length === 0 && (
        <div className="no-results">
          <p>Nem található a keresési feltételeknek megfelelő játék.</p>
        </div>
      )}

      {showComparison && (
        <GameComparison 
          games={games} 
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

export default Home;

