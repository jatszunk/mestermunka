const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// Globális hibakezelés
process.on('uncaughtException', (err) => {
  console.error('Váratlan hiba:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Kezeletlen Promise rejection:', reason);
  process.exit(1);
});

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
  connection.release();
});

// Hiba kezelése a pool szintjén
db.on('connection', function (connection) {
  console.log('MySQL kapcsolat létrehozva a poolból');
  
  connection.on('error', function(err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Adatbázis kapcsolat elveszett, újra csatlakozás...');
    } else {
      throw err;
    }
  });
  
  connection.on('end', function() {
    console.log('Adatbázis kapcsolat lezárva');
  });
});

// Segédfüggvény a lekérdezésekhez retry logikával
const query = async (sql, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
          if (error) {
            console.error(`Adatbázis hiba (kísérlet ${i + 1}/${retries}):`, error);
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    } catch (error) {
      if (i === retries - 1) {
        console.error('Adatbázis hiba, minden kísérlet sikertelen:', error);
        throw error;
      }
      
      // Várjunk egy kicsit az újrapróbálás előtt
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      console.log(`Adatbázis kapcsolat újrapróbálása (${i + 2}/${retries})...`);
    }
  }
};

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
      console.warn('[checkRole] Missing username', {
        method: req.method,
        path: req.originalUrl,
        hasBody: Boolean(req.body),
        queryKeys: Object.keys(req.query || {}),
        headerKeys: Object.keys(req.headers || {})
      });
      return res.status(401).json({ success: false, message: "Hiányzó felhasználónév" });
    }
    
    const handleResults = (results) => {
      if (!results || results.length === 0) {
        console.warn('[checkRole] Unknown user', { username, path: req.originalUrl });
        return res.status(401).json({ success: false, message: "Érvénytelen felhasználó" });
      }

      const userRole = results[0].userRole;
      if (!userRole) {
        console.warn('[checkRole] Missing role for user', { username, row: results[0], path: req.originalUrl });
      }
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ success: false, message: "Nincs jogosultsága" });
      }

      req.userRole = userRole;
      req.username = username;
      next();
    };

    const sqlPrimary = "SELECT szerepkor AS userRole FROM felhasznalo WHERE felhasznalonev = ?";
    db.query(sqlPrimary, [username], (err, results) => {
      if (!err) return handleResults(results);

      // Legacy fallback, if schema uses 'role' instead of 'szerepkor'
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        const sqlFallback = "SELECT role AS userRole FROM felhasznalo WHERE felhasznalonev = ?";
        return db.query(sqlFallback, [username], (err2, results2) => {
          if (err2) {
            console.error('[checkRole] DB error', { username, path: req.originalUrl, err: err2 });
            return res.status(500).json({ success: false, message: "Adatbázis hiba", error: err2 });
          }
          return handleResults(results2);
        });
      }

      console.error('[checkRole] DB error', { username, path: req.originalUrl, err });
      return res.status(500).json({ success: false, message: "Adatbázis hiba", error: err });
    });
  };
};

// Regisztráció
app.post("/register", (req, res) => {
  const { felhasznalonev, email, jelszo, szerepkor = 'felhasznalo' } = req.body;
  console.log('Regisztrációs kérés:', { felhasznalonev, email, szerepkor });
  
  const sql = "INSERT INTO felhasznalo (felhasznalonev, email, jelszo, szerepkor) VALUES (?, ?, ?, ?)";
  db.query(sql, [felhasznalonev, email, jelszo, szerepkor], (err) => {
    if (err) {
      console.error('Regisztrációs hiba:', err);
      return res.status(500).json({ success: false, message: "Hiba történt", error: err });
    }
    console.log('Regisztráció sikeres:', felhasznalonev);
    res.json({ success: true });
  });
});

// Bejelentkezés
app.post("/login", (req, res) => {
  const { felhasznalonev, jelszo } = req.body;
  console.log('Bejelentkezési kérés:', { felhasznalonev });
  
  const sql = "SELECT * FROM felhasznalo WHERE felhasznalonev=? AND jelszo=?";
  db.query(sql, [felhasznalonev, jelszo], (err, results) => {
    if (err) {
      console.error('Bejelentkezési hiba:', err);
      return res.status(500).json({ success: false, message: "Hiba történt", error: err });
    }
    if (results.length > 0) {
      console.log('Bejelentkezés sikeres:', felhasznalonev);
      res.json({ success: true, user: results[0] });
    } else {
      console.log('Bejelentkezés sikertelen:', felhasznalonev);
      res.status(401).json({ success: false, message: "Hibás adatok" });
    }
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
      COALESCE(r.minimum, '-') AS minimum,
      COALESCE(r.ajanlott, '-') AS recommended,
      j.leiras AS description,
      j.kepurl AS image,
      COALESCE(j.ertekeles, 0) AS rating,
      COALESCE(j.status, 'approved') AS status,
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
app.get("/jatekok/:id/extra", async (req, res) => {
  const gameId = req.params.id;

  try {
    const results = await query(
      "SELECT megjelenes, steam_link AS steamLink, jatek_elmeny AS jatekElmeny, reszletes_leiras AS reszletesLeiras FROM jatekextra WHERE idjatekok = ? LIMIT 1",
      [Number(gameId)]
    );
    
    res.json({ success: true, extra: results[0] || null });
  } catch (err) {
    console.error("EXTRA endpoint hiba:", err);
    res.status(500).json({ success: false, error: "Adatbázis hiba történt" });
  }
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
    LEFT JOIN felhasznalo f ON f.idfelhasznalo = k.idfelhasznalo
    ORDER BY k.idkommentek DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Kommentek lekérési hiba:', err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, comments: results });
  });
});

// Komment törlése (admin)
app.delete("/kommentek/:id", checkRole(['admin']), (req, res) => {
  const commentId = req.params.id;

  db.query("DELETE FROM kommentek WHERE idkommentek = ?", [commentId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Komment nem található" });
    res.json({ success: true, message: "Komment törölve" });
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
  const sql = "SELECT idfelhasznalo, felhasznalonev, email, szerepkor, nev FROM felhasznalo ORDER BY szerepkor, felhasznalonev";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, users: results });
  });
});

// Felhasználó role módosítása (admin)
app.put("/admin/users/:id/role", checkRole(['admin']), (req, res) => {
  const userId = req.params.id;
  const { szerepkor } = req.body;

  if (!['felhasznalo', 'gamedev', 'admin'].includes(szerepkor)) {
    return res.status(400).json({ success: false, message: "Érvénytelen szerepkör" });
  }

  const sql = "UPDATE felhasznalo SET szerepkor = ? WHERE idfelhasznalo = ?";
  db.query(sql, [szerepkor, userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Felhasználó nem található" });
    res.json({ success: true, message: "Szerepkör frissítve" });
  });
});

// Statisztikák (admin)
app.get("/admin/statistics", checkRole(['admin']), (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM felhasznalo) AS total_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE szerepkor = 'felhasznalo') AS regular_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE szerepkor = 'gamedev') AS gamedev_users,
      (SELECT COUNT(*) FROM felhasznalo WHERE szerepkor = 'admin') AS admin_users,
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
          const insertCategoryIfMissingSql =
            "INSERT INTO kategoria (nev) VALUES (?) ON DUPLICATE KEY UPDATE idkategoria=LAST_INSERT_ID(idkategoria)";

          const categoryList = (Array.isArray(category) ? category : String(category || "").split(","))
            .map((s) => String(s).trim())
            .filter(Boolean);

          let catPromises = categoryList.map((catName) => {
            return new Promise((resolve, reject) => {
              // 1) biztosítsuk, hogy létezik a kategória
              db.query(insertCategoryIfMissingSql, [catName], (errCat, catResult) => {
                if (errCat) {
                  // ha nincs unique index a nev oszlopon, akkor az ON DUPLICATE KEY nem fog futni;
                  // ebben az esetben fallback: SELECT
                  if (errCat.code !== 'ER_DUP_ENTRY') {
                    return db.query("SELECT idkategoria FROM kategoria WHERE nev = ? LIMIT 1", [catName], (errSel, selRes) => {
                      if (errSel) return reject(errSel);
                      if (!selRes || selRes.length === 0) return resolve();
                      return db.query(insertCatSql, [gameId, selRes[0].idkategoria], (errLink) => {
                        if (errLink) return reject(errLink);
                        return resolve();
                      });
                    });
                  }
                  return reject(errCat);
                }

                const catId = catResult.insertId;
                // 2) linkeljük a játékhoz
                db.query(insertCatSql, [gameId, catId], (errLink) => {
                  if (errLink) return reject(errLink);
                  return resolve();
                });
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

// ===== GAMEDEV PANEL VÉGPONTOK =====

// GameDev játékainak lekérdezése
app.get("/gamedev/:username/games", (req, res) => {
  const { username } = req.params;
  
  const sql = `
    SELECT 
      ge.*,
      u.nev as developerName,
      u.email as developerEmail
    FROM games_extended ge
    JOIN felhasznalo u ON ge.developer_username = u.felhasznalonev
    WHERE ge.developer_username = ?
    ORDER BY ge.uploadDate DESC
  `;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Hiba a GameDev játékainak lekérdezésekor:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    // Parse JSON fields
    const games = results.map(game => ({
      ...game,
      categories: game.categories ? JSON.parse(game.categories) : [],
      platforms: game.platforms ? JSON.parse(game.platforms) : [],
      images: game.images ? JSON.parse(game.images) : [],
      videos: game.videos ? JSON.parse(game.videos) : [],
      systemRequirements: game.systemRequirements ? JSON.parse(game.systemRequirements) : {},
      features: game.features ? JSON.parse(game.features) : [],
      languages: game.languages ? JSON.parse(game.languages) : [],
      socialLinks: game.socialLinks ? JSON.parse(game.socialLinks) : {},
      gameMode: game.gameMode ? JSON.parse(game.gameMode) : []
    }));
    
    res.json({ success: true, games });
  });
});

// GameDev statisztikák lekérdezése
app.get("/gamedev/:username/stats", (req, res) => {
  const { username } = req.params;
  
  const sql = `
    SELECT 
      COUNT(*) as totalGames,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedGames,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingGames,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedGames,
      COALESCE(SUM(downloads), 0) as totalDownloads,
      COALESCE(AVG(rating), 0) as averageRating,
      COALESCE(COUNT(rating), 0) as totalRatings
    FROM games_extended ge
    LEFT JOIN game_stats gs ON ge.id = gs.gameId
    LEFT JOIN game_ratings gr ON ge.id = gr.gameId
    WHERE ge.developer_username = ?
    GROUP BY ge.developer_username
  `;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Hiba a GameDev statisztikák lekérdezésekor:', err);
      return res.status(500).json({ success: false, error: err });
    }
    
    const stats = results.length > 0 ? results[0] : {
      totalGames: 0,
      approvedGames: 0,
      pendingGames: 0,
      rejectedGames: 0,
      totalDownloads: 0,
      averageRating: 0,
      totalRatings: 0
    };
    
    res.json({ success: true, stats });
  });
});

// Játék feltöltés végpont (bővített)
app.post("/games/upload", (req, res) => {
  const {
    title,
    description,
    developer,
    publisher,
    releaseDate,
    price,
    categories,
    platforms,
    images,
    videos,
    systemRequirements,
    features,
    languages,
    ageRating,
    multiplayer,
    gameMode,
    estimatedPlaytime,
    website,
    socialLinks,
    developer_username
  } = req.body;

  if (!title || !description || !developer_username) {
    return res.status(400).json({ 
      success: false, 
      error: "Hiányzó kötelező mezők: cím, leírás, fejlesztő" 
    });
  }

  const sql = `
    INSERT INTO games_extended (
      title, description, developer, publisher, releaseDate, price,
      categories, platforms, images, videos, systemRequirements,
      features, languages, ageRating, multiplayer, gameMode,
      estimatedPlaytime, website, socialLinks, status,
      developer_username, uploadDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
  `;

  const values = [
    title,
    description,
    developer,
    publisher || null,
    releaseDate || null,
    price || 0,
    JSON.stringify(categories || []),
    JSON.stringify(platforms || []),
    JSON.stringify(images || []),
    JSON.stringify(videos || []),
    JSON.stringify(systemRequirements || {}),
    JSON.stringify(features || []),
    JSON.stringify(languages || []),
    ageRating || null,
    multiplayer || false,
    JSON.stringify(gameMode || []),
    estimatedPlaytime || null,
    website || null,
    JSON.stringify(socialLinks || {}),
    developer_username
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Hiba a játék feltöltésekor:', err);
      return res.status(500).json({ success: false, error: err });
    }

    // Game statisztika létrehozása
    const statsSql = `
      INSERT INTO game_stats (gameId, totalDownloads, totalRatings, averageRating)
      VALUES (?, 0, 0, 0)
    `;
    
    db.query(statsSql, [result.insertId], (statsErr) => {
      if (statsErr) {
        console.error('Hiba a game statisztika létrehozásakor:', statsErr);
      }
    });

    // Developer statisztikák frissítése
    const devStatsSql = `
      INSERT INTO developer_stats (developerUsername, totalGames, lastGameUpload)
      VALUES (?, 1, NOW())
      ON DUPLICATE KEY UPDATE 
        totalGames = VALUES(totalGames + 1),
        lastGameUpload = VALUES(lastGameUpload)
    `;
    
    db.query(devStatsSql, [developer_username], (devErr) => {
      if (devErr) {
        console.error('Hiba a developer statisztikák frissítésekor:', devErr);
      }
    });

    // Kategória statisztikák frissítése
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        const catStatsSql = `
          INSERT INTO category_stats (categoryName, gameCount)
          VALUES (?, 1)
          ON DUPLICATE KEY UPDATE 
            gameCount = VALUES(gameCount + 1)
        `;
        db.query(catStatsSql, [category], (catErr) => {
          if (catErr) {
            console.error('Hiba a kategória statisztikák frissítésékora:', catErr);
          }
        });
      });
    }

    res.json({ 
      success: true, 
      message: "Játék sikeresen feltöltve, jóváhagyásra vár!",
      game: {
        id: result.insertId,
        title,
        status: 'pending'
      }
    });
  });
});

// Játék felülvizsgálása (admin)
app.put("/games/:gameId/review", (req, res) => {
  const { gameId } = req.params;
  const { status, rejectionReason, reviewer } = req.body;
  
  if (!['status'] || !reviewer) {
    return res.status(400).json({ 
      success: false, 
      error: "Hiányzó státusz vagy felülvizgáló" 
    });
  }

  const sql = `
    UPDATE games_extended 
    SET status = ?, 
        rejectionReason = ?,
        reviewer = ?,
        reviewDate = NOW()
    WHERE id = ?
  `;

  db.query(sql, [status, rejectionReason || null, reviewer, gameId], (err, result) => {
    if (err) {
      console.error('Hiba a játék felülvizsgálásakor:', err);
      return res.status(500).json({ success: false, error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Játék nem található" });
    }

    // Moderációs előzmény rögzítése
    const historySql = `
      INSERT INTO game_moderation_history (gameId, moderatorUsername, actionType, previousStatus, newStatus, reason, actionDate)
      VALUES (?, ?, 'status_change', ?, ?, ?, NOW())
    `;
    
    db.query(historySql, [gameId, reviewer, 'unknown', status, rejectionReason || null], (historyErr) => {
      if (historyErr) {
        console.error('Hiba a moderációs előzmény rögzítésekor:', historyErr);
      }
    });

    // Developer statisztikák frissítése
    const gameSql = `SELECT developer_username FROM games_extended WHERE id = ?`;
    db.query(gameSql, [gameId], (gameErr, gameResults) => {
      if (gameErr || gameResults.length === 0) return;
      
      const developerUsername = gameResults[0].developer_username;
      
      const devStatsSql = `
        UPDATE developer_stats 
        SET 
          approvedGames = (SELECT COUNT(*) FROM games_extended WHERE developer_username = ? AND status = 'approved'),
          pendingGames = (SELECT COUNT(*) FROM games_extended WHERE developer_username = ? AND status = 'pending'),
          rejectedGames = (SELECT COUNT(*) FROM games_extended WHERE developer_username = ? AND status = 'rejected'),
          lastActivity = NOW()
        WHERE developerUsername = ?
      `;
      
      db.query(devStatsSql, [developerUsername, developerUsername, developerUsername, developerUsername], (devErr) => {
        if (devErr) {
          console.error('Hiba a developer statisztikák frissítésékora:', devErr);
        }
      });
    });

    res.json({ 
      success: true, 
      message: `Játék státusza frissítve: ${status === 'approved' ? 'Elfogadva' : status === 'rejected' ? 'Elutasítva' : 'Feldolgozás alatt'}`,
      status,
      rejectionReason
    });
  });
});

// Játék letöltési statisztika növelése
app.post("/games/:gameId/download", (req, res) => {
  const { gameId } = req.params;
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ success: false, error: "Hiányzó felhasználónév" });
  }

  // Ellenőrizzük, hogy a felhasználó létezik-e
  const userSql = "SELECT felhasznalonev FROM felhasznalo WHERE felhasznalonev = ?";
  db.query(userSql, [username], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(401).json({ success: false, error: "Érvénytelen felhasználó" });
    }

    // Letöltés rögzítése
    const downloadSql = `
      INSERT INTO game_downloads (gameId, username, downloadDate, ipAddress)
      VALUES (?, ?, NOW(), ?)
    `;
    
    db.query(downloadSql, [gameId, username, req.ip || 'unknown'], (err, result) => {
      if (err) {
        console.error('Hiba a letöltés rögzítésekor:', err);
        return res.status(500).json({ success: false, error: err });
      }

      // Játék statisztikák frissítése
      const statsSql = `
        UPDATE game_stats 
        SET totalDownloads = (SELECT COUNT(*) FROM game_downloads WHERE gameId = ?),
            lastUpdated = NOW()
        WHERE gameId = ?
      `;
      
      db.query(statsSql, [gameId], (statsErr) => {
        if (statsErr) {
          console.error('Hiba a játék statisztikák frissítésékora:', statsErr);
        }
      });

      res.json({ success: true, message: "Letöltés rögzítve" });
    });
  });
});

// Játék értékelés hozzáadása
app.post("/games/:gameId/rating", (req, res) => {
  const { gameId } = req.params;
  const { username, rating, comment } = req.body;
  
  if (!username || rating === undefined) {
    return res.status(400).json({ success: false, error: "Hiányzó felhasználónév vagy értékelés" });
  }

  if (rating < 0 || rating > 10) {
    return res.status(400).json({ success: false, error: "Az értékelés 0 és 10 között kell legyen" });
  }

  // Ellenőrizzük, hogy a felhasználó létezik-e
  const userSql = "SELECT felhasznalonev FROM felhasznalo WHERE felhasznalonev = ?";
  db.query(userSql, [username], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(401).json({ success: false, error: "Érvénytelen felhasználó" });
    }

    // Értékelés mentése
    const ratingSql = `
      INSERT INTO game_ratings (gameId, username, rating, comment, reviewDate)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        rating = VALUES(rating),
        comment = VALUES(comment),
        reviewDate = VALUES(reviewDate)
    `;
    
    db.query(ratingSql, [gameId, username, rating, comment], (err, result) => {
      if (err) {
        console.error('Hiba az értékelés mentésekor:', err);
        return res.status(500).json({ success: false, error: err });
      }

      // Játék statisztikák frissítése
      const statsSql = `
        UPDATE game_stats 
        SET 
          totalRatings = (SELECT COUNT(*) FROM game_ratings WHERE gameId = ?),
          averageRating = (SELECT AVG(rating) FROM game_ratings WHERE gameId = ?),
          lastUpdated = NOW()
        WHERE gameId = ?
      `;
      
      db.query(statsSql, [gameId, gameId], (statsErr) => {
        if (statsErr) {
          console.error('Hiba a játék statisztikák frissítésékora:', statsErr);
        }
      });

      // Aktivitás rögzítése
      const activitySql = `
        INSERT INTO game_activity (gameId, username, activityType, activityData, activityDate)
        VALUES (?, ?, 'rating', ?, NOW())
      `;
      
      db.query(activitySql, [gameId, username, JSON.stringify({ rating, comment })], (activityErr) => {
        if (activityErr) {
          console.error('Hiba az aktivitás rögzítésekor:', activityErr);
        }
      });

      res.json({ success: true, message: "Értékelés mentve" });
    });
  });
});

// Játékok keresése és szűrése (bővített)
app.post("/games/search", (req, res) => {
  const { searchTerm, filters } = req.body;
  
  let sql = `
    SELECT 
      ge.*,
      u.nev as developerName,
      gs.totalDownloads,
      gs.averageRating,
      gs.totalRatings
    FROM games_extended ge
    JOIN felhasznalo u ON ge.developer_username = u.felhasznalonev
    LEFT JOIN game_stats gs ON ge.id = gs.gameId
    WHERE ge.status = 'approved'
  `;
  
  const params = [];
  const conditions = [];

  // Keresési feltételek
  if (searchTerm) {
    conditions.push(`(ge.title LIKE ? OR ge.description LIKE ? OR u.nev LIKE ?)`);
    params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
  }

  // Kategória szűrés
  if (filters && filters.categories && filters.categories.length > 0) {
    const categoryConditions = filters.categories.map(() => `JSON_CONTAINS(categories, ?)`);
    conditions.push(`(${categoryConditions.join(' OR ')})`);
    params.push(...filters.categories.map(JSON.stringify));
  }

  // Platform szűrés
  if (filters && filters.platforms && filters.platforms.length > 0) {
    const platformConditions = filters.platforms.map(() => `JSON_CONTAINS(platforms, ?)`);
    conditions.push(`(${platformConditions.join(' OR ')})`);
    params.push(...filters.platforms.map(JSON.stringify));
  }

  // Ár tartomány szűrés
  if (filters && filters.priceRange) {
    if (filters.priceRange.min > 0) {
      conditions.push(`ge.price >= ?`);
      params.push(filters.priceRange.min);
    }
    if (filters.priceRange.max < 50000) {
      conditions.push(`ge.price <= ?`);
      params.push(filters.priceRange.max);
    }
  }

  // Értékelés tartomány szűrés
  if (filters && filters.rating) {
    if (filters.rating.min > 0) {
      conditions.push(`gs.averageRating >= ?`);
      params.push(filters.rating.min);
    }
    if (filters.rating.max < 10) {
      conditions.push(`gs.averageRating <= ?`);
      params.push(filters.rating.max);
    }
  }

  // Rendszerkövetelmény szűrés
  if (filters && filters.systemRequirements) {
    if (filters.systemRequirements.os) {
      conditions.push(`JSON_CONTAINS(systemRequirements, JSON_OBJECT('os', ?))`);
      params.push(filters.systemRequirements.os);
    }
    if (filters.systemRequirements.cpu) {
      conditions.push(`JSON_CONTAINS(systemRequirements, JSON_OBJECT('cpu', ?))`);
      params.push(filters.systemRequirements.cpu);
    }
    if (filters.systemRequirements.gpu) {
      conditions.push(`JSON_CONTAINS(systemRequirements, JSON_OBJECT('gpu', ?))`);
      params.push(filters.systemRequirements.gpu);
    }
    if (filters.systemRequirements.ram) {
      conditions.push(`JSON_CONTAINS(systemRequirements, JSON_OBJECT('ram', ?))`);
      params.push(filters.systemRequirements.ram);
    }
    if (filters.systemRequirements.storage) {
      conditions.push(`JSON_CONTAINS(systemRequirements, JSON_OBJECT('storage', ?))`);
      params.push(filters.systemRequirements.storage);
    }
  }

  // Jellemzők szűrés
  if (filters && filters.features && filters.features.length > 0) {
    const featureConditions = filters.features.map(() => `JSON_CONTAINS(features, ?)`);
    conditions.push(`(${featureConditions.join(' OR ')})`);
    params.push(...filters.features.map(JSON.stringify));
  }

  // Nyelvek szűrés
  if (filters && filters.languages && filters.languages.length > 0) {
    const languageConditions = filters.languages.map(() => `JSON_CONTAINS(languages, ?)`);
    conditions.push(`(${languageConditions.join(' OR ')})`);
    params.push(...filters.languages.map(JSON.stringify));
  }

  // Többjátékos szűrés
  if (filters && filters.multiplayer !== null) {
    conditions.push(`ge.multiplayer = ?`);
    params.push(filters.multiplayer);
  }

  // Korhatár szűrés
  if (filters && filters.ageRating) {
    conditions.push(`ge.ageRating = ?`);
    params.push(filters.ageRating);
  }

  // Megjelenési év szűrés
  if (filters && filters.releaseYear) {
    if (filters.releaseYear.min > 2000) {
      conditions.push(`YEAR(ge.releaseDate) >= ?`);
      params.push(filters.releaseYear.min);
    }
    if (filters.releaseYear.max < new Date().getFullYear()) {
      conditions.push(`YEAR(ge.releaseDate) <= ?`);
      params.push(filters.releaseYear.max);
    }
  }

  if (conditions.length > 0) {
    sql += ` AND ${conditions.join(' AND ')}`;
  }

  sql += ` ORDER BY gs.totalDownloads DESC, gs.averageRating DESC LIMIT 100`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Hiba a játékok keresésekor:', err);
      return res.status(500).json({ success: false, error: err });
    }

    // Parse JSON fields
    const games = results.map(game => ({
      ...game,
      categories: game.categories ? JSON.parse(game.categories) : [],
      platforms: game.platforms ? JSON.parse(game.platforms) : [],
      images: game.images ? JSON.parse(game.images) : [],
      videos: game.videos ? JSON.parse(game.videos) : [],
      systemRequirements: game.systemRequirements ? JSON.parse(game.systemRequirements) : {},
      features: game.features ? JSON.parse(game.features) : [],
      languages: game.languages ? JSON.parse(game.languages) : [],
      socialLinks: game.socialLinks ? JSON.parse(game.socialLinks) : {},
      gameMode: game.gameMode ? JSON.parse(game.gameMode) : []
    }));
    
    res.json({ success: true, games });
  });
});

// ===== WISHLIST ÉS COLLECTION VÉGPONTOK =====

// Kívánságlista táblák létrehozása ha nem léteznek
const createWishlistCollectionTables = () => {
  const createWishlistTable = `
    CREATE TABLE IF NOT EXISTS wishlist (
      id int(11) NOT NULL AUTO_INCREMENT,
      idfelhasznalo int(11) NOT NULL,
      idjatekok int(11) NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY unique_user_game_wishlist (idfelhasznalo,idjatekok),
      KEY idfelhasznalo_wishlist (idfelhasznalo),
      KEY idjatekok_wishlist (idjatekok),
      CONSTRAINT fk_wishlist_user FOREIGN KEY (idfelhasznalo) REFERENCES felhasznalo (idfelhasznalo) ON DELETE CASCADE,
      CONSTRAINT fk_wishlist_game FOREIGN KEY (idjatekok) REFERENCES jatekok (idjatekok) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createCollectionTable = `
    CREATE TABLE IF NOT EXISTS game_collection (
      id int(11) NOT NULL AUTO_INCREMENT,
      idfelhasznalo int(11) NOT NULL,
      idjatekok int(11) NOT NULL,
      status enum('owned','played','completed','abandoned') NOT NULL DEFAULT 'owned',
      rating int(11) DEFAULT NULL,
      notes text DEFAULT NULL,
      added_at timestamp NOT NULL DEFAULT current_timestamp(),
      updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY unique_user_game_collection (idfelhasznalo,idjatekok),
      KEY idfelhasznalo_collection (idfelhasznalo),
      KEY idjatekok_collection (idjatekok),
      KEY status_collection (status),
      CONSTRAINT fk_collection_user FOREIGN KEY (idfelhasznalo) REFERENCES felhasznalo (idfelhasznalo) ON DELETE CASCADE,
      CONSTRAINT fk_collection_game FOREIGN KEY (idjatekok) REFERENCES jatekok (idjatekok) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  db.query(createWishlistTable, (err) => {
    if (err) console.error('Hiba a wishlist tábla létrehozásakor:', err);
    else console.log('Wishlist tábla létrehozva vagy már létezik');
  });

  db.query(createCollectionTable, (err) => {
    if (err) console.error('Hiba a collection tábla létrehozásakor:', err);
    else console.log('Collection tábla létrehozva vagy már létezik');
  });
};

// Táblák létrehozása a szerver indításakor
createWishlistCollectionTables();

// Felhasználói tábla kiegészítése
const updateUserTable = () => {
  const alterTable = `
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
  `;

  db.query(alterTable, (err) => {
    if (err) {
      console.error('Hiba a felhasználói tábla kiegészítésekor:', err);
    } else {
      console.log('Felhasználói tábla kiegészítve vagy már létezik');
    }
  });
};

// Játék tábla kiegészítése
const updateGameTable = () => {
  const statements = [
    "ALTER TABLE jatekok ADD COLUMN status ENUM('approved', 'pending', 'rejected') DEFAULT 'approved'",
    "ALTER TABLE jatekok ADD COLUMN uploaded_by INT NULL",
    "ALTER TABLE jatekok ADD COLUMN approved_at DATETIME NULL",
    "ALTER TABLE jatekok ADD COLUMN approved_by INT NULL",
    "ALTER TABLE jatekok ADD COLUMN rejection_reason TEXT NULL",
    "ALTER TABLE jatekok ADD COLUMN ertekeles DECIMAL(3,2) DEFAULT 0.00",
    "ALTER TABLE jatekok ADD COLUMN idrendszerkovetelmeny INT NULL DEFAULT 1"
  ];

  let i = 0;
  const runNext = () => {
    if (i >= statements.length) {
      console.log('Játék tábla kiegészítve vagy már létezik');
      return;
    }

    const sql = statements[i];
    i += 1;
    db.query(sql, (err) => {
      if (err) {
        // ER_DUP_FIELDNAME: column already exists
        if (err.code === 'ER_DUP_FIELDNAME') return runNext();
        console.error('Hiba a játék tábla kiegészítésekor:', err);
        return;
      }
      return runNext();
    });
  };

  runNext();
};

// Hiányzó táblák létrehozása
const createMissingTables = () => {
  const createRendszerKovetelmeny = `
    CREATE TABLE IF NOT EXISTS rendszerkovetelmeny (
      idrendszerkovetelmeny int(11) NOT NULL AUTO_INCREMENT,
      minimum varchar(255) DEFAULT NULL,
      ajanlott varchar(255) DEFAULT NULL,
      PRIMARY KEY (idrendszerkovetelmeny)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createJatekExtra = `
    CREATE TABLE IF NOT EXISTS jatekextra (
      idjatekok int(11) NOT NULL,
      megjelenes varchar(100) NOT NULL,
      steam_link varchar(500) NOT NULL,
      jatek_elmeny varchar(255) DEFAULT NULL,
      reszletes_leiras text NOT NULL,
      PRIMARY KEY (idjatekok),
      CONSTRAINT fk_jatekextra_jatek FOREIGN KEY (idjatekok) REFERENCES jatekok (idjatekok) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createJatekVideok = `
    CREATE TABLE IF NOT EXISTS jatek_videok (
      id int(11) NOT NULL AUTO_INCREMENT,
      idjatekok int(11) NOT NULL,
      url varchar(500) NOT NULL,
      PRIMARY KEY (id),
      KEY idjatekok (idjatekok),
      CONSTRAINT fk_jatek_videok_jatek FOREIGN KEY (idjatekok) REFERENCES jatekok (idjatekok) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createKategoria = `
    CREATE TABLE IF NOT EXISTS kategoria (
      idkategoria int(11) NOT NULL AUTO_INCREMENT,
      nev varchar(100) NOT NULL,
      PRIMARY KEY (idkategoria)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createPlatform = `
    CREATE TABLE IF NOT EXISTS platform (
      idplatform int(11) NOT NULL AUTO_INCREMENT,
      nev varchar(100) NOT NULL,
      PRIMARY KEY (idplatform)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createJatekokKategoriak = `
    CREATE TABLE IF NOT EXISTS jatekok_kategoriak (
      idjatekok int(11) NOT NULL,
      idkategoria int(11) NOT NULL,
      PRIMARY KEY (idjatekok, idkategoria),
      KEY idkategoria (idkategoria),
      CONSTRAINT fk_jatek_kategoria FOREIGN KEY (idjatekok) REFERENCES jatekok (idjatekok) ON DELETE CASCADE,
      CONSTRAINT fk_kategoria_jatek FOREIGN KEY (idkategoria) REFERENCES kategoria (idkategoria) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createJatekokPlatformok = `
    CREATE TABLE IF NOT EXISTS jatekok_platformok (
      idjatekok int(11) NOT NULL,
      idplatform int(11) NOT NULL,
      PRIMARY KEY (idjatekok, idplatform),
      KEY idplatform (idplatform),
      CONSTRAINT fk_jatek_platform FOREIGN KEY (idjatekok) REFERENCES jatekok (idjatekok) ON DELETE CASCADE,
      CONSTRAINT fk_platform_jatek FOREIGN KEY (idplatform) REFERENCES platform (idplatform) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  const createKommentek = `
    CREATE TABLE IF NOT EXISTS kommentek (
      idkommentek int(11) NOT NULL AUTO_INCREMENT,
      idjatekok int(11) NOT NULL,
      idfelhasznalo int(11) NOT NULL,
      tartalom text NOT NULL,
      ertekeles decimal(3,2) DEFAULT NULL,
      datum timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (idkommentek),
      KEY idjatekok (idjatekok),
      KEY idfelhasznalo (idfelhasznalo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;

  db.query(createKommentek, (err) => {
    if (err) {
      console.error('Hiba a kommentek tábla létrehozásakor:', err);
    } else {
      console.log('kommentek tábla létrehozva vagy már létezik');
    }
  });

  const tables = [
    { sql: createRendszerKovetelmeny, name: 'rendszerkovetelmeny' },
    { sql: createJatekExtra, name: 'jatekextra' },
    { sql: createJatekVideok, name: 'jatek_videok' },
    { sql: createKategoria, name: 'kategoria' },
    { sql: createPlatform, name: 'platform' },
    { sql: createJatekokKategoriak, name: 'jatekok_kategoriak' },
    { sql: createJatekokPlatformok, name: 'jatekok_platformok' }
  ];

  tables.forEach(table => {
    db.query(table.sql, (err) => {
      if (err) {
        console.error(`Hiba a ${table.name} tábla létrehozásakor:`, err);
      } else {
        console.log(`${table.name} tábla létrehozva vagy már létezik`);
      }
    });
  });

  // Alap adatok beszúrása
  const insertKategoria = "INSERT IGNORE INTO kategoria (nev) VALUES ('Akció'), ('Kaland'), ('Stratégia'), ('RPG'), ('Sport')";
  const insertPlatform = "INSERT IGNORE INTO platform (nev) VALUES ('PC'), ('PlayStation'), ('Xbox'), ('Nintendo')";
  const insertRendszerKovetelmeny = "INSERT IGNORE INTO rendszerkovetelmeny (minimum, ajanlott) VALUES ('Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM')";

  db.query(insertKategoria, (err) => {
    if (err) console.error('Hiba a kategóriák beszúrásakor:', err);
    else console.log('Alap kategóriák beszúrva');
  });

  db.query(insertPlatform, (err) => {
    if (err) console.error('Hiba a platformok beszúrásakor:', err);
    else console.log('Alap platformok beszúrva');
  });

  db.query(insertRendszerKovetelmeny, (err) => {
    if (err) console.error('Hiba a rendszerkövetelmények beszúrásakor:', err);
    else console.log('Alap rendszerkövetelmény beszúrva');
  });
};

// Felhasználói tábla kiegészítése a szerver indításakor
updateUserTable();
updateGameTable();
createMissingTables();

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

app.delete("/wishlist/:username/:gameId", (req, res) => {
  const { username, gameId } = req.params;
  
  const sql = `
    DELETE w FROM wishlist w
    JOIN felhasznalo u ON w.idfelhasznalo = u.idfelhasznalo
    WHERE u.felhasznalonev = ? AND w.idjatekok = ?
  `;

  db.query(sql, [username, gameId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Nincs ilyen játék a kívánságlistán" });
    res.json({ success: true, message: "Játék törölve a kívánságlistáról" });
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

app.put("/collection/:username/:gameId", (req, res) => {
  const { username, gameId } = req.params;
  const { status, rating, notes } = req.body;
  
  const sql = `
    UPDATE game_collection c
    JOIN felhasznalo u ON c.idfelhasznalo = u.idfelhasznalo
    SET c.status = ?, c.rating = ?, c.notes = ?, c.updated_at = CURRENT_TIMESTAMP
    WHERE u.felhasznalonev = ? AND c.idjatekok = ?
  `;

  db.query(sql, [status, rating || null, notes || null, username, gameId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Nincs ilyen játék a gyűjteményben" });
    res.json({ success: true, message: "Játék adatai frissítve" });
  });
});

app.delete("/collection/:username/:gameId", (req, res) => {
  const { username, gameId } = req.params;
  
  const sql = `
    DELETE c FROM game_collection c
    JOIN felhasznalo u ON c.idfelhasznalo = u.idfelhasznalo
    WHERE u.felhasznalonev = ? AND c.idjatekok = ?
  `;

  db.query(sql, [username, gameId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Nincs ilyen játék a gyűjteményben" });
    res.json({ success: true, message: "Játék törölve a gyűjteményből" });
  });
});

app.listen(3001, () => console.log("Szerver fut a 3001-es porton"));
