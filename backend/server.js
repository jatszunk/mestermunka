const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'jatekhirdeto'
});

app.get('/',(req,res)=>{
  res.send("fut a szeró");
})

// Regisztráció
app.post('/register', (req, res) => {
    const { felhasznalonev, email, jelszo } = req.body;
    const sql = 'INSERT INTO felhasznalo (felhasznalonev, email, jelszo) VALUES (?, ?, ?)';
    db.query(sql, [felhasznalonev, email, jelszo], (err, result) => {
      if (err) {
        console.error('Hiba regisztrációnál:', err);
        return res.status(500).send('Hiba történt');
      }
      res.send({ success: true });
    });
  });
  
  // Bejelentkezés
  app.post('/login', (req, res) => {
    const { felhasznalonev, jelszo } = req.body;
    const sql = 'SELECT * FROM felhasznalo WHERE felhasznalonev = ? AND jelszo = ?';
    db.query(sql, [felhasznalonev, jelszo], (err, results) => {
      if (err) {
        console.error('Hiba bejelentkezésnél:', err);
        return res.status(500).send('Hiba történt');
      }
      if (results.length > 0) {
        res.send({ success: true, user: results[0] });
      } else {
        res.status(401).send({ success: false, message: 'Hibás adatok' });
      }
    });
  });
  

// Felhasználók lekérdezése
app.get('/felhasznalok', (req, res) => {
  const sql = 'SELECT * FROM felhasznalo';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Hiba a felhasználók lekérdezésekor:', err);
      return res.status(500).send('Hiba történt');
    }
    res.send({ success: true, users: results });
  });
});

// 📦 GET /jatekok végpont
app.get('/jatekok', (req, res) => {
  const sql = `
    SELECT 
      j.idjatekok AS id,
      j.nev AS title,
      f.nev AS developer,
      j.ar,
      k.nev AS category,
      p.nev AS platform,
      j.rendszerkovetelmeny,
      j.ajanlottkovetelmeny,
      j.leiras AS description,
      j.kepurl AS image,
      j.ertekeles AS rating
    FROM jatekok j
    JOIN fejleszto f ON j.idfejleszto = f.idfejleszto
    JOIN kategoria k ON j.idkategoria = k.idkategoria
    JOIN platform p ON j.idplatform = p.idplatform
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Hiba a játékok lekérdezésekor:", err);
      return res.status(500).json({ success: false, error: err });
    }

    // 🎯 Adatok formázása frontendhez
    const mappedGames = results.map(game => ({
      id: game.id,
      title: game.title,
      developer: game.developer,
      price: game.ar === 0 ? 'Ingyenes' : `${game.ar.toLocaleString()} Ft`,
      image: game.image || '', // ha van kép URL
      requirements: {
        minimum: game.rendszerkovetelmeny || '',
        recommended: game.ajanlottkovetelmeny || ''
      },
      category: game.category,
      rating: game.rating || 0,
      description: game.description || ''
    }));

    res.json({ success: true, games: mappedGames });
  });
});

app.listen(3001, () => {
    console.log('Szerver fut a 3001-es porton');
  });
