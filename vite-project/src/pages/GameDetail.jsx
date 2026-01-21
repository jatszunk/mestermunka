import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function GameDetail({ user, games, comments, onDeleteGame, handleAddComment, fetchComments }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const game = games.find(g => String(g.id) === id);
  const allComments = comments[game?.id] || [];

  useEffect(() => {
    if (game?.id && typeof fetchComments === "function") {
      fetchComments(game.id);
    }
  }, [game?.id, fetchComments]);

  if (!game) return (
    <div className='maincenter'>
      <h2 style={{ color: '#19ffe3' }}>Játék nem található!</h2>
    </div>
  );
  const ownRating = allComments.find(c => c.user === (user && user.username));
  const globalRating = allComments.length
    ? (allComments.reduce((sum, v) => sum + v.rating, 0) / allComments.length).toFixed(2)
    : "Nincs értékelés";

  const [localComment, setLocalComment] = useState("");
  const [localRating, setLocalRating] = useState(5);

  return (
    <div className="maincenter">
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/profile" className="nav-link">{user ? "Profil" : "Bejelentkezés"}</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
      </nav>

      <h2>{game.title}</h2>

      <div className="game-card detail-card">
        <div className="game-image">
          <img src={game.image} alt={game.title} />
        </div>

        <div className="game-info" style={{ color: "white" }}>
          <div className="game-developer">{game.developer}</div>
          <span className="category-chip">{game.category}</span>

          <div className="game-requirements">
            <h4>Gépigény (minimum):</h4>
            <p>{game.requirements.minimum}</p>
            <h4>Ajánlott:</h4>
            <p>{game.requirements.recommended}</p>
          </div>

          <div><b>Leírás:</b> {game.description}</div>

          <div style={{ marginTop: 12, color: "white" }}>
            <b>Globális értékelés:</b> {globalRating}
            {user && <><br /><b>Saját értékelés:</b> {ownRating ? ownRating.rating : "Még nincs"}</>}
          </div>

          {user && (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAddComment(game.id, localComment, localRating);
                setLocalComment("");
                setLocalRating(5);
              }}
              style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "6px", maxWidth: "95%" }}
            >
              <input
                type="text"
                value={localComment}
                onChange={e => setLocalComment(e.target.value)}
                placeholder="Írj kommentet..."
                className="login-input"
                style={{ marginBottom: 0, width: "120px", fontSize: "0.98em", padding: "7px 6px" }}
                maxLength={60}
                required
              />
              <select
                value={localRating}
                onChange={e => setLocalRating(e.target.value)}
                className="login-input"
                style={{ width: "40px", padding: "5px 2px", fontSize: "1em" }}
              >
                {[...Array(10)].map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                ))}
              </select>
              <button type="submit" className="megtekintes-btn" style={{ padding: "5px 9px", fontSize: "0.98em", marginTop: 0 }}>
                Küldés
              </button>
            </form>
          )}

          <div>
            <b>Vélemények:</b>
            {allComments.length === 0 ? <div>Nincs még hozzászólás.</div>
              : allComments.map((cmt, i) => (
                <div key={i} style={{ background: '#23272f', borderRadius: '8px', margin: '6px 0', padding: '6px', color: '#fff', fontSize: "0.96em", maxWidth: "160px" }}>
                  <b>{cmt.user}</b>: {cmt.text} <span style={{ color: '#19ffe3' }}>({cmt.rating})</span>
                </div>
              ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 25
            }}
          >
            <button
              className="vissza-btn"
              style={{ marginTop: 0 }}
              onClick={() => navigate(-1)}
            >
              ⬅ Vissza
            </button>

            {user?.username === 'admin' && (
              <button
                type="button"
                onClick={async () => {
                  const ok = await onDeleteGame(game.id);
                  if (ok) {
                    alert("Játék sikeresen törölve!");
                    navigate("/");
                  } else {
                    alert("A játék törlése sikertelen!");
                  }
                }}
                
                style={{
                  fontSize: '0.9em',
                  background: '#93000f',
                  color: '#fff',
                  borderRadius: 6,
                  border: 'none',
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
                aria-label="Játék törlése"
                title="Játék törlése"
              >
                Játék törlése
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default GameDetail;

