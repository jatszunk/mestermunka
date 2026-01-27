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

  useEffect(() => {
    calculateStatistics();
  }, [games, comments, users]);

  const calculateStatistics = () => {
    // Alap statisztikák
    const totalGames = games.length;
    const totalUsers = users.length;
    const totalComments = Object.values(comments).flat().length;
    
    // Átlagos értékelés
    const allRatings = Object.values(comments).flat().map(c => c.rating);
    const averageRating = allRatings.length > 0 
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : 0;

    // Kategória statisztikák
    const categoryStats = {};
    games.forEach(game => {
      (game.categories || []).forEach(category => {
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });
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
      const price = game.price === 'Ingyenes' ? 0 : parseFloat(game.price) || 0;
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
      (game.platforms || []).forEach(platform => {
        platformStats[platform] = (platformStats[platform] || 0) + 1;
      });
    });

    // Fejlesztő statisztikák
    const developerStats = {};
    games.forEach(game => {
      developerStats[game.developer] = (developerStats[game.developer] || 0) + 1;
    });

    // Legfrissebb aktivitás (utolsó 10 komment)
    const recentActivity = Object.entries(comments)
      .flatMap(([gameId, gameComments]) => 
        gameComments.map(comment => ({
          ...comment,
          gameId,
          gameTitle: games.find(g => g.id === parseInt(gameId))?.title || 'Ismeretlen játék'
        }))
      )
      .sort((a, b) => b.id - a.id)
      .slice(0, 10);

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
      .filter(game => game.rating > 0)
      .sort((a, b) => b.rating - a.rating)
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

      {/* Fő statisztikák */}
      <div className="stats-overview">
        <div className="stat-card stat-blue">
          <h3>Összes játék</h3>
          <p>{stats.totalGames}</p>
        </div>
        <div className="stat-card stat-green">
          <h3>Felhasználók</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card stat-purple">
          <h3>Kommentek</h3>
          <p>{stats.totalComments}</p>
        </div>
        <div className="stat-card stat-yellow">
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
                <div key={game.id} className="top-game-item">
                  <span className="rank">#{index + 1}</span>
                  <img src={game.image} alt={game.title} className="top-game-image" />
                  <div className="top-game-info">
                    <h4>{game.title}</h4>
                    <p>{game.developer}</p>
                  </div>
                  <div className="top-game-rating">
                    <span>{game.rating}/10</span>
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
    </div>
  );
};

export default Statistics;
