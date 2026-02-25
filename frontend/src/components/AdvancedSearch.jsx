import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdvancedSearch = ({ onSearch, onFilter, games }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    platforms: [],
    priceRange: { min: 0, max: 150000 },
    rating: { min: 0, max: 10 },
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Kategóriák és platformok betöltése az adatbázisból
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, platformsResponse] = await Promise.all([
          axios.get('http://localhost:3001/categories'),
          axios.get('http://localhost:3001/platforms')
        ]);
        
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories);
        }
        
        if (platformsResponse.data.success) {
          setPlatforms(platformsResponse.data.platforms);
        }
      } catch (error) {
        console.error('Hiba az adatok betöltésekor:', error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    if (searchTerm.length > 2) {
      // Simulated search suggestions - in real app, this would be an API call
      const mockSuggestions = [
        `${searchTerm} - Akció játék`,
        `${searchTerm} - RPG játék`,
        `${searchTerm} - Stratégia játék`
      ].slice(0, 5);
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters };
    
    if (filterName.includes('.')) {
      const keys = filterName.split('.');
      let current = newFilters;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      newFilters[filterName] = value;
    }
    
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];
    handleFilterChange('categories', newCategories);
  };

  const handlePlatformToggle = (platformId) => {
    const newPlatforms = filters.platforms.includes(platformId)
      ? filters.platforms.filter(p => p !== platformId)
      : [...filters.platforms, platformId];
    handleFilterChange('platforms', newPlatforms);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      platforms: [],
      priceRange: { min: 0, max: 150000 },
      rating: { min: 0, max: 10 }
    });
    setSearchTerm('');
    if (onFilter) onFilter({});
    if (onSearch) onSearch('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.platforms.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 150000) count++;
    if (filters.rating.min > 0 || filters.rating.max < 10) count++;
    return count;
  };

  return (
    <div className="advanced-search">
      {/* Basic Search */}
      <div className="search-header">
        <div className="search-bar">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Keress játékokra, fejlesztőkre, kategóriákra..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              🔍
            </button>
          </div>
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSearch(suggestion.split(' - ')[0])}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="search-controls">
          <button
            className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            🎛️ Részletes szűrés
            {getActiveFiltersCount() > 0 && (
              <span className="filter-count">{getActiveFiltersCount()}</span>
            )}
          </button>
          
          {getActiveFiltersCount() > 0 && (
            <button className="clear-filters" onClick={clearFilters}>
              🗑️ Szűrők törlése
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h3>🏷️ Kategóriák</h3>
            <div className="filter-options">
              {categories.map(category => (
                <button
                  key={category.idkategoria}
                  className={`filter-chip ${filters.categories.includes(category.idkategoria.toString()) ? 'active' : ''}`}
                  onClick={() => handleCategoryToggle(category.idkategoria.toString())}
                >
                  {category.nev}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>🎮 Platformok</h3>
            <div className="filter-options">
              {platforms.map(platform => (
                <button
                  key={platform.idplatform}
                  className={`filter-chip ${filters.platforms.includes(platform.idplatform.toString()) ? 'active' : ''}`}
                  onClick={() => handlePlatformToggle(platform.idplatform.toString())}
                >
                  {platform.nev}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-section">
              <h3>💰 Ár tartomány</h3>
              <div className="range-filter">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange.min', parseInt(e.target.value) || 0)}
                  className="range-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange.max', parseInt(e.target.value) || 150000)}
                  className="range-input"
                />
                <span>Ft</span>
              </div>
            </div>

            <div className="filter-section">
              <h3>⭐ Értékelés</h3>
              <div className="range-filter">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="10"
                  value={filters.rating.min}
                  onChange={(e) => handleFilterChange('rating.min', parseFloat(e.target.value) || 0)}
                  className="range-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="10"
                  value={filters.rating.max}
                  onChange={(e) => handleFilterChange('rating.max', parseFloat(e.target.value) || 10)}
                  className="range-input"
                />
                <span>/10</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
