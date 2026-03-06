import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Statistics = ({ games, comments, users, user }) => {
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

  useEffect(() => {
    calculateStatistics();
  }, [games, comments, users]);

  const calculateStatistics = () => {
    console.log('Statistics data:', { 
      games: games ? games.length : 0, 
      comments: comments ? Object.keys(comments).length : 0, 
      users: users ? users.length : 0 
    });
    
    // Alap statisztikák
    const totalGames = games ? games.length : 0;
    const totalUsers = users ? users.length : 0;
    const totalComments = comments ? Object.values(comments).flat().length : 0;
    
    // Átlagos értékelés
    const allRatings = comments ? Object.values(comments).flat().map(c => c.rating) : [];
    const averageRating = allRatings.length > 0 
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : 0;

    // Kategória statisztikák
    const categoryStats = {};
    if (games && Array.isArray(games)) {
      games.forEach(game => {
        (game.categories || []).forEach(category => {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
      });
    }

    // Ár statisztikák
    const priceStats = {
      free: 0,
      paid: 0,
      averagePrice: 0,
      priceRanges: {
        '0-1000': 0,
        '1000-5000': 0,
        '5000-10000': 0,
        '10000+': 0
      }
    };
    
    let totalPrice = 0;
    if (games && Array.isArray(games)) {
      games.forEach(game => {
        const price = parseInt(game.price) || 0;
        totalPrice += price;
        
        if (price === 0) {
          priceStats.free++;
        } else {
          priceStats.paid++;
        }
        
        if (price <= 1000) priceStats.priceRanges['0-1000']++;
        else if (price <= 5000) priceStats.priceRanges['1000-5000']++;
        else if (price <= 10000) priceStats.priceRanges['5000-10000']++;
        else priceStats.priceRanges['10000+']++;
      });
    }
    
    priceStats.averagePrice = totalGames > 0 ? Math.round(totalPrice / totalGames) : 0;

    // Értékelés eloszlás
    const ratingDistribution = {};
    for (let i = 1; i <= 10; i++) {
      ratingDistribution[i] = 0;
    }
    allRatings.forEach(rating => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    // Fejlesztő statisztikák
    const developerStats = {};
    if (games && Array.isArray(games)) {
      games.forEach(game => {
        developerStats[game.developer] = (developerStats[game.developer] || 0) + 1;
      });
    }

    // Legfrissebb aktivitás
    const recentActivity = [];
    if (comments) {
      const activity = Object.values(comments).flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .map(comment => ({
          ...comment,
          gameTitle: games && Array.isArray(games) ? games.find(g => g.id === comment.gameId)?.title || 'Ismeretlen játék' : 'Ismeretlen játék'
        }));
      recentActivity.push(...activity);
    }

    setStats({
      totalGames,
      totalUsers,
      totalComments,
      averageRating,
      categoryStats,
      priceStats,
      ratingDistribution,
      developerStats,
      recentActivity
    });
  };

  const renderBarChart = (data, title, color = '#27e8ff') => {
    if (!data || typeof data !== 'object') {
      return (
        <div className="bar-chart">
          <h4>{title}</h4>
          <p style={{ color: '#b8bcc8', textAlign: 'center' }}>Nincs elég adat</p>
        </div>
      );
    }
    
    const maxValue = Math.max(...Object.values(data), 1); // Hogy ne legyen 0 a max
    
    return (
      <div className="bar-chart">
        <h4>{title}</h4>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bar-item">
            <span className="bar-label">{key}</span>
            <div className="bar-container">
              <div 
                className="bar" 
                style={{ 
                  width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                  backgroundColor: color
                }}
              />
            </div>
            <span className="bar-value">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  const getTopRatedGames = () => {
    return games
      .filter(game => game.rating && game.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  };

  const getTopCategories = () => {
    if (!stats.categoryStats || typeof stats.categoryStats !== 'object') {
      return [];
    }
    return Object.entries(stats.categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopDevelopers = () => {
    if (!stats.developerStats || typeof stats.developerStats !== 'object') {
      return [];
    }
    return Object.entries(stats.developerStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  // Debug információk
  if ((!games || games.length === 0) && (!users || users.length === 0)) {
    return (
      <div className="maincenter" style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
        <h2>Statisztikák betöltése...</h2>
        <p>Várjuk az adatokat a szerverről...</p>
        <p>Games: {games ? games.length : 0}, Users: {users ? users.length : 0}, Comments: {comments ? Object.keys(comments).length : 0}</p>
      </div>
    );
  }

  return (
    <div className="maincenter">
      {/* Navbar */}
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

      <div className="statistics-container">
        <div className="statistics-header">
          <h1>📊 GameVerse Statisztikák</h1>
          <p className="statistics-subtitle">Részletes betekintés a platform adataiba</p>
        </div>
        
        {/* Összesítő statisztikák */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">🎮</div>
            <h3>Összes játék</h3>
            <span className="stat-number">{stats.totalGames}</span>
            <div className="stat-change">+12% ebben a hónapban</div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">👥</div>
            <h3>Összes felhasználó</h3>
            <span className="stat-number">{stats.totalUsers}</span>
            <div className="stat-change">+8% ebben a hónapban</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">💬</div>
            <h3>Összes komment</h3>
            <span className="stat-number">{stats.totalComments}</span>
            <div className="stat-change">+25% ebben a hónapban</div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">⭐</div>
            <h3>Átlagos értékelés</h3>
            <span className="stat-number">{stats.averageRating}</span>
            <div className="stat-change">0.3 pont növekedés</div>
          </div>
        </div>

        {/* Részletes statisztikák */}
        <div className="stats-grid">
          {/* Kategória statisztikák */}
          <div className="stats-section">
            <div className="section-header">
              <h3>🏷️ Legnépszerűbb kategóriák</h3>
              <div className="section-badge">TOP 5</div>
            </div>
            {renderBarChart(getTopCategories(), 'Kategóriák eloszlása', '#ff6b6b')}
          </div>

          {/* Fejlesztő statisztikák */}
          <div className="stats-section">
            <div className="section-header">
              <h3>🏢 Legtöbb játékkal rendelkező fejlesztők</h3>
              <div className="section-badge">TOP 5</div>
            </div>
            {renderBarChart(getTopDevelopers(), 'Fejlesztők rangsora', '#4ecdc4')}
          </div>

          {/* Értékelés eloszlás */}
          <div className="stats-section">
            <div className="section-header">
              <h3>📈 Értékelések eloszlása</h3>
              <div className="section-badge">1-10 skála</div>
            </div>
            {renderBarChart(stats.ratingDistribution, 'Értékelési skála', '#45b7d1')}
          </div>

          {/* Ár statisztikák */}
          <div className="stats-section">
            <div className="section-header">
              <h3>💰 Árinformációk</h3>
              <div className="section-badge">Pénzügyi adatok</div>
            </div>
            <div className="price-stats">
              <div className="price-item">
                <span className="price-label">🆓 Ingyenes játékok:</span>
                <span className="price-value">{stats.priceStats.free}</span>
              </div>
              <div className="price-item">
                <span className="price-label">💵 Fizetős játékok:</span>
                <span className="price-value">{stats.priceStats.paid}</span>
              </div>
              <div className="price-item">
                <span className="price-label">📊 Átlagos ár:</span>
                <span className="price-value">{stats.priceStats.averagePrice} Ft</span>
              </div>
              <div className="price-item">
                <span className="price-label">📈 Teljes érték:</span>
                <span className="price-value">{stats.priceStats.averagePrice * stats.totalGames} Ft</span>
              </div>
            </div>
            <h4>Ár tartományok eloszlása</h4>
            {renderBarChart(stats.priceStats.priceRanges, 'Árkategóriák', '#ffaa00')}
          </div>
        </div>

        {/* Legjobbra értékelt játékok */}
        <div className="stats-section full-width">
          <div className="section-header">
            <h3>🏆 Legjobbra értékelt játékok</h3>
            <div className="section-badge">TOP RATED</div>
          </div>
          <div className="top-games-grid">
            {getTopRatedGames().map((game, index) => (
              <Link key={game.id} to={`/game/${game.id}`} className="top-game-card-link">
                <div className="top-game-card">
                  <div className="rank-badge">#{index + 1}</div>
                  <img src={game.image} alt={game.title} className="top-game-image" />
                  <div className="top-game-content">
                    <h4>{game.title}</h4>
                    <p className="developer">🏢 {game.developer}</p>
                    <div className="game-meta">
                      <span className="price-tag">{(() => {
                    const isFree = game.price == 0 || game.price == "0" || game.price === 0 || game.price === "0";
                    if (isFree) {
                      return 'Ingyenes';
                    }
                    const currency = game.currency && game.currency.trim() !== '' ? game.currency : 'FT';
                    return `${game.price} ${currency}`;
                  })()}</span>
                      <span className="rating-badge">⭐ {game.rating}/10</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Legfrissebb aktivitás */}
        <div className="stats-section full-width">
          <div className="section-header">
            <h3>🔥 Legfrissebb aktivitás</h3>
            <div className="section-badge">UTOLSÓ 10</div>
          </div>
          <div className="activity-timeline">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={`${activity.id}-${index}`} className="activity-item">
                  <div className="activity-avatar">
                    <div className="avatar-placeholder">👤</div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-user">{activity.user}</span>
                      <span className="activity-action">értékelte</span>
                      <span className="activity-game">{activity.gameTitle}</span>
                    </div>
                    <div className="activity-rating">
                      <div className="rating-stars">
                        {[...Array(10)].map((_, i) => (
                          <span key={i} className={i < activity.rating ? 'star filled' : 'star'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="rating-number">{activity.rating}/10</span>
                    </div>
                  </div>
                  <div className="activity-time">
                    {activity.date ? new Date(activity.date).toLocaleDateString('hu-HU') : 'Nemrég'}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">
                <p>📝 Még nincs aktivitás a rendszerben</p>
              </div>
            )}
          </div>
        </div>

        {/* Extra statisztikák */}
        <div className="stats-grid">
          <div className="stats-section">
            <div className="section-header">
              <h3>📊 Platform statisztikák</h3>
              <div className="section-badge">RÉSZLETEK</div>
            </div>
            <div className="platform-stats">
              <div className="platform-item">
                <span className="platform-name">🖥️ PC</span>
                <span className="platform-count">{Math.floor(stats.totalGames * 0.7)}</span>
              </div>
              <div className="platform-item">
                <span className="platform-name">🎮 Konzol</span>
                <span className="platform-count">{Math.floor(stats.totalGames * 0.2)}</span>
              </div>
              <div className="platform-item">
                <span className="platform-name">📱 Mobil</span>
                <span className="platform-count">{Math.floor(stats.totalGames * 0.1)}</span>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <div className="section-header">
              <h3>🎯 Felhasználói aktivitás</h3>
              <div className="section-badge">METRIKÁK</div>
            </div>
            <div className="activity-metrics">
              <div className="metric-item">
                <span className="metric-label">Átlagos komment/user:</span>
                <span className="metric-value">{stats.totalUsers > 0 ? (stats.totalComments / stats.totalUsers).toFixed(1) : 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Aktív felhasználók:</span>
                <span className="metric-value">{Math.floor(stats.totalUsers * 0.6)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Értékelések aránya:</span>
                <span className="metric-value">{stats.totalGames > 0 ? ((getTopRatedGames().length / stats.totalGames) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
