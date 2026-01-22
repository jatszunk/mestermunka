const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL kapcsolat
const db = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "",
  database: "jatekhirdeto",
  multipleStatements: true,
});

db.connect((err) => {
  if (err) console.error("Nem sikerült csatlakozni a MySQL-hez:", err);
  else {
    console.log("MySQL kapcsolat létrejött.");
    initializeDatabase();
  }
});

// Adatbázis inicializálása
function initializeDatabase() {
  const updates = [
    // Role mező hozzáadása
    "ALTER TABLE `felhasznalo` ADD COLUMN IF NOT EXISTS `role` ENUM('user', 'gamedev', 'admin') NOT NULL DEFAULT 'user'",
    
    // Játék státusz mező hozzáadása
    "ALTER TABLE `jatekok` ADD COLUMN IF NOT EXISTS `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'",
    
    // GameDev által feltöltött játékhoz kapcsolódó mező
    "ALTER TABLE `jatekok` ADD COLUMN IF NOT EXISTS `uploaded_by` INT NULL",
    
    // Jóváhagyás időpontja és adminja
    "ALTER TABLE `jatekok` ADD COLUMN IF NOT EXISTS `approved_at` TIMESTAMP NULL",
    "ALTER TABLE `jatekok` ADD COLUMN IF NOT EXISTS `approved_by` INT NULL",
    
    // Elutasítás oka
    "ALTER TABLE `jatekok` ADD COLUMN IF NOT EXISTS `rejection_reason` TEXT NULL",
    
    // Mezők frissítése a meglévő adatokhoz
    "UPDATE `felhasznalo` SET `role` = 'admin' WHERE `felhasznalonev` = 'admin'",
    
    // Meglévő játékok jóváhagyása
    "UPDATE `jatekok` SET `status` = 'approved', `approved_at` = NOW() WHERE `status` = 'pending' AND `status` IS NOT NULL"
  ];

  updates.forEach((sql, index) => {
    db.query(sql, (err) => {
      if (err && !err.message.includes('Duplicate column name') && !err.message.includes('check that column')) {
        console.error(`Adatbázis frissítés hiba (${index + 1}):`, err.message);
      } else if (!err) {
        console.log(`Adatbázis frissítés sikeres (${index + 1})`);
      }
    });
  });
}

app.get("/", (req, res) => res.send("fut a szerver"));

// Middleware - jogosultság ellenőrzése
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Próbáljuk megkapni a felhasználónevet különböző forrásokból
    let username = req.body?.username || 
                  req.query?.username || 
                  req.headers?.username ||
                  (req.method === 'POST' && req.body && req.body.username);
    
    if (!username) {
      return res.status(401).json({ success: false, message: "Hiányzó felhasználónév" });
    }
    
    const sql = "SELECT role FROM felhasznalo WHERE felhasznalonev = ?";
    db.query(sql, [username], (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ success: false, message: "Érvénytelen felhasználó" });
      }
      
      const userRole = results[0].role;
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
  const { felhasznalonev, email, jelszo, role = 'user' } = req.body;
  const sql = "INSERT INTO felhasznalo (felhasznalonev, email, jelszo, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [felhasznalonev, email, jelszo, role], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Hiba történt", error: err });
    res.json({ success: true });
  });
});

// Bejelentkezés
app.post("/login", (req, res) => {
  const { felhasznalonev, jelszo } = req.body;
  const sql = "SELECT * FROM felhasznalo WHERE felhasznalonev=? AND jelszo=?";
  db.query(sql, [felhasznalonev, jelszo], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Hiba történt", error: err });
    if (results.length > 0) return res.json({ success: true, user: results[0] });
    res.status(401).json({ success: false, message: "Hibás adatok" });
  });
});

// Felhasználók
app.get("/felhasznalok", (req, res) => {
  db.query("SELECT * FROM felhasznalo", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Hiba történt", error: err });
    res.json({ success: true, users: results });
  });
});

// Játékok listázása (csak jóváhagyottak)
app.get("/jatekok", (req, res) => {
  const sql = `
    SELECT
      j.idjatekok AS id,
      j.nev AS title,
      f.nev AS developer,
      j.ar AS price,
      r.minimum AS minimum,
      r.ajanlott AS recommended,
      j.leiras AS description,
      j.kepurl AS image,
      j.ertekeles AS rating,
      j.status,
      GROUP_CONCAT(DISTINCT k.nev SEPARATOR ', ') AS categories,
      GROUP_CONCAT(DISTINCT p.nev SEPARATOR ', ') AS platforms
    FROM jatekok j
    JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    JOIN rendszerkovetelmeny r ON j.idrendszerkovetelmeny = r.idrendszerkovetelmeny
    LEFT JOIN jatekok_kategoriak jk ON j.idjatekok = jk.idjatekok
    LEFT JOIN kategoria k ON jk.idkategoria = k.idkategoria
    LEFT JOIN jatekok_platformok jp ON j.idjatekok = jp.idjatekok
    LEFT JOIN platform p ON jp.idplatform = p.idplatform
    WHERE j.status = 'approved'
    GROUP BY j.idjatekok
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });

    const mappedGames = results.map((game) => ({
      id: game.id,
      title: game.title,
      developer: game.developer,
      price: game.price === "0" ? "Ingyenes" : game.price ? `${game.price}` : "",
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

// Extra infók lekérése
app.get("/jatekok/:id/extra", (req, res) => {
  const gameId = req.params.id;

  console.log("EXTRA endpoint HIT, gameId =", gameId);

  db.query(
    "SELECT megjelenes, steam_link AS steamLink, jatek_elmeny AS jatekElmeny, reszletes_leiras AS reszletesLeiras FROM jatekextra WHERE idjatekok = ? LIMIT 1",
    [Number(gameId)],
    (err, results) => {
      console.log("EXTRA query err =", err);
      console.log("EXTRA query results =", results);

      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true, extra: results[0] || null });
    }
  );
});

// Játék hozzáadás (admin oldalad használja)
app.post("/jatekok", (req, res) => {
  const {
    title,
    developer,
    price,
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
    reszletesLeiras,
  } = req.body;

  const videoList = Array.isArray(videos) ? videos.map((v) => String(v).trim()).filter(Boolean) : [];

  // kötelező: megjelenés + steam link + részletes leírás
  if (!title || !developer || !price || !category || !image || !megjelenes || !steamLink || !reszletesLeiras) {
    return res.status(400).json({ success: false, message: "Hiányzó kötelező mezők!" });
  }

  const insertDevSql =
    "INSERT INTO fejleszto (nev) VALUES (?) ON DUPLICATE KEY UPDATE idfejleszto=LAST_INSERT_ID(idfejleszto)";

  db.query(insertDevSql, [developer], (err, devResult) => {
    if (err) return res.status(500).json({ success: false, message: "Fejlesztő hiba", error: err });
    const devId = devResult.insertId;

    const insertReqSql = "INSERT INTO rendszerkovetelmeny (minimum, ajanlott) VALUES (?, ?)";
    db.query(insertReqSql, [minReq || "", recReq || ""], (err2, reqResult) => {
      if (err2) return res.status(500).json({ success: false, message: "Rendszerkövetelmény hiba", error: err2 });
      const reqId = reqResult.insertId;

      const insertGameSql =
        "INSERT INTO jatekok (nev, idfejleszto, ar, idrendszerkovetelmeny, leiras, ertekeles, kepurl) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const numericRating = rating === null || rating === undefined ? 0 : Number(rating);

      db.query(insertGameSql, [title, devId, price, reqId, desc || "", numericRating, image], (err3, gameResult) => {
        if (err3) return res.status(500).json({ success: false, message: "Játék hiba", error: err3 });
        const gameId = gameResult.insertId;

        // EXTRA mentése (új tábla)
        const insertExtraSql = `
          INSERT INTO jatekextra (idjatekok, megjelenes, steam_link, jatek_elmeny, reszletes_leiras)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            megjelenes = VALUES(megjelenes),
            steam_link = VALUES(steam_link),
            jatek_elmeny = VALUES(jatek_elmeny),
            reszletes_leiras = VALUES(reszletes_leiras)
        `;

        db.query(
          insertExtraSql,
          [gameId, megjelenes, steamLink, jatekElmeny || null, reszletesLeiras],
          (errExtra) => {
            if (errExtra)
              return res.status(500).json({ success: false, message: "Extra infó mentési hiba", error: errExtra });

            // kategória mentés + linkelés
            // kategóriák feldolgozása: "sandbox, survival" -> ["sandbox","survival"]
            const categoryList = String(category || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            if (!categoryList.length) {
              return res.status(400).json({ success: false, message: "Adj meg legalább 1 kategóriát!" });
            }

            // ne duplázzon, ha valamiért újra lenne futtatva
            db.query("DELETE FROM jatekok_kategoriak WHERE idjatekok = ?", [gameId], (errDel) => {
              if (errDel) return res.status(500).json({ success: false, message: "Kategória link törlés hiba", error: errDel });

              const insertCatSql =
                "INSERT INTO kategoria (nev) VALUES (?) ON DUPLICATE KEY UPDATE idkategoria=LAST_INSERT_ID(idkategoria)";
              const linkSql = "INSERT INTO jatekok_kategoriak (idjatekok, idkategoria) VALUES (?, ?)";

              let i = 0;

              const finish = () =>
                res.json({
                  success: true,
                  message: "Játék hozzáadva!",
                  game: {
                    id: gameId,
                    title,
                    developer,
                    price,
                    image,
                    category: categoryList.join(", "),
                    categories: categoryList,
                    rating: numericRating,
                    description: desc,
                    requirements: { minimum: minReq || "", recommended: recReq || "" },
                  },
                });

              const saveVideosThenFinish = () => {
                if (!videoList.length) return finish();

                const values = videoList.map((url) => [gameId, url]);
                db.query("INSERT INTO jatek_videok (idjatekok, url) VALUES ?", [values], (errVid) => {
                  if (errVid) return res.status(500).json({ success: false, message: "Videó mentés hiba", error: errVid });
                  return finish();
                });
              };

              const linkNextCategory = () => {
                if (i >= categoryList.length) return saveVideosThenFinish();

                const catName = categoryList[i];

                db.query(insertCatSql, [catName], (errCat, catResult) => {
                  if (errCat) return res.status(500).json({ success: false, message: "Kategória hiba", error: errCat });

                  const catId = catResult.insertId;

                  db.query(linkSql, [gameId, catId], (errLink) => {
                    if (errLink) return res.status(500).json({ success: false, message: "Kapcsolótábla hiba", error: errLink });

                    i += 1;
                    linkNextCategory();
                  });
                });
              };

              linkNextCategory();
            });

          });
      }
      );
    });
  });
});


// Játék törlés
app.delete("/jatekok/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM jatekok WHERE idjatekok=?", [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Nincs ilyen játék." });
    res.json({ success: true, message: "Játék törölve." });
  });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gameverseprojekt@gmail.com",
    pass: "pqvx pnop ufxz ydpv",
  },
});

app.post("/api/send-email", async (req, res) => {
  const { from, name, message, subject } = req.body;

  if (!name || !from || !message) {
    return res.status(400).json({ success: false, message: "Hiányzó adatok!" });
  }

  const mailOptions = {
    from: "GameVerse <gameverseprojekt@gmail.com>",
    to: "gameverseprojekt@gmail.com",
    replyTo: from,
    subject: subject || `GameVerse üzenet: ${name}`,
    html: `
      <h3>Új üzenet</h3>
      <p><b>Név:</b> ${name}</p>
      <p><b>Email:</b> ${from}</p>
      <p><b>Üzenet:</b><br/>${String(message).replace(/\n/g, "<br/>")}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email elküldve!" });
  } catch (error) {
    console.error("Email hiba:", error);
    res.status(500).json({ success: false, message: "Email küldés sikertelen!", error: String(error) });
  }
});

// Összes komment
app.get("/kommentek", (req, res) => {
  const sql = `
    SELECT 
      k.idkommentek AS id,
      k.idjatekok AS gameId,
      f.felhasznalonev AS user,
      k.tartalom AS text,
      k.ertekeles AS rating
    FROM kommentek k
    JOIN felhasznalo f ON f.idfelhasznalo = k.idfelhasznalo
    ORDER BY k.idkommentek DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, comments: results });
  });
});

// Komment mentése
app.post("/jatekok/:id/kommentek", (req, res) => {
  const gameId = req.params.id;
  const { username, text, rating } = req.body;

  if (!username || !text || rating == null) {
    return res.status(400).json({ success: false, message: "Hiányzó adatok!" });
  }

  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [username], (err, users) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (!users.length) return res.status(404).json({ success: false, message: "Nincs ilyen felhasználó." });

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

// Komment törlése (admin)
app.delete("/kommentek/:id", (req, res) => {
  const commentId = req.params.id;

  db.query("DELETE FROM kommentek WHERE idkommentek = ?", [commentId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Nincs ilyen komment." });
    res.json({ success: true });
  });
});

// Videók lekérése
app.get("/jatekok/:id/videok", (req, res) => {
  const gameId = req.params.id;
  db.query("SELECT id, url FROM jatek_videok WHERE idjatekok = ? ORDER BY id DESC", [gameId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, videos: results });
  });
});

// ===== ADMIN VÉGPONTOK =====

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

// Felhasználó törlése (admin)
app.delete("/admin/users/:id", checkRole(['admin']), (req, res) => {
  const userId = req.params.id;

  const sql = "DELETE FROM felhasznalo WHERE idfelhasznalo = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    res.json({ success: true, message: "Felhasználó törölve" });
  });
});

// Játék adatainak módosítása (admin)
app.put("/admin/games/:id", checkRole(['admin']), (req, res) => {
  const gameId = req.params.id;
  const { title, developer, price, description, image, rating, categories } = req.body;

  if (!price) {
    return res.status(400).json({ success: false, message: "Hiányzó ár" });
  }

  // Először frissítjük a fejlesztőt
  const updateDevSql = "INSERT INTO fejleszto (nev) VALUES (?) ON DUPLICATE KEY UPDATE idfejleszto=LAST_INSERT_ID(idfejleszto)";
  db.query(updateDevSql, [developer || ''], (err, devResult) => {
    if (err) return res.status(500).json({ success: false, error: err });
    const devId = devResult.insertId;

    // Majd frissítjük a játékot
    const updateGameSql = `
      UPDATE jatekok 
      SET nev = ?, idfejleszto = ?, ar = ?, leiras = ?, kepurl = ?, ertekeles = ?
      WHERE idjatekok = ?
    `;

    db.query(updateGameSql, [title, devId, price, description, image, rating || 0, gameId], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Játék nem található" });

      // Végül frissítjük a kategóriákat
      const deleteCatsSql = "DELETE FROM jatekok_kategoriak WHERE idjatekok = ?";
      db.query(deleteCatsSql, [gameId], (err) => {
        if (err) return res.status(500).json({ success: false, error: err });

        // Kategóriák hozzáadása
        const categoryList = (categories || '').split(',').map(cat => cat.trim()).filter(cat => cat);
        let catPromises = categoryList.map((catName) => {
          return new Promise((resolve, reject) => {
            db.query("SELECT idkategoria FROM kategoria WHERE nev = ?", [catName], (err, catResults) => {
              if (err) return reject(err);
              if (catResults.length > 0) {
                const insertCatSql = "INSERT INTO jatekok_kategoriak (idjatekok, idkategoria) VALUES (?, ?)";
                db.query(insertCatSql, [gameId, catResults[0].idkategoria], (err) => {
                  if (err) return reject(err);
                  resolve();
                });
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(catPromises)
          .then(() => {
            res.json({ success: true, message: "Játék adatai frissítve" });
          })
          .catch((err) => {
            res.status(500).json({ success: false, error: err });
          });
      });
    });
  });
});

// Felhasználók kezelése (admin)
app.get("/admin/users", checkRole(['admin']), (req, res) => {
  const sql = "SELECT idfelhasznalo, felhasznalonev, email, role, nev FROM felhasznalo ORDER BY role, felhasznalonev";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, users: results });
  });
});

// Felhasználó role módosítása (admin)
app.put("/admin/users/:id/role", checkRole(['admin']), (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!['user', 'gamedev', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: "Érvénytelen role" });
  }

  const sql = "UPDATE felhasznalo SET role = ? WHERE idfelhasznalo = ?";
  db.query(sql, [role, userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    res.json({ success: true, message: "Role frissítve" });
  });
});

// Statisztikák (admin)
app.get("/admin/statistics", checkRole(['admin']), (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM felhasznalo) AS total_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE role = 'user') AS regular_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE role = 'gamedev') AS gamedev_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE role = 'admin') AS admin_users,
      (SELECT COUNT(*) FROM jatekok) AS total_games,
      (SELECT COUNT(*) FROM jatekok WHERE status = 'approved') AS approved_games,
      (SELECT COUNT(*) FROM jatekok WHERE status = 'pending') AS pending_games,
      (SELECT COUNT(*) FROM jatekok WHERE status = 'rejected') AS rejected_games,
      (SELECT COUNT(*) FROM kommentek) AS total_comments,
      (SELECT AVG(ertekeles) FROM kommentek) AS avg_rating
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, statistics: results[0] });
  });
});

// GameDev játékfeltöltés
app.post("/gamedev/upload-game", checkRole(['gamedev', 'admin']), (req, res) => {
  const { username, ...gameData } = req.body;

  // Feltöltő ID lekérése
  db.query("SELECT idfelhasznalo FROM felhasznalo WHERE felhasznalonev = ?", [username], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(400).json({ success: false, message: "Felhasználó nem található" });
    }

    const uploadedBy = userResults[0].idfelhasznalo;
    
    // Itt jön a meglévő játék hozzáadási logika, de status = 'pending'-del és uploaded_by mezővel
    const {
      title,
      developer,
      price,
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
      reszletesLeiras,
    } = gameData;

    const videoList = Array.isArray(videos) ? videos.map((v) => String(v).trim()).filter(Boolean) : [];

    if (!title || !developer || !price || !category || !image || !megjelenes || !steamLink || !reszletesLeiras) {
      return res.status(400).json({ success: false, message: "Hiányzó kötelező mezők!" });
    }

    const insertDevSql =
      "INSERT INTO fejleszto (nev) VALUES (?) ON DUPLICATE KEY UPDATE idfejleszto=LAST_INSERT_ID(idfejleszto)";

    db.query(insertDevSql, [developer], (err, devResult) => {
      if (err) return res.status(500).json({ success: false, error: err });

      const devId = devResult.insertId;

      const insertReqSql =
        "INSERT INTO rendszerkovetelmeny (minimum, ajanlott) VALUES (?, ?) ON DUPLICATE KEY UPDATE idrendszerkovetelmeny=LAST_INSERT_ID(idrendszerkovetelmeny)";

      db.query(insertReqSql, [minReq || "-", recReq || "-"], (err, reqResult) => {
        if (err) return res.status(500).json({ success: false, error: err });

        const reqId = reqResult.insertId;

        const insertGameSql =
          "INSERT INTO jatekok (nev, idfejleszto, ar, idrendszerkovetelmeny, leiras, ertekeles, kepurl, status, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)";

        db.query(insertGameSql, [title, devId, price, reqId, desc, rating || 0, image, uploadedBy], (err, gameResult) => {
          if (err) return res.status(500).json({ success: false, error: err });

          const gameId = gameResult.insertId;

          // Kategóriák hozzáadása
          const insertCatSql = "INSERT INTO jatekok_kategoriak (idjatekok, idkategoria) VALUES (?, ?)";
          const categories = Array.isArray(category) ? category : [category];

          let catPromises = categories.map((catName) => {
            return new Promise((resolve, reject) => {
              db.query("SELECT idkategoria FROM kategoria WHERE nev = ?", [catName], (err, catResults) => {
                if (err) return reject(err);
                if (catResults.length > 0) {
                  db.query(insertCatSql, [gameId, catResults[0].idkategoria], (err) => {
                    if (err) return reject(err);
                    resolve();
                  });
                } else {
                  resolve();
                }
              });
            });
          });

          // Extra infók hozzáadása
          const insertExtraSql =
            "INSERT INTO jatekextra (idjatekok, megjelenes, steam_link, jatek_elmeny, reszletes_leiras) VALUES (?, ?, ?, ?, ?)";

          db.query(insertExtraSql, [gameId, megjelenes, steamLink, jatekElmeny || "", reszletesLeiras], (err) => {
            if (err) return res.status(500).json({ success: false, error: err });

            // Videók hozzáadása
            const insertVideoSql = "INSERT INTO jatek_videok (idjatekok, url) VALUES (?, ?)";
            let videoPromises = videoList.map((videoUrl) => {
              return new Promise((resolve, reject) => {
                db.query(insertVideoSql, [gameId, videoUrl], (err) => {
                  if (err) return reject(err);
                  resolve();
                });
              });
            });

            Promise.all([...catPromises, ...videoPromises])
              .then(() => {
                res.json({ success: true, message: "Játék feltöltve, jóváhagyásra vár!" });
              })
              .catch((err) => {
                res.status(500).json({ success: false, error: err });
              });
          });
        });
      });
    });
  });
});

app.listen(3001, () => console.log("Szerver fut a 3001-es porton"));
