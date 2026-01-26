# Steam API Integráció Használati Útmutató

## Beállítás

### 1. Steam API Kulcs Beszerzése
1. Látogass el a https://steamcommunity.com/dev/apikey oldalra
2. Jelentkezz be a Steam fiókodba
3. Add meg a domain nevet (pl. localhost) és kérj API kulcsot
4. Másold ki a kapott API kulcsot

### 2. Környezeti Változók Beállítása
Nyisd meg a `.env` fájlt a backend mappában és add hozzá a Steam API kulcsot:

```
STEAM_API_KEY=your_actual_steam_api_key_here
STEAM_API_BASE_URL=https://store.steampowered.com/api
STEAM_COMMUNITY_BASE_URL=https://steamcommunity.com
```

### 3. Adatbázis Frissítése
Futtasd a `steam_integration.sql` fájlt a meglévő adatbázison:

```bash
mysql -u root -p jatekhirdeto < steam_integration.sql
```

### 4. Függőségek Telepítése
```bash
cd backend
npm install
```

### 5. Szerver Indítása
```bash
npm start
```

## API Endpointok

### Steam Játék Keresése
```
GET /steam/search?query=counter&limit=10
```

### Steam Játék Részletek
```
GET /steam/game/730
```

### Steam Játék Szinkronizálása
```
POST /steam/sync/730
```

### Manuális Szinkronizáció Indítása
```
POST /steam/sync-manual
Content-Type: application/json

{
  "type": "price_update" // vagy "full_sync", "all_steam_games"
}
```

### Szinkronizációs Napló
```
GET /steam/sync-log?limit=50&status=success
```

## Automatikus Szinkronizáció

A rendszer automatikusan frissíti az adatokat:

- **Napi 2:00**: Steam játékok adatainak frissítése
- **Óránként**: Árak frissítése
- **Heti vasárnap 3:00**: Teljes adatbázis szinkronizáció

## Használati Példák

### Játék hozzáadása Steamről
```javascript
// Counter-Strike 2 hozzáadása
fetch('http://localhost:3001/steam/sync/730', {
  method: 'POST'
})
.then(response => response.json())
.then(data => console.log(data));
```

### Játékok keresése
```javascript
// "Counter" keresése
fetch('http://localhost:3001/steam/search?query=counter&limit=5')
.then(response => response.json())
.then(data => console.log(data.games));
```

### Manuális árfrissítés
```javascript
fetch('http://localhost:3001/steam/sync-manual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'price_update' })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Adatbázis Táblák

### Új Táblák
- `steam_sync_log`: Szinkronizációs napló
- `steam_platform_data`: Platform specifikus adatok
- `steam_price_history`: Ár történet
- `steam_categories`: Steam kategóriák
- `steam_genres`: Steam műfajok
- `jatekok_steam_categories`: Játék-kategória kapcsolatok
- `jatekok_steam_genres`: Játék-műfaj kapcsolatok

### Bővített Mezők (jatekok tábla)
- `steam_app_id`: Steam alkalmazás ID
- `steam_last_updated`: Utolsó Steam frissítés
- `steam_is_free`: Ingyenes-e
- `steam_coming_soon`: Hamarosan jön-e
- `steam_review_summary`: Értékelés összefoglaló
- `steam_review_score`: Értékelés pontszám
- `steam_review_count`: Értékelések száma

## Hibakezelés

A rendszer naplózza az összes szinkronizációs hibát a `steam_sync_log` táblában, beleértve:
- Hibaüzeneteket
- Időbélyegeket
- Feldolgozott játékok számát
- Részletes hibainformációkat

## Rate Limiting

A Steam API rate limitje miatt a rendszer automatikusan késlelteti a kéréseket:
- Játék részletek: 1 másodperc
- Árfrissítés: 0.5 másodperc
- Teljes szinkronizáció: 2 másodperc

## Biztonság

- Az API kulcs környezeti változóban tárolódik
- Minden endpoint hibakezeléssel rendelkezik
- Az adatbázis műveletek tranzakciókban történnek
- A szinkronizáció nem futtatható párhuzamosan
