
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfilePage({ user, handleProfileEdit, handleLogout }) {
  const navigate = useNavigate();

  const [edit, setEdit] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`;

  function uploadImage(e) {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  }

  function save() {
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

      <div className="nevjegy-card" style={{ maxWidth: 380 }}>
        <img src={avatarPreview} alt="profil" className="profile-avatar" />

        {edit ? (
          <>
            <div>
              <label>Kép feltöltés:</label>
              <input type="file" accept="image/*" onChange={uploadImage} />
            </div>

            <div>
              <label>vagy URL:</label>
              <input
                value={avatarUrl}
                onChange={e => {
                  setAvatarUrl(e.target.value);
                  setAvatarFile(null);
                }}
              />
            </div>

            <b>Név:</b> <input value={user.username} disabled />

            <b>Email:</b> <input value={user.email} disabled />

            <b>Leírás:</b>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={200}
            />

            <button className="login-btn" onClick={save}>Mentés</button>
          </>
        ) : (
          <>
            <b>Név:</b> {user.username}
            <br />
            <b>Email:</b> {user.email}
            <br />
            <b>Leírás:</b> {user.bio || "—"}

            <button className="login-btn" onClick={() => setEdit(true)}>
              Szerkesztés
            </button>
          </>
        )}

        <button className="vissza-btn" onClick={() => navigate('/')}>
          ⬅ Vissza
        </button>

        <button
          className="vissza-btn"
          style={{ background: "crimson", color: "#fff" }}
          onClick={handleLogout}
        >
          Kijelentkezés
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
