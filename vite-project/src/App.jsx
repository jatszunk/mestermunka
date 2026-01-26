import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";

import Home from "./pages/Home.jsx";
import GameDetail from "./pages/GameDetail.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import AddGamePage from "./pages/AddGamePage.jsx";
import NevjegyPage from "./pages/Nevjegy.jsx";
import LandingPage from "./pages/landingpage.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import GameDevUpload from "./pages/GameDevUpload.jsx";
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
    axios.get("http://localhost:3001/felhasznalok").then((res) => {
      if (res.data.success) {
        const mapped = (res.data.users || []).map((u) => ({
          id: u.idfelhasznalo,
          username: u.felhasznalonev,
          email: u.email,
          password: u.jelszo,
          bio: u.bio || "",
          avatar: u.avatar || "",
          role: u.role || "user",
          name: u.nev || "",
        }));
        setUsers(mapped);
      }
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
    axios
      .post("http://localhost:3001/login", {
        felhasznalonev: uname,
        jelszo: pass,
      })
      .then((res) => {
        if (res.data.success) {
          const u = res.data.user;
          setUser({
            id: u.idfelhasznalo,
            username: u.felhasznalonev,
            email: u.email,
            role: u.role || "user",
            bio: u.bio || "",
            avatar: u.avatar || "",
            name: u.nev || "",
          });
          navigate("/");
        } else {
          alert("Hibás felhasználónév vagy jelszó!");
        }
      });
  }

  function handleRegister(uname, email, pass, role = 'user', cb) {
    if (users.some((u) => u.username === uname)) {
      alert("Ez a név már foglalt!");
      return;
    }

    const newUser = { 
      username: uname, 
      email, 
      password: pass, 
      role,
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
      role,
    });

    cb && cb();
  }

  function handleLogout() {
    setUser(null);
  }

  // ------------ COMMENTS (DB) ------------------
  async function fetchComments(gameId) {
    // Nálad a szerverben jelenleg nincs GET /jatekok/:id/kommentek endpoint,
    // ezért itt a teljes /kommentek listát frissítjük és gameId szerint csoportosítjuk.
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

  async function handleDeleteComment(gameId, commentId) {
    if (!user || user.username !== "admin") return;

    const res = await axios.delete(`http://localhost:3001/kommentek/${commentId}`);
    if (res.data.success) {
      setComments((prev) => ({
        ...prev,
        [gameId]: (prev[gameId] || []).filter((c) => c.id !== commentId),
      }));
    }
  }

  // ------------ DELETE GAME (admin only) ------------------
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
                handleDeleteComment={handleDeleteComment}
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

        <Route
          path="/addgame"
          element={
            user?.username === "admin" ? (
              <AddGamePage setGames={setGames} />
            ) : (
              <Home user={user} games={games} comments={comments} filterSortGames={filterSortGames} />
            )
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
            user?.role === 'gamedev' || user?.role === 'admin' ? (
              <GameDevUpload user={user} />
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
