const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'reklamoldal'
});

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

app.listen(3001, () => {
    console.log('Szerver fut a 3001-es porton');
  });
