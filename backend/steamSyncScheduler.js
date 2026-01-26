const cron = require('node-cron');
const SteamAPI = require('./steamAPI');

class SteamSyncScheduler {
    constructor(db, steamAPI) {
        this.db = db;
        this.steamAPI = steamAPI;
        this.isRunning = false;
        this.setupScheduledTasks();
    }

    setupScheduledTasks() {
        // Minden nap 2:00-kor frissíti a Steam játékokat
        cron.schedule('0 2 * * *', async () => {
            console.log('Napi Steam szinkronizáció indítása...');
            await this.syncAllSteamGames();
        });

        // Minden órában frissíti az árakat
        cron.schedule('0 * * * *', async () => {
            console.log('Órai árfrissítés indítása...');
            await this.updatePrices();
        });

        // Hetente egyszer frissíti az összes adatot
        cron.schedule('0 3 * * 0', async () => {
            console.log('Heti teljes adatfrissítés indítása...');
            await this.fullSync();
        });
    }

    async syncAllSteamGames() {
        if (this.isRunning) {
            console.log('Steam szinkronizáció már fut, kihagyva...');
            return;
        }

        this.isRunning = true;
        const syncStartTime = Date.now();

        try {
            const steamGames = await this.db.query(
                'SELECT idjatekok, steam_app_id, steam_last_updated FROM jatekok WHERE steam_app_id IS NOT NULL'
            );

            let processed = 0;
            let updated = 0;
            let errors = 0;

            for (const game of steamGames) {
                try {
                    const steamData = await this.steamAPI.getAppDetails(game.steam_app_id);
                    
                    if (steamData) {
                        await this.updateGameData(game.idjatekok, steamData);
                        updated++;
                    }

                    processed++;
                    
                    // Rate limit elkerülése
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.error(`Hiba a játék frissítésekor (${game.steam_app_id}):`, error);
                    errors++;
                }
            }

            // Szinkronizációs napló bejegyzés
            await this.db.query(`
                INSERT INTO steam_sync_log (
                    sync_type, status, games_processed, games_updated, 
                    sync_completed_at, duration_ms
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                'price_update', 'success', processed, updated,
                new Date(), Date.now() - syncStartTime
            ]);

            console.log(`Steam szinkronizáció befejezve: ${processed} feldolgozva, ${updated} frissítve, ${errors} hiba`);

        } catch (error) {
            console.error('Steam szinkronizációs hiba:', error);
            
            await this.db.query(`
                INSERT INTO steam_sync_log (
                    sync_type, status, message, sync_completed_at, duration_ms, error_details
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                'price_update', 'error', error.message,
                new Date(), Date.now() - syncStartTime,
                JSON.stringify({ stack: error.stack })
            ]);
        } finally {
            this.isRunning = false;
        }
    }

    async updatePrices() {
        const syncStartTime = Date.now();
        
        try {
            const steamGames = await this.db.query(
                'SELECT idjatekok, steam_app_id FROM jatekok WHERE steam_app_id IS NOT NULL'
            );

            let processed = 0;
            let updated = 0;

            for (const game of steamGames) {
                try {
                    const steamData = await this.steamAPI.getAppDetails(game.steam_app_id);
                    
                    if (steamData && steamData.ar !== undefined) {
                        await this.db.query(
                            'UPDATE jatekok SET ar = ?, steam_last_updated = NOW() WHERE idjatekok = ?',
                            [steamData.ar, game.idjatekok]
                        );

                        // Ártörténet naplózása
                        await this.db.query(`
                            INSERT INTO steam_price_history (
                                steam_app_id, price, currency, discount_percent, 
                                final_price, is_free
                            ) VALUES (?, ?, ?, ?, ?, ?)
                        `, [
                            game.steam_app_id,
                            steamData.ar || 0,
                            steamData.penznem || 'HUF',
                            0, // TODO: Steam discount percentage
                            steamData.ar || 0,
                            steamData.ar === 0 ? 1 : 0
                        ]);

                        updated++;
                    }

                    processed++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    console.error(`Hiba az árfrissítéskor (${game.steam_app_id}):`, error);
                }
            }

            console.log(`Árfrissítés befejezve: ${processed} feldolgozva, ${updated} frissítve`);

        } catch (error) {
            console.error('Árfrissítési hiba:', error);
        }
    }

    async fullSync() {
        if (this.isRunning) {
            console.log('Teljes szinkronizáció már fut, kihagyva...');
            return;
        }

        this.isRunning = true;
        const syncStartTime = Date.now();

        try {
            const steamGames = await this.steamAPI.getAppList();
            const processedGames = [];
            let processed = 0;
            let added = 0;
            let updated = 0;

            // Csak az első 500 játékot szinkronizáljuk a rate limit miatt
            const gamesToSync = steamGames.slice(0, 500);

            for (const app of gamesToSync) {
                try {
                    const steamData = await this.steamAPI.getAppDetails(app.appid);
                    
                    if (steamData) {
                        const existingGame = await this.db.query(
                            'SELECT idjatekok FROM jatekok WHERE steam_app_id = ?',
                            [steamData.steam_app_id]
                        );

                        if (existingGame.length > 0) {
                            await this.updateGameData(existingGame[0].idjatekok, steamData);
                            updated++;
                        } else {
                            await this.insertNewGame(steamData);
                            added++;
                        }

                        processedGames.push({
                            appId: steamData.steam_app_id,
                            name: steamData.nev,
                            action: existingGame.length > 0 ? 'updated' : 'added'
                        });
                    }

                    processed++;
                    
                    // Rate limit elkerülése
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    console.error(`Hiba a teljes szinkronizáció során (${app.appid}):`, error);
                }
            }

            // Szinkronizációs napló bejegyzés
            await this.db.query(`
                INSERT INTO steam_sync_log (
                    sync_type, status, games_processed, games_updated, 
                    games_added, sync_completed_at, duration_ms
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                'full_sync', 'success', processed, updated, added,
                new Date(), Date.now() - syncStartTime
            ]);

            console.log(`Teljes szinkronizáció befejezve: ${processed} feldolgozva, ${added} hozzáadva, ${updated} frissítve`);

        } catch (error) {
            console.error('Teljes szinkronizációs hiba:', error);
            
            await this.db.query(`
                INSERT INTO steam_sync_log (
                    sync_type, status, message, sync_completed_at, duration_ms, error_details
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                'full_sync', 'error', error.message,
                new Date(), Date.now() - syncStartTime,
                JSON.stringify({ stack: error.stack })
            ]);
        } finally {
            this.isRunning = false;
        }
    }

    async updateGameData(gameId, steamData) {
        await this.db.query(`
            UPDATE jatekok SET 
                nev = ?, leiras = ?, reszletes_leiras = ?, kepurl = ?, 
                background_url = ?, website = ?, megjelenes_datuma = ?, 
                ar = ?, penznem = ?, ertekeles = ?, steam_link = ?,
                steam_last_updated = NOW(),
                multiplayer = ?, co_op = ?, controller_support = ?,
                achievements = ?, vr_support = ?
            WHERE idjatekok = ?
        `, [
            steamData.nev, steamData.leiras, steamData.reszletes_leiras, 
            steamData.kepurl, steamData.background_url, steamData.website, 
            steamData.megjelenes_datuma, steamData.ar, steamData.penznem, 
            steamData.ertekeles, steamData.steam_link,
            steamData.multiplayer ? 1 : 0, steamData.co_op ? 1 : 0, 
            steamData.controller_support ? 1 : 0, steamData.achievements ? 1 : 0,
            steamData.vr_support ? 1 : 0, gameId
        ]);
    }

    async insertNewGame(steamData) {
        const result = await this.db.query(`
            INSERT INTO jatekok (
                nev, slug, leiras, reszletes_leiras, kepurl, background_url,
                website, megjelenes_datuma, ar, penznem, ertekeles, steam_link,
                steam_app_id, steam_last_updated, status, multiplayer, co_op,
                controller_support, achievements, vr_support
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            steamData.nev, steamData.nev.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            steamData.leiras, steamData.reszletes_leiras, steamData.kepurl,
            steamData.background_url, steamData.website, steamData.megjelenes_datuma,
            steamData.ar, steamData.penznem, steamData.ertekeles, steamData.steam_link,
            steamData.steam_app_id, new Date(), 'approved',
            steamData.multiplayer ? 1 : 0, steamData.co_op ? 1 : 0,
            steamData.controller_support ? 1 : 0, steamData.achievements ? 1 : 0,
            steamData.vr_support ? 1 : 0
        ]);

        return result.insertId;
    }

    // Kézi szinkronizáció indítása
    async manualSync(type = 'price_update') {
        switch (type) {
            case 'price_update':
                await this.updatePrices();
                break;
            case 'full_sync':
                await this.fullSync();
                break;
            case 'all_steam_games':
                await this.syncAllSteamGames();
                break;
            default:
                throw new Error(`Ismeretlen szinkronizációs típus: ${type}`);
        }
    }
}

module.exports = SteamSyncScheduler;
