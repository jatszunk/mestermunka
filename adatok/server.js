const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MySQL adatbázis kapcsolat - meglévő jatekhirdeto adatbázis használata
const dbConfig = {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'jatekhirdeto',
    charset: 'utf8mb4'
};

let db;

async function initDatabase() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('MySQL kapcsolat sikeres a jatekhirdeto adatbázishoz!');
        
        // A felhasznalo tábla már létezik, nem kell létrehozni
        console.log('Felhasznalo tábla ellenőrizve!');
    } catch (error) {
        console.error('Adatbázis hiba:', error);
        process.exit(1);
    }
}

// API végpontok

// Összes adat lekérése a felhasznalo táblából
app.get('/api/adatok', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                idfelhasznalo as id,
                nev as nev,
                email as email,
                birthYear as kor,
                'Ismeretlen' as szak,
                regisztracio_datum as letrehozva
            FROM felhasznalo 
            WHERE aktiv = 1 
            ORDER BY regisztracio_datum DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Hiba az adatok lekérésekor:', error);
        res.status(500).json({ error: 'Adatbázis hiba' });
    }
});

// Email validáció függvény
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Új felhasználó mentése a felhasznalo táblába
app.post('/api/adatok', async (req, res) => {
    try {
        const { nev, email, kor, szak } = req.body;
        
        if (!nev || !email || !kor) {
            return res.status(400).json({ error: 'Név, email és kor megadása kötelező!' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Érvénytelen email formátum!' });
        }

        // Generálunk felhasználónevet és jelszót
        const felhasznalonev = email.split('@')[0] + '_' + Date.now();
        const jelszo = Math.random().toString(36).slice(-8);

        const [result] = await db.execute(
            'INSERT INTO felhasznalo (felhasznalonev, email, jelszo, nev, birthYear, szerepkor) VALUES (?, ?, ?, ?, ?, ?)',
            [felhasznalonev, email, jelszo, nev, kor, 'felhasznalo']
        );
        
        res.json({ 
            success: true, 
            id: result.insertId,
            message: 'Felhasználó sikeresen létrehozva!',
            felhasznalonev: felhasznalonev,
            jelszo: jelszo
        });
    } catch (error) {
        console.error('Hiba a mentéskor:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Ez az email cím már létezik!' });
        } else {
            res.status(500).json({ error: 'Adatbázis hiba' });
        }
    }
});

// Adat törlése (deaktiválás a felhasznalo táblából)
app.delete('/api/adatok/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute('UPDATE felhasznalo SET aktiv = 0 WHERE idfelhasznalo = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'A felhasználó nem található!' });
        }
        
        res.json({ success: true, message: 'Felhasználó deaktiválva!' });
    } catch (error) {
        console.error('Hiba a törléskor:', error);
        res.status(500).json({ error: 'Adatbázis hiba' });
    }
});

// Minta adatok betöltése a felhasznalo táblába
app.post('/api/minta-adatok', async (req, res) => {
    try {
        const mintaAdatok = [
            ['Nagy Péter', 'nagy.peter@email.com', 22, 'Mérnök informatika'],
            ['Kiss Anna', 'kiss.anna@email.com', 21, 'Gazdálkodás'],
            ['Szabó Gábor', 'szabo.gabor@email.com', 23, 'Matematika'],
            ['Tóth Éva', 'toth.eva@email.com', 20, 'Angol nyelv'],
            ['Varga István', 'varga.istvan@email.com', 24, 'Fizika']
        ];

        for (const [nev, email, kor] of mintaAdatok) {
            try {
                const felhasznalonev = email.split('@')[0] + '_' + Date.now() + Math.random().toString(36).slice(-4);
                const jelszo = Math.random().toString(36).slice(-8);
                
                await db.execute(
                    'INSERT INTO felhasznalo (felhasznalonev, email, jelszo, nev, birthYear, szerepkor) VALUES (?, ?, ?, ?, ?, ?)',
                    [felhasznalonev, email, jelszo, nev, kor, 'felhasznalo']
                );
            } catch (error) {
                // Duplikált email esetén kihagyjuk
                if (error.code !== 'ER_DUP_ENTRY') {
                    throw error;
                }
            }
        }
        
        res.json({ success: true, message: 'Minta felhasználók betöltve!' });
    } catch (error) {
        console.error('Hiba a minta adatok betöltésekor:', error);
        res.status(500).json({ error: 'Adatbázis hiba' });
    }
});

// Szerver indítása
app.listen(PORT, async () => {
    await initDatabase();
    console.log(`Szerver fut: http://localhost:${PORT}`);
    console.log('Adatbázis kezelő elérhető!');
});

module.exports = app;
