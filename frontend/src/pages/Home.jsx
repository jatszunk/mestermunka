
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
    
    // Kategória szűrés - ID-k alapján
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(game => 
        game.categories && game.categories.length > 0 && game.categories.some(cat => filters.categories.includes(cat.toString()))
      );
    }
    
    // Platform szűrés - ID-k alapján
    if (filters.platforms && filters.platforms.length > 0) {
      filtered = filtered.filter(game => 
        game.platforms && game.platforms.length > 0 && game.platforms.some(platform => filters.platforms.includes(platform.toString()))
      );
    }
    
    // Ár szűrés
    if (filters.priceRange) {
      filtered = filtered.filter(game => 
        game.price >= filters.priceRange.min && 
        game.price <= filters.priceRange.max
      );
    }
    
    // Értékelés szűrés - globális értékelés alapján
    if (filters.rating) {
      filtered = filtered.filter(game => {
        // Kiszámoljuk a globális értékelést a kommentek alapján
        const gameComments = comments[game.id] || [];
        const globalRating = gameComments.length > 0 
          ? gameComments.reduce((sum, comment) => sum + comment.rating, 0) / gameComments.length 
          : 0;
        
        return globalRating >= filters.rating.min && globalRating <= filters.rating.max;
      });
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
          comments={comments}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

export default Home;

