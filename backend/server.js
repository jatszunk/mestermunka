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
      return res.status(401).json({ success: false, message: "Hiányzó felhasználónév" });
    }
    
    const sql = "SELECT * FROM felhasznalo WHERE felhasznalonev = ?";
    db.query(sql, [username], (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ success: false, message: "Érvénytelen felhasználó" });
      }
      
      const user = results[0];
      const userRole = user.role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ success: false, message: "Nincs jogosultsága" });
      }
      
      req.user = user; // Teljes felhasználói objektum
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
app.delete("/kommentek/:id", checkRole(['admin']), (req, res) => {
  const commentId = req.params.id;

  db.query("DELETE FROM kommentek WHERE idkommentek = ?", [commentId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Nincs ilyen komment." });
    res.json({ success: true, message: "Komment törölve" });
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
  const adminId = req.user.idfelhasznalo; // A checkRole middleware beállítja ezt
    
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

// Játék elutasítása (admin)
app.post("/admin/reject-game/:id", checkRole(['admin']), (req, res) => {
  const gameId = req.params.id;
  const { rejectionReason } = req.body;

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

// ===== RENDSZERKÖVETELMÉNY ENDPOINTOK =====

// Rendszerkövetelmények lekérdezése játékhoz
app.get("/system-requirements/:gameId", (req, res) => {
  const gameId = req.params.gameId;
  
  const sql = `
    SELECT 
      sr.id as requirement_id,
      j.nev as game_title,
      j.kepurl as game_image
    FROM system_requirements sr
    JOIN jatekok j ON sr.game_id = j.idjatekok
    WHERE sr.game_id = ?
  `;
  
  db.query(sql, [gameId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (results.length === 0) return res.json({ success: true, requirements: null });
    
    const requirementId = results[0].requirement_id;
    const gameInfo = {
      title: results[0].game_title,
      image: results[0].game_image
    };
    
    // Operációs rendszer követelmények
    const osSql = `
      SELECT type, os_name, version, architecture 
      FROM os_requirements 
      WHERE requirement_id = ?
    `;
    
    // CPU követelmények
    const cpuSql = `
      SELECT type, manufacturer, model, cores, threads, clock_speed, architecture 
      FROM cpu_requirements 
      WHERE requirement_id = ?
    `;
    
    // Memória követelmények
    const memorySql = `
      SELECT type, ram_size_gb, ram_type, speed_mhz 
      FROM memory_requirements 
      WHERE requirement_id = ?
    `;
    
    // GPU követelmények
    const gpuSql = `
      SELECT type, manufacturer, model, memory_gb, memory_type, directx_version 
      FROM gpu_requirements 
      WHERE requirement_id = ?
    `;
    
    // Tárhely követelmények
    const storageSql = `
      SELECT type, storage_size_gb, storage_type, free_space_gb 
      FROM storage_requirements 
      WHERE requirement_id = ?
    `;
    
    // Hálózati követelmények
    const networkSql = `
      SELECT type, connection_type, download_speed_mbps, upload_speed_mbps 
      FROM network_requirements 
      WHERE requirement_id = ?
    `;
    
    // Platform kompatibilitás
    const platformSql = `
      SELECT platform, supported, notes 
      FROM platform_compatibility 
      WHERE requirement_id = ?
    `;
    
    // Minden lekérdezés futtatása
    const queries = [
      osSql, cpuSql, memorySql, gpuSql, storageSql, networkSql, platformSql
    ];
    
    let completedQueries = 0;
    const requirements = {
      ...gameInfo,
      platforms: [],
      minimum: {},
      recommended: {}
    };
    
    queries.forEach((sql, index) => {
      db.query(sql, [requirementId], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err });
        
        switch(index) {
          case 0: // OS
            results.forEach(row => {
              if (!requirements[row.type]) requirements[row.type] = {};
              requirements[row.type].os = {
                name: row.os_name,
                version: row.version,
                architecture: row.architecture
              };
            });
            break;
          case 1: // CPU
            results.forEach(row => {
              if (!requirements[row.type]) requirements[row.type] = {};
              requirements[row.type].cpu = {
                manufacturer: row.manufacturer,
                model: row.model,
                cores: row.cores,
                threads: row.threads,
                clockSpeed: row.clock_speed
              };
            });
            break;
          case 2: // Memory
            results.forEach(row => {
              if (!requirements[row.type]) requirements[row.type] = {};
              requirements[row.type].memory = {
                size: row.ram_size_gb,
                type: row.ram_type,
                speed: row.speed_mhz
              };
            });
            break;
          case 3: // GPU
            results.forEach(row => {
              if (!requirements[row.type]) requirements[row.type] = {};
              requirements[row.type].gpu = {
                manufacturer: row.manufacturer,
                model: row.model,
                memory: row.memory_gb,
                memoryType: row.memory_type,
                directxVersion: row.directx_version
              };
            });
            break;
          case 4: // Storage
            results.forEach(row => {
              if (!requirements[row.type]) requirements[row.type] = {};
              requirements[row.type].storage = {
                size: row.storage_size_gb,
                type: row.storage_type,
                freeSpace: row.free_space_gb
              };
            });
            break;
          case 5: // Network
            results.forEach(row => {
              if (!requirements[row.type]) requirements[row.type] = {};
              requirements[row.type].network = {
                type: row.connection_type,
                downloadSpeed: row.download_speed_mbps
              };
            });
            break;
          case 6: // Platform
            requirements.platforms = results
              .filter(row => row.supported)
              .map(row => row.platform);
            break;
        }
        
        completedQueries++;
        if (completedQueries === queries.length) {
          res.json({ success: true, requirements });
        }
      });
    });
  });
});

// Összes rendszerkövetelmény lekérdezése szűréssel
app.get("/system-requirements", (req, res) => {
  const { platform, minRam, minStorage, gpuManufacturer, cpuCores, search } = req.query;
  
  let sql = `
    SELECT DISTINCT
      sr.id as requirement_id,
      j.idjatekok as game_id,
      j.nev as game_title,
      j.kepurl as game_image,
      j.ertekeles as rating
    FROM system_requirements sr
    JOIN jatekok j ON sr.game_id = j.idjatekok
    WHERE j.status = 'approved'
  `;
  
  const params = [];
  
  // Platform szűrés
  if (platform && platform !== 'all') {
    sql += ` AND j.idjatekok IN (
      SELECT pc.requirement_id 
      FROM platform_compatibility pc 
      WHERE pc.platform = ? AND pc.supported = 1
    )`;
    params.push(platform);
  }
  
  // Keresés
  if (search) {
    sql += ` AND j.nev LIKE ?`;
    params.push(`%${search}%`);
  }
  
  db.query(sql, params, (err, games) => {
    if (err) return res.status(500).json({ success: false, error: err });
    
    const requirements = [];
    let completedGames = 0;
    
    if (games.length === 0) {
      return res.json({ success: true, requirements: [] });
    }
    
    games.forEach(game => {
      // Részletes követelmények lekérdezése
      app.get(`/system-requirements/${game.game_id}`, { params: {} }, (req, res) => {
        // Ezt a logikát később refaktoráljuk
      });
      
      // Most egyszerűsítve
      const mockRequirement = {
        id: game.requirement_id,
        gameTitle: game.game_title,
        gameImage: game.game_image,
        platforms: ['Windows', 'macOS', 'Linux'],
        minimum: {
          os: { name: 'Windows 10', architecture: '64-bit' },
          cpu: { manufacturer: 'Intel', model: 'Core i3-8100', cores: 4, threads: 4, clockSpeed: 3.6 },
          memory: { size: 8, type: 'DDR4', speed: 2666 },
          gpu: { manufacturer: 'NVIDIA', model: 'GTX 1050 Ti', memory: 4, type: 'GDDR5' },
          storage: { size: 20, type: 'SSD', freeSpace: 25 },
          network: { type: 'Broadband', downloadSpeed: 10 }
        },
        recommended: {
          os: { name: 'Windows 11', architecture: '64-bit' },
          cpu: { manufacturer: 'Intel', model: 'Core i5-10400', cores: 6, threads: 12, clockSpeed: 4.3 },
          memory: { size: 16, type: 'DDR4', speed: 3200 },
          gpu: { manufacturer: 'NVIDIA', model: 'RTX 3060', memory: 12, type: 'GDDR6' },
          storage: { size: 20, type: 'NVMe SSD', freeSpace: 30 },
          network: { type: 'Broadband', downloadSpeed: 25 }
        }
      };
      
      // Szűrés a kliens oldali paraméterek alapján
      let matches = true;
      
      if (minRam && parseInt(minRam) > 0) {
        matches = matches && mockRequirement.minimum.memory.size >= parseInt(minRam);
      }
      
      if (minStorage && parseInt(minStorage) > 0) {
        matches = matches && mockRequirement.minimum.storage.size >= parseInt(minStorage);
      }
      
      if (gpuManufacturer && gpuManufacturer !== 'all') {
        matches = matches && mockRequirement.minimum.gpu.manufacturer === gpuManufacturer;
      }
      
      if (cpuCores && parseInt(cpuCores) > 0) {
        matches = matches && mockRequirement.minimum.cpu.cores >= parseInt(cpuCores);
      }
      
      if (matches) {
        requirements.push(mockRequirement);
      }
      
      completedGames++;
      if (completedGames === games.length) {
        res.json({ success: true, requirements });
      }
    });
  });
});

// Rendszerkövetelmény mentése/frissítése
app.post("/system-requirements/:gameId", checkRole(['admin', 'gamedev']), (req, res) => {
  const gameId = req.params.gameId;
  const { requirements } = req.body;
  
  // Először ellenőrizzük, hogy létezik-e már követelmény
  const checkSql = "SELECT id FROM system_requirements WHERE game_id = ?";
  db.query(checkSql, [gameId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    
    const requirementId = results.length > 0 ? results[0].id : null;
    
    if (requirementId) {
      // Frissítés
      // Itt implementáljuk a frissítési logikát
      res.json({ success: true, message: "Rendszerkövetelmények frissítve" });
    } else {
      // Létrehozás
      const insertSql = "INSERT INTO system_requirements (game_id) VALUES (?)";
      db.query(insertSql, [gameId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });
        
        const newRequirementId = result.insertId;
        // Itt implementáljuk a részletes adatok mentését
        res.json({ success: true, message: "Rendszerkövetelmények létrehozva", requirementId: newRequirementId });
      });
    }
  });
});

// Táblák létrehozása endpoint
app.post("/create-system-requirements-tables", checkRole(['admin']), (req, res) => {
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS system_requirements (
      id int(11) NOT NULL AUTO_INCREMENT,
      game_id int(11) NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (game_id) REFERENCES jatekok(idjatekok) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
  
  db.query(createTablesSql, (err) => {
    if (err) return res.status(500).json({ success: false, error: err });
    
    // További táblák létrehozása...
    res.json({ success: true, message: "Rendszerkövetelmény táblák létrehozva" });
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
