import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GameDevUpload from "./GameDevUpload.jsx";

const AdminPanel = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statistics, setStatistics] = useState({});
  const [pendingGames, setPendingGames] = useState([]);
  const [approvedGames, setApprovedGames] = useState([]);
  const [rejectedGames, setRejectedGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchStatistics();
    fetchPendingGames();
    fetchApprovedGames();
    fetchRejectedGames();
    fetchUsers();
    fetchComments();
  }, []);

  const getAxiosErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.message ||
      (typeof error?.response?.data?.error === 'string' ? error.response.data.error : null) ||
      (error?.response?.status ? `HTTP ${error.response.status}` : null) ||
      fallback
    );
  };

  const fetchStatistics = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/statistics", {
        params: { username: user.username }
      });
      if (res.data.success) {
        setStatistics(res.data.statistics);
      }
    } catch (error) {
      console.error("Statisztikák hiba:", error);
    }
  };

  const fetchApprovedGames = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/approved-games", {
        headers: { username: user.username }
      });
      if (res.data.success) {
        setApprovedGames(res.data.games);
      }
    } catch (error) {
      console.error("Jóváhagyott játékok hiba:", error);
    }
  };

  const fetchRejectedGames = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/rejected-games", {
        headers: { username: user.username }
      });
      if (res.data.success) {
        setRejectedGames(res.data.games);
      }
    } catch (error) {
      console.error("Elutasított játékok hiba:", error);
    }
  };

  const fetchPendingGames = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/pending-games", {
        headers: { username: user.username }
      });
      if (res.data.success) {
        setPendingGames(res.data.games);
        setLoading(false);
      }
    } catch (error) {
      console.error("Várakozó játékok hiba:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/users", {
        headers: { username: user.username }
      });
      if (res.data.success) {
        setUsers(res.data.users);
        setLoading(false);
      }
    } catch (error) {
      console.error("Felhasználók hiba:", error);
      setLoading(false);
    }
  };

  const handleApproveGame = async (gameId) => {
    try {
      const res = await axios.post(`http://localhost:3001/admin/approve-game/${gameId}`, {
        username: user.username,
        adminUsername: user.username
      });
      
      if (res.data.success) {
        alert("Játék jóváhagyva!");
        await fetchPendingGames();
        await fetchApprovedGames();
        await fetchRejectedGames();
        await fetchStatistics();
        // Kis késleltetés a state frissülésére
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Jóváhagyás hiba:", error);
      alert(getAxiosErrorMessage(error, "Hiba történt a jóváhagyás során!"));
    }
  };

  const handleRejectGame = async (gameId) => {
    const reason = prompt("Kérem, adja meg az elutasítás okát:");
    if (!reason) return;

    try {
      const res = await axios.post(`http://localhost:3001/admin/reject-game/${gameId}`, {
        username: user.username,
        rejectionReason: reason
      });
      
      if (res.data.success) {
        alert("Játék elutasítva!");
        await fetchPendingGames();
        await fetchApprovedGames();
        await fetchRejectedGames();
        await fetchStatistics();
        // Kis késleltetés a state frissülésére
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Elutasítás hiba:", error);
      alert(getAxiosErrorMessage(error, "Hiba történt az elutasítás során!"));
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Frontend role → Backend szerepkör konverzió
      const backendRole = newRole === 'user' ? 'felhasznalo' : newRole;
      
      const res = await axios.put(`http://localhost:3001/admin/users/${userId}/role`, {
        username: user.username,
        szerepkor: backendRole
      });
      
      if (res.data.success) {
        alert("Felhasználó szerepkör frissítve!");
        fetchUsers();
      }
    } catch (error) {
      console.error("Szerepkör módosítás hiba:", error);
      alert(getAxiosErrorMessage(error, "Hiba történt a szerepkör módosítás során!"));
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!confirm("Biztosan törli ezt a játékot?")) return;
    
    try {
      const res = await axios.delete(`http://localhost:3001/admin/games/${gameId}`, {
        headers: { username: user.username }
      });
      
      if (res.data.success) {
        alert("Játék törölve!");
        await fetchApprovedGames();
        await fetchPendingGames();
        await fetchStatistics();
        // Kis késleltetés a state frissülésére
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Játék törlés hiba:", error);
      alert(getAxiosErrorMessage(error, "Hiba történt a törlés során!"));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Biztosan törli ezt a felhasználót?")) return;
    
    try {
      const res = await axios.delete(`http://localhost:3001/admin/users/${userId}`, {
        headers: { username: user.username }
      });
      
      if (res.data.success) {
        alert("Felhasználó törölve!");
        await fetchUsers();
        await fetchStatistics();
        // Kis késleltetés a state frissülésére
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Felhasználó törlés hiba:", error);
      alert(getAxiosErrorMessage(error, "Hiba történt a törlés során!"));
    }
  };

  const handleEditGame = async (gameId) => {
    const game = approvedGames.find(g => g.id === gameId);
    if (!game) return;

    setEditingGame(game);
    setEditFormData({
      title: game.title,
      developer: game.developer,
      price: game.price,
      description: game.description,
      image: game.image,
      rating: game.rating,
      categories: game.categories
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveGame = async () => {
    if (!editingGame) return;

    try {
      const res = await axios.put(`http://localhost:3001/admin/games/${editingGame.id}`, editFormData, {
        headers: { username: user.username }
      });
      
      if (res.data.success) {
        alert("Játék adatai frissítve!");
        setEditingGame(null);
        setEditFormData({});
        await fetchApprovedGames();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Játék frissítés hiba:", error);
      const errorMessage = getAxiosErrorMessage(error, "Hiba történt a frissítés során!");
      alert(`Hiba történt a frissítés során! ${errorMessage}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingGame(null);
    setEditFormData({});
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get("http://localhost:3001/kommentek");
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (error) {
      console.error("Kommentek hiba:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Biztosan törli ezt a kommentet?")) return;
    
    try {
      const res = await axios.delete(`http://localhost:3001/kommentek/${commentId}`, {
        headers: { username: user.username }
      });
      
      if (res.data.success) {
        alert("Komment törölve!");
        await fetchComments();
        await fetchStatistics();
        // Kis késleltetés a state frissülésére
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Komment törlés hiba:", error);
      alert(getAxiosErrorMessage(error, "Hiba történt a törlés során!"));
    }
  };

  const StatCard = ({ title, value, color = "blue" }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="maincenter">
      {/* Navbar */}
      <nav>
        <a href="/" className="nav-link">Főoldal</a>
        <a href="/statistics" className="nav-link">Statisztikák</a>
        <a href="/profile" className="nav-link">Profil</a>
        <a href="/nevjegy" className="nav-link">Névjegy</a>
        <a href="/admin-panel" className="nav-link active">Admin Panel</a>
        <button 
          onClick={() => setActiveTab("game-upload")}
          className="nav-link"
          style={{ 
            background: activeTab === "game-upload" ? "#00d2d3" : "transparent",
            color: activeTab === "game-upload" ? "white" : "#00d2d3",
            border: "1px solid #00d2d3"
          }}
        >
          Játék Feltöltés
        </button>
      </nav>

      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button
          onClick={() => navigate("/")}
          className="vissza-btn"
        >
          Vissza a főoldalra
        </button>
      </div>

      <div className="admin-tabs">
        {["dashboard", "pending-games", "approved-games", "rejected-games", "users", "comments"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
          >
            {tab === "dashboard" && "Statisztikák"}
            {tab === "pending-games" && "Várakozó játékok"}
            {tab === "approved-games" && "Jóváhagyott játékok"}
            {tab === "rejected-games" && "Elutasított játékok"}
            {tab === "users" && "Felhasználók"}
            {tab === "comments" && "Kommentek"}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === "dashboard" && (
          <div>
            <h2>Statisztikák</h2>
            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <h3>Összes felhasználó</h3>
                <p>{statistics.total_users || 0}</p>
              </div>
              <div className="stat-card stat-green">
                <h3>Reguláris felhasználók</h3>
                <p>{statistics.regular_users || 0}</p>
              </div>
              <div className="stat-card stat-purple">
                <h3>GameDev felhasználók</h3>
                <p>{statistics.gamedev_users || 0}</p>
              </div>
              <div className="stat-card stat-red">
                <h3>Adminok</h3>
                <p>{statistics.admin_users || 0}</p>
              </div>
              <div className="stat-card stat-yellow">
                <h3>Összes játék</h3>
                <p>{statistics.total_games || 0}</p>
              </div>
              <div className="stat-card stat-green">
                <h3>Jóváhagyott játékok</h3>
                <p>{statistics.approved_games || 0}</p>
              </div>
              <div className="stat-card stat-orange">
                <h3>Várakozó játékok</h3>
                <p>{statistics.pending_games || 0}</p>
              </div>
              <div className="stat-card stat-red">
                <h3>Elutasított játékok</h3>
                <p>{statistics.rejected_games || 0}</p>
              </div>
              <div className="stat-card stat-blue">
                <h3>Összes komment</h3>
                <p>{statistics.total_comments || 0}</p>
              </div>
              <div className="stat-card stat-purple">
                <h3>Átlagos értékelés</h3>
                <p>{statistics.avg_rating ? statistics.avg_rating.toFixed(1) : "0"}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pending-games" && (
          <div>
            <h2>Várakozó játékok ({pendingGames.length})</h2>
            {pendingGames.length === 0 ? (
              <p className="no-data">Nincsenek várakozó játékok.</p>
            ) : (
              <div className="pending-games-list">
                {pendingGames.map((game) => (
                  <div key={game.id} className="pending-game-card">
                    <div className="pending-game-info">
                      <h3>{game.title}</h3>
                      <p>Fejlesztő: {game.developer}</p>
                      <p>Ár: {game.price}</p>
                      <p>Kategóriák: {game.categories}</p>
                      <p>Feltöltötte: {game.uploaded_by_name}</p>
                      <p className="game-desc">{game.description}</p>
                    </div>
                    <div className="pending-game-actions">
                      <button
                        onClick={() => handleApproveGame(game.id)}
                        className="approve-btn"
                      >
                        Jóváhagyás
                      </button>
                      <button
                        onClick={() => handleRejectGame(game.id)}
                        className="reject-btn"
                      >
                        Elutasítás
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "approved-games" && (
          <div>
            <h2>Jóváhagyott játékok ({approvedGames.length})</h2>
            
            {/* Szerkesztő Felület */}
            {editingGame && (
              <div className="edit-game-modal">
                <div className="edit-game-content">
                  <h3>Játék adatainak módosítása</h3>
                  <div className="edit-form-grid">
                    <div className="form-group">
                      <label className="form-label">Játék neve</label>
                      <input
                        type="text"
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditFormChange}
                        className="login-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Fejlesztő</label>
                      <input
                        type="text"
                        name="developer"
                        value={editFormData.developer}
                        onChange={handleEditFormChange}
                        className="login-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Ár</label>
                      <input
                        type="text"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditFormChange}
                        className="login-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Kép URL</label>
                      <input
                        type="url"
                        name="image"
                        value={editFormData.image}
                        onChange={handleEditFormChange}
                        className="login-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Értékelés (0-10)</label>
                      <input
                        type="number"
                        name="rating"
                        value={editFormData.rating}
                        onChange={handleEditFormChange}
                        min="0"
                        max="10"
                        className="login-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Kategóriák</label>
                      <input
                        type="text"
                        name="categories"
                        value={editFormData.categories}
                        onChange={handleEditFormChange}
                        placeholder="pl: FPS, RPG, Stratégia"
                        className="login-input"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label className="form-label">Leírás</label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        rows="4"
                        className="neon-textarea"
                      />
                    </div>
                  </div>
                  
                  <div className="edit-form-actions">
                    <button onClick={handleSaveGame} className="approve-btn">
                      Mentés
                    </button>
                    <button onClick={handleCancelEdit} className="reject-btn">
                      Mégse
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Játékok Lista */}
            {approvedGames.length === 0 ? (
              <p className="no-data">Nincsenek jóváhagyott játékok.</p>
            ) : (
              <div className="pending-games-list">
                {approvedGames.map((game) => (
                  <div key={game.id} className="pending-game-card">
                    <div className="pending-game-info">
                      <h3>{game.title}</h3>
                      <p>Fejlesztő: {game.developer}</p>
                      <p>Ár: {game.price}</p>
                      <p>Kategóriák: {game.categories}</p>
                      <p>Feltöltötte: {game.uploaded_by_name}</p>
                      <p className="game-desc">{game.description}</p>
                    </div>
                    <div className="pending-game-actions">
                      <button
                        onClick={() => handleEditGame(game.id)}
                        className="approve-btn"
                        style={{ marginRight: '10px' }}
                      >
                        Módosítás
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="reject-btn"
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "rejected-games" && (
          <div>
            <h2>Elutasított játékok ({rejectedGames.length})</h2>
            {rejectedGames.length === 0 ? (
              <p className="no-data">Nincsenek elutasított játékok.</p>
            ) : (
              <div className="pending-games-list">
                {rejectedGames.map((game) => (
                  <div key={game.id} className="pending-game-card">
                    <div className="pending-game-info">
                      <h3>{game.title}</h3>
                      <p>Fejlesztő: {game.developer}</p>
                      <p>Ár: {game.price === '0' || game.price === 0 ? 'Ingyenes' : `${game.price} ${game.currency || 'FT'}`}</p>
                      <p>Kategóriák: {game.categories}</p>
                      <p>Feltöltötte: {game.uploaded_by_name}</p>
                      {game.rejection_reason && (
                        <p className="rejection-reason" style={{ 
                          background: '#ffebee', 
                          border: '1px solid #f44336', 
                          borderRadius: '4px', 
                          padding: '8px', 
                          margin: '8px 0',
                          color: '#c62828'
                        }}>
                          <strong>Elutasítás oka:</strong> {game.rejection_reason}
                        </p>
                      )}
                      <p className="game-desc">{game.description}</p>
                    </div>
                    <div className="pending-game-actions">
                      <button
                        onClick={() => handleApproveGame(game.id)}
                        className="approve-btn"
                        style={{ marginRight: '10px' }}
                      >
                        Jóváhagyás
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="reject-btn"
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "game-upload" && (
          <GameDevUpload user={user} />
        )}

        {activeTab === "users" && (
          <div>
            <h2>Felhasználók ({users.length})</h2>
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Felhasználónév</th>
                    <th>Név</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.idfelhasznalo}>
                      <td>{userItem.idfelhasznalo}</td>
                      <td className="username-cell">{userItem.felhasznalonev}</td>
                      <td>{userItem.nev || "-"}</td>
                      <td>{userItem.email}</td>
                      <td>
                        <select
                          value={userItem.szerepkor === 'felhasznalo' ? 'user' : userItem.szerepkor}
                          onChange={(e) => handleRoleChange(userItem.idfelhasznalo, e.target.value)}
                          className="role-select"
                          disabled={userItem.idfelhasznalo === user.id}
                        >
                          <option value="user">User</option>
                          <option value="gamedev">GameDev</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        {userItem.idfelhasznalo === user.id && (
                          <span className="current-user-badge">Ön</span>
                        )}
                        {userItem.idfelhasznalo !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(userItem.idfelhasznalo)}
                            className="reject-btn"
                            style={{ marginLeft: '10px' }}
                          >
                            Törlés
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div>
            <h2>Kommentek ({comments.length})</h2>
            {comments.length === 0 ? (
              <p className="no-data">Nincsenek kommentek.</p>
            ) : (
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-card">
                    <div className="comment-info">
                      <h3>Komment ID: {comment.id}</h3>
                      <p>Felhasználó: {comment.user}</p>
                      <p>Játék ID: {comment.gameId}</p>
                      <p>Értékelés: {comment.rating}/10</p>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                    <div className="comment-actions">
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="reject-btn"
                      >
                        Törlés
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
  );
};

export default AdminPanel;
