import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import axios from 'axios';

export function handleRegister(felhasznalonev, email, jelszo, onSuccess) {
  axios.post('localhost:3001/register', {
    felhasznalonev,
    email,
    jelszo
  })
  .then(res => {
    if (res.data.success) {
      onSuccess();
    }
  })
  .catch(err => {
    alert('Hiba regisztrációnál');
    console.error(err);
  });
}

export function handleLogin(felhasznalonev, jelszo, onSuccess) {
  axios.post('localhost:3001/login', {
    felhasznalonev,
    jelszo
  })
  .then(res => {
    if (res.data.success) {
      onSuccess();
    }
  })
  .catch(err => {
    alert('Hibás felhasználónév vagy jelszó');
    console.error(err);
  });
}

const gameImages = {
  'Cyberpunk 2077': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  'The Witcher 3': 'https://images.igdb.com/igdb/image/upload/t_original/co1r73.jpg',
  'Counter-Strike 2': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
  'Minecraft': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  'GTA V': 'https://images.igdb.com/igdb/image/upload/t_original/co1v9d.jpg',
  'Valorant': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
  'Among Us': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  'Fortnite': 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80',
  'Elden Ring': 'https://images.igdb.com/igdb/image/upload/t_original/co1tmu.jpg',
  'League of Legends': 'https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2015/03/League-of-Legends-wallpaper.jpg',
  'Overwatch 2': 'https://blz-contentstack-images.akamaized.net/v3/assets/blt2477dcaf4ebd440c/bltdabc3782553659f1/6785b50a1970a9f14eb5ccd7/xboxshowcase.png',
  'FIFA 23': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80',
  'Rocket League': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  'Apex Legends': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/f002ac48d98f501231e7d8bd3cc418b65c8d511a/capsule_616x353.jpg?t=1754578148',
  'Hades': 'https://images.igdb.com/igdb/image/upload/t_original/co1qzl.jpg',
};

const gamesDemo = [
  {
    id: 1,
    title: 'Cyberpunk 2077',
    developer: 'CD Projekt Red',
    price: '19,990 Ft',
    image: gameImages['Cyberpunk 2077'],
    requirements: { minimum: 'Intel i5-3570K, 8GB RAM, GTX 780', recommended: 'Intel i7-4790, 12GB RAM, GTX 1060' },
    category: 'RPG',
    rating: 4.2,
    description: "Night City a Te játszótered, ölj hackelj világíts!"
  },
  {
    id: 2,
    title: 'The Witcher 3',
    developer: 'CD Projekt Red',
    price: '9,990 Ft',
    image: gameImages['The Witcher 3'],
    requirements: { minimum: 'Intel i5-2500K, 6GB RAM, GTX 660', recommended: 'Intel i7-3770, 8GB RAM, GTX 770' },
    category: 'RPG',
    rating: 4.8,
    description: "Geralt kardját és mágiáját alkalmazva hódíthatod meg a szörnyek birodalmát!"
  },
  {
    id: 3,
    title: 'Counter-Strike 2',
    developer: 'Valve',
    price: 'Ingyenes',
    image: gameImages['Counter-Strike 2'],
    requirements: { minimum: 'Intel i5-2500, 8GB RAM, GTX 960', recommended: 'Intel i7, 12GB RAM, RTX 2060' },
    category: 'Shooter',
    rating: 4.7,
    description: "Taktikai FPS, klasszikus e-sport akció."
  },
  {
    id: 4,
    title: 'Minecraft',
    developer: 'Mojang',
    price: '8,990 Ft',
    image: gameImages['Minecraft'],
    requirements: { minimum: 'Intel i3, 4GB RAM, Intel HD', recommended: 'Intel i5, 8GB RAM, GTX 1060' },
    category: 'Sandbox',
    rating: 4.9,
    description: "Szabad építés, kreativitás, kaland bármely korosztálynak."
  },
  {
    id: 5,
    title: 'GTA V',
    developer: 'Rockstar Games',
    price: '11,990 Ft',
    image: gameImages['GTA V'],
    requirements: { minimum: 'Intel Core i5-3470, 8GB RAM, GTX 660', recommended: 'Intel Core i7-4770, 16GB RAM, GTX 1060' },
    category: 'Action',
    rating: 4.6,
    description: "Los Santos nyitott világa, bűnözés, autók, szabad élet."
  },
  {
    id: 6,
    title: 'Valorant',
    developer: 'Riot Games',
    price: 'Ingyenes',
    image: gameImages['Valorant'],
    requirements: { minimum: 'Intel i3-370M, 4GB RAM, Intel HD 3000', recommended: 'Intel i5-4460, 8GB RAM, GTX 1050' },
    category: 'Shooter',
    rating: 4.3,
    description: "Taktikai shooter képességekkel és karakterekkel."
  },
  {
    id: 7,
    title: 'Among Us',
    developer: 'InnerSloth',
    price: '1,500 Ft',
    image: gameImages['Among Us'],
    requirements: { minimum: 'Intel Dual Core, 2GB RAM, DirectX 10', recommended: 'Intel i3, 4GB RAM, DirectX 11' },
    category: 'Party',
    rating: 4.1,
    description: "Társasjáték az űrben - ki a besúgó?"
  },
  {
    id: 8,
    title: 'Fortnite',
    developer: 'Epic Games',
    price: 'Ingyenes',
    image: gameImages['Fortnite'],
    requirements: { minimum: 'Intel i3-3225, 4GB RAM, Intel HD 4000', recommended: 'Intel i5-7300U, 8GB RAM, GTX 1050' },
    category: 'Battle Royale',
    rating: 4.0,
    description: "Battle Royale építéssel és szórakozással."
  },
  {
    id: 9,
    title: 'Elden Ring',
    developer: 'FromSoftware',
    price: '24,990 Ft',
    image: gameImages['Elden Ring'],
    requirements: { minimum: 'Intel i5-8400, 12GB RAM, GTX 1060', recommended: 'Intel i7-8700K, 16GB RAM, GTX 1070' },
    category: 'RPG',
    rating: 4.9,
    description: "Souls-szerű kaland nyitott világban, óriás főellenségekkel."
  },
  {
    id: 10,
    title: 'League of Legends',
    developer: 'Riot Games',
    price: 'Ingyenes',
    image: gameImages['League of Legends'],
    requirements: { minimum: 'Intel Core i3-530, 4GB RAM, Intel HD 4000', recommended: 'Intel Core i5-3300, 8GB RAM, GTX 560' },
    category: 'MOBA',
    rating: 4.6,
    description: "Világ legnépszerűbb MOBA-ja, online csapat harc."
  },
  {
    id: 11,
    title: 'Overwatch 2',
    developer: 'Blizzard',
    price: 'Ingyenes',
    image: gameImages['Overwatch 2'],
    requirements: { minimum: 'Intel Core i3, 6GB RAM, GTX 600', recommended: 'Intel Core i5, 8GB RAM, GTX 1060' },
    category: 'Shooter',
    rating: 4.2,
    description: "Hősalapú shooter, látványos pályák, különleges karakterek."
  },
  {
    id: 12,
    title: 'FIFA 23',
    developer: 'EA Sports',
    price: '18,000 Ft',
    image: gameImages['FIFA 23'],
    requirements: { minimum: 'Intel Core i5-6600K, 8GB RAM, GTX 1050Ti', recommended: 'Intel i7-6700, 12GB RAM, GTX 1660' },
    category: 'Sport',
    rating: 3.9,
    description: "A futball szerelmeseinek legújabb generációs élmény."
  },
  {
    id: 13,
    title: 'Rocket League',
    developer: 'Psyonix',
    price: 'Ingyenes',
    image: gameImages['Rocket League'],
    requirements: { minimum: 'Intel Core 2 Duo E8210, 2GB RAM, GeForce 8800', recommended: 'Intel Core i5-2550, 4GB RAM, GTX 660' },
    category: 'Sport',
    rating: 4.5,
    description: "Focizz autókkal! Játékos és őrült."
  },
  {
    id: 14,
    title: 'Apex Legends',
    developer: 'Respawn Entertainment',
    price: 'Ingyenes',
    image: gameImages['Apex Legends'],
    requirements: { minimum: 'Intel Core i3-6300, 6GB RAM, GTX 640', recommended: 'Intel i5-3570K, 8GB RAM, GTX 970' },
    category: 'Battle Royale',
    rating: 4.4,
    description: "Gyors tempójú Battle Royale egyedi karakterekkel."
  },
  {
    id: 15,
    title: 'Hades',
    developer: 'Supergiant Games',
    price: '7,990 Ft',
    image: gameImages['Hades'],
    requirements: { minimum: 'Dual Core 2.4GHz, 4GB RAM, GeForce 8400', recommended: 'Dual Core 3.0GHz, 8GB RAM, GTX 660' },
    category: 'Hack&Slash',
    rating: 4.9,
    description: "Gyors harc, roguelike élmény a görög alvilágban."
  },
];


function App() {
  const [games, setGames] = useState(gamesDemo);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState({});

  function isAdmin() {
    return user && user.username === "admin";
  }


  useEffect(() => {
    if (user && typeof user.bio === "undefined") {
      setUser(prev => ({ ...prev, bio: '', avatar: '' }));
    }
  }, [user]);

  function handleRegister(uname, email, pass, cb) {
    if (users.some(u => u.username === uname)) return alert("Ez a név már foglalt!");
    const newu = { username: uname, email, password: pass, bio: "", avatar: "" };
    setUsers([...users, newu]);
    setUser(newu);
    cb && cb();
  }
  function handleLogin(uname, pass, cb) {
    const found = users.find(u => u.username === uname && u.password === pass);
    if (!found) return alert("Hibás felhasználó vagy jelszó!");
    setUser(found);
    cb && cb();
  }
  function handleLogout() { setUser(null); }
  function handleAddComment(gameId, text, rating) {
    if (!user) return;
    setComments(prev => ({
      ...prev,
      [gameId]: [
        ...(prev[gameId] || []),
        { user: user.username, text, rating: Number(rating) }
      ]
    }));
  }
  function handleDeleteComment(gameId, commentIdx) {
    setComments(prev => ({
      ...prev,
      [gameId]: (prev[gameId] || []).filter((_, idx) => idx !== commentIdx)
    }));
  }
  function handleProfileEdit(data) {
    setUser(prev => ({ ...prev, ...data }));
    setUsers(usrs => usrs.map(u =>
      u.username === user.username ? { ...u, ...data } : u
    ));
  }


  // ----------- SEARCH, FILTER/RENDEZÉS -----------------
  function filterSortGames(games, search, filter, sort) {
    let filtered = [...games];
    // Keresés címre, fejlesztőre, leírásra
    if (search.trim() !== '') {
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.developer.toLowerCase().includes(search.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    // Szűrő
    if (filter !== 'Összes') {
      filtered = filtered.filter(g => g.category === filter);
    }
    // Rendezés
    switch (sort) {
      case 'Legolcsóbb':
        filtered = filtered.sort((a, b) => (parseFloat(a.price) || 999999) - (parseFloat(b.price) || 999999));
        break;
      case 'Legdrágább':
        filtered = filtered.sort((a, b) => (parseFloat(b.price) || -1) - (parseFloat(a.price) || -1));
        break;
      case 'Értékelés ↑':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'Értékelés ↓':
        filtered = filtered.sort((a, b) => a.rating - b.rating);
        break;
      default: break;
    }
    return filtered;
  }

  // ----------- FŐOLDAL -----------------
  function Főoldal({ games }) {
    const [selectedCategory, setSelectedCategory] = useState('Összes');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const categories = ['Összes', ...new Set(games.map(g => g.category))];

    const filteredGames = filterSortGames(games, search, selectedCategory, sort);

    return (
      <div className="maincenter">
        <nav>
          <Link to="/" className="nav-link">Főoldal</Link>
          <Link to="/profile" className="nav-link">{user ? "Profil" : "Bejelentkezés"}</Link>
          <Link to="/register" className="nav-link">Regisztráció</Link>
          <Link to="/nevjegy" className="nav-link">Névjegy</Link>
          {user?.username === 'admin' && (
            <Link to="/addgame" className="nav-link">Új játék (admin)</Link>
          )}

        </nav>
        <h1>Játéklista</h1>
        {/* Keresés, szűrő, rendező---responsive grid: */}
        <div className="fooldal-filters">
          <input
            type="text"
            placeholder="Keresés cím/fejlesztő/leírás..."
            className="login-input"
            style={{ width: "130px", fontSize: ".98em", marginBottom: "2px" }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="login-input" style={{ width: "110px" }}>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="login-input" style={{ width: "115px" }}>
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

  function GameCard({ game, user, comments, onAddComment, onDeleteComment }) {
    const ownRating = comments.find(c => c.user === (user && user.username));
    const globalRating = comments.length
      ? (comments.reduce((sum, v) => sum + v.rating, 0) / comments.length).toFixed(2)
      : "Nincs";
    const [localComment, setLocalComment] = useState("");
    const [localRating, setLocalRating] = useState(5);

    return (
      <div className="game-card">
        <div className="game-image">
          <img src={game.image} alt={game.title} />
          <div className="game-rating-badge">
            <span className="rating-star">⭐</span>
            <span>{game.rating}</span>
          </div>
        </div>
        <div className="game-info">
          <h3 className="game-title">{game.title}</h3>
          <div className="game-developer">{game.developer}</div>
          <span className="category-chip">{game.category}</span>
          <div className="game-requirements">
            <h4>Gépigény (minimum):</h4>
            <p>{game.requirements.minimum}</p>
          </div>
          <div style={{ marginTop: 12 }}>
            <b>Globális értékelés:</b> {globalRating}
            {user && <><br /><b>Saját értékelés:</b> {ownRating ? ownRating.rating : "Még nincs"}</>}
          </div>
          <div className="game-footer">
            <span className="game-price">{game.price}</span>
            <Link to={`/game/${game.id}`}>
              <button className="megtekintes-btn">Megtekintés</button>
            </Link>
          </div>

          {user &&
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
          }

          <div>
            <b>Vélemények:</b>
            {comments.length === 0 ? (
              <div>Nincs még hozzászólás.</div>
            ) : (
              comments.map((cmt, i) => (
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

                  {user?.username === 'admin' && (
                    <button
                      type="button"
                      onClick={() => onDeleteComment(game.id, i)}
                      style={{
                        marginLeft: 7,
                        fontSize: '0.9em',
                        background: '#93000f',
                        color: '#fff',
                        borderRadius: 6,
                        border: 'none',
                        padding: '3px 8px',
                        cursor: 'pointer'
                      }}
                      aria-label="Komment törlése"
                      title="Komment törlése"
                    >
                      Törlés</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  function GameDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const game = games.find(g => String(g.id) === id);
    const allComments = comments[game?.id] || [];

    const ownRating = allComments.find(c => c.user === (user && user.username));
    const globalRating = allComments.length
      ? (allComments.reduce((sum, v) => sum + v.rating, 0) / allComments.length).toFixed(2)
      : "Nincs értékelés";
    const [localComment, setLocalComment] = useState("");
    const [localRating, setLocalRating] = useState(5);

    if (!game) return <div className='maincenter'><h2 style={{ color: '#19ffe3' }}>Játék nem található!</h2></div>;

    return (
      <div className="maincenter">
        <nav>
          <Link to="/" className="nav-link">Főoldal</Link>
          <Link to="/profile" className="nav-link">{user ? "Profil" : "Bejelentkezés"}</Link>
          <Link to="/register" className="nav-link">Regisztráció</Link>
          <Link to="/nevjegy" className="nav-link">Névjegy</Link>
        </nav>
        <h2>{game.title}</h2>
        <div className="game-card detail-card">
          <div className="game-image">
            <img src={game.image} alt={game.title} />
          </div>
          <div className="game-info">
            <div className="game-developer">{game.developer}</div>
            <span className="category-chip">{game.category}</span>
            <div className="game-requirements">
              <h4>Gépigény (minimum):</h4>
              <p>{game.requirements.minimum}</p>
              <h4>Ajánlott:</h4>
              <p>{game.requirements.recommended}</p>
            </div>
            <div><b>Leírás:</b> {game.description}</div>
            <div style={{ marginTop: 12 }}>
              <b>Globális értékelés:</b> {globalRating}
              {user && <><br /><b>Saját értékelés:</b> {ownRating ? ownRating.rating : "Még nincs"}</>}
            </div>
            {user &&
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
                  style={{
                    marginBottom: 0,
                    width: "120px",
                    fontSize: "0.98em",
                    padding: "7px 6px"
                  }}
                  maxLength={60}
                  required
                />
                <select value={localRating} onChange={e => setLocalRating(e.target.value)} className="login-input"
                  style={{ width: "40px", padding: "5px 2px", fontSize: "1em" }}>
                  {[...Array(10)].map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                  ))}
                </select>
                <button type="submit" className="megtekintes-btn" style={{ padding: "5px 9px", fontSize: "0.98em", marginTop: 0 }}>Küldés</button>
              </form>
            }
            <div>
              <b>Vélemények:</b>
              {allComments.length === 0 ? <div>Nincs még hozzászólás.</div>
                : allComments.map((cmt, i) => (
                  <div key={i} style={{ background: '#23272f', borderRadius: '8px', margin: '6px 0', padding: '6px', color: '#fff', fontSize: "0.96em", maxWidth: "160px" }}>
                    <b>{cmt.user}</b>: {cmt.text} <span style={{ color: '#19ffe3' }}>({cmt.rating})</span>
                  </div>
                ))}
            </div>
            <button className="vissza-btn" style={{ marginTop: 25 }} onClick={() => navigate(-1)}>⬅ Vissza</button>
          </div>
        </div>
      </div>
    );
  }

  function Login() {
    const navigate = useNavigate();
    const [uname, setUname] = useState("");
    const [pass, setPass] = useState("");
    return (
      <div className="maincenter">
        <h2>Bejelentkezés</h2>
        <form className="login-form"
          onSubmit={e => {
            e.preventDefault();
            handleLogin(uname, pass, () => navigate('/'));
          }}>
          <input type="text" placeholder="Felhasználónév" value={uname} onChange={e => setUname(e.target.value)} required className="login-input" />
          <input type="password" placeholder="Jelszó" value={pass} onChange={e => setPass(e.target.value)} required className="login-input" />
          <button type="submit" className="login-btn">Belépés</button>
        </form>
        <button className="vissza-btn" style={{ marginTop: 20 }} onClick={() => navigate('/')}>⬅ Vissza</button>
      </div>
    );
  }

  function Register() {
    const navigate = useNavigate();
    const [uname, setUname] = useState("");
    const [pass, setPass] = useState("");
    const [mail, setMail] = useState("");
    return (
      <div className="maincenter">
        <h2>Regisztráció</h2>
        <form className="login-form"
          onSubmit={e => {
            e.preventDefault();
            handleRegister(uname, mail, pass, () => navigate('/'));
          }}>
          <input type="text" placeholder="Felhasználónév" value={uname} onChange={e => setUname(e.target.value)} required className="login-input" />
          <input type="email" placeholder="Email" value={mail} onChange={e => setMail(e.target.value)} required className="login-input" />
          <input type="password" placeholder="Jelszó" value={pass} onChange={e => setPass(e.target.value)} required className="login-input" />
          <button type="submit" className="login-btn">Regisztráció</button>
        </form>
        <button className="vissza-btn" style={{ marginTop: 20 }} onClick={() => navigate('/')}>⬅ Vissza</button>
      </div>
    );
  }

  function Profile() {
    const navigate = useNavigate();
    const [edit, setEdit] = useState(false);
    const [bio, setBio] = useState(user?.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const avatarPreview = avatarFile
      ? URL.createObjectURL(avatarFile)
      : avatarUrl || "https://ui-avatars.com/api/?name=" + (user?.username || "U");

    function handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      setAvatarFile(file);
    }
    function handleSave() {
      if (avatarFile) {
        const reader = new FileReader();
        reader.onload = ev => {
          handleProfileEdit({ bio, avatar: ev.target.result });
          setEdit(false);
        };
        reader.readAsDataURL(avatarFile);
      } else {
        handleProfileEdit({ bio, avatar: avatarUrl });
        setEdit(false);
      }
    }
    return (
      <div className="maincenter">
        <h2>Profil</h2>
        <div className="nevjegy-card" style={{ maxWidth: 380, minWidth: 230 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={avatarPreview} alt="profil" style={{ width: 80, height: 80, borderRadius: 40, objectFit: 'cover', border: '2px solid #27e8ff', marginBottom: 10 }} />
          </div>
          {edit ? (
            <>
              <div>
                <label>Kép feltöltés:&nbsp;</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ margin: "8px 0 8px 0" }} />
                <label>vagy URL:</label>
                <input value={avatarUrl} onChange={e => { setAvatarUrl(e.target.value); setAvatarFile(null); }}
                  placeholder="Kép URL" style={{ marginBottom: 10, width: '100%' }} />
              </div>
              <div><b>Név:</b> <input value={user.username} disabled style={{ width: "80%" }} /></div>
              <div><b>Email:</b> <input value={user.email} disabled style={{ width: "80%" }} /></div>
              <div><b>Leírás:</b></div>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ width: "100%", marginBottom: 8 }} maxLength={100} />
              <button className="login-btn" style={{ marginBottom: 9 }} onClick={handleSave}>Mentés</button>
            </>
          ) : (
            <>
              <div><b>Név:</b> {user?.username}</div>
              <div><b>Email:</b> {user?.email}</div>
              <div><b>Leírás:</b> {user?.bio || "–"}</div>
              <button className="login-btn" style={{ margin: "14px 0 9px 0" }} onClick={() => setEdit(true)}>Szerkesztés</button>
            </>
          )}
          <button className="vissza-btn" style={{ marginTop: "7px" }} onClick={() => navigate('/')}>⬅ Vissza</button>
          <button className="vissza-btn" style={{ marginTop: "7px", background: 'crimson', color: '#fff' }} onClick={handleLogout}>Kijelentkezés</button>
        </div>
      </div>
    );
  }

  function AdminPage({ games, setGames, user }) {
    const navigate = useNavigate();
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
      title: '',
      developer: '',
      price: '',
      category: '',
      image: '',
      minReq: '',
      recReq: '',
      rating: 5,
      desc: ''
    });
    const [imgFile, setImgFile] = useState(null);

    // Előre töltés szerkesztéshez
    function startEdit(game) {
      setEditId(game.id);
      setForm({
        title: game.title,
        developer: game.developer,
        price: game.price,
        category: game.category,
        image: game.image,
        minReq: game.requirements.minimum,
        recReq: game.requirements.recommended,
        rating: game.rating,
        desc: game.description || ''
      });
      setImgFile(null);
    }

    // Ha új vagy szerkesztett játék mentése
    function handleSaveGame(e) {
      e.preventDefault();
      if (!form.title || !form.developer || !form.category || !form.minReq || !form.recReq || !form.price) {
        alert('Minden mező kitöltése kötelező!');
        return;
      }
      if (editId == null) {
        setGames(prev => [
          ...prev,
          {
            id: Math.max(...prev.map(g => g.id)) + 1,
            title: form.title,
            developer: form.developer,
            price: form.price,
            image: form.image,
            requirements: { minimum: form.minReq, recommended: form.recReq },
            category: form.category,
            rating: Number(form.rating),
            description: form.desc
          }
        ]);
      } else {
        setGames(prev => prev.map(g =>
          g.id === editId ? {
            ...g,
            title: form.title,
            developer: form.developer,
            price: form.price,
            image: form.image,
            requirements: { minimum: form.minReq, recommended: form.recReq },
            category: form.category,
            rating: Number(form.rating),
            description: form.desc
          } : g
        ));
      }
      setForm({ title: '', developer: '', price: '', category: '', image: '', minReq: '', recReq: '', rating: 5, desc: '' });
      setEditId(null);
      setImgFile(null);
      alert(editId ? "Játék módosítva!" : "Új játék felvéve!");
    }




    function handleImgUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      setImgFile(file);
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
      reader.readAsDataURL(file);
    }

    function handleDelete(id) {
      if (window.confirm('Biztosan töröljem ezt a játékot?')) {
        setGames(prev => prev.filter(g => g.id !== id));
        if (editId === id) setEditId(null);
      }
    }

    return (
      <div className="maincenter">
        <nav>
          <Link to="/" className="nav-link">Főoldal</Link>
          <Link to="/profile" className="nav-link">{user ? "Profil" : "Bejelentkezés"}</Link>
          <button className="vissza-btn" style={{ marginLeft: "24px" }} onClick={() => navigate('/')}>⬅ Vissza</button>
        </nav>
        <h2>Admin – Játék hozzáadása / szerkesztése</h2>
        <form className="login-form" style={{ maxWidth: 500, width: '98vw' }}
          onSubmit={handleSaveGame}
        >
          <input className="login-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Játék címe" required />
          <input className="login-input" value={form.developer} onChange={e => setForm(f => ({ ...f, developer: e.target.value }))} placeholder="Fejlesztő" required />
          <input className="login-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Ár pl: 9990 Ft vagy Ingyenes" required />
          <input className="login-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Kategória" required />
          <input className="login-input" value={form.rating} type="number" min="1" max="10" step="0.1" onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} placeholder="Értékelés (pl. 9.2)" />
          <textarea className="login-input" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Játék leírása" />
          <input className="login-input" value={form.minReq} onChange={e => setForm(f => ({ ...f, minReq: e.target.value }))} placeholder="Minimum gépigény" required />
          <input className="login-input" value={form.recReq} onChange={e => setForm(f => ({ ...f, recReq: e.target.value }))} placeholder="Ajánlott gépigény" required />
          <input type="file" accept="image/*" onChange={handleImgUpload} />
          <input className="login-input" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="(vagy kép url)" />
          {form.image && <img src={form.image} alt="játék kép előnézet" style={{ width: 100, margin: '8px auto' }} />}
          <button className="login-btn" type="submit">{editId ? "Játék mentése" : "Játék hozzáadása"}</button>
        </form>
        <hr style={{ margin: "26px 0", width: "88%", borderColor: "#ff41fa" }} />
        <h2 style={{ fontSize: "1.3em" }}>Összes játék szerkesztése/törlése</h2>
        <div style={{ maxWidth: 920, margin: "0 auto", display: 'flex', flexWrap: 'wrap', gap: '23px' }}>
          {games.map(g => (
            <div key={g.id} style={{ background: '#2b1849', borderRadius: 15, padding: '13px 12px', color: '#19ffe3', minWidth: 220, maxWidth: 260 }}>
              <img src={g.image} alt={g.title} style={{ width: "100%", maxHeight: 80, objectFit: "cover", borderRadius: '12px' }} />
              <div><b>{g.title}</b> <span style={{ color: "#ff41fa" }}>{g.category}</span></div>
              <div>{g.developer}</div>
              <div>{g.price}</div>
              <button className="login-btn" style={{ margin: "5px 9px 0 0" }} onClick={() => startEdit(g)}>Szerkesztés</button>
              <button className="login-btn" style={{ margin: "5px 0 0 0", background: "#93000f", color: "#fff" }} onClick={() => handleDelete(g.id)}>Törlés</button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  function AddGamePage({ setGames }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
      title: '', developer: '', price: '', category: '',
      image: '', minReq: '', recReq: '', desc: '', rating: 5
    });
    const [imgFile, setImgFile] = useState(null);

    function handleImgUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      setImgFile(file);
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
      reader.readAsDataURL(file);
    }

    function handleSubmit(e) {
      e.preventDefault();
      if (!form.title || !form.developer || !form.price || !form.category || !form.image) {
        alert("Minden mező kötelező!");
        return;
      }
      setGames(prev => [
        ...prev,
        {
          id: Math.max(...prev.map(g => g.id)) + 1,
          title: form.title,
          developer: form.developer,
          price: form.price,
          image: form.image,
          requirements: { minimum: form.minReq, recommended: form.recReq },
          category: form.category,
          rating: parseFloat(form.rating),
          description: form.desc
        }
      ]);
      alert("Játék hozzáadva!");
      navigate('/');
    }

    return (
      <div className="maincenter">
        <nav>
          <Link to="/" className="nav-link">Főoldal</Link>
          <button className="vissza-btn" style={{ marginLeft: "24px" }} onClick={() => navigate('/')}>⬅ Vissza</button>
        </nav>
        <h2>Új játék hozzáadása (admin)</h2>
        <form className="login-form" style={{ maxWidth: 500, width: '98vw' }} onSubmit={handleSubmit}>
          <input className="login-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Játék címe" required />
          <input className="login-input" value={form.developer} onChange={e => setForm(f => ({ ...f, developer: e.target.value }))} placeholder="Fejlesztő" required />
          <input className="login-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Ár pl: 9990 Ft vagy Ingyenes" required />
          <input className="login-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Kategória" required />
          <input className="login-input" value={form.rating} type="number" min="1" max="10" step="0.1"
            onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} placeholder="Értékelés (pl. 9.2)" required />
          <textarea className="login-input" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Játék leírása" />
          <input className="login-input" value={form.minReq} onChange={e => setForm(f => ({ ...f, minReq: e.target.value }))} placeholder="Minimum gépigény" required />
          <input className="login-input" value={form.recReq} onChange={e => setForm(f => ({ ...f, recReq: e.target.value }))} placeholder="Ajánlott gépigény" required />
          <input type="file" accept="image/*" onChange={handleImgUpload} />
          <input className="login-input" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="(vagy kép url)" required />
          {form.image && <img src={form.image} alt="játék kép előnézet" style={{ width: 100, margin: '8px auto' }} />}
          <button className="login-btn" type="submit">Játék hozzáadása</button>
        </form>
      </div>
    );
  }
  function Nevjegy() {
    const navigate = useNavigate();
    return (
      <div className="maincenter" style={{ overflowX: "hidden" }}>
        <h2>Névjegy</h2>
        <div className="nevjegy-card">
          <p><b>Steam Mester Demo</b></p>
          <p>Készítette: Pacek Reactes</p>
          <p>Neon gamer webáruház mintaprojekt. Válassz játékot, böngéssz kategóriák szerint!</p>
          <p>Kapcsolat: <a style={{ color: "#ff41fa" }} href="mailto:valaki@email.hu">valaki@email.hu</a></p>
          <p>Verzió: 1.0.0</p>
          <button className="vissza-btn" style={{ marginTop: "21px" }} onClick={() => navigate('/')}>⬅ Vissza</button>
        </div>
      </div>
    );
  }
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Főoldal games={games} />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/login" element={user ? <Profile /> : <Login />} />
        <Route path="/profile" element={user ? <Profile /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/nevjegy" element={<Nevjegy />} />
        <Route
          path="/addgame"
          element={user && user.username === "admin"
            ? <AddGamePage setGames={setGames} />
            : <Főoldal games={games} />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;