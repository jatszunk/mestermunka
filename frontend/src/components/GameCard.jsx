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
          <span className="rating-star">⭐ Értékelés:</span>
          <span>{globalRating}</span>
        </div>
        <div className="game-developer">{game.developer}</div>


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



      </div>
    </div>
  );
}

export default GameCard;
