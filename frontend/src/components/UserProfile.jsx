import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProfileEdit from "./ProfileEdit";
import "../styles/UserProfile.css";

const UserProfile = ({ user, users, comments, games, onProfileEdit, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const [userStats, setUserStats] = useState({
    totalComments: 0,
    averageRating: 0,
    favoriteCategories: {},
    commentedGames: [],
    wishlist: [],
    collection: [],
  });

  const [wishlist, setWishlist] = useState([]);
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState({ wishlist: false, collection: false });

  // Modal nyitva: háttér scroll tiltása
 useEffect(() => {
  if (!showEditModal) return;

  const scrollY = window.scrollY;
  const prevOverflow = document.body.style.overflow;
  const prevPosition = document.body.style.position;
  const prevTop = document.body.style.top;
  const prevWidth = document.body.style.width;

  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  return () => {
    document.body.style.overflow = prevOverflow || "";
    document.body.style.position = prevPosition || "";
    document.body.style.top = prevTop || "";
    document.body.style.width = prevWidth || "";
    window.scrollTo(0, scrollY);
  };
}, [showEditModal]);


  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      calculateUserStats(user);
      fetchWishlist(user);
      fetchCollection(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, comments, games]);

  const fetchWishlist = async (u = user) => {
    if (!u) return;
    setLoading((prev) => ({ ...prev, wishlist: true }));
    try {
      const response = await axios.get(`http://localhost:3001/wishlist/${u.username}`);
      if (response.data.success) {
        setWishlist(response.data.wishlist);
        setUserStats((prev) => ({ ...prev, wishlist: response.data.wishlist }));
      }
    } catch (error) {
      console.error('Hiba a kívánságlista betöltésekor:', error);
    } finally {
      setLoading((prev) => ({ ...prev, wishlist: false }));
    }
  };

  const fetchCollection = async (u = user) => {
    if (!u) return;
    setLoading((prev) => ({ ...prev, collection: true }));
    try {
      const response = await axios.get(`http://localhost:3001/collection/${u.username}`);
      if (response.data.success) {
        setCollection(response.data.collection);
        setUserStats((prev) => ({ ...prev, collection: response.data.collection }));
      }
    } catch (error) {
      console.error('Hiba a gyűjtemény betöltésekor:', error);
    } finally {
      setLoading((prev) => ({ ...prev, collection: false }));
    }
  };

  // Fontos: itt ne a régi currentUser state-ből számoljunk, hanem a user/currentUser paraméterből
  const calculateUserStats = (u = currentUser) => {
    if (!u) return;

    const allComments = Object.values(comments || {}).flat();
    const userComments = allComments.filter((c) => c.user === u.username);

    const totalComments = userComments.length;

    const ratings = userComments.map((c) => c.rating);
    const averageRating =
      ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;

    const commentedGameIds = [...new Set(userComments.map((c) => c.gameId))];
    const commentedGames = (games || []).filter((game) => commentedGameIds.includes(game.id));

    const favoriteCategories = {};
    commentedGames.forEach((game) => {
      (game.categoryNames || []).forEach((category) => {
        favoriteCategories[category] = (favoriteCategories[category] || 0) + 1;
      });
    });

    setUserStats((prev) => ({
      ...prev,
      totalComments,
      averageRating,
      favoriteCategories,
      commentedGames,
      wishlist,
      collection,
    }));
  };

  const handleProfileEdit = () => setShowEditModal(true);

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    if (onProfileEdit) onProfileEdit(updatedUser);
  };

  const handleEditCancel = () => setShowEditModal(false);

  const handleAddToWishlist = async (gameId) => {
    if (!user) return;
    try {
      const response = await axios.post(`http://localhost:3001/wishlist/${user.username}/${gameId}`);
      if (response.data.success) {
        await fetchWishlist();
        alert("Játék hozzáadva a kívánságlistához!");
      } else {
        alert(response.data.message || "Hiba történt a kívánságlistához adáskor");
      }
    } catch (error) {
      console.error("Hiba a kívánságlistához adáskor:", error);
      alert("Hiba történt a kívánságlistához adáskor");
    }
  };

  const handleRemoveFromWishlist = async (gameId) => {
    if (!user) return;
    if (!window.confirm("Biztosan törlöd a játékot a kívánságlistáról?")) return;

    try {
      const response = await axios.delete(`http://localhost:3001/wishlist/${user.username}/${gameId}`);
      if (response.data.success) {
        await fetchWishlist();
        alert("Játék törölve a kívánságlistáról!");
      } else {
        alert(response.data.message || "Hiba történt a kívánságlistáról törléskor");
      }
    } catch (error) {
      console.error("Hiba a kívánságlistáról törléskor:", error);
      alert("Hiba történt a kívánságlistáról törléskor");
    }
  };

  const handleAddToCollection = async (gameId, status = "owned") => {
    if (!user) return;
    try {
      const response = await axios.post(`http://localhost:3001/collection/${user.username}/${gameId}`, {
        status,
      });
      if (response.data.success) {
        await fetchCollection();
        alert("Játék hozzáadva a gyűjteményhez!");
      } else {
        alert(response.data.message || "Hiba történt a gyűjteményhez adáskor");
      }
    } catch (error) {
      console.error("Hiba a gyűjteményhez adáskor:", error);
      alert("Hiba történt a gyűjteményhez adáskor");
    }
  };

  const handleUpdateCollection = async (gameId, updates) => {
    if (!user) return;
    console.log("Collection update:", { username: user.username, gameId, updates });

    try {
      const response = await axios.put(`http://localhost:3001/collection/${user.username}/${gameId}`, updates);
      if (response.data.success) {
        await fetchCollection();
      } else {
        alert(response.data.message || "Hiba történt a gyűjtemény frissítésekor");
      }
    } catch (error) {
      console.error("Hiba a gyűjtemény frissítésekor:", error);
      alert("Hiba történt a gyűjtemény frissítésekor");
    }
  };

  const handleRemoveFromCollection = async (gameId) => {
    if (!user) return;
    if (!window.confirm("Biztosan törlöd a játékot a gyűjteményből?")) return;

    try {
      const response = await axios.delete(`http://localhost:3001/collection/${user.username}/${gameId}`);
      if (response.data.success) {
        await fetchCollection();
        alert("Játék törölve a gyűjteményből!");
      } else {
        alert(response.data.message || "Hiba történt a gyűjteményből törléskor");
      }
    } catch (error) {
      console.error("Hiba a gyűjteményből törléskor:", error);
      alert("Hiba történt a gyűjteményből törléskor");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("hu-HU");
  };

  const getTopCategories = () => {
    return Object.entries(userStats.favoriteCategories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  if (!currentUser) {
    return (
      <div className="maincenter">
        <div className="login-prompt">
          <h2>Kérjük, jelentkezz be a profil megtekintéséhez!</h2>
          <Link to="/login" className="login-btn">
            Bejelentkezés
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="maincenter">
      <div>
        <h1>Profil</h1>
      </div>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.username} className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">{currentUser.username.charAt(0).toUpperCase()}</div>
            )}
          </div>

          <div className="profile-info">
            <h1>{currentUser.name || currentUser.username}</h1>
            <p className="username">@{currentUser.username}</p>
            <p className="email">{currentUser.email}</p>
            {currentUser.bio && <p className="bio">{currentUser.bio}</p>}

            <div className="personal-info">
              {currentUser.country && <p className="country">🌍 {currentUser.country}</p>}
              {currentUser.birthYear && <p className="birth-year">🎂 {currentUser.birthYear}</p>}
            </div>

            <div className="user-role">
              <span className={`role-badge ${currentUser.role}`}>
                {currentUser.role === "admin"
                  ? "Admin"
                  : currentUser.role === "gamedev"
                  ? "GameDev"
                  : "Felhasználó"}
              </span>
            </div>

            {currentUser.favoriteGenres && currentUser.favoriteGenres.length > 0 && (
              <div className="user-genres">
                <strong>Kedvenc műfajok:</strong>
                <div className="genre-tags">
                  {currentUser.favoriteGenres.map((genre, index) => (
                    <span key={index} className="genre-tag">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="profile-actions">
            <button onClick={handleProfileEdit} className="edit-profile-btn">
              ✏️ Profil szerkesztése
            </button>
            <button onClick={onLogout} className="logout-btn">
              🚪 Kijelentkezés
            </button>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            📊 Áttekintés
          </button>
          <button className={`tab-btn ${activeTab === "comments" ? "active" : ""}`} onClick={() => setActiveTab("comments")}>
            💬 Kommentjeim
          </button>
          <button className={`tab-btn ${activeTab === "wishlist" ? "active" : ""}`} onClick={() => setActiveTab("wishlist")}>
            ❤️ Kívánságlista
          </button>
          <button className={`tab-btn ${activeTab === "collection" ? "active" : ""}`} onClick={() => setActiveTab("collection")}>
            🎮 Játékgyűjtemény
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "overview" && (
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
                    .filter((c) => c.user === currentUser.username)
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 5)
                    .map((comment) => {
                      const game = games.find((g) => g.id === comment.gameId);
                      return (
                        <div key={comment.id} className="activity-item">
                          <div className="activity-content">
                            <span className="rating">{comment.rating}/10</span>
                            <span className="game-title">{game?.title || "Ismeretlen játék"}</span>
                            <span className="comment-text">{comment.text}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="comments-section">
              <h3>Összes komment ({userStats.totalComments})</h3>
              <div className="user-comments">
                {(() => {
                  const userComments = Object.values(comments)
                    .flat()
                    .filter((c) => c.user === currentUser.username);

                  const groupedByGame = userComments.reduce((acc, c) => {
                    const gid = c.gameId;
                    if (!acc[gid]) acc[gid] = [];
                    acc[gid].push(c);
                    return acc;
                  }, {});

                  const gameIds = Object.keys(groupedByGame);
                  if (gameIds.length === 0) {
                    return (
                      <div className="empty-state">
                        <p>Még nincs komment.</p>
                      </div>
                    );
                  }

                  return gameIds.map((gid) => {
                    const gameIdNum = Number(gid);
                    const game = games.find((g) => g.id === gameIdNum);
                    const gameComments = groupedByGame[gid] || [];

                    return (
                      <div key={gid} className="game-comments-card">
                        <div className="game-info">
                          {game?.image ? (
                            <img src={game.image} alt={game.title} className="game-thumbnail" />
                          ) : (
                            <div className="game-thumbnail" />
                          )}
                          <div>
                            <h4>{game?.title || `Ismeretlen játék (ID: ${gid})`}</h4>
                            <p>{game?.developer || ""}</p>
                          </div>
                        </div>

                        <div className="comments-list">
                          {gameComments.map((comment) => (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-header">
                                <span className="rating-badge">{comment.rating}/10</span>
                                <span className="comment-date">{formatDate(comment.datum)}</span>
                              </div>
                              <p className="comment-text">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="wishlist-section">
              <h3>Kívánságlista ({wishlist.length})</h3>

              {loading.wishlist ? (
                <div className="loading">Betöltés...</div>
              ) : wishlist.length === 0 ? (
                <div className="empty-state">
                  <p>Még nincs játék a kívánságlistádon.</p>
                  <p>Nézz körül a játékok között és adjd hozzá a kedvenceidet!</p>
                  <Link to="/" className="btn-primary">
                    Játékok megtekintése
                  </Link>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map((item) => (
                    <div key={item.id} className="wishlist-item">
                      <img src={item.image} alt={item.title} className="game-thumbnail" />
                      <div className="game-info">
                        <h4>{item.title}</h4>
                        <p>{item.developer}</p>
                        <p className="price">
                          {(() => {
                            const isFree = item.price == 0 || item.price == "0" || item.price === 0 || item.price === "0";
                            if (isFree) return "Ingyenes";
                            const currency = item.currency && item.currency.trim() !== "" ? item.currency : "FT";
                            return `${item.price} ${currency}`;
                          })()}
                        </p>
                      </div>

                      <div className="wishlist-actions">
                        <button
                          onClick={() => handleAddToCollection(item.gameId)}
                          className="btn-secondary"
                          title="Hozzáadás a gyűjteményhez"
                        >
                          🎮
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.gameId)}
                          className="btn-danger"
                          title="Törlés a kívánságlistáról"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "collection" && (
            <div className="collection-section">
              <h3>Játékgyűjtemény ({collection.length})</h3>

              {loading.collection ? (
                <div className="loading">Betöltés...</div>
              ) : collection.length === 0 ? (
                <div className="empty-state">
                  <p>Még nincs játék a gyűjteményedben.</p>
                  <p>Add hozzá azokat a játékokat, amiket már játszottál vagy birtokolsz!</p>
                  <Link to="/" className="btn-primary">
                    Játékok megtekintése
                  </Link>
                </div>
              ) : (
                <div className="collection-grid">
                  {collection.map((item) => (
                    <div key={item.id} className="collection-item">
                      <img src={item.image} alt={item.title} className="game-thumbnail" />
                      <div className="game-info">
                        <h4>{item.title}</h4>
                        <p>{item.developer}</p>

                        <p className="price">
                          {(() => {
                            const isFree = item.price == 0 || item.price == "0" || item.price === 0 || item.price === "0";
                            if (isFree) return "Ingyenes";
                            const currency = item.currency && item.currency.trim() !== "" ? item.currency : "FT";
                            return `${item.price} ${currency}`;
                          })()}
                        </p>

                        <div className="game-status">
                          <span className={`status-badge ${item.status}`}>
                            {item.status === "owned"
                              ? "Birtokolom"
                              : item.status === "played"
                              ? "Játszottam"
                              : item.status === "completed"
                              ? "Ki vittem"
                              : "Abbahagytam"}
                          </span>

                          {item.rating && <span className="rating-badge">{item.rating}/10</span>}
                        </div>

                        {item.notes && <p className="game-notes">{item.notes}</p>}
                      </div>

                      <div className="collection-actions">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateCollection(item.gameId, { status: e.target.value })}
                          className="status-select"
                        >
                          <option value="owned">Birtokolom</option>
                          <option value="played">Játszottam</option>
                          <option value="completed">Ki vittem</option>
                          <option value="abandoned">Abbahagytam</option>
                        </select>

                        <button
                          onClick={() => handleRemoveFromCollection(item.gameId)}
                          className="btn-danger"
                          title="Törlés a gyűjteményből"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <ProfileEdit user={currentUser} onProfileUpdate={handleProfileUpdate} onCancel={handleEditCancel} />
      )}
    </div>
  );
};

export default UserProfile;
