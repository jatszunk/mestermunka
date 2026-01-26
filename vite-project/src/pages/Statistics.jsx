import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Statistics = ({ games, comments, users }) => {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalUsers: 0,
    totalComments: 0,
    averageRating: 0,
    categoryStats: {},
    priceStats: {},
    ratingDistribution: {},
    platformStats: {},
    developerStats: {},
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStatistics();
  }, [games, comments, users]);

  const calculateStatistics = () => {
    setLoading(true);
    
    // Alap statisztikák
    const totalGames = games.length;
    const totalUsers = users.length;
    
    // Összes komment kinyerése az objektumból
    const allComments = Object.values(comments).flat();
    const totalComments = allComments.length;
    
    // Átlagos értékelés
    const allRatings = allComments.map(c => c.rating || c.ertekeles || 0).filter(r => r > 0);
    const averageRating = allRatings.length > 0 
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : 0;

    // Kategória statisztikák
    const categoryStats = {};
    games.forEach(game => {
      const categories = game.categories || game.category || [];
      if (Array.isArray(categories)) {
        categories.forEach(category => {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
      } else if (typeof categories === 'string') {
        categoryStats[categories] = (categoryStats[categories] || 0) + 1;
      }
    });

    // Ár statisztikák
    const priceStats = {
      free: 0,
      paid: 0,
      averagePrice: 0,
      priceRanges: {
        '0-1000': 0,
        '1001-5000': 0,
        '5001-10000': 0,
        '10001+': 0
      }
    };
    
    let totalPrice = 0;
    let paidCount = 0;
    
    games.forEach(game => {
      const priceStr = game.price || game.ar || '0';
      const price = priceStr === 'Ingyenes' || priceStr === 'ingyenes' ? 0 : parseFloat(priceStr) || 0;
      if (price === 0) {
        priceStats.free++;
      } else {
        priceStats.paid++;
        totalPrice += price;
        paidCount++;
        
        // Ár tartományok
        if (price <= 1000) priceStats.priceRanges['0-1000']++;
        else if (price <= 5000) priceStats.priceRanges['1001-5000']++;
        else if (price <= 10000) priceStats.priceRanges['5001-10000']++;
        else priceStats.priceRanges['10001+']++;
      }
    });
    
    priceStats.averagePrice = paidCount > 0 ? (totalPrice / paidCount).toFixed(0) : 0;

    // Értékelés eloszlás
    const ratingDistribution = {
      '0-2': 0,
      '3-4': 0,
      '5-6': 0,
      '7-8': 0,
      '9-10': 0
    };
    
    allRatings.forEach(rating => {
      if (rating <= 2) ratingDistribution['0-2']++;
      else if (rating <= 4) ratingDistribution['3-4']++;
      else if (rating <= 6) ratingDistribution['5-6']++;
      else if (rating <= 8) ratingDistribution['7-8']++;
      else ratingDistribution['9-10']++;
    });

    // Platform statisztikák
    const platformStats = {};
    games.forEach(game => {
      const platforms = game.platforms || game.platform || [];
      if (Array.isArray(platforms)) {
        platforms.forEach(platform => {
          platformStats[platform] = (platformStats[platform] || 0) + 1;
        });
      } else if (typeof platforms === 'string') {
        const platformList = platforms.split(',').map(p => p.trim());
        platformList.forEach(platform => {
          platformStats[platform] = (platformStats[platform] || 0) + 1;
        });
      }
    });

    // Fejlesztő statisztikák
    const developerStats = {};
    games.forEach(game => {
      const developer = game.developer || game.fejleszto || 'Ismeretlen';
      developerStats[developer] = (developerStats[developer] || 0) + 1;
    });

    // Legutóbbi aktivitás
    const recentActivity = allComments
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 10)
      .map(comment => {
        const game = games.find(g => 
          (g.id || g.idjatekok) === (comment.gameId || comment.idjatekok)
        );
        return {
          user: comment.user || comment.felhasznalo || 'Ismeretlen',
          gameId: comment.gameId || comment.idjatekok,
          rating: comment.rating || comment.ertekeles,
          text: comment.text || comment.tartalom,
          gameTitle: game?.title || game?.nev || 'Ismeretlen játék'
        };
      });

    setStats({
      totalGames,
      totalUsers,
      totalComments,
      averageRating,
      categoryStats,
      priceStats,
      ratingDistribution,
      platformStats,
      developerStats,
      recentActivity
    });
    
    setLoading(false);
  };

  const getTopCategories = () => {
    return Object.entries(stats.categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopDevelopers = () => {
    return Object.entries(stats.developerStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopRatedGames = () => {
    return games
      .filter(game => (game.rating || game.ertekeles || 0) > 0)
      .sort((a, b) => (b.rating || b.ertekeles || 0) - (a.rating || a.ertekeles || 0))
      .slice(0, 5);
  };

  const renderBarChart = (data, title, color = '#27e8ff') => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="bar-chart">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bar-item">
              <div className="bar-label">{key}</div>
              <div className="bar-wrapper">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: `${(value / maxValue) * 100}%`,
                    background: `linear-gradient(90deg, ${color} 25%, #ff41fa 100%)`
                  }}
                ></div>
                <span className="bar-value">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="maincenter">
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/statistics" className="nav-link active">Statisztikák</Link>
        <Link to="/profile" className="nav-link">Profil</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
      </nav>

      <h1>Játék Statisztikák és Elemzések</h1>

      {loading ? (
        <div className="no-results">
          <div className="loading-spinner"></div>
          <p>Adatok betöltése...</p>
        </div>
      ) : (
        <>
          {stats.totalGames === 0 ? (
            <div className="no-results">
              <div className="empty-icon">📊</div>
              <h3>Nincs elérhető adat</h3>
              <p>Jelenleg nincsenek statisztikai adatok a megjelenítéshez.</p>
            </div>
          ) : (
            <>
              {/* Fő statisztikák */}
              <div className="stats-overview">
                <div className="stat-card stat-blue">
                  <div className="stat-icon">🎮</div>
                  <h3>Összes játék</h3>
                  <p>{stats.totalGames}</p>
                </div>
                <div className="stat-card stat-green">
                  <div className="stat-icon">👥</div>
                  <h3>Felhasználók</h3>
                  <p>{stats.totalUsers}</p>
                </div>
                <div className="stat-card stat-purple">
                  <div className="stat-icon">💬</div>
                  <h3>Kommentek</h3>
                  <p>{stats.totalComments}</p>
                </div>
                <div className="stat-card stat-yellow">
                  <div className="stat-icon">⭐</div>
                  <h3>Átlagos értékelés</h3>
                  <p>{stats.averageRating}/10</p>
                </div>
              </div>

              <div className="stats-grid">
                {/* Kategória statisztikák */}
                <div className="stats-section">
                  {renderBarChart(
                    Object.fromEntries(getTopCategories()), 
                    'Top 5 Kategória',
                    '#27e8ff'
                  )}
                </div>

                {/* Fejlesztő statisztikák */}
                <div className="stats-section">
                  {renderBarChart(
                    Object.fromEntries(getTopDevelopers()), 
                    'Top 5 Fejlesztő',
                    '#ff41fa'
                  )}
                </div>

                {/* Értékelés eloszlás */}
                <div className="stats-section">
                  {renderBarChart(
                    stats.ratingDistribution, 
                    'Értékelés eloszlás',
                    '#00ff88'
                  )}
                </div>

                {/* Ár statisztikák */}
                <div className="stats-section">
                  <div className="price-stats">
                    <h3>Ár statisztikák</h3>
                    <div className="price-info">
                      <div className="price-item">
                        <span className="price-label">Ingyenes:</span>
                        <span className="price-value">{stats.priceStats.free}</span>
                      </div>
                      <div className="price-item">
                        <span className="price-label">Fizetős:</span>
                        <span className="price-value">{stats.priceStats.paid}</span>
                      </div>
                      <div className="price-item">
                        <span className="price-label">Átlagos ár:</span>
                        <span className="price-value">{stats.priceStats.averagePrice} Ft</span>
                      </div>
                    </div>
                    <h4>Ár tartományok</h4>
                    {renderBarChart(stats.priceStats.priceRanges, 'Ár tartományok', '#ffaa00')}
                  </div>
                </div>

                {/* Legjobbra értékelt játékok */}
                <div className="stats-section">
                  <div className="top-games">
                    <h3>Legjobbra értékelt játékok</h3>
                    <div className="top-games-list">
                      {getTopRatedGames().map((game, index) => (
                        <div key={game.id || game.idjatekok} className="top-game-item">
                          <span className="rank">#{index + 1}</span>
                          <img src={game.image || game.kepurl} alt={game.title || game.nev} className="top-game-image" />
                          <div className="top-game-info">
                            <h4>{game.title || game.nev}</h4>
                            <p>{game.developer || game.fejleszto}</p>
                          </div>
                          <div className="top-game-rating">
                            <span>{game.rating || game.ertekeles}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legfrissebb aktivitás */}
                <div className="stats-section">
                  <div className="recent-activity">
                    <h3>Legfrissebb aktivitás</h3>
                    <div className="activity-list">
                      {stats.recentActivity.map((activity, index) => (
                        <div key={`${activity.id}-${index}`} className="activity-item">
                          <div className="activity-user">{activity.user}</div>
                          <div className="activity-content">
                            <span className="action">értékelte</span>
                            <span className="game-title">{activity.gameTitle}</span>
                            <span className="rating">{activity.rating}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Statistics;
