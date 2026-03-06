import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GameDevPanel = ({ user }) => {
  console.log('GameDevPanel render, user:', user);
  
  if (!user) {
    console.log('GameDevPanel: nincs user objektum');
    return (
      <div className="maincenter">
        <div className="loading">Felhasználói adatok betöltése...</div>
      </div>
    );
  }

  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    pendingGames: 0,
    approvedGames: 0,
    rejectedGames: 0,
    totalDownloads: 0,
    totalRatings: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDeveloperGames();
    fetchDeveloperStats();
  }, [user]);

  const fetchDeveloperGames = async () => {
    console.log('fetchDeveloperGames hívva, user:', user);
    console.log('Felhasználónév:', user?.username);
    
    if (!user?.username) {
      console.error('Nincs felhasználónév!');
      return;
    }
    
    try {
      const url = `http://localhost:3001/gamedev/${user.username}/games`;
      console.log('API hívás URL:', url);
      
      const response = await axios.get(url, {
        headers: {
          'x-username': user.username
        }
      });
      console.log('GameDev API válasz:', response.data);
      if (response.data.success) {
        setGames(response.data.games);
        console.log('Beállított játékok:', response.data.games);
      } else {
        console.error('API válasz sikertelen:', response.data);
      }
    } catch (error) {
      console.error('Hiba a játékok betöltésekor:', error);
      console.error('Hiba részletei:', error.response?.data);
      console.error('Hiba status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeveloperStats = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/gamedev/${user.username}/stats`, {
        headers: {
          'x-username': user.username
        }
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Hiba a statisztikák betöltésekor:', error);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchDeveloperGames();
    fetchDeveloperStats();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#00d2d3';
      case 'pending': return '#feca57';
      case 'rejected': return '#ee5a24';
      default: return '#b8bcc8';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Elfogadva';
      case 'pending': return 'Várakozik';
      case 'rejected': return 'Elutasítva';
      default: return 'Ismeretlen';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  const getPendingGames = () => games.filter(game => game.status === 'pending');
  const getApprovedGames = () => games.filter(game => game.status === 'approved');
  const getRejectedGames = () => games.filter(game => game.status === 'rejected');

  if (loading) {
    return (
      <div className="maincenter">
        <div className="loading">Statisztikák betöltése...</div>
      </div>
    );
  }

  return (
    <div className="maincenter">

      <div className="gamedev-panel">
        <div className="gamedev-header">
          <h1>🎮 GameDev Panel</h1>
          <p>Fejlesztői statisztikák és játék menedzsment</p>
          <div className="developer-info">
            <span>Fejlesztő: <strong>{user.username}</strong></span>
          </div>
        </div>

        {/* Statisztika áttekintés */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">🎮</div>
            <h3>Összes játék</h3>
            <span className="stat-number">{stats.totalGames}</span>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <h3>Várakozó játékok</h3>
            <span className="stat-number">{stats.pendingGames}</span>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <h3>Elfogadott játékok</h3>
            <span className="stat-number">{stats.approvedGames}</span>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <h3>Elutasított játékok</h3>
            <span className="stat-number">{stats.rejectedGames}</span>
          </div>
        </div>

        {/* Részletes statisztikák */}
        <div className="detailed-stats">
          <div className="stat-item">
            <span className="stat-label">Összes értékelés:</span>
            <span className="stat-value">{stats.totalRatings || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Átlagos értékelés:</span>
            <span className="stat-value">{parseFloat(stats.averageRating).toFixed(2)}/10</span>
          </div>
        </div>

        {/* Tab navigáció */}
        <div className="gamedev-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Áttekintés
          </button>
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Várakozó ({getPendingGames().length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            ✅ Elfogadott ({getApprovedGames().length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            ❌ Elutasított ({getRejectedGames().length})
          </button>
        </div>

        {/* Tartalom */}
        <div className="gamedev-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h3>📈 Játék Státuszok</h3>
              <div className="status-chart">
                {games.length === 0 ? (
                  <div className="empty-state">
                    <p>Még nincs feltöltött játékod.</p>
                    <a href="/gamedev-upload" className="btn-primary">Első játék feltöltése</a>
                  </div>
                ) : (
                  <div className="game-status-list">
                    {games.map(game => (
                      <div key={game.id} className="game-status-item">
                        <div className="game-info">
                          <img src={game.image || '/placeholder-game.jpg'} alt={game.title} className="game-thumbnail" />
                          <div className="game-details">
                            <h4>{game.title}</h4>
                            <p className="game-meta">
                              Feltöltve: {formatDate(game.uploadDate)}
                            </p>
                            <p className="game-meta">
                              Értékelés: {game.averageRating ? `${parseFloat(game.averageRating).toFixed(2)}/10` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="status-info">
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(game.status) }}
                          >
                            {getStatusText(game.status)}
                          </span>
                          {game.status === 'rejected' && game.rejectionReason && (
                            <div className="rejection-reason">
                              <strong>Indoklás:</strong> {game.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="pending-section">
              <h3>⏳ Várakozó Játékok</h3>
              {getPendingGames().length === 0 ? (
                <div className="empty-state">
                  <p>Nincsenek várakozó játékaid.</p>
                </div>
              ) : (
                <div className="games-grid">
                  {getPendingGames().map(game => (
                    <div key={game.id} className="game-card">
                      <div className="game-image">
                        <img src={game.image || '/placeholder-game.jpg'} alt={game.title} />
                        <div className="status-overlay pending">
                          <span>⏳ Várakozik</span>
                        </div>
                      </div>
                      <div className="game-info">
                        <h4>{game.title}</h4>
                        <p className="game-meta">Feltöltve: {formatDate(game.uploadDate)}</p>
                        <p className="game-description">{game.description?.substring(0, 100)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="approved-section">
              <h3>✅ Elfogadott Játékok</h3>
              {getApprovedGames().length === 0 ? (
                <div className="empty-state">
                  <p>Nincsenek elfogadott játékaid.</p>
                </div>
              ) : (
                <div className="games-grid">
                  {getApprovedGames().map(game => (
                    <div key={game.id} className="game-card">
                      <div className="game-image">
                        <img src={game.image || '/placeholder-game.jpg'} alt={game.title} />
                        <div className="status-overlay approved">
                          <span>✅ Elfogadva</span>
                        </div>
                      </div>
                      <div className="game-info">
                        <h4>{game.title}</h4>
                        <p className="game-meta">Feltöltve: {formatDate(game.uploadDate)}</p>
                        <div className="game-stats">
                          <span>⭐ {game.averageRating ? `${parseFloat(game.averageRating).toFixed(2)}/10` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="rejected-section">
              <h3>❌ Elutasított Játékok</h3>
              {getRejectedGames().length === 0 ? (
                <div className="empty-state">
                  <p>Nincsenek elutasított játékaid.</p>
                </div>
              ) : (
                <div className="rejected-games-list">
                  {getRejectedGames().map(game => (
                    <div key={game.id} className="rejected-game-item">
                      <div className="game-info">
                        <img src={game.image || '/placeholder-game.jpg'} alt={game.title} className="game-thumbnail" />
                        <div className="game-details">
                          <h4>{game.title}</h4>
                          <p className="game-meta">Feltöltve: {formatDate(game.uploadDate)}</p>
                          <p className="game-meta">Elutasítva: {formatDate(game.reviewDate)}</p>
                        </div>
                      </div>
                      <div className="rejection-info">
                        <div className="rejection-reason">
                          <strong>Elutasítás oka:</strong>
                          <p>{game.rejectionReason || 'Nincs megadva'}</p>
                        </div>
                        <div className="rejection-suggestions">
                          <strong>Javaslatok:</strong>
                          <ul>
                            <li>Javítsd ki a hibákat és töltsd fel újra</li>
                            <li>Ellenőrizd a játék leírását és képeit</li>
                            <li>Győződj meg róla, hogy minden követelménynek megfelel</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDevPanel;
