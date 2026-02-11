# Adatbázis Kezelő Alkalmazás

Egy egyszerű webes alkalmazás, amely a meglévő `jatekhirdeto` MySQL adatbázist használja felhasználói adatok kezelésére Node.js és Express segítségével.

## Funkciók

- **Felhasználók listázása**: Aktív felhasználók megjelenítése a `felhasznalo` táblából
- **Új felhasználó létrehozása**: Felhasználó hozzáadása a rendszerhez
- **Felhasználó deaktiválása**: Felhasználó inaktívvá tétele (soft delete)
- **Minta felhasználók**: 5 teszt felhasználó automatikus létrehozása
- **Adatok frissítése**: Adatok újratöltése adatbázisból
- **Validáció**: Email formátum és kor ellenőrzése

## Adatbázis Integráció

Az alkalmazás a meglévő `jatekhirdeto` adatbázist használja:

- **Adatbázis**: `jatekhirdeto`
- **Tábla**: `felhasznalo`
- **Port**: 3307 (a backend beállításainak megfelelően)
- **Kapcsolat**: MySQL2 driverrel

### Adatbázis mezők használata:

- `idfelhasznalo` → ID
- `nev` → Név
- `email` → Email
- `birthYear` → Kor
- `regisztracio_datum` → Létrehozva dátum
- `aktiv` → Aktív státusz

## Telepítés és Futtatás

### Előfeltételek

1. **Node.js** telepítve (v14 vagy újabb)
2. **MySQL** szerver fut a 3307-es porton
3. **jatekhirdeto** adatbázis létezik és a `felhasznalo` tábla elérhető

### Alkalmazás Telepítése

1. Telepítsd a szükséges csomagokat:
   ```bash
   npm install
   ```

2. Indítsd el a szervert:
   ```bash
   npm start
   ```
   Vagy fejlesztéshez:
   ```bash
   npm run dev
   ```

3. Nyisd meg a böngésződben:
   ```
   http://localhost:3000
   ```

## Használat

1. **Felhasználó hozzáadása**:
   - Töltsd ki a név, email és kor mezőket
   - A "Szak" mező opcionális (jelenleg nem kerül az adatbázisba)
   - Kattints a "Mentés" gombra
   - A rendszer automatikusan generál felhasználónevet és jelszót

2. **Felhasználók megtekintése**:
   - A mentett felhasználók automatikusan megjelennek az alábbi listában
   - Minden felhasználó deaktiválható a "Törlés" gombbal

3. **Minta felhasználók**:
   - Kattints a "Minta adatok" gombra 5 teszt felhasználó létrehozásához

4. **Teljes adat**:
   - Kattints a "Teljes adat" gombra az összes felhasználó adatainak konzolra írásához

## API Végpontok

- `GET /api/adatok` - Összes aktív felhasználó lekérése
- `POST /api/adatok` - Új felhasználó létrehozása
- `DELETE /api/adatok/:id` - Felhasználó deaktiválása
- `POST /api/minta-adatok` - Minta felhasználók létrehozása

## Technikai Részletek

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Adatbázis**: MySQL (jatekhirdeto)
- **Stílus**: Modern, reszponzív design
- **Validáció**: Kliens oldali és szerver oldali

## Megjegyzések

- Az alkalmazás a meglévő `jatekhirdeto` adatbázishoz csatlakozik
- Új felhasználók létrehozásakor a rendszer automatikusan generál felhasználónevet és jelszót
- A törlés művelet valójában deaktiválás (aktiv = 0)
- A "Szak" mező jelenleg nem kerül az adatbázisba, mivel a `felhasznalo` táblában nincs ilyen mező

## Hibaelhárítás

### "Nem sikerült csatlakozni a szerverhez" hiba
- Ellenőrizd, hogy a Node.js szerver fut-e
- Ellenőrizd, hogy a port 3000 szabad-e

### Adatbázis hibák
- Ellenőrizd, hogy a MySQL szerver fut-e a 3307-es porton
- Ellenőrizd, hogy a `jatekhirdeto` adatbázis létezik-e
- Ellenőrizd a `felhasznalo` tábla elérhetőségét

### Port konfliktus
- Ha a 3000-as port foglalt, módosítsd a `PORT` változót a `server.js` fájlban

## Licenc

ISC
