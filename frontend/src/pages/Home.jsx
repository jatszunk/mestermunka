
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard.jsx';
import AdvancedSearch from '../components/AdvancedSearch.jsx';
import GameComparison from '../components/GameComparison.jsx';

function Home({ user, games, comments, handleAddComment, handleAddToWishlist, handleAddToCollection }) {
  const [filteredGames, setFilteredGames] = useState(games);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setFilteredGames(games);
  }, [games]);

  const handleFilterChange = (filters) => {
    let filtered = [...games];
    
    // Kategória szűrés
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(game => 
        filters.categories.includes(game.category)
      );
    }
    
    // Platform szűrés
    if (filters.platforms && filters.platforms.length > 0) {
      filtered = filtered.filter(game => 
        filters.platforms.some(platform => 
          game.platform && game.platform.includes(platform)
        )
      );
    }
    
    // Ár szűrés
    if (filters.priceRange) {
      filtered = filtered.filter(game => 
        game.price >= filters.priceRange.min && 
        game.price <= filters.priceRange.max
      );
    }
    
    // Értékelés szűrés
    if (filters.rating) {
      filtered = filtered.filter(game => 
        game.rating >= filters.rating.min && 
        game.rating <= filters.rating.max
      );
    }
    
    // Keresési szűrés
    if (filters.searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        game.developer.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (game.description && game.description.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }
    
    setFilteredGames(filtered);
  };

  const handleSearch = (searchTerm) => {
    handleFilterChange({ searchTerm });
  };

  return (
    <div className="maincenter">
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/statistics" className="nav-link">Statisztikák</Link>
        <Link to="/profile" className="nav-link">{user ? "Profil" : "Bejelentkezés"}</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
        {user?.role === 'admin' && (
          <Link to="/admin-panel" className="nav-link">Admin Panel</Link>
        )}
        {user?.role === 'gamedev' && (
          <>
            <Link to="/gamedev-panel" className="nav-link">GameDev Panel</Link>
            <Link to="/gamedev-upload" className="nav-link">Játék Feltöltés</Link>
          </>
        )}
      </nav>

      <h1>Játéklista</h1>

      <div className="action-bar">
        <AdvancedSearch 
          games={games} 
          onFilter={handleFilterChange}
          onSearch={handleSearch}
        />
        <button 
          className="comparison-toggle-btn"
          onClick={() => setShowComparison(true)}
        >
          🔄 Játékok Összehasonlítása
        </button>
      </div>

      <div className="games-grid">
        {filteredGames.map(game => (
          <GameCard
            key={game.id}
            game={game}
            user={user}
            comments={comments[game.id] || []}
            onAddComment={handleAddComment}
            onAddToWishlist={handleAddToWishlist}
            onAddToCollection={handleAddToCollection}
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

