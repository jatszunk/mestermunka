const axios = require('axios');
require('dotenv').config();

class SteamAPI {
    constructor() {
        this.apiKey = process.env.STEAM_API_KEY;
        this.storeBaseUrl = process.env.STEAM_API_BASE_URL || 'https://store.steampowered.com/api';
        this.communityBaseUrl = process.env.STEAM_COMMUNITY_BASE_URL || 'https://steamcommunity.com';
    }

    // Játék részleteinek lekérdezése Steam Store API-ról
    async getAppDetails(appId) {
        try {
            const response = await axios.get(`${this.storeBaseUrl}/appdetails`, {
                params: {
                    appids: appId,
                    l: 'hungarian' // Magyar nyelvű adatok
                }
            });

            const data = response.data[appId];
            if (data && data.success) {
                return this.formatGameData(data.data);
            }
            return null;
        } catch (error) {
            console.error(`Hiba a játék adatok lekérésekor (${appId}):`, error.message);
            return null;
        }
    }

    // Összes játék listájának lekérdezése
    async getAppList() {
        try {
            const response = await axios.get(`${this.storeBaseUrl}/GetAppList/v2/`);
            return response.data.applist.apps;
        } catch (error) {
            console.error('Hiba a játék lista lekérésekor:', error.message);
            return [];
        }
    }

    // Játék adatok formázása adatbázisnak
    formatGameData(steamData) {
        return {
            steam_app_id: steamData.steam_appid,
            nev: steamData.name,
            leiras: steamData.short_description,
            reszletes_leiras: steamData.detailed_description,
            kepurl: steamData.header_image,
            background_url: steamData.background,
            website: steamData.website,
            megjelenes_datuma: steamData.release_date ? steamData.release_date.date : null,
            fejlesztok: steamData.developers || [],
            kiadok: steamData.publishers || [],
            kategoriak: steamData.genres || [],
            platformok: this.extractPlatforms(steamData.platforms),
            ar: this.extractPrice(steamData.price_overview),
            penznem: steamData.price_overview ? steamData.price_overview.currency : 'HUF',
            ertekeles: this.extractRating(steamData.metacritic),
            kepek: steamData.screenshots || [],
            videok: steamData.movies || [],
            features: this.extractFeatures(steamData.categories),
            languages: this.extractLanguages(steamData.languages),
            steam_link: `https://store.steampowered.com/app/${steamData.steam_appid}`,
            multiplayer: this.hasMultiplayer(steamData.categories),
            co_op: this.hasCoOp(steamData.categories),
            controller_support: this.hasControllerSupport(steamData.categories),
            achievements: this.hasAchievements(steamData.categories),
            vr_support: this.hasVRSupport(steamData.categories)
        };
    }

    // Platformok kinyerése
    extractPlatforms(platforms) {
        if (!platforms) return [];
        return Object.keys(platforms).filter(platform => platforms[platform]);
    }

    // Ár kinyerése
    extractPrice(priceOverview) {
        if (!priceOverview) return null;
        return priceOverview.final / 100; // Átváltás fillérről forintra
    }

    // Értékelés kinyerése
    extractRating(metacritic) {
        return metacritic ? metacritic.score : null;
    }

    // Jellemzők kinyerése
    extractFeatures(categories) {
        if (!categories) return [];
        return categories.map(cat => cat.description);
    }

    // Nyelvek kinyerése
    extractLanguages(languages) {
        if (!languages) return [];
        return languages;
    }

    // Multiplayer támogatás ellenőrzése
    hasMultiplayer(categories) {
        if (!categories) return false;
        return categories.some(cat => 
            cat.description.toLowerCase().includes('multi-player') ||
            cat.description.toLowerCase().includes('multiplayer')
        );
    }

    // Co-op támogatás ellenőrzése
    hasCoOp(categories) {
        if (!categories) return false;
        return categories.some(cat => 
            cat.description.toLowerCase().includes('co-op') ||
            cat.description.toLowerCase().includes('coop')
        );
    }

    // Controller támogatás ellenőrzése
    hasControllerSupport(categories) {
        if (!categories) return false;
        return categories.some(cat => 
            cat.description.toLowerCase().includes('controller') ||
            cat.description.toLowerCase().includes('gamepad')
        );
    }

    // Achievements támogatás ellenőrzése
    hasAchievements(categories) {
        if (!categories) return false;
        return categories.some(cat => 
            cat.description.toLowerCase().includes('achievements')
        );
    }

    // VR támogatás ellenőrzése
    hasVRSupport(categories) {
        if (!categories) return false;
        return categories.some(cat => 
            cat.description.toLowerCase().includes('vr') ||
            cat.description.toLowerCase().includes('virtual reality')
        );
    }

    // Játékok keresése név alapján
    async searchGames(query, limit = 10) {
        try {
            const appList = await this.getAppList();
            const filtered = appList.filter(app => 
                app.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, limit);

            // Részletes adatok lekérése a talált játékokhoz
            const detailedGames = [];
            for (const app of filtered) {
                const details = await this.getAppDetails(app.appid);
                if (details) {
                    detailedGames.push(details);
                }
                // Kisebb késleltetés a rate limit elkerülésére
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return detailedGames;
        } catch (error) {
            console.error('Hiba a játék kereséskor:', error.message);
            return [];
        }
    }
}

module.exports = SteamAPI;
