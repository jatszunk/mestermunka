
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard.jsx';
import AdvancedSearch from '../components/AdvancedSearch.jsx';
import GameComparison from '../components/GameComparison.jsx';

function Home({ user, games, comments, handleAddComment, handleAddToWishlist, handleAddToCollection }) {
  const [filteredGames, setFilteredGames] = useState(games);
  const [showComparison, setShowComparison] = useState(false);
  const [mobileWarning, setMobileWarning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 9;

  useEffect(() => {
    setFilteredGames(games);
    setCurrentPage(1); // Reset page when games change
  }, [games]);

  const handleComparisonClick = () => {
    // Check if mobile
    if (window.innerWidth <= 768) {
      setMobileWarning(true);
      // Hide warning after 3 seconds
      setTimeout(() => setMobileWarning(false), 3000);
      return;
    }
    
    setShowComparison(true);
  };

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
    setCurrentPage(1); // Reset page when filters change
  };

  const handleSearch = (searchTerm) => {
    handleFilterChange({ searchTerm });
  };

  // Pagination logic
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
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
          onClick={handleComparisonClick}
        >
          🔄 Játékok Összehasonlítása
        </button>
        {mobileWarning && (
          <div className="mobile-warning">
            📱 Mobil nézetben nem elérhető
          </div>
        )}
      </div>

      <div className="games-grid">
        {currentGames.map(game => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn prev-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ← Előző
          </button>
          
          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          
          <button 
            className="pagination-btn next-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Következő →
          </button>
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

