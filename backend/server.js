const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // ✅ JSON body parser

// MySQL kapcsolat
const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'jatekhirdeto',
  multipleStatements: true // ha később több utasítást szeretnél egy query-ben
});

db.connect(err => {
  if (err) {
    console.error('Nem sikerült csatlakozni a MySQL-hez:', err);
  } else {
    console.log('MySQL kapcsolat létrejött.');
  }
});

app.get('/', (req, res) => {
  res.send('fut a szeró');
});

// Regisztráció
app.post('/register', (req, res) => {
  const { felhasznalonev, email, jelszo } = req.body;
  const sql = 'INSERT INTO felhasznalo (felhasznalonev, email, jelszo) VALUES (?, ?, ?)';
  db.query(sql, [felhasznalonev, email, jelszo], (err) => {
    if (err) {
      console.error('Hiba regisztrációnál:', err);
      return res.status(500).json({ success: false, message: 'Hiba történt', error: err });
    }
    res.json({ success: true });
  });
});

// Bejelentkezés
app.post('/login', (req, res) => {
  const { felhasznalonev, jelszo } = req.body;
  const sql = 'SELECT * FROM felhasznalo WHERE felhasznalonev = ? AND jelszo = ?';
  db.query(sql, [felhasznalonev, jelszo], (err, results) => {
    if (err) {
      console.error('Hiba bejelentkezésnél:', err);
      return res.status(500).json({ success: false, message: 'Hiba történt', error: err });
    }
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: 'Hibás adatok' });
    }
  });
});

// Felhasználók lekérdezése
app.get('/felhasznalok', (req, res) => {
  const sql = 'SELECT * FROM felhasznalo';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Hiba a felhasználók lekérdezésekor:', err);
      return res.status(500).json({ success: false, message: 'Hiba történt', error: err });
    }
    res.json({ success: true, users: results });
  });
});

// 📦 GET /jatekok végpont
app.get('/jatekok', (req, res) => {
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
    LEFT JOIN jatekok_kategoriak jk ON j.idjatekok = jk.idjatekok
    LEFT JOIN kategoria k ON jk.idkategoria = k.idkategoria
    LEFT JOIN jatekok_platformok jp ON j.idjatekok = jp.idjatekok
    LEFT JOIN platform p ON jp.idplatform = p.idplatform
    GROUP BY j.idjatekok
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Hiba a játékok lekérdezésekor:', err);
      return res.status(500).json({ success: false, error: err });
    }

    const mappedGames = results.map(game => ({
      id: game.id,
      title: game.title,
      developer: game.developer,
      price: game.price == 0 ? 'Ingyenes' : `${Number(game.price).toLocaleString()} Ft`,
      image: game.image || '',
      requirements: {
        minimum: game.minimum || '',
        recommended: game.recommended || ''
      },
      categories: game.categories ? game.categories.split(', ') : [],
      platforms: game.platforms ? game.platforms.split(', ') : [],
      rating: game.rating || 0,
      description: game.description || ''
    }));

    res.json({ success: true, games: mappedGames });
  });
});

// 📥 POST /jatekok – teljes beszúrás FK-kkal és kapcsolótáblával
app.post('/jatekok', (req, res) => {
  const { title, developer, price, category, image, minReq, recReq, desc, rating } = req.body;

  // Kötelező mezők ellenőrzése
  if (!title || !developer || !price || !category || !image) {
    return res.status(400).json({ success: false, message: 'Hiányzó mezők!' });
  }

  // 1) Fejlesztő beszúrása / lekérése
  const insertDevSql = `
    INSERT INTO fejleszto (nev) VALUES (?)
    ON DUPLICATE KEY UPDATE idfejleszto = LAST_INSERT_ID(idfejleszto)
  `;
  db.query(insertDevSql, [developer], (err, devResult) => {
    if (err) {
      console.error('Hiba fejlesztőnél:', err);
      return res.status(500).json({ success: false, message: 'Fejlesztő hiba', error: err });
    }
    const devId = devResult.insertId;

    // 2) Rendszerkövetelmény beszúrása
    const insertReqSql = `
      INSERT INTO rendszerkovetelmeny (minimum, ajanlott)
      VALUES (?, ?)
    `;
    db.query(insertReqSql, [minReq || '', recReq || ''], (err, reqResult) => {
      if (err) {
        console.error('Hiba rendszerkövetelménynél:', err);
        return res.status(500).json({ success: false, message: 'Rendszerkövetelmény hiba', error: err });
      }
      const reqId = reqResult.insertId;

      // 3) Játék beszúrása minden szükséges oszloppal
      const insertGameSql = `
        INSERT INTO jatekok (nev, idfejleszto, ar, idrendszerkovetelmeny, leiras, ertekeles, kepurl)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const numericRating = rating === '' || rating === null || rating === undefined ? 0 : Number(rating);
      db.query(
        insertGameSql,
        [title, devId, price, reqId, desc || '', numericRating, image],
        (err, gameResult) => {
          if (err) {
            console.error('Hiba játéknál:', err);
            return res.status(500).json({ success: false, message: 'Játék hiba', error: err });
          }
          const gameId = gameResult.insertId;

          // 4) Kategória beszúrása / lekérése
          const insertCatSql = `
            INSERT INTO kategoria (nev) VALUES (?)
            ON DUPLICATE KEY UPDATE idkategoria = LAST_INSERT_ID(idkategoria)
          `;
          db.query(insertCatSql, [category], (err, catResult) => {
            if (err) {
              console.error('Hiba kategóriánál:', err);
              return res.status(500).json({ success: false, message: 'Kategória hiba', error: err });
            }
            const catId = catResult.insertId;

            // 5) Kapcsolótábla frissítése (játék-kategória)
            const linkSql = 'INSERT INTO jatekok_kategoriak (idjatekok, idkategoria) VALUES (?, ?)';
            db.query(linkSql, [gameId, catId], (err) => {
              if (err) {
                console.error('Hiba kapcsolótáblánál:', err);
                return res.status(500).json({ success: false, message: 'Kapcsolótábla hiba', error: err });
              }

              // ✅ Sikeres beszúrás – vissza JSON
              res.json({
                success: true,
                message: 'Játék hozzáadva!',
                game: {
                  id: gameId,
                  title,
                  developer,
                  price,
                  image,
                  category,
                  rating: numericRating,
                  description: desc || '',
                  requirements: { minimum: minReq || '', recommended: recReq || '' }
                }
              });
            });
          });
        }
      );
    });
  });
});

// 📦 DELETE /jatekok/:id – CASCADE miatt elég a szülőt törölni
app.delete('/jatekok/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM jatekok WHERE idjatekok = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Hiba a játék törlésekor:', err);
      return res.status(500).json({ success: false, error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Nincs ilyen játék.' });
    }

    res.json({ success: true, message: 'Játék törölve.' });
  });
});

app.listen(3001, () => {
  console.log('Szerver fut a 3001-es porton');
});
