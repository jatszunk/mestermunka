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
      console.error("Hiba a felhasználó mezők hozzáadásakor:", alterErr);
    } else {
      console.log("Felhasználó mezők hozzáadva vagy már léteznek.");
    }
  });

  connection.query(`
    ALTER TABLE jatekok 
    ADD COLUMN IF NOT EXISTS megjelenes VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS steam_link VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS jatek_elmeny TEXT NULL,
    ADD COLUMN IF NOT EXISTS reszletes_leiras TEXT NULL,
    ADD COLUMN IF NOT EXISTS approved_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS approved_by INT NULL,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
    ADD COLUMN IF NOT EXISTS uploaded_by INT NULL
  `, (gameAlterErr) => {
    if (gameAlterErr) {
      console.error("Hiba a játék mezők hozzáadásakor:", gameAlterErr);
    } else {
      console.log("Játék mezők hozzáadva vagy már léteznek.");
    }
  });

  // Problémát okozó trigger eltávolítása
  connection.query("DROP TRIGGER IF EXISTS log_game_status_change", (triggerErr) => {
    if (triggerErr) {
      console.log("Trigger eltávolítása nem szükséges vagy hiba történt:", triggerErr.message);
    } else {
      console.log("log_game_status_change trigger eltávolítva.");
    }
  });
  connection.release();
});

// Middleware - jogosultság ellenőrzése
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Próbáljuk megkapni a felhasználónevet több forrásból
    let username = req.body?.username || 
                  req.query?.username || 
                  req.headers?.username ||
                  req.headers['x-username'] ||
                  (req.method === 'POST' && req.body && req.body.username);
    
    console.log('checkRole - keresett username:', username);
    console.log('checkRole - req.body:', req.body);
    console.log('checkRole - req.headers:', req.headers);
    
    if (!username) {
      console.log('checkRole - nincs username');
      return res.status(401).json({ success: false, message: "Hiányzó felhasználónév" });
    }
    
    const sql = "SELECT szerepkor AS userRole FROM felhasznalo WHERE felhasznalonev = ? AND aktiv = 1";
    db.query(sql, [username], (err, results) => {
      if (err) {
        console.error('checkRole - adatbázis hiba:', err);
        return res.status(500).json({ success: false, message: "Adatbázis hiba", error: err });
      }
      
      console.log('checkRole - adatbázis eredmény:', results);
      
      if (!results.length) {
        console.log('checkRole - nincs ilyen felhasználó vagy inaktív:', username);
        return res.status(401).json({ success: false, message: "Érvénytelen felhasználó" });
      }

      const userRole = results[0].userRole;
      console.log('checkRole - felhasználó szerepköre:', userRole, 'engedélyezett:', allowedRoles);
      
      if (!allowedRoles.includes(userRole)) {
        console.log('checkRole - nincs jogosultsága');
        return res.status(403).json({ success: false, message: "Nincs jogosultsága" });
      }

      req.userRole = userRole;
      req.username = username;
      console.log('checkRole - sikeres ellenőrzés');
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
      CASE WHEN j.penznem IS NULL OR j.penznem = '' THEN NULL ELSE j.penznem END AS currency,
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
app.get("/jatekok/:id/extra", (req, res) => {
  const gameId = req.params.id;

  const sql = `
    SELECT
      megjelenes,
      steam_link AS steamLink,
      jatek_elmeny AS jatekElmeny,
      reszletes_leiras AS reszletesLeiras
    FROM jatekextra
    WHERE idjatekok = ?
    LIMIT 1
  `;

  db.query(sql, [gameId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (!results.length) return res.json({ success: true, extra: null });
    return res.json({ success: true, extra: results[0] });
  });
});

app.get("/jatekok/:id/videok", (req, res) => {
  const gameId = req.params.id;

  const sql = `
    SELECT id, url
    FROM jatek_videok
    WHERE idjatekok = ?
    ORDER BY id ASC
  `;

  db.query(sql, [gameId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    return res.json({ success: true, videos: results || [] });
  });
});


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

  console.log('Komment hozzáadás kérés:', { gameId, username, text, rating });

  if (!username || !text || rating == null) {
    return res.status(400).json({ success: false, message: "Hiányzó adatok!" });
  }

  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ? AND aktiv = 1", [username], (err, users) => {
    if (err) {
      console.error('Felhasználó keresési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    if (!users.length) return res.status(404).json({ success: false, message: "Nincs ilyen felhasználó vagy inaktív." });

    const userId = users[0].idfelhasznalo;

    db.query(
      "INSERT INTO kommentek (idfelhasznalo, idjatekok, ertekeles, tartalom) VALUES (?, ?, ?, ?)",
      [userId, gameId, Number(rating), text],
      (err2, result) => {
        if (err2) {
          console.error('Komment hozzáadási hiba:', err2);
          return res.status(500).json({ success: false, error: err2 });
        }

        console.log('Komment sikeresen hozzáadva:', result.insertId);
        res.json({
          success: true,
          comment: { id: result.insertId, user: username, text, rating: Number(rating) },
        });
      }
    );
  });
});

// Komment törlése (admin)
app.delete("/kommentek/:commentId", checkRole(['admin']), (req, res) => {
  const commentId = req.params.commentId;
  
  console.log('Komment törlés kérés:', { commentId });

  const sql = "DELETE FROM kommentek WHERE id = ?";
  
  db.query(sql, [commentId], (err, result) => {
    if (err) {
      console.error('Komment törlési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Komment nem található" });
    }
    
    console.log('Komment sikeresen törölve:', commentId);
    res.json({ success: true, message: "Komment sikeresen törölve" });
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

app.delete("/admin/users/:userId", checkRole(['admin']), (req, res) => {
  const userId = req.params.userId;
  
  console.log('Felhasználó törlés kérés:', { userId, username: req.username });

  // Ellenőrizzük, hogy nem saját magát próbálja-e törölni
  if (req.username) {
    db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [req.username], (err, adminResults) => {
      if (err) {
        console.error('Admin keresési hiba:', err);
        return res.status(500).json({ success: false, error: err });
      }
      
      if (adminResults.length === 0) {
        return res.status(404).json({ success: false, message: "Admin nem található" });
      }
      
      const adminId = adminResults[0].idfelhasznalo;
      
      if (parseInt(userId) === adminId) {
        return res.status(400).json({ success: false, message: "Nem törölheti saját magát" });
      }
      
      // Felhasználó deaktiválása (soft delete)
      const sql = "UPDATE felhasznalo SET aktiv = 0 WHERE idfelhasznalo = ?";
      
      db.query(sql, [userId], (err, result) => {
        if (err) {
          console.error('Felhasználó törlési hiba:', err);
          return res.status(500).json({ success: false, error: err });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Felhasználó nem található" });
        }
        
        console.log('Felhasználó sikeresen deaktiválva:', userId);
        res.json({ success: true, message: "Felhasználó sikeresen törölve" });
      });
    });
  } else {
    console.log('Felhasználó törlés - nincs username a requestben');
    res.status(401).json({ success: false, message: "Nincs jogosultsága" });
  }
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

// Elutasított játékok listázása (admin)
app.get("/admin/rejected-games", checkRole(['admin']), (req, res) => {
  const sql = `
    SELECT
      j.idjatekok AS id,
      j.nev AS title,
      f.nev AS developer,
      j.ar AS price,
      CASE WHEN j.penznem IS NULL OR j.penznem = '' THEN NULL ELSE j.penznem END AS currency,
      j.leiras AS description,
      j.kepurl AS image,
      j.ertekeles AS rating,
      j.rejection_reason,
      j.created_at,
      GROUP_CONCAT(DISTINCT k.nev SEPARATOR ', ') AS categories
    FROM jatekok j
    LEFT JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    LEFT JOIN jatekok_kategoriak jk ON j.idjatekok = jk.idjatekok
    LEFT JOIN kategoria k ON jk.idkategoria = k.idkategoria
    WHERE j.status = 'rejected'
    GROUP BY j.idjatekok
    ORDER BY j.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Elutasított játékok lekérdezési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, games: results });
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
      CASE WHEN j.penznem IS NULL OR j.penznem = '' THEN NULL ELSE j.penznem END AS currency,
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

// Wishlist törlése
app.delete("/wishlist/:username/:gameId", (req, res) => {
  const { username, gameId } = req.params;
  
  // Felhasználó ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [username], (err, userResults) => {
    if (err) {
      console.error('Felhasználó keresési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    }

    const userId = userResults[0].idfelhasznalo;

    const sql = "DELETE FROM wishlist WHERE idfelhasznalo = ? AND idjatekok = ?";
    db.query(sql, [userId, gameId], (err, result) => {
      if (err) {
        console.error('Wishlist törlési hiba:', err);
        return res.status(500).json({ success: false, error: err });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "A játék nem található a kívánságlistán" });
      }
      
      res.json({ success: true, message: "Játék törölve a kívánságlistáról" });
    });
  });
});

// Collection törlése
app.delete("/collection/:username/:gameId", (req, res) => {
  const { username, gameId } = req.params;
  
  // Felhasználó ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [username], (err, userResults) => {
    if (err) {
      console.error('Felhasználó keresési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    }

    const userId = userResults[0].idfelhasznalo;

    const sql = "DELETE FROM game_collection WHERE idfelhasznalo = ? AND idjatekok = ?";
    db.query(sql, [userId, gameId], (err, result) => {
      if (err) {
        console.error('Collection törlési hiba:', err);
        return res.status(500).json({ success: false, error: err });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "A játék nem található a gyűjteményben" });
      }
      
      res.json({ success: true, message: "Játék törölve a gyűjteményből" });
    });
  });
});

// Collection frissítése
app.put("/collection/:username/:gameId", (req, res) => {
  const { username, gameId } = req.params;
  const { status, rating, notes } = req.body;
  
  // Felhasználó ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [username], (err, userResults) => {
    if (err) {
      console.error('Felhasználó keresési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    }

    const userId = userResults[0].idfelhasznalo;

    const sql = "UPDATE game_collection SET status = ?, rating = ?, notes = ?, updated_at = NOW() WHERE idfelhasznalo = ? AND idjatekok = ?";
    db.query(sql, [status, rating || null, notes || null, userId, gameId], (err, result) => {
      if (err) {
        console.error('Collection frissítési hiba:', err);
        return res.status(500).json({ success: false, error: err });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "A játék nem található a gyűjteményben" });
      }
      
      res.json({ success: true, message: "Gyűjtemény frissítve" });
    });
  });
});

// GameDev játékainak lekérdezése
app.get("/gamedev/:username/games", checkRole(['gamedev', 'admin']), (req, res) => {
  const { username } = req.params;
  
  console.log('GameDev játékok lekérdezése:', { username });

  const sql = `
    SELECT 
      j.idjatekok AS id,
      j.nev AS title,
      f.nev AS developer,
      j.ar AS price,
      CASE WHEN j.penznem IS NULL OR j.penznem = '' THEN NULL ELSE j.penznem END AS currency,
      j.leiras AS description,
      j.kepurl AS image,
      j.ertekeles AS rating,
      j.status,
      j.created_at,
      GROUP_CONCAT(DISTINCT k.nev SEPARATOR ', ') AS categories
    FROM jatekok j
    LEFT JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    LEFT JOIN jatekok_kategoriak jk ON j.idjatekok = jk.idjatekok
    LEFT JOIN kategoria k ON jk.idkategoria = k.idkategoria
    WHERE j.uploaded_by = (
      SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?
    )
    GROUP BY j.idjatekok
    ORDER BY j.created_at DESC
  `;
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('GameDev játékok lekérdezési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    res.json({ success: true, games: results });
  });
});

// GameDev statisztikák lekérdezése
app.get("/gamedev/:username/stats", checkRole(['gamedev', 'admin']), (req, res) => {
  const { username } = req.params;
  
  console.log('GameDev statisztikák lekérdezése:', { username });

  const sql = `
    SELECT 
      COUNT(*) as totalGames,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingGames,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedGames,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedGames,
      COALESCE(AVG(ertekeles), 0) as averageRating
    FROM jatekok 
    WHERE uploaded_by = (
      SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?
    )
  `;
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('GameDev statisztikák lekérdezési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    res.json({ success: true, stats: results[0] });
  });
});

// Email küldési végpont
app.post("/api/send-email", (req, res) => {
  const { from, name, message, subject } = req.body;
  
  console.log('Email küldési kérés:', { from, name, subject });

  // Email transporter beállítása
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'gameverseprojekt@gmail.com', // Itt add meg a valós email címed
      pass: 'basznalak01!' // Itt add meg az app jelszavad
    }
  });

  const mailOptions = {
    from: from,
    to: 'jatekhirdeto.app@gmail.com', // Címzett email
    subject: `JátékHirdető Kapcsolat: ${subject}`,
    text: `
      Új üzenet érkezett a JátékHirdető oldalról:
      
      Feladó: ${name} (${from})
      Tárgy: ${subject}
      
      Üzenet:
      ${message}
    `,
    html: `
      <h2>Új üzenet érkezett a JátékHirdető oldalról</h2>
      <p><strong>Feladó:</strong> ${name} (${from})</p>
      <p><strong>Tárgy:</strong> ${subject}</p>
      <hr>
      <h3>Üzenet:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email küldési hiba:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Hiba történt az email küldése során!' 
      });
    }
    
    console.log('Email sikeresen elküldve:', info.messageId);
    res.json({ 
      success: true, 
      message: 'Email sikeresen elküldve!' 
    });
  });
});

// Felhasználó szerepkör módosítása (admin)
app.put("/admin/users/:userId/role", checkRole(['admin']), (req, res) => {
  const userId = req.params.userId;
  const { szerepkor } = req.body;
  
  console.log('Szerepkör módosítás kérés:', { userId, szerepkor });

  const sql = "UPDATE felhasznalo SET szerepkor = ? WHERE idfelhasznalo = ?";
  
  db.query(sql, [szerepkor, userId], (err, result) => {
    if (err) {
      console.error('Szerepkör módosítási hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    }
    
    res.json({ success: true, message: "Felhasználó szerepkör sikeresen frissítve" });
  });
});

// Játék frissítése (admin)
app.put("/admin/games/:id", checkRole(['admin']), (req, res) => {
  const gameId = req.params.id;
  const { title, developer, price, description, image, rating, categories } = req.body;
  
  console.log('Játék frissítés kérés:', { gameId, body: req.body });

  // Játék frissítése
  const sql = `
    UPDATE jatekok 
    SET nev = ?, ar = ?, leiras = ?, kepurl = ?, ertekeles = ?
    WHERE idjatekok = ?
  `;
  
  db.query(sql, [title, price, description, image, rating, gameId], (err, result) => {
    if (err) {
      console.error('Játék frissítési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Játék nem található" });
    }
    
    res.json({ success: true, message: "Játék sikeresen frissítve" });
  });
});

// Játék jóváhagyása (admin)
app.post("/admin/approve-game/:id", checkRole(['admin']), (req, res) => {
  const gameId = req.params.id;
  const adminUsername = req.username;

  console.log('Játék jóváhagyás - gameId:', gameId, 'adminUsername:', adminUsername);

  // Admin ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [adminUsername], (err, adminResults) => {
    if (err) {
      console.error('Admin keresési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    if (adminResults.length === 0) {
      console.log('Admin nem található:', adminUsername);
      return res.status(400).json({ success: false, message: "Admin nem található" });
    }

    const adminId = adminResults[0].idfelhasznalo;
    console.log('Admin ID:', adminId);
    
    const sql = `
      UPDATE jatekok 
      SET status = 'approved', approved_at = NOW(), approved_by = ?, rejection_reason = NULL
      WHERE idjatekok = ?
    `;

    console.log('Jóváhagyás SQL:', sql, [adminId, gameId]);

    db.query(sql, [adminId, gameId], (err, result) => {
      if (err) {
        console.error('Játék jóváhagyási hiba:', err);
        return res.status(500).json({ success: false, error: err });
      }
      if (result.affectedRows === 0) {
        console.log('Játék nem található:', gameId);
        return res.status(404).json({ success: false, message: "Játék nem található" });
      }
      console.log('Játék sikeresen jóváhagyva:', gameId);
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

// Teszt végpont - felhasználó ellenőrzéshez
app.post("/test-user", (req, res) => {
  const { username } = req.body;
  console.log('Teszt kérés - username:', username);
  
  const sql = "SELECT felhasznalonev, szerepkor, aktiv FROM felhasznalo WHERE felhasznalonev = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Teszt hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    console.log('Teszt eredmény:', results);
    res.json({ success: true, user: results });
  });
});

// Játék feltöltése (gamedev és admin)
app.post("/gamedev/upload-game", checkRole(['gamedev', 'admin']), (req, res) => {
  const {
    title,
    developer,
    price,
    currency,
    category,
    image,
    minReq,
    recReq,
    desc,
    rating,
    videos,
    megjelenes,
    steamLink,
    jatekElmeny,
    reszletesLeiras
  } = req.body;

  console.log('Játék feltöltési kérés:', req.body);

  // Fejlesztő hozzáadása vagy keresése
  const developerSql = "SELECT idfejleszto FROM fejleszto WHERE nev = ?";
  db.query(developerSql, [developer], (err, devResults) => {
    if (err) {
      console.error('Fejlesztő keresési hiba:', err);
      return res.status(500).json({ success: false, message: "Adatbázis hiba" });
    }

    let developerId;
    if (devResults.length === 0) {
      // Új fejlesztő hozzáadása
      const insertDeveloperSql = "INSERT INTO fejleszto (nev) VALUES (?)";
      db.query(insertDeveloperSql, [developer], (err2, result) => {
        if (err2) {
          console.error('Fejlesztő hozzáadási hiba:', err2);
          return res.status(500).json({ success: false, message: "Fejlesztő hozzáadási hiba" });
        }
        developerId = result.insertId;
        insertGame();
      });
    } else {
      developerId = devResults[0].idfejleszto;
      insertGame();
    }

    function insertGame() {
      // Rendszerkövetelmények keresése vagy hozzáadása
      const reqSql = "SELECT idrendszerkovetelmeny FROM rendszerkovetelmeny WHERE minimum = ? AND ajanlott = ?";
      db.query(reqSql, [minReq, recReq], (err3, reqResults) => {
        if (err3) {
          console.error('Rendszerkövetelmény keresési hiba:', err3);
          return res.status(500).json({ success: false, message: "Rendszerkövetelmény hiba" });
        }

        let reqId;
        if (reqResults.length === 0) {
          // Új rendszerkövetelmény hozzáadása egyedi azonosítóval
          const insertReqSql = "INSERT INTO rendszerkovetelmeny (minimum, ajanlott) VALUES (?, ?)";
          db.query(insertReqSql, [minReq, recReq], (err4, reqResult) => {
            if (err4) {
              console.error('Rendszerkövetelmény hozzáadási hiba:', err4);
              // Ha már létezik, próbáljuk megkeresni
              if (err4.code === 'ER_DUP_ENTRY') {
                console.log('Duplikált rendszerkövetelmény, megpróbáljuk megtalálni...');
                db.query(reqSql, [minReq, recReq], (err5, retryResults) => {
                  if (err5 || retryResults.length === 0) {
                    return res.status(500).json({ success: false, message: "Rendszerkövetelmény hiba" });
                  }
                  reqId = retryResults[0].idrendszerkovetelmeny;
                  insertGameData(reqId);
                });
              } else {
                return res.status(500).json({ success: false, message: "Rendszerkövetelmény hiba" });
              }
            } else {
              reqId = reqResult.insertId;
              insertGameData(reqId);
            }
          });
        } else {
          reqId = reqResults[0].idrendszerkovetelmeny;
          insertGameData(reqId);
        }
      });

      function insertGameData(reqId) {
        // Játék hozzáadása
        const gameSql = `
          INSERT INTO jatekok 
          (nev, idfejleszto, idrendszerkovetelmeny, ar, penznem, leiras, kepurl, ertekeles, status, megjelenes, steam_link, jatek_elmeny, reszletes_leiras) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
        `;
        
        // Ár kezelése - ha nem szám, akkor 0
        let numericPrice = 0;
        if (price === "Ingyenes" || price === "" || price === null) {
          numericPrice = 0;
        } else {
          const parsed = parseFloat(price);
          numericPrice = isNaN(parsed) ? 0 : parsed;
        }
        
        // Értékelés kezelése - ha nem szám, akkor 0
        let numericRating = 0;
        if (rating === "" || rating === null) {
          numericRating = 0;
        } else {
          const parsedRating = parseFloat(rating);
          numericRating = isNaN(parsedRating) ? 0 : parsedRating;
        }
        
        // Pénznem kezelése - alapértelmezett FT
        let gameCurrency = currency || 'FT';
        if (!gameCurrency || gameCurrency.trim() === '') {
          gameCurrency = 'FT';
        }
        
        console.log('Feldolgozott adatok:', { title, numericPrice, gameCurrency, numericRating });
        
        db.query(gameSql, [
          title, developerId, reqId, numericPrice, gameCurrency, desc, image, numericRating,
          megjelenes, steamLink, jatekElmeny, reszletesLeiras
        ], (err4, gameResult) => {
          if (err4) {
            console.error('Játék hozzáadási hiba:', err4);
            return res.status(500).json({ success: false, message: "Játék hozzáadási hiba" });
          }

          const gameId = gameResult.insertId;

          // Kategóriák hozzáadása
          // Kategória kezelése - lehet string vagy tömb
          let categories = [];
          if (category) {
            if (Array.isArray(category)) {
              categories = category;
            } else if (typeof category === 'string') {
              // Ha vesszővel elválasztott string, akkor szétbontjuk
              categories = category.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
            }
          }

          if (categories.length > 0) {
            const categoryPromises = categories.map(catName => {
              return new Promise((resolve, reject) => {
                const catSql = "SELECT idkategoria FROM kategoria WHERE nev = ?";
                db.query(catSql, [catName], (err5, catResults) => {
                  if (err5) return reject(err5);
                  
                  if (catResults.length === 0) {
                    // Új kategória hozzáadása
                    const insertCatSql = "INSERT INTO kategoria (nev) VALUES (?)";
                    db.query(insertCatSql, [catName], (err6, catResult) => {
                      if (err6) return reject(err6);
                      
                      const linkSql = "INSERT INTO jatekok_kategoriak (idjatekok, idkategoria) VALUES (?, ?)";
                      db.query(linkSql, [gameId, catResult.insertId], (err7) => {
                        if (err7) return reject(err7);
                        resolve();
                      });
                    });
                  } else {
                    const linkSql = "INSERT INTO jatekok_kategoriak (idjatekok, idkategoria) VALUES (?, ?)";
                    db.query(linkSql, [gameId, catResults[0].idkategoria], (err8) => {
                      if (err8) return reject(err8);
                      resolve();
                    });
                  }
                });
              });
            });

            Promise.all(categoryPromises)
              .then(() => {
                console.log('Játék sikeresen feltöltve:', gameId);
                res.json({ success: true, message: "Játék sikeresen feltöltve jóváhagyásra!", gameId });
              })
              .catch((err9) => {
                console.error('Kategória hiba:', err9);
                res.status(500).json({ success: false, message: "Kategória hiba" });
              });
          } else {
            console.log('Játék sikeresen feltöltve:', gameId);
            res.json({ success: true, message: "Játék sikeresen feltöltve jóváhagyásra!", gameId });
          }
        });
      }
    }
  });
});

app.get("/", (req, res) => res.send("fut a szerver"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
