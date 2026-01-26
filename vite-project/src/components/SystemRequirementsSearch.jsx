// Rendszerkövetelmény kereső komponens - 10/10-es UX
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SystemRequirementsSearch.css';

const SystemRequirementsSearch = () => {
  const [requirements, setRequirements] = useState([]);
  const [filteredRequirements, setFilteredRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    platform: 'all',
    requirementType: 'all',
    minRam: 0,
    minStorage: 0,
    gpuManufacturer: 'all',
    cpuCores: 0
  });

  // Mock adatok - később API hívás lesz
  const mockRequirements = [
    {
      id: 1,
      gameTitle: 'Project Castaway',
      gameImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1713350/header.jpg',
      platforms: ['Windows', 'macOS', 'Linux'],
      minimum: {
        os: { name: 'Windows 10', architecture: '64-bit' },
        cpu: { manufacturer: 'Intel', model: 'Core i3-8100', cores: 4, threads: 4, clockSpeed: 3.6 },
        memory: { size: 8, type: 'DDR4', speed: 2666 },
        gpu: { manufacturer: 'NVIDIA', model: 'GTX 1050 Ti', memory: 4, type: 'GDDR5' },
        storage: { size: 20, type: 'SSD', freeSpace: 25 },
        network: { type: 'Broadband', downloadSpeed: 10 }
      },
      recommended: {
        os: { name: 'Windows 11', architecture: '64-bit' },
        cpu: { manufacturer: 'Intel', model: 'Core i5-10400', cores: 6, threads: 12, clockSpeed: 4.3 },
        memory: { size: 16, type: 'DDR4', speed: 3200 },
        gpu: { manufacturer: 'NVIDIA', model: 'RTX 3060', memory: 12, type: 'GDDR6' },
        storage: { size: 20, type: 'NVMe SSD', freeSpace: 30 },
        network: { type: 'Broadband', downloadSpeed: 25 }
      }
    },
    {
      id: 2,
      gameTitle: 'Counter-Strike 2',
      gameImage: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
      platforms: ['Windows', 'macOS', 'Linux'],
      minimum: {
        os: { name: 'Windows 10', architecture: '64-bit' },
        cpu: { manufacturer: 'Intel', model: 'Core i3-4340', cores: 2, threads: 4, clockSpeed: 3.5 },
        memory: { size: 4, type: 'DDR3', speed: 1600 },
        gpu: { manufacturer: 'Intel', model: 'HD Graphics 4600', memory: 1, type: 'Shared' },
        storage: { size: 15, type: 'HDD', freeSpace: 20 },
        network: { type: 'Broadband', downloadSpeed: 5 }
      },
      recommended: {
        os: { name: 'Windows 10', architecture: '64-bit' },
        cpu: { manufacturer: 'Intel', model: 'Core i5-9400F', cores: 6, threads: 6, clockSpeed: 2.9 },
        memory: { size: 8, type: 'DDR4', speed: 2400 },
        gpu: { manufacturer: 'NVIDIA', model: 'GTX 1050 Ti', memory: 4, type: 'GDDR5' },
        storage: { size: 15, type: 'SSD', freeSpace: 25 },
        network: { type: 'Broadband', downloadSpeed: 10 }
      }
    }
  ];

  useEffect(() => {
    setRequirements(mockRequirements);
    setFilteredRequirements(mockRequirements);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, requirements]);

  const applyFilters = () => {
    let filtered = requirements.filter(req => {
      // Keresés név szerint
      const matchesSearch = req.gameTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Platform szűrés
      const matchesPlatform = filters.platform === 'all' || 
        req.platforms.includes(filters.platform);
      
      // RAM szűrés
      const matchesRam = filters.minRam === 0 || 
        req.minimum.memory.size >= filters.minRam;
      
      // Tárhely szűrés
      const matchesStorage = filters.minStorage === 0 || 
        req.minimum.storage.size >= filters.minStorage;
      
      // GPU gyártó szűrés
      const matchesGpu = filters.gpuManufacturer === 'all' || 
        req.minimum.gpu.manufacturer === filters.gpuManufacturer;
      
      // CPU magok szűrés
      const matchesCores = filters.cpuCores === 0 || 
        req.minimum.cpu.cores >= filters.cpuCores;
      
      return matchesSearch && matchesPlatform && matchesRam && 
             matchesStorage && matchesGpu && matchesCores;
    });
    
    setFilteredRequirements(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const getRequirementIcon = (type) => {
    const icons = {
      os: '🖥️',
      cpu: '⚙️',
      memory: '🧠',
      gpu: '🎮',
      storage: '💾',
      network: '🌐'
    };
    return icons[type] || '📋';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'Windows': '🪟',
      'macOS': '🍎',
      'Linux': '🐧',
      'SteamOS': '🎮'
    };
    return icons[platform] || '💻';
  };

  const renderRequirementCard = (req) => (
    <div key={req.id} className="requirement-card">
      <div className="card-header">
        <img src={req.gameImage} alt={req.gameTitle} className="game-image" />
        <div className="game-info">
          <h3>{req.gameTitle}</h3>
          <div className="platforms">
            {req.platforms.map(platform => (
              <span key={platform} className="platform-badge">
                {getPlatformIcon(platform)} {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="requirements-content">
        <div className="requirement-section">
          <h4>🔽 Minimum Követelmények</h4>
          <div className="requirement-grid">
            <div className="requirement-item">
              <span className="icon">{getRequirementIcon('os')}</span>
              <div className="details">
                <strong>OS:</strong> {req.minimum.os.name} {req.minimum.os.architecture}
              </div>
            </div>
            <div className="requirement-item">
              <span className="icon">{getRequirementIcon('cpu')}</span>
              <div className="details">
                <strong>CPU:</strong> {req.minimum.cpu.manufacturer} {req.minimum.cpu.model}
                <br />
                <small>{req.minimum.cpu.cores} mag / {req.minimum.cpu.threads} szál @ {req.minimum.cpu.clockSpeed}GHz</small>
              </div>
            </div>
            <div className="requirement-item">
              <span className="icon">{getRequirementIcon('memory')}</span>
              <div className="details">
                <strong>RAM:</strong> {req.minimum.memory.size}GB {req.minimum.memory.type}
                <br />
                <small>{req.minimum.memory.speed}MHz</small>
              </div>
            </div>
            <div className="requirement-item">
              <span className="icon">{getRequirementIcon('gpu')}</span>
              <div className="details">
                <strong>GPU:</strong> {req.minimum.gpu.manufacturer} {req.minimum.gpu.model}
                <br />
                <small>{req.minimum.gpu.memory}GB {req.minimum.gpu.memoryType}</small>
              </div>
            </div>
            <div className="requirement-item">
              <span className="icon">{getRequirementIcon('storage')}</span>
              <div className="details">
                <strong>Tárhely:</strong> {req.minimum.storage.size}GB {req.minimum.storage.type}
                <br />
                <small>Szükséges hely: {req.minimum.storage.freeSpace}GB</small>
              </div>
            </div>
            <div className="requirement-item">
              <span className="icon">{getRequirementIcon('network')}</span>
              <div className="details">
                <strong>Hálózat:</strong> {req.minimum.network.type}
                <br />
                <small>Letöltés: {req.minimum.network.downloadSpeed}Mbps</small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="requirement-section">
          <h4>⭐ Ajánlott Követelmények</h4>
          <div className="requirement-grid">
            <div className="requirement-item recommended">
              <span className="icon">{getRequirementIcon('os')}</span>
              <div className="details">
                <strong>OS:</strong> {req.recommended.os.name} {req.recommended.os.architecture}
              </div>
            </div>
            <div className="requirement-item recommended">
              <span className="icon">{getRequirementIcon('cpu')}</span>
              <div className="details">
                <strong>CPU:</strong> {req.recommended.cpu.manufacturer} {req.recommended.cpu.model}
                <br />
                <small>{req.recommended.cpu.cores} mag / {req.recommended.cpu.threads} szál @ {req.recommended.cpu.clockSpeed}GHz</small>
              </div>
            </div>
            <div className="requirement-item recommended">
              <span className="icon">{getRequirementIcon('memory')}</span>
              <div className="details">
                <strong>RAM:</strong> {req.recommended.memory.size}GB {req.recommended.memory.type}
                <br />
                <small>{req.recommended.memory.speed}MHz</small>
              </div>
            </div>
            <div className="requirement-item recommended">
              <span className="icon">{getRequirementIcon('gpu')}</span>
              <div className="details">
                <strong>GPU:</strong> {req.recommended.gpu.manufacturer} {req.recommended.gpu.model}
                <br />
                <small>{req.recommended.gpu.memory}GB {req.recommended.gpu.memoryType}</small>
              </div>
            </div>
            <div className="requirement-item recommended">
              <span className="icon">{getRequirementIcon('storage')}</span>
              <div className="details">
                <strong>Tárhely:</strong> {req.recommended.storage.size}GB {req.recommended.storage.type}
                <br />
                <small>Szükséges hely: {req.recommended.storage.freeSpace}GB</small>
              </div>
            </div>
            <div className="requirement-item recommended">
              <span className="icon">{getRequirementIcon('network')}</span>
              <div className="details">
                <strong>Hálózat:</strong> {req.recommended.network.type}
                <br />
                <small>Letöltés: {req.recommended.network.downloadSpeed}Mbps</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="system-requirements-search">
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/statistics" className="nav-link">Statisztikák</Link>
        <Link to="/system-requirements" className="nav-link active">Rendszerkövetelmények</Link>
        <Link to="/profile" className="nav-link">Profil</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
      </nav>

      <div className="search-header">
        <h1>🎮 Rendszerkövetelmény Kereső</h1>
        <p>Találd meg a tökéletes játékot a gépedhez!</p>
      </div>

      <div className="search-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Keresés játékokra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-panel">
          <h3>🎛️ Szűrők</h3>
          <div className="filter-grid">
            <div className="filter-group">
              <label>Platform</label>
              <select 
                value={filters.platform} 
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="filter-select"
              >
                <option value="all">Összes platform</option>
                <option value="Windows">🪟 Windows</option>
                <option value="macOS">🍎 macOS</option>
                <option value="Linux">🐧 Linux</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Minimum RAM (GB)</label>
              <select 
                value={filters.minRam} 
                onChange={(e) => handleFilterChange('minRam', parseInt(e.target.value))}
                className="filter-select"
              >
                <option value="0">Bármennyi</option>
                <option value="4">4 GB+</option>
                <option value="8">8 GB+</option>
                <option value="16">16 GB+</option>
                <option value="32">32 GB+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Minimum tárhely (GB)</label>
              <select 
                value={filters.minStorage} 
                onChange={(e) => handleFilterChange('minStorage', parseInt(e.target.value))}
                className="filter-select"
              >
                <option value="0">Bármekkora</option>
                <option value="10">10 GB+</option>
                <option value="20">20 GB+</option>
                <option value="50">50 GB+</option>
                <option value="100">100 GB+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>GPU gyártó</label>
              <select 
                value={filters.gpuManufacturer} 
                onChange={(e) => handleFilterChange('gpuManufacturer', e.target.value)}
                className="filter-select"
              >
                <option value="all">Bármelyik</option>
                <option value="NVIDIA">🟢 NVIDIA</option>
                <option value="AMD">🔴 AMD</option>
                <option value="Intel">🔵 Intel</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Minimum CPU magok</label>
              <select 
                value={filters.cpuCores} 
                onChange={(e) => handleFilterChange('cpuCores', parseInt(e.target.value))}
                className="filter-select"
              >
                <option value="0">Bármennyi</option>
                <option value="2">2 mag+</option>
                <option value="4">4 mag+</option>
                <option value="6">6 mag+</option>
                <option value="8">8 mag+</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h2>📊 Találatok ({filteredRequirements.length})</h2>
          {searchTerm && (
            <p>Keresés: "{searchTerm}"</p>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Találatok betöltése...</p>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Nincs találat</h3>
            <p>Próbáld módosítani a szűrőket vagy a keresési kifejezést!</p>
          </div>
        ) : (
          <div className="requirements-grid">
            {filteredRequirements.map(renderRequirementCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemRequirementsSearch;
