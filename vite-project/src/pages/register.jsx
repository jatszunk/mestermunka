
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import '../App.css'; // opcionális, ha kell

function ProfilePage({ user, handleProfileEdit, handleLogout }) {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : (avatarUrl || ("https://ui-avatars.com/api/?name=" + (user?.username || "U")));

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
          <img
            src={avatarPreview}
            alt="profil"
            style={{
              width: 80, height: 80, borderRadius: 40, objectFit: 'cover',
              border: '2px solid #27e8ff', marginBottom: 10
            }}
          />
        </div>

        {edit ? (
          <>
            <div>
              <label>Kép feltöltés:&nbsp;</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ margin: "8px 0 8px 0" }}
              />
              <label>vagy URL:</label>
              <input
                value={avatarUrl}
                onChange={e => { setAvatarUrl(e.target.value); setAvatarFile(null); }}
                placeholder="Kép URL"
                style={{ marginBottom: 10, width: '100%' }}
                className="login-input"
              />
            </div>

            <div><b>Név:</b> <input value={user.username} disabled style={{ width: "80%" }} className="login-input" /></div>
            <div><b>Email:</b> <input value={user.email} disabled style={{ width: "80%" }} className="login-input" /></div>

            <div><b id='leirass'>Leírás:</b></div>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              style={{ width: "100%", marginBottom: 8 }}
              maxLength={100}
              className="login-input"
            />

            <button className="login-btn" style={{ marginBottom: 9 }} onClick={handleSave}>
              Mentés
            </button>
          </>
        ) : (
          <>
            <div><b>Név:</b> {user?.username}</div>
            <div><b>Email:</b> {user?.email}</div>
            <div><b id='leirass'>Leírás:</b> {user?.bio || "–"}</div>
            <button className="login-btn" style={{ margin: "14px 0 9px 0" }} onClick={() => setEdit(true)}>
              Szerkesztés
            </button>
          </>
        )}

        <button className="vissza-btn" style={{ marginTop: "7px" }} onClick={() => navigate('/')}>
          ⬅ Vissza
        </button>
        <button
          className="vissza-btn"
          style={{ marginTop: "7px", background: 'crimson', color: '#fff' }}
          onClick={handleLogout}
        >
          Kijelentkezés
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
