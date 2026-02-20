import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";


function GameCard({ game, user, comments, onAddComment, onAddToWishlist, onAddToCollection }) {
  const ownRating = comments.find(c => c.user === (user && user.username));
  const globalRating = comments.length
    ? (comments.reduce((sum, v) => sum + v.rating, 0) / comments.length).toFixed(2)
    : "Nincs";
  const [localComment, setLocalComment] = useState("");
  const [localRating, setLocalRating] = useState(5);
  const [showAllComments, setShowAllComments] = useState(false);

  // Csak az első 2 kommentet mutatjuk, ha nincs engedélyezve az összes mutatása
  const displayedComments = showAllComments ? comments : comments.slice(0, 2);

  return (
     
    <div className="game-card">
      <div className="game-image">
        <img src={game.image} alt={game.title} />
      </div>

      <div className="game-info" style={{ color: "white" }}>
        <h3 className="game-title">{game.title}</h3>
        <div className="game-rating-badge">
          <span className="rating-star">⭐</span>
          <span>{game.rating}</span>
        </div>
        <div className="game-developer">{game.developer}</div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
  {(Array.isArray(game.categoryNames) && game.categoryNames.length ? game.categoryNames : [game.category || "Egyéb"])
    .filter(Boolean)
    .map((cat) => (
      <span key={cat} className="category-chip">
        {cat}
      </span>
    ))}
</div>


        <div className="game-requirements">
          <h4>Gépigény (minimum):</h4>
          <p>{game.requirements?.minimum || "Nincs megadva"}</p>
        </div>

        <div className="game-requirements">
          <h4>Gépigény (ajánlott):</h4>
          <p>{game.requirements?.recommended || "Nincs megadva"}</p>
        </div>

        <div style={{ marginTop: 12 }}>
          <b>Globális értékelés:</b> {globalRating}
          {user && <><br /><b>Saját értékelés:</b> {ownRating ? ownRating.rating : "Még nincs"}</>}
        </div>

        <div className="game-footer">
          <span className="game-price">
            {(() => {
              const isFree = game.price == 0 || game.price == "0" || game.price === 0 || game.price === "0";
              if (isFree) {
                return "Ingyenes";
              }
              const currency = game.currency && game.currency.trim() !== '' ? game.currency : 'FT';
              return `${game.price} ${currency}`;
            })()}
          </span>
          <div className="game-actions">
            {user && (
              <>
                <button 
                  onClick={() => onAddToWishlist(game.id)}
                  className="wishlist-btn"
                  title="Hozzáadás a kívánságlistához"
                >
                  ❤️
                </button>
                <button 
                  onClick={() => onAddToCollection(game.id)}
                  className="collection-btn"
                  title="Hozzáadás a gyűjteményhez"
                >
                  🎮
                </button>
              </>
            )}
            <Link to={`/game/${game.id}`}>
              <button className="megtekintes-btn">Megtekintés</button>
            </Link>
          </div>
        </div>

        {user && (
          <form
            onSubmit={e => {
              e.preventDefault();
              onAddComment(game.id, localComment, localRating);
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
          {comments.length === 0 ? (
            <div>Nincs még hozzászólás.</div>
          ) : (
            <>
              {displayedComments.map((cmt, i) => (
                <div
                  key={i}
                  style={{
                    background: '#23272f',
                    borderRadius: '8px',
                    margin: '6px 0',
                    padding: '6px',
                    color: '#fff',
                    fontSize: "0.96em",
                    maxWidth: "220px",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <div style={{ flex: "1 1 auto" }}>
                    <b>{cmt.user}</b>: {cmt.text} <span style={{ color: '#19ffe3' }}>({cmt.rating})</span>
                  </div>
                </div>
              ))}
              
              {/* Ha több mint 2 komment van és nem mutatjuk mindet, akkor mutassunk egy gombot */}
              {comments.length > 2 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  style={{
                    background: '#19ffe3',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#000',
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    margin: '4px 0'
                  }}
                >
                  Mutasd az összes ({comments.length - 2} további)
                </button>
              )}
              
              {/* Ha már mutatjuk az összeset, akkor lehetőség a bezárásra */}
              {showAllComments && (
                <button
                  onClick={() => setShowAllComments(false)}
                  style={{
                    background: '#666',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#fff',
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    margin: '4px 0'
                  }}
                >
                  Kevesebb mutatása
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default GameCard;
