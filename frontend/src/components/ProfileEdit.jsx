import React, { useState, useEffect } from "react";

const ProfileEdit = ({ user, onProfileUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    avatar: "",
    favoriteGenres: [],
    preferredPlatforms: [],
    country: "",
    birthYear: "",
    discord: "",
    twitter: "",
    youtube: "",
    twitch: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        favoriteGenres: user.favoriteGenres || [],
        preferredPlatforms: user.preferredPlatforms || [],
        country: user.country || "",
        birthYear: user.birthYear || "",
        discord: user.discord || "",
        twitter: user.twitter || "",
        youtube: user.youtube || "",
        twitch: user.twitch || "",
      });
    }
  }, [user]);

  const genres = [
    "Akció", "Kaland", "RPG", "Stratégia", "Sport", "Verseny",
    "Horrort", "Puzzle", "Platformer", "Shooter", "MMO", "Szimulátor",
    "Indie", "Co-op", "Battle Royale", "MOBA", "Taktikai", "Barkochba",
  ];

  const platforms = [
    "PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One",
    "Nintendo Switch", "Mobil", "VR", "Steam", "Epic Games", "GOG",
  ];

  const countries = [
    "Magyarország", "Ausztria", "Németország", "Szlovákia", "Románia",
    "Egyesült Királyság", "Egyesült Államok", "Kanada", "Franciaország", "Olaszország",
    "Spanyolország", "Lengyelország", "Csehország", "Horvátország", "Szerbia",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10, 16, 24, 0.65)",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
  };

  const selectStyle = {
    ...inputStyle,
    background: "#fff",
    color: "#000",
    border: "1px solid rgba(0,0,0,0.18)",
  };

  const optionStyle = {
    background: "#fff",
    color: "#000",
  };

  const sectionStyle = {
    background: "rgba(52, 73, 94, 0.55)",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid rgba(0, 255, 255, 0.22)",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const handlePlatformToggle = (platform) => {
    setFormData((prev) => ({
      ...prev,
      preferredPlatforms: prev.preferredPlatforms.includes(platform)
        ? prev.preferredPlatforms.filter((p) => p !== platform)
        : [...prev.preferredPlatforms, platform],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit kezdődik, loading állapot:', loading);
    setLoading(true);
    console.log('loading beállítva true-ra, loading állapot:', loading);
    setMessage("");

    if (!formData || !user || !user.username) {
      setMessage("Hiányzó adatok vagy felhasználó!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    console.log('Profil mentés adatok:', formData);
    
    onProfileUpdate(formData)
      .then(result => {
        console.log('Profil mentés eredmény:', result);
        
        // A loading állapotot csak a sikeres/hibás válasz után állítjuk vissza
        if (result && result.success === true) {
          const successMessage = result.message || 'Sikeres mentés!';
          setMessage(successMessage);
          setMessageType("success");
          console.log('Sikeres mentés:', successMessage);
          setLoading(false); // Sikeres esetén is állítsuk vissza
          console.log('loading visszaállítva false-ra, loading állapot:', loading);
          
          // Azonnal bezárjuk a kártyát sikeres mentés után
          onCancel();
        } else {
          const errorMessage = result?.message || "Ismeretlen hiba történt";
          setMessage(errorMessage);
          setMessageType("error");
          console.error('Profil mentés hiba:', errorMessage);
          setLoading(false); // Hiba esetén is állítsuk vissza
          console.log('loading visszaállítva false-ra hiba esetén, loading állapot:', loading);
        }
      })
      .catch(error => {
        console.error("Profil frissítési hiba:", error);
        setMessage("Hiba történt a frissítés során");
        setMessageType("error");
        setLoading(false); // Kivétel esetén is állítsuk vissza
        console.log('loading visszaállítva false-ra catch blokkban, loading állapot:', loading);
      });
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.78)",
          backdropFilter: "blur(8px)",
          zIndex: 999,
        }}
      />

      {/* Dialog */}
      <div
        className="profile-edit-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          inset: "50% auto auto 50%",
          transform: "translate(-50%, -50%)",
          width: "min(1100px, 92vw)",
          height: "min(800px, 88vh)",
          zIndex: 1000,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(0, 255, 255, 0.55)",
          boxShadow:
            "0 0 0 1px rgba(0,255,255,0.18), 0 0 28px rgba(0,255,255,0.22), 0 0 70px rgba(0,255,255,0.10)",
          background: "rgba(44, 62, 80, 0.92)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header (fix, nem scrollozik) */}
        {/* Header (fix, nem scrollozik) */}
        <div
          style={{
            position: "relative",
            padding: "16px 18px",
            borderBottom: "1px solid rgba(0, 255, 255, 0.22)",
            background:
              "linear-gradient(180deg, rgba(0,255,255,0.10), rgba(0,0,0,0.0))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#c9ffff",
                letterSpacing: 0.6,
                textShadow:
                  "0 0 10px rgba(0,255,255,0.40), 0 0 24px rgba(0,255,255,0.20)",
                paddingRight: 70, // hely a gombnak, hogy ne csússzon rá
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              📝 Profil szerkesztése
            </div>

            {/* Jobb felső neon close */}
            <button
  onClick={onCancel}
  title="Bezárás"
  style={{
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(0, 255, 255, 0.70)",
    background: "rgba(8, 12, 18, 0.55)",
    color: "#bffcff",
    cursor: "pointer",
    fontWeight: 1000,
    boxShadow:
      "0 0 0 1px rgba(0,255,255,0.20) inset, 0 0 22px rgba(0,255,255,0.40), 0 0 70px rgba(255,0,255,0.14)",
  }}
>
  ✖
</button>


          </div>

          {/* Neon “beütés” csík */}
          <div
            style={{
              marginTop: 12,
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, rgba(0,255,255,0), rgba(0,255,255,0.95), rgba(255,0,255,0.65), rgba(0,255,255,0))",
              boxShadow: "0 0 18px rgba(0,255,255,0.35)",
            }}
          />
        </div>


        {/* Üzenet */}
        {message && (
          <div
            style={{
              margin: "12px 18px 0 18px",
              padding: "10px 12px",
              borderRadius: 12,
              fontWeight: 700,
              color: messageType === "success" ? "#0b2b12" : "#2b0b0b",
              background:
                messageType === "success"
                  ? "rgba(0, 255, 140, 0.18)"
                  : "rgba(255, 80, 80, 0.18)",
              border:
                messageType === "success"
                  ? "1px solid rgba(0,255,140,0.25)"
                  : "1px solid rgba(255,80,80,0.25)",
            }}
          >
            {message}
          </div>
        )}

        {/* Body (egyetlen scroll itt van) */}
        <div
          style={{
            padding: "14px 18px 18px 18px",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* Alap információk */}
            <div style={sectionStyle}>
              <h3 style={{ margin: "0 0 12px 0", color: "#8ffcff", fontSize: 16 }}>
                🔧 Alap információk
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Teljes név
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Add meg a teljes neved"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Felhasználónév
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Egyedi felhasználónév"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Email cím
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@pelda.com"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://pelda.com/avatar.jpg"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                  Bemutatkozás
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Mesélj magadról pár mondatban..."
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
            </div>

            {/* Személyes adatok */}
            <div style={sectionStyle}>
              <h3 style={{ margin: "0 0 12px 0", color: "#8ffcff", fontSize: 16 }}>
                👤 Személyes adatok
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Ország
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="" style={optionStyle}>
                      Válassz országot
                    </option>
                    {countries.map((country) => (
                      <option key={country} value={country} style={optionStyle}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Születési év
                  </label>
                  <select
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="" style={optionStyle}>
                      Válassz évet
                    </option>
                    {years.map((year) => (
                      <option key={year} value={year} style={optionStyle}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Játék preferenciák */}
            <div style={sectionStyle}>
              <h3 style={{ margin: "0 0 12px 0", color: "#8ffcff", fontSize: 16 }}>
                🎮 Játék preferenciák
              </h3>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#eaf6ff", fontWeight: 700 }}>
                  Kedvenc műfajok
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {genres.map((genre) => {
                    const selected = formData.favoriteGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        style={{
                          padding: "9px 12px",
                          borderRadius: 999,
                          border: selected
                            ? "1px solid rgba(0,255,255,0.75)"
                            : "1px solid rgba(255,255,255,0.18)",
                          background: selected ? "rgba(0,255,255,0.88)" : "rgba(10,16,24,0.45)",
                          color: selected ? "#000" : "#eaf6ff",
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#eaf6ff", fontWeight: 700 }}>
                  Preferált platformok
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {platforms.map((platform) => {
                    const selected = formData.preferredPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handlePlatformToggle(platform)}
                        style={{
                          padding: "9px 12px",
                          borderRadius: 999,
                          border: selected
                            ? "1px solid rgba(0,255,255,0.75)"
                            : "1px solid rgba(255,255,255,0.18)",
                          background: selected ? "rgba(0,255,255,0.88)" : "rgba(10,16,24,0.45)",
                          color: selected ? "#000" : "#eaf6ff",
                          cursor: "pointer",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Közösségi média */}
            <div style={sectionStyle}>
              <h3 style={{ margin: "0 0 12px 0", color: "#8ffcff", fontSize: 16 }}>
                🌐 Közösségi média
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Discord
                  </label>
                  <input
                    type="text"
                    name="discord"
                    value={formData.discord}
                    onChange={handleChange}
                    placeholder="Felhasználónév#1234"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Twitter/X
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="@felhasznalo"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    YouTube
                  </label>
                  <input
                    type="text"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    placeholder="Csatorna neve"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#eaf6ff", fontWeight: 700 }}>
                    Twitch
                  </label>
                  <input
                    type="text"
                    name="twitch"
                    value={formData.twitch}
                    onChange={handleChange}
                    placeholder="Felhasználónév"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Actions (a form végén, a body scrollozható) */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                paddingTop: 4,
              }}
            >
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 60, 60, 0.65)",
                  background: "rgba(12, 6, 8, 0.55)",
                  color: "#ffd5d5",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 950,
                  boxShadow:
                    "0 0 0 1px rgba(255,60,60,0.18) inset, 0 0 18px rgba(255,60,60,0.25), 0 0 55px rgba(255,60,60,0.12)",
                }}

              >
                Mégse
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(0, 255, 255, 0.70)",
                  background: loading ? "rgba(40, 50, 60, 0.65)" : "rgba(0, 255, 255, 0.10)",
                  color: "#c9ffff",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 950,
                  boxShadow:
                    "0 0 0 1px rgba(0,255,255,0.22) inset, 0 0 22px rgba(0,255,255,0.35), 0 0 80px rgba(255,0,255,0.10)",
                }}

              >
                {loading ? "Sikeres mentés" : "Profil mentése"}
              </button>
              {/* Debug: loading állapot */}
              {console.log('Gomb renderelése, loading:', loading)}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfileEdit;
