import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminPanel = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statistics, setStatistics] = useState({});
  const [pendingGames, setPendingGames] = useState([]);
  const [approvedGames, setApprovedGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [comments, setComments] = useState([]);
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    developer: "",
    price: "",
    category: "",
    image: "",
    minReq: "",
    recReq: "",
    desc: "",
    rating: 0,
    videos: [""],
    megjelenes: "",
    steamLink: "",
    jatekElmeny: "",
    reszletesLeiras: "",
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
    fetchPendingGames();
    fetchApprovedGames();
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

  // Játék feltöltéshez szükséges függvények
  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoChange = (index, value) => {
    const newVideos = [...uploadFormData.videos];
    newVideos[index] = value;
    setUploadFormData(prev => ({
      ...prev,
      videos: newVideos
    }));
  };

  const addVideoField = () => {
    setUploadFormData(prev => ({
      ...prev,
      videos: [...prev.videos, ""]
    }));
  };

  const handleGameUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/gamedev/upload-game", {
        ...uploadFormData,
        username: user.username
      });

      if (res.data.success) {
        alert("Játék sikeresen feltöltve, jóváhagyásra vár!");
        setUploadFormData({
          title: "",
          developer: "",
          price: "",
          category: "",
          image: "",
          minReq: "",
          recReq: "",
          desc: "",
          rating: "",
          videos: [""],
          megjelenes: "",
          steamLink: "",
          jatekElmeny: "",
          reszletesLeiras: ""
        });
        await fetchPendingGames();
        await fetchStatistics();
      }
    } catch (error) {
      console.error("Játék feltöltési hiba:", error);
      alert(getAxiosErrorMessage(error, "Hiba történt a játék feltöltése során!"));
    } finally {
      setUploadLoading(false);
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
        {["dashboard", "pending-games", "approved-games", "users", "comments"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
          >
            {tab === "dashboard" && "Statisztikák"}
            {tab === "pending-games" && "Várakozó játékok"}
            {tab === "approved-games" && "Jóváhagyott játékok"}
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

        {activeTab === "game-upload" && (
          <div>
            <h2>Játék Feltöltés</h2>
            <form onSubmit={handleGameUpload} className="upload-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Játék neve *</label>
                  <input
                    type="text"
                    name="title"
                    value={uploadFormData.title}
                    onChange={handleUploadChange}
                    className="login-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Fejlesztő *</label>
                  <input
                    type="text"
                    name="developer"
                    value={uploadFormData.developer}
                    onChange={handleUploadChange}
                    className="login-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ár *</label>
                  <input
                    type="number"
                    name="price"
                    value={uploadFormData.price}
                    onChange={handleUploadChange}
                    className="login-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Kategóriák *</label>
                  <input
                    type="text"
                    name="category"
                    value={uploadFormData.category}
                    onChange={handleUploadChange}
                    className="login-input"
                    placeholder="pl: FPS, RPG, Stratégia"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Kép URL *</label>
                  <input
                    type="url"
                    name="image"
                    value={uploadFormData.image}
                    onChange={handleUploadChange}
                    className="login-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Értékelés (0-10)</label>
                  <input
                    type="number"
                    name="rating"
                    value={uploadFormData.rating}
                    onChange={handleUploadChange}
                    className="login-input"
                    min="0"
                    max="10"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Megjelenés dátuma *</label>
                  <input
                    type="date"
                    name="megjelenes"
                    value={uploadFormData.megjelenes}
                    onChange={handleUploadChange}
                    className="login-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Steam Link *</label>
                  <input
                    type="url"
                    name="steamLink"
                    value={uploadFormData.steamLink}
                    onChange={handleUploadChange}
                    className="login-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Minimum rendszerkövetelmények</label>
                  <textarea
                    name="minReq"
                    value={uploadFormData.minReq}
                    onChange={handleUploadChange}
                    className="neon-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ajánlott rendszerkövetelmények</label>
                  <textarea
                    name="recReq"
                    value={uploadFormData.recReq}
                    onChange={handleUploadChange}
                    className="neon-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Játék élmény</label>
                  <textarea
                    name="jatekElmeny"
                    value={uploadFormData.jatekElmeny}
                    onChange={handleUploadChange}
                    className="neon-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Leírás *</label>
                  <textarea
                    name="desc"
                    value={uploadFormData.desc}
                    onChange={handleUploadChange}
                    className="neon-textarea"
                    rows="4"
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Részletes leírás *</label>
                  <textarea
                    name="reszletesLeiras"
                    value={uploadFormData.reszletesLeiras}
                    onChange={handleUploadChange}
                    className="neon-textarea"
                    rows="6"
                    required
                  />
                </div>
              </div>
              
              <div className="videos-section">
                <h3>Videók</h3>
                {uploadFormData.videos.map((video, index) => (
                  <div key={index} className="video-input-group">
                    <input
                      type="url"
                      value={video}
                      onChange={(e) => handleVideoChange(index, e.target.value)}
                      className="login-input"
                      placeholder="Video URL"
                    />
                    {uploadFormData.videos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(index)}
                        className="remove-video-btn"
                      >
                        Törlés
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVideoField}
                  className="add-video-btn"
                >
                  + Video hozzáadása
                </button>
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="approve-btn"
                >
                  {uploadLoading ? "Feltöltés..." : "Játék feltöltése"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className="reject-btn"
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
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
