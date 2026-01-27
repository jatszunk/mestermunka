import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";

import Home from "./pages/Home.jsx";
import GameDetail from "./pages/GameDetail.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import NevjegyPage from "./pages/Nevjegy.jsx";
import LandingPage from "./pages/landingpage.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import GameDevUpload from "./pages/GameDevUpload.jsx";
import GameDevPanel from "./components/GameDevPanel.jsx";
import Statistics from "./pages/Statistics.jsx";
import UserProfile from "./components/UserProfile.jsx";

import defaultImage from "./assets/default.jpg";
import Footer from "./components/Footer.jsx";

function App() {
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState({}); // { [gameId]: [ {id,user,text,rating}, ... ] }

  // ----- Fetch users + games + comments -----
  useEffect(() => {
    // users
    axios.get("http://localhost:3001/felhasznalok")
      .then((res) => {
        console.log('Felhasználók válasz:', res.data);
        if (res.data.success) {
          const mapped = (res.data.users || []).map((u) => ({
            id: u.idfelhasznalo,
            username: u.felhasznalonev,
            email: u.email,
            password: u.jelszo,
            bio: u.bio || "",
            avatar: u.avatar || "",
            role: u.szerepkor === 'felhasznalo' ? 'user' : u.szerepkor,
            name: u.nev || "",
          }));
          setUsers(mapped);
        }
      })
      .catch((err) => {
        console.error('Felhasználók lekérési hiba:', err);
      });

    // games
    axios.get("http://localhost:3001/jatekok").then((res) => {
      const mappedGames = (res.data.games || []).map((g) => ({
        id: g.id,
        title: g.title,
        developer: g.developer,
        price: g.price,
        image: g.image || defaultImage,
        requirements: g.requirements || { minimum: "-", recommended: "-" },
        categories: Array.isArray(g.categories) ? g.categories : [],
        category: Array.isArray(g.categories) && g.categories.length ? g.categories[0] : "Egyéb", // fallback (régi kódoknak)
        platforms: Array.isArray(g.platforms) ? g.platforms : [],
        rating: g.rating || 0,
        description: g.description || "",
      }));
      setGames(mappedGames);
    });

    // all comments (grouped)
    axios.get("http://localhost:3001/kommentek").then((res) => {
      if (res.data.success) {
        const grouped = {};
        for (const c of res.data.comments || []) {
          if (!grouped[c.gameId]) grouped[c.gameId] = [];
          grouped[c.gameId].push(c);
        }
        setComments(grouped);
      }
    });
  }, [user?.role]);

  // ------------ AUTH ------------------
  function handleLogin(uname, pass, navigate) {
    console.log('Bejelentkezési kérés:', { uname, pass });
    axios
      .post("http://localhost:3001/login", {
        felhasznalonev: uname,
        jelszo: pass,
      })
      .then((res) => {
        console.log('Bejelentkezési válasz:', res.data);
        if (res.data.success) {
          const u = res.data.user;
          setUser({
            id: u.idfelhasznalo,
            username: u.felhasznalonev,
            email: u.email,
            role: u.szerepkor === 'felhasznalo' ? 'user' : u.szerepkor,
            bio: u.bio || "",
            avatar: u.avatar || "",
            name: u.nev || "",
          });
          navigate("/");
        } else {
          alert("Hibás felhasználónév vagy jelszó!");
        }
      })
      .catch((err) => {
        console.error('Bejelentkezési hiba:', err);
        alert("Bejelentkezési hiba történt!");
      });
  }

  function handleRegister(uname, email, pass, role = 'felhasznalo', cb) {
    console.log('Regisztrációs kérés:', { uname, email, pass, role });
    if (users.some((u) => u.username === uname)) {
      alert("Ez a név már foglalt!");
      return;
    }

    const frontendRole = role === 'felhasznalo' ? 'user' : role;
    const newUser = { 
      username: uname, 
      email, 
      password: pass, 
      role: frontendRole,
      bio: "", 
      avatar: "",
      name: ""
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);

    axios.post("http://localhost:3001/register", {
      felhasznalonev: uname,
      email,
      jelszo: pass,
      szerepkor: role,
    })
    .then((res) => {
      console.log('Regisztrációs válasz:', res.data);
      if (res.data.success) {
        cb && cb();
      } else {
        alert("Regisztrációs hiba történt!");
      }
    })
    .catch((err) => {
      console.error('Regisztrációs hiba:', err);
      alert("Regisztrációs hiba történt!");
    });
  }

  function handleLogout() {
    setUser(null);
    // Töröljük a localStorage-ből is a felhasználói adatokat
    localStorage.removeItem('user');
    // Visszairányítjuk a főoldalra
    window.location.href = '/';
  }

  // ------------ COMMENTS (DB) ------------------
  async function fetchComments(gameId) {
    const res = await axios.get("http://localhost:3001/kommentek");
    if (res.data.success) {
      const grouped = {};
      for (const c of res.data.comments || []) {
        if (!grouped[c.gameId]) grouped[c.gameId] = [];
        grouped[c.gameId].push(c);
      }
      setComments(grouped);
    }
  }

  async function handleAddComment(gameId, text, rating) {
    if (!user) return;

    const res = await axios.post(`http://localhost:3001/jatekok/${gameId}/kommentek`, {
      username: user.username,
      text,
      rating: Number(rating),
    });

    if (res.data.success) {
      setComments((prev) => ({
        ...prev,
        [gameId]: [res.data.comment, ...(prev[gameId] || [])],
      }));
    }
  }

  // ------------ WISHLIST AND COLLECTION ------------------
  async function handleAddToWishlist(gameId) {
    if (!user) return;
    try {
      const response = await axios.post(`http://localhost:3001/wishlist/${user.username}/${gameId}`);
      if (response.data.success) {
        alert('Játék hozzáadva a kívánságlistához!');
      } else {
        alert(response.data.message || 'Hiba történt');
      }
    } catch (error) {
      console.error('Hiba a kívánságlistához adáskor:', error);
      alert('Hiba történt a kívánságlistához adáskor');
    }
  }

  async function handleAddToCollection(gameId, status = 'owned') {
    if (!user) return;
    try {
      const response = await axios.post(`http://localhost:3001/collection/${user.username}/${gameId}`, { status });
      if (response.data.success) {
        alert('Játék hozzáadva a gyűjteményhez!');
      } else {
        alert(response.data.message || 'Hiba történt');
      }
    } catch (error) {
      console.error('Hiba a gyűjteményhez adáskor:', error);
      alert('Hiba történt a gyűjteményhez adáskor');
    }
  }
  async function onDeleteGame(gameId) {
    if (!window.confirm("Biztosan törlöd?")) return false;

    const res = await fetch(`http://localhost:3001/jatekok/${gameId}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      setGames((prev) => prev.filter((g) => g.id !== gameId));

      setComments((prev) => {
        const copy = { ...prev };
        delete copy[gameId];
        return copy;
      });

      return true;
    }

    return false;
  }

  // ---------- PROFILE EDIT ------------------
  function handleProfileEdit(data) {
    setUser((prev) => ({ ...prev, ...data }));
    setUsers((prev) => prev.map((u) => (u.username === user.username ? { ...u, ...data } : u)));
  }

  // ------------ SEARCH / FILTER ------------
  function filterSortGames(gamesList, search, filter, sort) {
    let filtered = [...gamesList];

    if (search.trim()) {
      filtered = filtered.filter(
        (g) =>
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.developer.toLowerCase().includes(search.toLowerCase()) ||
          (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // kategória szűrés: a categories tömbben keressük
    if (filter !== "Összes") {
      filtered = filtered.filter((g) => Array.isArray(g.categories) && g.categories.includes(filter));
    }

    switch (sort) {
      case "Legolcsóbb":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "Legdrágább":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "Értékelés ↑":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "Értékelés ↓":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    return filtered;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Home
                user={user}
                games={games}
                comments={comments}
                handleAddComment={handleAddComment}
                handleAddToWishlist={handleAddToWishlist}
                handleAddToCollection={handleAddToCollection}
              />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route
          path="/game/:id"
          element={
            <GameDetail
              user={user}
              games={games}
              comments={comments}
              onDeleteGame={onDeleteGame}
              handleAddComment={handleAddComment}
              fetchComments={fetchComments}
            />
          }
        />

        <Route path="/login" element={<LoginPage user={user} handleLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage handleRegister={handleRegister} />} />

        <Route
          path="/profile"
          element={
            <UserProfile 
              user={user}
              users={users}
              comments={comments}
              games={games}
              onProfileEdit={handleProfileEdit}
              onLogout={handleLogout}
            />
          }
        />

        <Route path="/nevjegy" element={<NevjegyPage />} />

        <Route
          path="/statistics"
          element={
            <Statistics 
              games={games}
              comments={comments}
              users={users}
              user={user}
            />
          }
        />

        <Route
          path="/admin"
          element={
            user?.role === 'admin' ? (
              <AdminPanel user={user} />
            ) : (
              <LoginPage handleLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/gamedev-upload"
          element={
            user?.role === 'gamedev' ? (
              <GameDevUpload user={user} />
            ) : (
              <LoginPage handleLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/gamedev-panel"
          element={
            user?.role === 'gamedev' ? (
              <GameDevPanel user={user} />
            ) : (
              <LoginPage handleLogin={handleLogin} />
            )
          }
        />
      </Routes>

      <Footer user={user} />
    </BrowserRouter>
  );
}

export default App;
