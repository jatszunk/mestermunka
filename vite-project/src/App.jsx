import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import LandingPage from './pages/landingpage.jsx';
import defaultImage from './assets/default.jpg';
import Register from './pages/register.jsx';
import Login from './pages/login.jsx';
import Nevjegy from './pages/nevjegy.jsx';
import Profile from './pages/profile.jsx';

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
];


function App() {
  const [games, setGames] = useState(gamesDemo);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState({});

  useEffect(() => {
    // Felhasználók betöltése
    axios.get('http://localhost:3001/felhasznalok')
      .then(res => {
        if (res.data.success) {
          const mappedUsers = res.data.users.map(u => ({
            username: u.felhasznalonev,
            email: u.email,
            password: u.jelszo,
            bio: u.bio || "",
            avatar: u.avatar || ""
          }));
          setUsers(mappedUsers);
        }
      })
      .catch(err => console.error("Hiba a felhasználók lekérésekor:", err));

    // Játékok betöltése
    const roleParam = user?.role ? `?role=${user.role}` : "";

    axios.get(`http://localhost:3001/jatekok${roleParam}`)

      .then(res => {
        const mappedGames = res.data.games.map(game => ({
          id: game.id,
          title: game.title,
          developer: game.developer,
          price: game.price,
          image: game.image || defaultImage,
          requirements: {
            minimum: game.minimum,
            recommended: game.recommended
          },
          category: Array.isArray(game.categories)
            ? (game.categories[0] || "Egyéb")
            : (typeof game.categories === "string" ? (game.categories.split(", ")[0] || "Egyéb") : "Egyéb"),

          rating: game.rating || 0,
          description: game.description
        }));
        setGames(mappedGames);
      })
      .catch(err => console.error("Hiba a játékok lekérésekor:", err));
  }, [user?.role]);


  function handleLogin(uname, pass, navigate) {
    axios.post('http://localhost:3001/login', {
      felhasznalonev: uname,
      jelszo: pass
    })
      .then(res => {
        if (res.data.success) {
          const u = res.data.user;
          setUser({
            username: u.felhasznalonev,
            email: u.email,
            role: u.role,         // EZ A LÉNYEG
            bio: u.bio || "",
            avatar: u.avatar || ""
          });
          navigate('/');
        } else {
          alert("Hibás felhasználónév vagy jelszó!");
        }
      })
      .catch(() => alert("Hibás felhasználónév vagy jelszó!"));
  }


  function handleRegister(uname, email, pass, cb) {
    if (users.some(u => u.username === uname)) return alert("Ez a név már foglalt!");
    const newu = { username: uname, email, password: pass, bio: "", avatar: "" };
    setUsers([...users, newu]);
    setUser(newu);
    cb && cb();

    // 🔽 Hozzáadás az adatbázishoz
    axios.post('http://localhost:3001/register', {
      felhasznalonev: uname,
      email: email,
      jelszo: pass
    })
      .then(res => {
        if (!res.data.success) {
          console.warn("Az adatbázisba mentés nem sikerült.");
        }
      })
      .catch(err => {
        console.error("Hiba az adatbázisba mentés során:", err);
      });
  }

  function handleLogout() {
    setUser(null);
  }

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
  const onDeleteGame = async (gameId) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a játékot?")) return;

    try {
      const res = await fetch(`http://localhost:3001/jatekok/${gameId}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        alert("Játék törölve!");
        // pl. frissítsd a játéklistát
        setGames(prev => prev.filter(g => g.id !== gameId));
      } else {
        alert("Hiba: " + data.message);
      }
    } catch (err) {
      console.error("Hiba a játék törlésekor:", err);
      alert("Nem sikerült törölni a játékot.");
    }
  };

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
        <div className="game-info" style={{ color: "white" }}>
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
                onClick={() => onDeleteGame(game.id)}
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
              <div><b id='leirass'>Leírás:</b></div>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ width: "100%", marginBottom: 8 }} maxLength={100} />
              <button className="login-btn" style={{ marginBottom: 9 }} onClick={handleSave}>Mentés</button>
            </>
          ) : (
            <>
              <div><b>Név:</b> {user?.username}</div>
              <div><b>Email:</b> {user?.email}</div>
              <div><b id='leirass'>Leírás:</b> {user?.bio || "–"}</div>
              <button className="login-btn" style={{ margin: "14px 0 9px 0" }} onClick={() => setEdit(true)}>Szerkesztés</button>
            </>
          )}
          <button className="vissza-btn" style={{ marginTop: "7px" }} onClick={() => navigate('/')}>⬅ Vissza</button>
          <button className="vissza-btn" style={{ marginTop: "7px", background: 'crimson', color: '#fff' }} onClick={handleLogout}>Kijelentkezés</button>
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

    async function handleSubmit(e) {
      e.preventDefault();
      if (!form.title || !form.developer || !form.price || !form.category || !form.image) {
        alert("Minden mező kötelező!");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/jatekok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        const data = await res.json();

        if (data.success) {
          alert("Játék hozzáadva!");
          // opcionálisan frissítjük a state-et
          setGames(prev => [...prev, data.game]);
          navigate('/');
        } else {
          alert("Hiba: " + data.message);
        }
      } catch (err) {
        console.error("Hiba a játék hozzáadásakor:", err);
        alert("Nem sikerült hozzáadni a játékot.");
      }
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
          <input className="login-input" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Kép URL" required />
          {form.image && <img src={form.image} alt="játék kép előnézet" style={{ width: 100, margin: '8px auto' }} />}
          <button className="login-btn" type="submit">Játék hozzáadása</button>
        </form>
      </div>
    );
  }

  function Nevjegy() {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      message: ''
    });
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setStatus('📤 Küldés...');

      try {
        const response = await fetch("http://localhost:3001/api/send-email", {

          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: formData.email,
            name: formData.name,
            message: formData.message,
            subject: `GameVerse: ${formData.name}`
          }),
          
        });

        const data = await response.json();

        setIsSubmitting(false);
        if (data.success) {
          setStatus('✅ Elküldve a fejlesztőknek!');
          setFormData({ name: '', email: '', message: '' });
        } else {
          setStatus('❌ ' + (data.message || 'Hiba'));
        }
      } catch (error) {
        setIsSubmitting(false);
        setStatus('❌ Backend nem elérhető!');
        console.error(error);
      }
    };


    return (
      <main className="maincenter" style={{ overflowX: 'hidden' }}>
        <h2>Névjegy</h2>

        <section className="nevjegy-card" aria-labelledby="app-name">
          <h3 id="app-name" style={{ marginTop: 0 }}>
            <b>GameVerse</b>
          </h3>

          <p>
            A GameVerse egy vizsgához készült projektmunka, amely egy neon témájú gamer
            mintaprojektet valósít meg. Elsősorban videojátékok böngészésére,
            keresésére és értékelésére szolgál.
          </p>

          <div className="nvj-grid">
            <div className="nvj-block">
              <h4>👥 Készítők &amp; kapcsolat</h4>
              <ul>
                <li>Kiss Csaba</li>
                <li>Kormos Levente</li>
              </ul>
              <p>
                <strong>E-mail:</strong>{' '}
                <a href="mailto:gameverseprojekt@gmail.hu">
                  gameverseprojekt@gmail.hu
                </a>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 21, flexWrap: 'wrap' }}>
            <button className="vissza-btn" onClick={() => navigate('/')}>
              ⬅ Vissza
            </button>
          </div>
        </section>

        {/* Neon dizájnú kapcsolatfelvételi form */}
        <section className="contact-section">
          <h3 style={{
            color: '#19ffe3',
            textShadow: '0 0 18px #1ef7ff, 0 0 32px #ff41fa',
            fontFamily: "'Orbitron', sans-serif",
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            📧 Írj nekünk!
          </h3>
          <p style={{ color: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>
            Üzeneted azonnal elküldődik gameverseprojekt@gmail.hu címre.
          </p>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name" style={{ color: '#27e8ff', fontWeight: 'bold' }}>
                Neved:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="neon-input"
                placeholder="Pl. Valami Valaki"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" style={{ color: '#27e8ff', fontWeight: 'bold' }}>
                E-mail címed:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="neon-input"
                placeholder="te@email.hu"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message" style={{ color: '#27e8ff', fontWeight: 'bold' }}>
                Üzeneted:
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                required
                className="neon-textarea"
                placeholder="Írd ide üzenetedet..."
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="neon-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '📤 Küldés...' : '🚀 Azonnali küldés'}
            </button>

            {status && (
              <p className="status-message" style={{
                background: status.includes('✅') ? 'rgba(39,232,255,0.2)' : 'rgba(255,65,250,0.2)',
                color: status.includes('✅') ? '#19ffe3' : '#ff41fa',
                border: `2px solid ${status.includes('✅') ? '#27e8ff' : '#ff41fa'}`,
                textShadow: '0 0 8px currentColor',
                padding: '1rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                {status}
              </p>
            )}
          </form>
        </section>
      </main>
    );
  }



  // 🔥 ADMIN JÓVÁHAGYÓ DASHBOARD
  function AdminJovahagyas({ user, navigate, games, setGames }) {
    const [pendingGames, setPendingGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch('http://localhost:3001/jatekok-pending')
        .then(r => r.json())
        .then(data => {
          setPendingGames(data.games || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    const handleApprove = async (idjatekok) => {
      try {
        const res = await fetch(`http://localhost:3001/admin-jovahagy/${idjatekok}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ felhasznalonev: user.username })
        });
        const data = await res.json();
        if (!data.success) return alert(data.message || "Hiba jóváhagyásnál!");

        setPendingGames(prev => prev.filter(g => g.id !== idjatekok));
        alert("Játék jóváhagyva!");
      } catch {
        alert("Hiba a jóváhagyásnál!");
      }
    };

    const handleReject = async (idjatekok) => {
      try {
        const res = await fetch(`http://localhost:3001/admin-elutasit/${idjatekok}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ felhasznalonev: user.username })
        });
        const data = await res.json();
        if (!data.success) return alert(data.message || "Hiba elutasításnál!");

        setPendingGames(prev => prev.filter(g => g.id !== idjatekok));
        alert("Játék elutasítva!");
      } catch {
        alert("Hiba az elutasításnál!");
      }
    };


    if (!user || user.role !== 'admin') return (
      <div className="maincenter" style={{ textAlign: 'center', color: '#ff41fa' }}>
        <h2>🚫 Admin jogosultság szükséges!</h2>
        <Link to="/">← Főoldal</Link>
      </div>
    );

    return (
      <div className="maincenter">
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/" className="nav-link">🏠 Főoldal</Link>
          <Link to="/profile" className="nav-link">👤 Profil</Link>
          <button className="vissza-btn" onClick={() => navigate('/')}>← Vissza</button>
        </nav>
        <h2 style={{ color: '#19ffe3', textShadow: '0 0 15px #27e8ff' }}>⚙️ Admin Dashboard</h2>
        <h3 style={{ color: '#ff41fa' }}>Függőben: {pendingGames.length} játék</h3>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#27e8ff' }}>⏳ Betöltés...</div>
        ) : pendingGames.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#27e8ff' }}>
            ✅ Nincs függőben lévő játék
          </div>
        ) : (
          <div className="games-grid">
            {pendingGames.map((game) => (
              <div key={game.id} className="game-card" style={{ maxWidth: '380px' }}>
                <div className="game-image" style={{ backgroundImage: `url(${game.kepurl || defaultImage})` }}></div>
                <div className="game-info">
                  <h3 style={{ color: '#19ffe3' }}>{game.nev}</h3>
                  <p><strong style={{ color: '#ff41fa' }}>Gamedev:</strong> {game.felhasznalonev}</p>
                  <p><strong>Ár:</strong> {game.ar}</p>
                  <p style={{ color: '#888', fontSize: '0.9em' }}>{game.leiras?.substring(0, 100)}...</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button className="login-btn" onClick={() => handleApprove(game.id)}>
                      ✅ JÓVÁHAGY
                    </button>

                    <button
                      className="vissza-btn"
                      style={{ background: "#93000f", padding: "10px 15px" }}onClick={() => handleReject(game.id)}>
                      ❌ ELUTASÍT
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Főoldal games={games} /> : <LandingPage />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/login" element={user ? <Profile /> : <Login />} />
        <Route path="/profile" element={user ? <Profile /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/nevjegy" element={<Nevjegy />} />
        <Route
          path="/addgame"
          element={
            user && user.username === "admin"
              ? <AddGamePage setGames={setGames} />
              : <Főoldal games={games} />
          }
        />
        <Route
          path="/gamedev"
          element={
            user?.role === 'gamedev'
              ? <GamedevFeltoltes user={user} />
              : <Főoldal games={games} />
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            user?.role === 'admin'
              ? <AdminJovahagyas user={user} games={games} setGames={setGames} />
              : <Főoldal games={games} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;