import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function getYouTubeEmbedUrl(url) {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

function GameDetail({ user, games, comments, onDeleteGame, handleAddComment, fetchComments }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const game = games.find((g) => String(g.id) === id);
  const allComments = comments[game?.id] || [];

  const [videos, setVideos] = useState([]);
  const [extra, setExtra] = useState(null);

  const [localComment, setLocalComment] = useState("");
  const [localRating, setLocalRating] = useState(5);

  useEffect(() => {
    if (game?.id && typeof fetchComments === "function") {
      fetchComments(game.id);
    }
  }, [game?.id, fetchComments]);

  useEffect(() => {
    if (!game?.id) return;

    axios.get(`http://localhost:3001/jatekok/${game.id}/videok`).then((res) => {
      if (res.data.success) setVideos(res.data.videos || []);
    });
  }, [game?.id]);

  useEffect(() => {
    if (!game?.id) return;

    axios.get(`http://localhost:3001/jatekok/${game.id}/extra`).then((res) => {
      if (res.data.success) setExtra(res.data.extra);
    });
  }, [game?.id]);

  if (!game) {
    return (
      <div className="maincenter">
        <h2 style={{ color: "#19ffe3" }}>Játék nem található!</h2>
      </div>
    );
  }

  const ownRating = user ? allComments.find((c) => c.user === user.username) : null;
  const globalRating = allComments.length
    ? (allComments.reduce((sum, v) => sum + Number(v.rating || 0), 0) / allComments.length).toFixed(2)
    : "Nincs értékelés";

  return (
    <div className="maincenter">
      <nav>
        <Link to="/" className="nav-link">
          Főoldal
        </Link>
        <Link to="/profile" className="nav-link">
          {user ? "Profil" : "Bejelentkezés"}
        </Link>
        <Link to="/nevjegy" className="nav-link">
          Névjegy
        </Link>
      </nav>

      <h2>{game.title}</h2>

      {/* 3 OSZLOP: BAL videó / KÖZÉP gamecard / JOBB extra */}
      <div className="detail-3col">
        {/* BAL: videók */}
        <div className="detail-left">
          <h3 style={{ color: "#19ffe3", marginTop: 0 }}>Videók</h3>

          {videos.length === 0 ? (
            <div style={{ color: "white" }}>Nincs videó ehhez a játékhoz.</div>
          ) : (
            videos.map((v) => {
              const embed = getYouTubeEmbedUrl(v.url);
              return (
                <div key={v.id} className="video-box">
                  {embed ? (
                    <iframe
                      width="100%"
                      height="220"
                      src={embed}
                      title="YouTube video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: 10 }}
                    />
                  ) : (
                    <a href={v.url} target="_blank" rel="noreferrer" style={{ color: "#27e8ff" }}>
                      {v.url}
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* KÖZÉP: GameCard EGYBEN */}
        <div className="detail-center">
          <div className="game-card detail-card">
            <div className="game-image">
              <img src={game.image} alt={game.title} />
            </div>

            <div className="game-info" style={{ color: "white" }}>
              <div className="game-developer">{game.developer}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
  {(Array.isArray(game.categories) && game.categories.length ? game.categories : [game.category || "Egyéb"])
    .filter(Boolean)
    .map((cat) => (
      <span key={cat} className="category-chip">
        {cat}
      </span>
    ))}
</div>


              <div className="game-requirements">
                <h4>Gépigény (minimum)</h4>
                <p>{game.requirements?.minimum || game.minimum || game.minReq || "Nincs megadva"}</p>
<h4>Ajánlott</h4>
<p>{game.requirements?.recommended || game.recommended || game.recReq || "Nincs megadva"}</p>

              </div>

              <div>
                <b>Leírás</b>
                <div className="leirass">{game.description}</div>
              </div>

              <div style={{ marginTop: 12, color: "white" }}>
                <b>Globális értékelés:</b> {globalRating}
                <br />
                {user && (
                  <>
                    <b>Saját értékelés:</b> {ownRating ? ownRating.rating : "Még nincs"}
                  </>
                )}
              </div>

              {user && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddComment(game.id, localComment, localRating);
                    setLocalComment("");
                    setLocalRating(5);
                  }}
                  style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: 6, maxWidth: "95%" }}
                >
                  <input
                    type="text"
                    value={localComment}
                    onChange={(e) => setLocalComment(e.target.value)}
                    placeholder="Írj kommentet..."
                    className="login-input"
                    style={{ marginBottom: 0, width: 160, fontSize: "0.98em", padding: "7px 6px" }}
                    maxLength={60}
                    required
                  />
                  <select
                    value={localRating}
                    onChange={(e) => setLocalRating(e.target.value)}
                    className="login-input"
                    style={{ width: 54, padding: "5px 2px", fontSize: "1em" }}
                  >
                    {[...Array(10)].map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {idx + 1}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="megtekintes-btn" style={{ padding: "5px 9px", fontSize: "0.98em" }}>
                    Küldés
                  </button>
                </form>
              )}

              <div>
                <b>Vélemények</b>
                {allComments.length === 0 ? (
                  <div>Nincs még hozzászólás.</div>
                ) : (
                  allComments.map((cmt) => (
                    <div
                      key={cmt.id}
                      style={{
                        background: "#23272f",
                        borderRadius: 8,
                        margin: "6px 0",
                        padding: 6,
                        color: "#fff",
                        fontSize: "0.96em",
                        maxWidth: 520,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: "1 1 auto" }}>
                        <b>{cmt.user}</b> {cmt.text} <span style={{ color: "#19ffe3" }}>{cmt.rating}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 25 }}>
                <button className="vissza-btn" style={{ marginTop: 0 }} onClick={() => navigate(-1)}>
                  Vissza
                </button>

                {user?.role === 'admin' && (
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
                      fontSize: "0.9em",
                      background: "#93000f",
                      color: "#fff",
                      borderRadius: 6,
                      border: "none",
                      padding: "6px 12px",
                      cursor: "pointer",
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

        {/* JOBB: extra infók DB-ből */}
        <div className="detail-right">
          <h3 style={{ color: "#19ffe3", marginTop: 0 }}>Extra infók</h3>

          {!extra ? (
            <div style={{ color: "white" }}>Nincs extra információ.</div>
          ) : (
            <div style={{ color: "white", lineHeight: 1.6 }}>
              <div>
                <b>Megjelenés:</b> {extra.megjelenes}
              </div>

              <div style={{ marginTop: 6 }}>
                <b>Steam:</b>{" "}
                <a href={extra.steamLink} target="_blank" rel="noreferrer" style={{ color: "#27e8ff" }}>
                  {extra.steamLink}
                </a>
              </div>

              <div style={{ marginTop: 12 }}>
                <b>Részletes leírás:</b>
              </div>
              <div className="leirass">{extra.reszletesLeiras}</div>

              {extra.jatekElmeny && (
                <>
                  <div style={{ marginTop: 12 }}>
                    <b>Játék élménye:</b>
                  </div>
                  <div className="leirass">{extra.jatekElmeny}</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameDetail;
