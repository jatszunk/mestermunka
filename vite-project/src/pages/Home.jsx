
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard.jsx';

function Home({ user, games, comments, filterSortGames, handleAddComment, handleDeleteComment }) {
  const [selectedCategory, setSelectedCategory] = useState('Összes');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');

  const categories = [
    "Összes",
    ...new Set(games.flatMap((g) => (Array.isArray(g.categories) ? g.categories : []))),
  ];
  
  const filteredGames = filterSortGames(games, search, selectedCategory, sort);

  return (
    <div className="maincenter">
      <nav>
        <Link to="/" className="nav-link">Főoldal</Link>
        <Link to="/profile" className="nav-link">{user ? "Profil" : "Bejelentkezés"}</Link>
        <Link to="/nevjegy" className="nav-link">Névjegy</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">Admin Panel</Link>
        )}
        {(user?.role === 'gamedev' || user?.role === 'admin') && (
          <Link to="/gamedev-upload" className="nav-link">Játék Feltöltés</Link>
        )}
        {user?.username === 'admin' && (
          <Link to="/addgame" className="nav-link">Új játék (régi)</Link>
        )}
      </nav>

      <h1>Játéklista</h1>

      <div className="fooldal-filters">
        <input
          type="text"
          placeholder="Keresés cím/fejlesztő/leírás..."
          className="login-input"
          style={{ width: "130px", fontSize: ".98em", marginBottom: "2px" }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="login-input"
          style={{ width: "110px" }}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="login-input"
          style={{ width: "115px" }}
        >
          <option value="">Rendezés</option>
          <option value="Legolcsóbb">Ár ↑</option>
          <option value="Legdrágább">Ár ↓</option>
          <option value="Értékelés ↑">Értékelés ↑</option>
          <option value="Értékelés ↓">Értékelés ↓</option>
        </select>
      </div>

      <div className="games-grid">
        {filteredGames.map(game => (
          <GameCard
            key={game.id}
            game={game}
            user={user}
            comments={comments[game.id] || []}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;

