import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserProfile = ({ user, users, comments, games, onProfileEdit, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    totalComments: 0,
    averageRating: 0,
    favoriteCategories: {},
    commentedGames: [],
    wishlist: [],
    collection: []
  });

  useEffect(() => {
    if (user) {
      calculateUserStats();
    }
  }, [user, comments, games]);

  const calculateUserStats = () => {
    // Összes komment kinyerése az objektumból
    const allComments = Object.values(comments).flat();
    const userComments = allComments.filter(c => 
      c.user === user.username || c.felhasznalo === user.username
    );
    const totalComments = userComments.length;
    
    const ratings = userComments.map(c => c.rating || c.ertekeles || 0).filter(r => r > 0);
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    const commentedGameIds = [...new Set(userComments.map(c => c.gameId || c.idjatekok))];
    const commentedGames = games.filter(game => commentedGameIds.includes(game.id || game.idjatekok));

    const favoriteCategories = {};
    commentedGames.forEach(game => {
      const categories = game.categories || game.category || [];
      if (Array.isArray(categories)) {
        categories.forEach(category => {
          favoriteCategories[category] = (favoriteCategories[category] || 0) + 1;
        });
      } else if (typeof categories === 'string') {
        const categoryList = categories.split(',').map(c => c.trim());
        categoryList.forEach(category => {
          favoriteCategories[category] = (favoriteCategories[category] || 0) + 1;
        });
      }
    });

    setUserStats({
      totalComments,
      averageRating,
      favoriteCategories,
      commentedGames,
      wishlist: [], // TODO: Implement wishlist functionality
      collection: [] // TODO: Implement collection functionality
    });
  };

  const handleAddToWishlist = (gameId) => {
    // TODO: Implement wishlist functionality
    alert('Kívánságlista funkció hamarosan elérhető!');
  };

  const handleAddToCollection = (gameId) => {
    // TODO: Implement collection functionality
    alert('Játékgyűjtemény funkció hamarosan elérhető!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  const getTopCategories = () => {
    return Object.entries(userStats.favoriteCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  if (!user) {
    return (
      <div className="maincenter">
        <div className="login-prompt">
          <h2>Kérjük, jelentkezz be a profil megtekintéséhez!</h2>
          <Link to="/login" className="login-btn">Bejelentkezés</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="maincenter">
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/statistics" className="nav-link">Statisztikák</Link>
        <Link to="/profile" className="nav-link active">Profil</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">Admin Panel</Link>
        )}
        {(user?.role === 'gamedev' || user?.role === 'admin') && (
          <Link to="/gamedev-upload" className="nav-link">Játék Feltöltés</Link>
        )}
      </nav>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="profile-info">
            <h1>{user.name || user.username}</h1>
            <p className="username">@{user.username}</p>
            <p className="email">{user.email}</p>
            <div className="user-role">
              <span className={`role-badge ${user.role}`}>
                {user.role === 'admin' ? 'Admin' : user.role === 'gamedev' ? 'GameDev' : 'Felhasználó'}
              </span>
            </div>
          </div>
          <div className="profile-actions">
            <button onClick={() => onProfileEdit({})} className="edit-profile-btn">
              ✏️ Profil szerkesztése
            </button>
            <button onClick={onLogout} className="logout-btn">
              🚪 Kijelentkezés
            </button>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Áttekintés
          </button>
          <button
            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            💬 Kommentjeim
          </button>
          <button
            className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            ❤️ Kívánságlista
          </button>
          <button
            className={`tab-btn ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            🎮 Játékgyűjtemény
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Kommentek</h3>
                  <p>{userStats.totalComments}</p>
                </div>
                <div className="stat-card">
                  <h3>Átlagos értékelés</h3>
                  <p>{userStats.averageRating}/10</p>
                </div>
                <div className="stat-card">
                  <h3>Értékelt játékok</h3>
                  <p>{userStats.commentedGames.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Kedvenc kategóriák</h3>
                  <div className="favorite-categories">
                    {getTopCategories().map(([category, count]) => (
                      <span key={category} className="category-tag">
                        {category} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Legutóbbi kommentek</h3>
                <div className="activity-list">
                  {Object.values(comments)
                    .flat()
                    .filter(c => c.user === user.username || c.felhasznalo === user.username)
                    .sort((a, b) => (b.id || 0) - (a.id || 0))
                    .slice(0, 5)
                    .map((comment) => {
                      const game = games.find(g => 
                        (g.id || g.idjatekok) === (comment.gameId || comment.idjatekok)
                      );
                      return (
                        <div key={comment.id} className="activity-item">
                          <div className="activity-content">
                            <span className="rating">{comment.rating || comment.ertekeles}/10</span>
                            <span className="game-title">{game?.title || game?.nev || 'Ismeretlen játék'}</span>
                            <span className="comment-text">{comment.text || comment.tartalom}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="comments-section">
              <h3>Összes komment ({userStats.totalComments})</h3>
              <div className="user-comments">
                {userStats.commentedGames.map(game => {
                  const gameComments = Object.values(comments)
                    .flat()
                    .filter(c => 
                      (c.user === user.username || c.felhasznalo === user.username) && 
                      (c.gameId || c.idjatekok) === (game.id || game.idjatekok)
                    );
                  
                  return (
                    <div key={game.id || game.idjatekok} className="game-comments-card">
                      <div className="game-info">
                        <img src={game.image || game.kepurl} alt={game.title || game.nev} className="game-thumbnail" />
                        <div>
                          <h4>{game.title || game.nev}</h4>
                          <p>{game.developer || game.fejleszto}</p>
                        </div>
                      </div>
                      <div className="comments-list">
                        {gameComments.map(comment => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <span className="rating-badge">{comment.rating || comment.ertekeles}/10</span>
                              <span className="comment-date">{formatDate(comment.date)}</span>
                            </div>
                            <p className="comment-text">{comment.text || comment.tartalom}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="wishlist-section">
              <h3>Kívánságlista</h3>
              <div className="empty-state">
                <p>A kívánságlista funkció hamarosan elérhető!</p>
                <p>Itt tudod majd kezelni a játékokat, amiket szeretnél kipróbálni.</p>
              </div>
            </div>
          )}

          {activeTab === 'collection' && (
            <div className="collection-section">
              <h3>Játékgyűjtemény</h3>
              <div className="empty-state">
                <p>A játék gyűjtemény funkció hamarosan elérhető!</p>
                <p>Itt tudod majd vezetni a birtokolt és játszott játékaidat.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
