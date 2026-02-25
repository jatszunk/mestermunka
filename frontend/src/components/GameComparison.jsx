import React, { useState } from 'react';

const GameComparison = ({ games, comments, onClose }) => {
  const [selectedGames, setSelectedGames] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Globális értékelés számítása egy játékhoz
  const getGlobalRating = (gameId) => {
    const gameComments = comments[gameId] || [];
    return gameComments.length > 0 
      ? (gameComments.reduce((sum, comment) => sum + comment.rating, 0) / gameComments.length).toFixed(2)
      : "Nincs";
  };

  const handleGameSelect = (game) => {
    if (selectedGames.find(g => g.id === game.id)) {
      setSelectedGames(selectedGames.filter(g => g.id !== game.id));
    } else if (selectedGames.length < 4) {
      setSelectedGames([...selectedGames, game]);
    } else {
      alert('Maximum 4 játékot hasonlíthatsz össze!');
    }
  };

  const handleCompare = () => {
    if (selectedGames.length >= 2) {
      setShowComparison(true);
    } else {
      alert('Legalább 2 játékot válassz ki az összehasonlításhoz!');
    }
  };

  const formatPrice = (price, currency) => {
    const isFree = price == 0 || price == "0" || price === 0 || price === "0" || price === 'Ingyenes';
    if (isFree) {
      return 'Ingyenes';
    }
    const validCurrency = currency && currency.trim() !== '' ? currency : 'FT';
    return `${price} ${validCurrency}`;
  };

  const getRequirements = (requirements) => {
    if (!requirements) return { minimum: '-', recommended: '-' };
    return requirements;
  };

  if (showComparison) {
    return (
      <div className="comparison-modal">
        <div className="comparison-content">
          <div className="comparison-header">
            <h2>Játék Összehasonlítás</h2>
            <button onClick={() => setShowComparison(false)} className="back-btn">
              ← Vissza a választáshoz
            </button>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          
          <div className="comparison-table">
            <div className="comparison-row header">
              <div className="comparison-cell">Jellemző</div>
              {selectedGames.map(game => (
                <div key={game.id} className="comparison-cell game-header">
                  <img src={game.image} alt={game.title} className="comparison-game-image" />
                  <h3>{game.title}</h3>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-cell label">Fejlesztő</div>
              {selectedGames.map(game => (
                <div key={game.id} className="comparison-cell developer">{game.developer}</div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-cell label">Ár</div>
              {selectedGames.map(game => (
                <div key={game.id} className="comparison-cell price">
                  {formatPrice(game.price, game.currency)}
                </div>
              ))}
            </div>
            <div className="comparison-row">
              <div className="comparison-cell label">Értékelés</div>
              {selectedGames.map(game => {
                const globalRating = getGlobalRating(game.id);
                return (
                <div key={game.id} className="comparison-cell rating">
                  <div className="rating-display">
                    <span className="rating-score">{globalRating}/10</span>
                    <div className="rating-bar">
                      <div 
                        className="rating-fill" 
                        style={{ width: `${(parseFloat(globalRating) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            <div className="comparison-row">
              <div className="comparison-cell label">Kategóriák</div>
              {selectedGames.map(game => (
                <div key={game.id} className="comparison-cell">
                  <div className="category-tags">
                    {(game.categoryNames || []).map((cat, idx) => (
                      <span key={idx} className="category-tag">{cat}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-cell label">Platformok</div>
              {selectedGames.map(game => (
                <div key={game.id} className="comparison-cell">
                  <div className="platform-tags">
                    {(game.platformNames || []).map((platform, idx) => (
                      <span key={idx} className="platform-tag">{platform}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-cell label">Minimum követelmények</div>
              {selectedGames.map(game => (
                <div key={game.id} className="comparison-cell requirements">
                  {getRequirements(game.requirements).minimum || '-'}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-cell label">Ajánlott követelmények</div>
              {selectedGames.map(game => (
                <div key={game.id} className="comparison-cell requirements">
                  {getRequirements(game.requirements).recommended || '-'}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-cell label">Leírás</div>
              {selectedGames.map(game => (
                <div key={game.id} className="comparison-cell description">
                  {game.description || '-'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-modal">
      <div className="comparison-content">
        <div className="comparison-header">
          <h2>Játékok Összehasonlítása</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="selection-info">
          <p>Válassz ki 2-4 játékot az összehasonlításhoz ({selectedGames.length}/4)</p>
          {selectedGames.length >= 2 && (
            <button onClick={handleCompare} className="compare-btn">
              Összehasonlítás ({selectedGames.length} játék)
            </button>
          )}
        </div>

        <div className="games-selection">
          <div className="games-grid-selection">
            {games.map(game => {
              const isSelected = selectedGames.find(g => g.id === game.id);
              return (
                <div
                  key={game.id}
                  className={`game-select-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleGameSelect(game)}
                >
                  <div className="game-select-image">
                    <img src={game.image} alt={game.title} />
                    {isSelected && (
                      <div className="selected-overlay">
                        <span>✓</span>
                      </div>
                    )}
                  </div>
                  <div className="game-select-info">
                    <h4>{game.title}</h4>
                    <p>{game.developer}</p>
                    <p className="price">{formatPrice(game.price, game.currency)}</p>
                    <div className="rating-small">
                      <span>{getGlobalRating(game.id)}/10</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameComparison;
