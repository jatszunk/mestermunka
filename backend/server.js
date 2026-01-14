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
  else console.log("MySQL kapcsolat létrejött.");
});

app.get("/", (req, res) => res.send("fut a szerver"));

// Regisztráció
app.post("/register", (req, res) => {
  const { felhasznalonev, email, jelszo } = req.body;
  const sql = "INSERT INTO felhasznalo (felhasznalonev, email, jelszo) VALUES (?, ?, ?)";
  db.query(sql, [felhasznalonev, email, jelszo], (err) => {
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

// Játékok listázása
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
      GROUP_CONCAT(DISTINCT k.nev SEPARATOR ', ') AS categories,
      GROUP_CONCAT(DISTINCT p.nev SEPARATOR ', ') AS platforms
    FROM jatekok j
    JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    JOIN rendszerkovetelmeny r ON j.idrendszerkovetelmeny = r.idrendszerkovetelmeny
    LEFT JOIN jatekokkategoriak jk ON j.idjatekok = jk.idjatekok
    LEFT JOIN kategoria k ON jk.idkategoria = k.idkategoria
    LEFT JOIN jatekokplatformok jp ON j.idjatekok = jp.idjatekok
    LEFT JOIN platform p ON jp.idplatform = p.idplatform
    GROUP BY j.idjatekok
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });

    const mappedGames = results.map((game) => ({
      id: game.id,
      title: game.title,
      developer: game.developer,
      price: game.price === "0" ? "Ingyenes" : (game.price ? `${game.price}` : ""),
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

// Játék hozzáadás (admin oldalad használja)
app.post("/jatekok", (req, res) => {
  const { title, developer, price, category, image, minReq, recReq, desc, rating } = req.body;

  if (!title || !developer || !price || !category || !image) {
    return res.status(400).json({ success: false, message: "Hiányzó mezők!" });
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

      db.query(
        insertGameSql,
        [title, devId, price, reqId, desc || "", numericRating, image],
        (err3, gameResult) => {
          if (err3) return res.status(500).json({ success: false, message: "Játék hiba", error: err3 });
          const gameId = gameResult.insertId;

          const insertCatSql =
            "INSERT INTO kategoria (nev) VALUES (?) ON DUPLICATE KEY UPDATE idkategoria=LAST_INSERT_ID(idkategoria)";
          db.query(insertCatSql, [category], (err4, catResult) => {
            if (err4) return res.status(500).json({ success: false, message: "Kategória hiba", error: err4 });
            const catId = catResult.insertId;

            const linkSql = "INSERT INTO jatekokkategoriak (idjatekok, idkategoria) VALUES (?, ?)";
            db.query(linkSql, [gameId, catId], (err5) => {
              if (err5) return res.status(500).json({ success: false, message: "Kapcsolótábla hiba", error: err5 });

              res.json({
                success: true,
                message: "Játék hozzáadva!",
                game: { id: gameId, title, developer, price, image, category, rating: numericRating, description: desc },
              });
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

// EMAIL
// EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gameverseprojekt@gmail.com",
    pass: "rvsv wosp oglj jvpd", // app password
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
    html: `<div><h3>Új üzenet</h3><p><b>Név:</b> ${name}</p><p><b>Email:</b> ${from}</p><p><b>Üzenet:</b><br/>${String(message).replace(/\n/g, "<br/>")}</p></div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email elküldve!" });
  } catch (error) {
    console.error("Email hiba:", error);
    res.status(500).json({ success: false, message: "Email küldés sikertelen!", error: String(error) });
  }
});

app.listen(3001, () => console.log("Szerver fut a 3001-es porton"));
