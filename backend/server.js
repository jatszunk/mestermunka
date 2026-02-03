const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MySQL kapcsolat pool beállítása
const db = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  port: 3307,
  user: "root",
  password: "",
  database: "jatekhirdeto",
  multipleStatements: true,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
});

// Kapcsolat ellenőrzése
db.getConnection((err, connection) => {
  if (err) {
    console.error("Nem sikerült csatlakozni a MySQL-hez:", err);
    return;
  }
  console.log("MySQL kapcsolat létrejött.");
  
  connection.query(`
    ALTER TABLE felhasznalo 
    ADD COLUMN IF NOT EXISTS bio TEXT NULL,
    ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS favoriteGenres JSON NULL,
    ADD COLUMN IF NOT EXISTS preferredPlatforms JSON NULL,
    ADD COLUMN IF NOT EXISTS country VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS birthYear INT NULL,
    ADD COLUMN IF NOT EXISTS discord VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS twitter VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS youtube VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS twitch VARCHAR(100) NULL
  `, (alterErr) => {
    if (alterErr) {
      console.error("Hiba a mezők hozzáadásakor:", alterErr);
    } else {
      console.log("Profil mezők hozzáadva vagy már léteznek.");
    }
  });
  connection.release();
});

// Middleware - jogosultság ellenőrzése
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    let username = req.body?.username || 
                  req.query?.username || 
                  req.headers?.username ||
                  (req.method === 'POST' && req.body && req.body.username);
    
    if (!username) {
      return res.status(401).json({ success: false, message: "Hiányzó felhasználónév" });
    }
    
    const sql = "SELECT szerepkor AS userRole FROM felhasznalo WHERE felhasznalonev = ? AND aktiv = 1";
    db.query(sql, [username], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Adatbázis hiba", error: err });
      if (!results.length) return res.status(401).json({ success: false, message: "Érvénytelen felhasználó" });

      const userRole = results[0].userRole;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ success: false, message: "Nincs jogosultsága" });
      }

      req.userRole = userRole;
      req.username = username;
      next();
    });
  };
};

// Regisztráció
app.post("/register", (req, res) => {
  const { felhasznalonev, email, jelszo, szerepkor = 'felhasznalo' } = req.body;
  
  const sql = "INSERT INTO felhasznalo (felhasznalonev, email, jelszo, szerepkor) VALUES (?, ?, ?, ?)";
  db.query(sql, [felhasznalonev, email, jelszo, szerepkor], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Hiba történt", error: err });
    res.json({ success: true });
  });
});

// Bejelentkezés
app.post("/login", (req, res) => {
  const { felhasznalonev, jelszo } = req.body;
  
  const sql = "SELECT * FROM felhasznalo WHERE felhasznalonev=? AND jelszo=? AND aktiv = 1";
  db.query(sql, [felhasznalonev, jelszo], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Hiba történt", error: err });
    if (results.length > 0) {
      // Update last login time
      db.query("UPDATE felhasznalo SET utolso_belepes = NOW() WHERE idfelhasznalo = ?", [results[0].idfelhasznalo]);
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: "Hibás adatok vagy inaktív fiók" });
    }
  });
});

// Játékok listázása
app.get("/jatekok", (req, res) => {
  const sql = `
    SELECT
      j.idjatekok AS id,
      j.nev AS title,
      f.nev AS developer,
      j.ar AS price,
      COALESCE(r.minimum, '-') AS minimum,
      COALESCE(r.ajanlott, '-') AS recommended,
      j.leiras AS description,
      j.kepurl AS image,
      COALESCE(j.ertekeles, 0) AS rating,
      GROUP_CONCAT(DISTINCT k.nev SEPARATOR ', ') AS categories,
      GROUP_CONCAT(DISTINCT p.nev SEPARATOR ', ') AS platforms
    FROM jatekok j
    LEFT JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    LEFT JOIN rendszerkovetelmeny r ON j.idrendszerkovetelmeny = r.idrendszerkovetelmeny
    LEFT JOIN jatekok_kategoriak jk ON j.idjatekok = jk.idjatekok
    LEFT JOIN kategoria k ON jk.idkategoria = k.idkategoria
    LEFT JOIN jatekok_platformok jp ON j.idjatekok = jp.idjatekok
    LEFT JOIN platform p ON jp.idplatform = p.idplatform
    WHERE (j.status = 'approved' OR j.status IS NULL)
    GROUP BY j.idjatekok
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });

    const mappedGames = results.map((game) => ({
      id: game.id,
      title: game.title,
      developer: game.developer,
      price: game.price === 0.00 ? "Ingyenes" : game.price ? `${game.price}` : "",
      image: game.image,
      requirements: { minimum: game.minimum, recommended: game.recommended },
      categories: game.categories ? game.categories.split(",").map((x) => x.trim()) : [],
      platforms: game.platforms ? game.platforms.split(",").map((x) => x.trim()) : [],
      rating: game.rating || 0,
      description: game.description,
    }));

    res.json({ success: true, games: mappedGames });
  });
});

// Komment mentése
app.post("/jatekok/:id/kommentek", (req, res) => {
  const gameId = req.params.id;
  const { username, text, rating } = req.body;

  if (!username || !text || rating == null) {
    return res.status(400).json({ success: false, message: "Hiányzó adatok!" });
  }

  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ? AND aktiv = 1", [username], (err, users) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (!users.length) return res.status(404).json({ success: false, message: "Nincs ilyen felhasználó vagy inaktív." });

    const userId = users[0].idfelhasznalo;

    db.query(
      "INSERT INTO kommentek (idfelhasznalo, idjatekok, ertekeles, tartalom) VALUES (?, ?, ?, ?)",
      [userId, gameId, Number(rating), text],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, error: err2 });

        res.json({
          success: true,
          comment: { id: result.insertId, user: username, text, rating: Number(rating) },
        });
      }
    );
  });
});

// Kommentek listázása
app.get("/kommentek", (req, res) => {
  const sql = `
    SELECT 
      k.idkommentek AS id,
      k.idjatekok AS gameId,
      f.felhasznalonev AS user,
      k.tartalom AS text,
      k.ertekeles AS rating
    FROM kommentek k
    LEFT JOIN felhasznalo f ON f.idfelhasznalo = k.idfelhasznalo
    WHERE k.status = 'active'
    ORDER BY k.idkommentek DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, comments: results });
  });
});

// ===== ÚJ VÉGPONTOK A TÁROLT ELJÁRÁSOKHOZ =====

// Felhasználói statisztikák lekérdezése
app.get("/user-statistics/:userId", checkRole(['admin', 'felhasznalo']), (req, res) => {
  const userId = req.params.userId;
  
  if (req.userRole !== 'admin') {
    // Get user ID from username for non-admin users
    db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ? AND aktiv = 1", [req.username], (err, userResults) => {
      if (err || !userResults.length) return res.status(403).json({ success: false, message: "Nincs jogosultsága" });
      if (userResults[0].idfelhasznalo != userId) return res.status(403).json({ success: false, message: "Nincs jogosultsága" });
      
      callStatisticsProcedure(userId, res);
    });
  } else {
    callStatisticsProcedure(userId, res);
  }
});

function callStatisticsProcedure(userId, res) {
  db.query("CALL GetUserStatistics(?)", [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, statistics: results[0][0] || null });
  });
}

// Játék értékelésének manuális frissítése
app.post("/update-game-rating/:gameId", checkRole(['admin']), (req, res) => {
  const gameId = req.params.gameId;
  
  db.query("CALL UpdateGameRating(?)", [gameId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, message: "Játék értékelése frissítve" });
  });
});

// Felhasználók listázása
app.get("/felhasznalok", (req, res) => {
  db.query("SELECT idfelhasznalo, felhasznalonev, email, szerepkor, nev, aktiv, utolso_belepes FROM felhasznalo ORDER BY szerepkor, felhasznalonev", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Hiba történt", error: err });
    res.json({ success: true, users: results });
  });
});

// Felhasználói profil frissítése
app.put("/users/:username", (req, res) => {
  const { username } = req.params;
  
  console.log('Profil frissítés kérés:', {
    params: req.params,
    body: req.body,
    headers: req.headers['content-type']
  });
  
  // Ellenőrizzük, hogy a body létezik-e
  if (!req.body) {
    console.log('Hiányzó req.body');
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });
  }
  
  const { email, name, nev, bio, avatar, favoriteGenres, preferredPlatforms, country, birthYear, discord, twitter, youtube, twitch } = req.body;
  
  // A frontend 'name' mezőt használja, de szervernek 'nev' kell
  const finalNev = name || nev || '';
  
  console.log('Destructured adatok:', { email, name, nev, finalNev, bio, avatar, favoriteGenres, preferredPlatforms, country, birthYear, discord, twitter, youtube, twitch });
  
  // JSON mezők konvertálása
  const favoriteGenresJson = Array.isArray(favoriteGenres) ? JSON.stringify(favoriteGenres) : null;
  const preferredPlatformsJson = Array.isArray(preferredPlatforms) ? JSON.stringify(preferredPlatforms) : null;
  
  const sql = `
    UPDATE felhasznalo 
    SET email = ?, nev = ?, bio = ?, avatar = ?, 
        favoriteGenres = ?, preferredPlatforms = ?, 
        country = ?, birthYear = ?, discord = ?, twitter = ?, youtube = ?, twitch = ?
    WHERE felhasznalonev = ?
  `;
  
  const params = [
    email, finalNev, bio, avatar, 
    favoriteGenresJson, preferredPlatformsJson, 
    country, birthYear, discord, twitter, youtube, twitch, 
    username
  ];
  
  console.log('SQL paraméterek:', params);
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('SQL hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    if (result.affectedRows === 0) {
      console.log('Nem található felhasználó:', username);
      return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    }
    console.log('Sikeres frissítés:', result);
    res.json({ success: true, message: "Profil frissítve" });
  });
});

// Felhasználói adatok lekérdezése
app.get("/users/:username", (req, res) => {
  const { username } = req.params;
  
  const sql = `
    SELECT 
      idfelhasznalo, felhasznalonev, email, szerepkor, nev, aktiv, utolso_belepes, 
      bio, avatar, favoriteGenres, preferredPlatforms, 
      country, birthYear, discord, twitter, youtube, twitch 
    FROM felhasznalo 
    WHERE felhasznalonev = ?
  `;
  
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (results.length === 0) return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    
    // JSON mezők konvertálása
    const user = {
      ...results[0],
      favoriteGenres: results[0].favoriteGenres ? JSON.parse(results[0].favoriteGenres) : [],
      preferredPlatforms: results[0].preferredPlatforms ? JSON.parse(results[0].preferredPlatforms) : [],
      name: results[0].nev || results[0].felhasznalonev
    };
    
    res.json({ success: true, user });
  });
});

// Admin végpontok
app.get("/admin/users", checkRole(['admin']), (req, res) => {
  const sql = "SELECT idfelhasznalo, felhasznalonev, email, szerepkor, nev, aktiv, utolso_belepes FROM felhasznalo ORDER BY szerepkor, felhasznalonev";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, users: results });
  });
});

app.delete("/admin/users/:id", checkRole(['admin']), (req, res) => {
  const userId = req.params.id;
  const sql = "UPDATE felhasznalo SET aktiv = 0 WHERE idfelhasznalo = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    res.json({ success: true, message: "Felhasználó deaktiválva" });
  });
});

// Admin statisztikák
app.get("/admin/statistics", checkRole(['admin']), (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM felhasznalo WHERE aktiv = 1) AS total_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE szerepkor = 'felhasznalo' AND aktiv = 1) AS regular_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE szerepkor = 'gamedev' AND aktiv = 1) AS gamedev_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE szerepkor = 'admin' AND aktiv = 1) AS admin_users,
      (SELECT COUNT(*) FROM jatekok) AS total_games,
      (SELECT COUNT(*) FROM jatekok WHERE status = 'approved') AS approved_games,
      (SELECT COUNT(*) FROM jatekok WHERE status = 'pending') AS pending_games,
      (SELECT COUNT(*) FROM jatekok WHERE status = 'rejected') AS rejected_games,
      (SELECT COUNT(*) FROM kommentek WHERE status = 'active') AS total_comments,
      (SELECT AVG(ertekeles) FROM kommentek WHERE status = 'active' AND ertekeles IS NOT NULL) AS avg_rating
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, statistics: results[0] });
  });
});

// Várakozó játékok listázása (admin)
app.get("/admin/pending-games", checkRole(['admin']), (req, res) => {
  const sql = `
    SELECT
      j.idjatekok AS id,
      j.nev AS title,
      f.nev AS developer,
      j.ar AS price,
      j.leiras AS description,
      j.kepurl AS image,
      j.ertekeles AS rating,
      j.status,
      j.uploaded_by,
      u.felhasznalonev AS uploaded_by_name,
      GROUP_CONCAT(DISTINCT k.nev SEPARATOR ', ') AS categories
    FROM jatekok j
    JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    LEFT JOIN felhasznalo u ON j.uploaded_by = u.idfelhasznalo
    LEFT JOIN jatekok_kategoriak jk ON j.idjatekok = jk.idjatekok
    LEFT JOIN kategoria k ON jk.idkategoria = k.idkategoria
    WHERE j.status = 'pending'
    GROUP BY j.idjatekok
    ORDER BY j.idjatekok DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, games: results });
  });
});

// Jóváhagyott játékok listázása (admin)
app.get("/admin/approved-games", checkRole(['admin']), (req, res) => {
  const sql = `
    SELECT
      j.idjatekok AS id,
      j.nev AS title,
      f.nev AS developer,
      j.ar AS price,
      j.leiras AS description,
      j.kepurl AS image,
      j.ertekeles AS rating,
      j.status,
      j.uploaded_by,
      u.felhasznalonev AS uploaded_by_name,
      GROUP_CONCAT(DISTINCT k.nev SEPARATOR ', ') AS categories
    FROM jatekok j
    JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    LEFT JOIN felhasznalo u ON j.uploaded_by = u.idfelhasznalo
    LEFT JOIN jatekok_kategoriak jk ON j.idjatekok = jk.idjatekok
    LEFT JOIN kategoria k ON jk.idkategoria = k.idkategoria
    WHERE j.status = 'approved'
    GROUP BY j.idjatekok
    ORDER BY j.idjatekok DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, games: results });
  });
});

// Wishlist végpontok
app.get("/wishlist/:username", (req, res) => {
  const { username } = req.params;
  
  const sql = `
    SELECT 
      w.id,
      w.created_at,
      j.idjatekok AS gameId,
      j.nev AS title,
      j.kepurl AS image,
      j.ar AS price,
      f.nev AS developer
    FROM wishlist w
    JOIN jatekok j ON w.idjatekok = j.idjatekok
    JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    JOIN felhasznalo u ON w.idfelhasznalo = u.idfelhasznalo
    WHERE u.felhasznalonev = ?
    ORDER BY w.created_at DESC
  `;

  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, wishlist: results });
  });
});

// Collection végpontok
app.get("/collection/:username", (req, res) => {
  const { username } = req.params;
  
  const sql = `
    SELECT 
      c.id,
      c.status,
      c.rating,
      c.notes,
      c.added_at,
      c.updated_at,
      j.idjatekok AS gameId,
      j.nev AS title,
      j.kepurl AS image,
      j.ar AS price,
      f.nev AS developer
    FROM game_collection c
    JOIN jatekok j ON c.idjatekok = j.idjatekok
    JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    JOIN felhasznalo u ON c.idfelhasznalo = u.idfelhasznalo
    WHERE u.felhasznalonev = ?
    ORDER BY c.updated_at DESC
  `;

  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, collection: results });
  });
});

app.post("/collection/:username/:gameId", (req, res) => {
  const { username, gameId } = req.params;
  const { status = 'owned', rating, notes } = req.body;
  
  // Felhasználó ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [username], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    }

    const userId = userResults[0].idfelhasznalo;

    const sql = "INSERT INTO game_collection (idfelhasznalo, idjatekok, status, rating, notes) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [userId, gameId, status, rating || null, notes || null], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: "Ez a játék már a gyűjteményben van" });
        }
        return res.status(500).json({ success: false, error: err });
      }
      res.json({ success: true, message: "Játék hozzáadva a gyűjteményhez" });
    });
  });
});

app.post("/wishlist/:username/:gameId", (req, res) => {
  const { username, gameId } = req.params;
  
  // Felhasználó ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [username], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    }

    const userId = userResults[0].idfelhasznalo;

    const sql = "INSERT INTO wishlist (idfelhasznalo, idjatekok) VALUES (?, ?)";
    db.query(sql, [userId, gameId], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: "Ez a játék már a kívánságlistán van" });
        }
        return res.status(500).json({ success: false, error: err });
      }
      res.json({ success: true, message: "Játék hozzáadva a kívánságlistához" });
    });
  });
});

// Játék jóváhagyása (admin)
app.post("/admin/approve-game/:id", checkRole(['admin']), (req, res) => {
  const gameId = req.params.id;
  const adminUsername = req.username;

  // Admin ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [adminUsername], (err, adminResults) => {
    if (err || adminResults.length === 0) {
      return res.status(400).json({ success: false, message: "Admin nem található" });
    }

    const adminId = adminResults[0].idfelhasznalo;
    
    const sql = `
      UPDATE jatekok 
      SET status = 'approved', approved_at = NOW(), approved_by = ?, rejection_reason = NULL
      WHERE idjatekok = ?
    `;

    db.query(sql, [adminId, gameId], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Játék nem található" });
      res.json({ success: true, message: "Játék jóváhagyva" });
    });
  });
});

// Játék elutasítása (admin)
app.post("/admin/reject-game/:id", checkRole(['admin']), (req, res) => {
  const gameId = req.params.id;
  const { rejectionReason } = req.body;
  const adminUsername = req.username;

  // Admin ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [adminUsername], (err, adminResults) => {
    if (err || adminResults.length === 0) {
      return res.status(400).json({ success: false, message: "Admin nem található" });
    }

    const sql = `
      UPDATE jatekok 
      SET status = 'rejected', rejection_reason = ?, approved_at = NULL, approved_by = NULL
      WHERE idjatekok = ?
    `;

    db.query(sql, [rejectionReason, gameId], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Játék nem található" });
      res.json({ success: true, message: "Játék elutasítva" });
    });
  });
});

// Játék törlése (admin)
app.delete("/admin/games/:id", checkRole(['admin']), (req, res) => {
  const gameId = req.params.id;

  const sql = "DELETE FROM jatekok WHERE idjatekok = ?";
  db.query(sql, [gameId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Játék nem található" });
    res.json({ success: true, message: "Játék törölve" });
  });
});

app.get("/", (req, res) => res.send("fut a szerver"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
