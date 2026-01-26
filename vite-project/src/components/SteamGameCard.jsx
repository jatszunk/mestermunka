// Steam-szerű Játék Kártya Komponens - Professzionális Megjelenés
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SteamGameCard.css';

const SteamGameCard = ({ game, onAddToWishlist, onQuickView, showQuickActions = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showWishlistAnimation, setShowWishlistAnimation] = useState(false);

  const formatPrice = (price, currency = 'HUF') => {
    if (price === 0 || price === '0' || price === null || price === undefined) {
      return 'Ingyenes';
    }
    
    const numPrice = parseFloat(price);
    if (currency === 'HUF') {
      return `${numPrice.toLocaleString('hu-HU')} Ft`;
    }
    return `${numPrice.toFixed(2)} ${currency}`;
  };

  const getDiscountPercentage = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return null;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const getRatingColor = (rating) => {
    if (rating >= 9) return '#4CAF50'; // Zöld
    if (rating >= 7) return '#FFC107'; // Sárga
    if (rating >= 5) return '#FF9800'; // Narancs
    return '#F44336'; // Piros
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowWishlistAnimation(true);
    if (onAddToWishlist) {
      onAddToWishlist(game);
    }
    setTimeout(() => setShowWishlistAnimation(false), 1000);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(game);
    }
  };

  const discountPercentage = getDiscountPercentage(game.ar, game.akcios_ar);
  const currentPrice = game.akcios_ar || game.ar;
  const originalPrice = game.ar;

  // Platform ikonok
  const getPlatformIcons = () => {
    const platforms = [];
    if (game.platforms && Array.isArray(game.platforms)) {
      if (game.platforms.includes('Windows')) platforms.push('🪟');
      if (game.platforms.includes('macOS')) platforms.push('🍎');
      if (game.platforms.includes('Linux')) platforms.push('🐧');
    }
    return platforms;
  };

  // Feature ikonok
  const getFeatureIcons = () => {
    const features = [];
    if (game.multiplayer) features.push('👥');
    if (game.co_op) features.push('🤝');
    if (game.achievements) features.push('🏆');
    if (game.cloud_save) features.push('☁️');
    if (game.controller_support) features.push('🎮');
    if (game.vr_support) features.push('🥽');
    return features;
  };

  return (
    <div 
      className={`steam-game-card ${isHovered ? 'hovered' : ''} ${showWishlistAnimation ? 'wishlist-animation' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Kép konténer */}
      <div className="game-image-container">
        <Link to={`/game/${game.slug || game.idjatekok}`}>
          {!imageLoaded && (
            <div className="image-placeholder">
              <div className="loading-spinner"></div>
            </div>
          )}
          <img
            src={game.kepurl || game.image || '/default-game.jpg'}
            alt={game.nev || game.title}
            className={`game-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = '/default-game.jpg';
              setImageLoaded(true);
            }}
          />
          
          {/* Overlay hover effektek */}
          <div className={`image-overlay ${isHovered ? 'visible' : ''}`}>
            <div className="overlay-content">
              <button 
                className="quick-view-btn"
                onClick={handleQuickViewClick}
                title="Gyorsnézet"
              >
                👁️
              </button>
              <button 
                className="wishlist-btn"
                onClick={handleWishlistClick}
                title="Kívánságlistára"
              >
                ❤️
              </button>
            </div>
          </div>
        </Link>

        {/* Akció jelző */}
        {discountPercentage && (
          <div className="discount-badge">
            -{discountPercentage}%
          </div>
        )}

        {/* Új játék jelző */}
        {game.new_release && (
          <div className="new-badge">
            ÚJ
          </div>
        )}

        {/* Coming Soon jelző */}
        {game.coming_soon && (
          <div className="coming-soon-badge">
            HAMAROSAN
          </div>
        )}

        {/* Platform ikonok */}
        <div className="platform-icons">
          {getPlatformIcons().map((icon, index) => (
            <span key={index} className="platform-icon">{icon}</span>
          ))}
        </div>
      </div>

      {/* Játék információk */}
      <div className="game-info">
        <Link to={`/game/${game.slug || game.idjatekok}`} className="game-title-link">
          <h3 className="game-title" title={game.nev || game.title}>
            {game.nev || game.title}
          </h3>
        </Link>

        {/* Fejlesztő és kiadó */}
        <div className="game-meta">
          <span className="developer">
            {game.fejleszto || game.developer || 'Ismeretlen fejlesztő'}
          </span>
          {game.kiado && game.kiado !== game.fejleszto && (
            <span className="publisher">
              • {game.kiado}
            </span>
          )}
        </div>

        {/* Értékelés */}
        {game.ertekeles && game.ertekeles > 0 && (
          <div className="rating-container">
            <div 
              className="rating-stars"
              style={{ color: getRatingColor(game.ertekeles) }}
            >
              {'★'.repeat(Math.round(game.ertekeles / 2))}{'☆'.repeat(5 - Math.round(game.ertekeles / 2))}
            </div>
            <span className="rating-number">
              {game.ertekeles.toFixed(1)}
            </span>
            {game.ertekelesek_szama && (
              <span className="rating-count">
                ({game.ertekelesek_szama.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Feature ikonok */}
        <div className="feature-icons">
          {getFeatureIcons().map((icon, index) => (
            <span key={index} className="feature-icon" title={icon}>
              {icon}
            </span>
          ))}
        </div>

        {/* Címkék */}
        {game.tags && Array.isArray(game.tags) && game.tags.length > 0 && (
          <div className="tags-container">
            {game.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {typeof tag === 'string' ? tag : tag.nev}
              </span>
            ))}
            {game.tags.length > 3 && (
              <span className="tag-more">+{game.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Ár információk */}
        <div className="price-container">
          {discountPercentage ? (
            <div className="discount-pricing">
              <span className="original-price">
                {formatPrice(originalPrice, game.penznem)}
              </span>
              <span className="current-price">
                {formatPrice(currentPrice, game.penznem)}
              </span>
            </div>
          ) : (
            <span className="current-price">
              {formatPrice(currentPrice, game.penznem)}
            </span>
          )}
        </div>

        {/* Gyors akció gombok */}
        {showQuickActions && isHovered && (
          <div className="quick-actions">
            <button 
              className="action-btn primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Játék vásárlás/megnyitás logika
              }}
            >
              {currentPrice > 0 ? 'Vásárlás' : 'Ingyenes Játék'}
            </button>
            <button 
              className="action-btn secondary"
              onClick={handleWishlistClick}
            >
              ❤️ Kívánságlista
            </button>
          </div>
        )}

        {/* Statisztikák */}
        <div className="game-stats">
          {game.views_count > 0 && (
            <span className="stat" title="Megtekintések">
              👁️ {game.views_count.toLocaleString()}
            </span>
          )}
          {game.wishlist_count > 0 && (
            <span className="stat" title="Kívánságlistán">
              ❤️ {game.wishlist_count.toLocaleString()}
            </span>
          )}
          {game.purchase_count > 0 && (
            <span className="stat" title="Vásárlók">
              🛒 {game.purchase_count.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Wishlist animáció */}
      {showWishlistAnimation && (
        <div className="wishlist-animation-overlay">
          <div className="wishlist-heart">❤️</div>
          <div className="wishlist-text">Kívánságlistára helyezve!</div>
        </div>
      )}
    </div>
  );
};

export default SteamGameCard;
