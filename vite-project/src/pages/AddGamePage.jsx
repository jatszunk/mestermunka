import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AddGamePage({ setGames }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    developer: "",
    price: "",
    category: "",
    image: "",
    minReq: "",
    recReq: "",
    desc: "",
    rating: 5,

    videosText: "",

    // EXTRA (új tábla)
    megjelenes: "",
    steamLink: "",
    jatekElmeny: "", // nem kötelező
    reszletesLeiras: "", // kötelező
  });

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.title ||
      !form.developer ||
      !form.price ||
      !form.category ||
      !form.image ||
      !form.minReq ||
      !form.recReq ||
      !form.megjelenes ||
      !form.steamLink ||
      !form.reszletesLeiras
    ) {
      alert("A kötelező mezők nincsenek kitöltve!");
      return;
    }

    const videos = form.videosText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = { ...form, videos };
    delete payload.videosText;

    try {
      const res = await fetch("http://localhost:3001/jatekok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Játék hozzáadva!");
        setGames((prev) => [...prev, data.game]);
        navigate("/");
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
        <Link to="/" className="nav-link">
          Főoldal
        </Link>
        <button className="vissza-btn" style={{ marginLeft: "24px" }} onClick={() => navigate("/")}>
          ⬅ Vissza
        </button>
      </nav>

      <h2>Új játék hozzáadása (admin)</h2>

      <form className="login-form" style={{ maxWidth: 520, width: "98vw" }} onSubmit={handleSubmit}>
        <input
          className="login-input"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Játék címe"
          required
        />

        <input
          className="login-input"
          value={form.developer}
          onChange={(e) => setForm((f) => ({ ...f, developer: e.target.value }))}
          placeholder="Fejlesztő"
          required
        />

        <input
          className="login-input"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="Ár pl: 9990 Ft vagy Ingyenes"
          required
        />

        <input
          className="login-input"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          placeholder="Kategória Vesszőkkel elválasztva (pl. Akció, Kaland)" 
          required
        />

        <input
          className="login-input"
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={form.rating}
          onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
          placeholder="Értékelés (pl. 9.2)"
          required
        />

        <textarea
          className="login-input"
          value={form.desc}
          onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
          placeholder="Rövid leírás (a kártyára)"
          style={{ minHeight: 80 }}
        />

        <input
          className="login-input"
          value={form.minReq}
          onChange={(e) => setForm((f) => ({ ...f, minReq: e.target.value }))}
          placeholder="Minimum gépigény"
          required
        />

        <input
          className="login-input"
          value={form.recReq}
          onChange={(e) => setForm((f) => ({ ...f, recReq: e.target.value }))}
          placeholder="Ajánlott gépigény"
          required
        />

        <input
          className="login-input"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          placeholder="Kép URL"
          required
        />

        {form.image && <img src={form.image} alt="játék kép előnézet" style={{ width: 120, margin: "8px auto" }} />}

        <textarea
          className="login-input"
          value={form.videosText}
          onChange={(e) => setForm((f) => ({ ...f, videosText: e.target.value }))}
          placeholder={"Videó linkek (1 sor = 1 link)\nPl:\nhttps://www.youtube.com/watch?v=...\nhttps://youtu.be/..."}
          style={{ minHeight: 110 }}
        />

        {/* EXTRA INFÓK */}
        <input
          className="login-input"
          value={form.megjelenes}
          onChange={(e) => setForm((f) => ({ ...f, megjelenes: e.target.value }))}
          placeholder="Megjelenés (kötelező) pl. 2025-10-12"
          required
        />

        <input
          className="login-input"
          value={form.steamLink}
          onChange={(e) => setForm((f) => ({ ...f, steamLink: e.target.value }))}
          placeholder="Steam link (kötelező)"
          required
        />

        <textarea
          className="login-input"
          value={form.reszletesLeiras}
          onChange={(e) => setForm((f) => ({ ...f, reszletesLeiras: e.target.value }))}
          placeholder="Játék részletes leírása (kötelező)"
          style={{ minHeight: 120 }}
          required
        />

        <textarea
          className="login-input"
          value={form.jatekElmeny}
          onChange={(e) => setForm((f) => ({ ...f, jatekElmeny: e.target.value }))}
          placeholder="Játék élménye (nem kötelező)"
          style={{ minHeight: 90 }}
        />

        <button className="login-btn" type="submit">
          Játék hozzáadása
        </button>
      </form>
    </div>
  );
}

export default AddGamePage;
