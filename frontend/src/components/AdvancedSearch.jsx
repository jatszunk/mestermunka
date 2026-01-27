import React, { useState, useEffect } from 'react';

const AdvancedSearch = ({ games, onFilterChange, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [ratingRange, setRatingRange] = useState({ min: 0, max: 10 });
  const [sortBy, setSortBy] = useState('title-asc');
  const [platforms, setPlatforms] = useState([]);
  const [isFree, setIsFree] = useState(false);

  // Extract unique categories and platforms from games
  const allCategories = [...new Set(games.flatMap(g => g.categories || []))];
  const allPlatforms = [...new Set(games.flatMap(g => g.platforms || []))];

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategories, priceRange, ratingRange, sortBy, platforms, isFree]);

  const applyFilters = () => {
    let filtered = [...games];

    // Search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.developer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(game =>
        selectedCategories.some(cat => game.categories?.includes(cat))
      );
    }

    // Price range filter
    if (priceRange.min !== '') {
      filtered = filtered.filter(game => {
        const price = game.price === 'Ingyenes' ? 0 : parseFloat(game.price) || 0;
        return price >= parseFloat(priceRange.min);
      });
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(game => {
        const price = game.price === 'Ingyenes' ? 0 : parseFloat(game.price) || 0;
        return price <= parseFloat(priceRange.max);
      });
    }

    // Free games filter
    if (isFree) {
      filtered = filtered.filter(game => game.price === 'Ingyenes');
    }

    // Rating range filter
    filtered = filtered.filter(game => 
      game.rating >= ratingRange.min && game.rating <= ratingRange.max
    );

    // Platform filter
    if (platforms.length > 0) {
      filtered = filtered.filter(game =>
        platforms.some(platform => game.platforms?.includes(platform))
      );
    }

    // Sorting
    const [sortField, sortOrder] = sortBy.split('-');
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'price') {
        aVal = a.price === 'Ingyenes' ? 0 : parseFloat(a.price) || 0;
        bVal = b.price === 'Ingyenes' ? 0 : parseFloat(b.price) || 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    onFilterChange(filtered);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePlatformToggle = (platform) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setRatingRange({ min: 0, max: 10 });
    setSortBy('title-asc');
    setPlatforms([]);
    setIsFree(false);
  };

  return (
    <div className="advanced-search">
      <div className="search-header">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Keresés játékokra..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="advanced-toggle-btn"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '▲' : '▼'} Részletes keresés
          </button>
        </div>
        
        <div className="quick-sort">
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="title-asc">Név (A-Z)</option>
            <option value="title-desc">Név (Z-A)</option>
            <option value="price-asc">Ár (alacsony→magas)</option>
            <option value="price-desc">Ár (magas→alacsony)</option>
            <option value="rating-desc">Értékelés (magas→alacsony)</option>
            <option value="rating-asc">Értékelés (alacsony→magas)</option>
          </select>
        </div>
      </div>

      {isOpen && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h3>Kategóriák</h3>
            <div className="checkbox-group">
              {allCategories.map(category => (
                <label key={category} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Ár tartomány</h3>
            <div className="price-range">
              <input
                type="number"
                placeholder="Minimum"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Maximum"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="price-input"
              />
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              Csak ingyenes játékok
            </label>
          </div>

          <div className="filter-section">
            <h3>Értékelés</h3>
            <div className="rating-range">
              <input
                type="range"
                min="0"
                max="10"
                value={ratingRange.min}
                onChange={(e) => setRatingRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                className="rating-slider"
              />
              <span>{ratingRange.min}</span>
              <span>-</span>
              <input
                type="range"
                min="0"
                max="10"
                value={ratingRange.max}
                onChange={(e) => setRatingRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="rating-slider"
              />
              <span>{ratingRange.max}</span>
            </div>
          </div>

          {allPlatforms.length > 0 && (
            <div className="filter-section">
              <h3>Platformok</h3>
              <div className="checkbox-group">
                {allPlatforms.map(platform => (
                  <label key={platform} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform)}
                      onChange={() => handlePlatformToggle(platform)}
                    />
                    {platform}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="filter-actions">
            <button onClick={resetFilters} className="reset-btn">
              Szűrők törlése
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
