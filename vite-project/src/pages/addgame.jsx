import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

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
    export default AddGamePage;