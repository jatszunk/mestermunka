-- Steam API integrációhoz szükséges adatbázis bővítések
-- Futtasd ezt a SQL fájlt a meglévő adatbázison

USE jatekhirdeto;

-- Steam specifikus mezők hozzáadása a jatekok táblához
ALTER TABLE jatekok 
ADD COLUMN steam_app_id INT NULL UNIQUE AFTER idjatekok,
ADD COLUMN steam_last_updated TIMESTAMP NULL DEFAULT NULL AFTER updated_at,
ADD COLUMN steam_is_free TINYINT(1) DEFAULT 0 AFTER ar,
ADD COLUMN steam_coming_soon TINYINT(1) DEFAULT 0 AFTER megjelenes_allapot,
ADD COLUMN steam_review_summary VARCHAR(100) NULL AFTER ertekelesek_szama,
ADD COLUMN steam_review_score INT NULL AFTER steam_review_summary,
ADD COLUMN steam_review_count INT NULL AFTER steam_review_score;

-- Index hozzáadása a Steam app ID-hoz
ALTER TABLE jatekok 
ADD INDEX idx_steam_app_id (steam_app_id),
ADD INDEX idx_steam_last_updated (steam_last_updated);

-- Steam szinkronizációs napló tábla
CREATE TABLE steam_sync_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sync_type ENUM('full_sync', 'single_game', 'search_sync', 'price_update') NOT NULL,
    steam_app_id INT NULL,
    status ENUM('success', 'error', 'partial') NOT NULL,
    message TEXT NULL,
    games_processed INT DEFAULT 0,
    games_updated INT DEFAULT 0,
    games_added INT DEFAULT 0,
    sync_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_completed_at TIMESTAMP NULL,
    duration_ms INT NULL,
    error_details JSON NULL
);

-- Steam platform adatok tábla
CREATE TABLE steam_platform_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steam_app_id INT NOT NULL UNIQUE,
    windows_support TINYINT(1) DEFAULT 0,
    mac_support TINYINT(1) DEFAULT 0,
    linux_support TINYINT(1) DEFAULT 0,
    controller_full_support TINYINT(1) DEFAULT 0,
    controller_partial_support TINYINT(1) DEFAULT 0,
    steam_cloud TINYINT(1) DEFAULT 0,
    steam_achievements TINYINT(1) DEFAULT 0,
    steam_leaderboards TINYINT(1) DEFAULT 0,
    steam_trading_cards TINYINT(1) DEFAULT 0,
    steam_workshop TINYINT(1) DEFAULT 0,
    steam_cloud_save TINYINT(1) DEFAULT 0,
    remote_play_together TINYINT(1) DEFAULT 0,
    remote_play_phone TINYINT(1) DEFAULT 0,
    remote_play_tablet TINYINT(1) DEFAULT 0,
    remote_play_tv TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (steam_app_id) REFERENCES jatekok(steam_app_id) ON DELETE CASCADE
);

-- Steam ár adatok tábla
CREATE TABLE steam_price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steam_app_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'HUF',
    discount_percent INT DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    is_free TINYINT(1) DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (steam_app_id) REFERENCES jatekok(steam_app_id) ON DELETE CASCADE,
    INDEX idx_steam_app_price (steam_app_id),
    INDEX idx_recorded_at (recorded_at)
);

-- Steam kategória tábla
CREATE TABLE steam_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steam_category_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Steam műfaj tábla
CREATE TABLE steam_genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    steam_genre_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Játék-Steam kategória kapcsolat tábla
CREATE TABLE jatekok_steam_categories (
    steam_app_id INT NOT NULL,
    steam_category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (steam_app_id, steam_category_id),
    FOREIGN KEY (steam_app_id) REFERENCES jatekok(steam_app_id) ON DELETE CASCADE,
    FOREIGN KEY (steam_category_id) REFERENCES steam_categories(steam_category_id) ON DELETE CASCADE
);

-- Játék-Steam műfaj kapcsolat tábla
CREATE TABLE jatekok_steam_genres (
    steam_app_id INT NOT NULL,
    steam_genre_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (steam_app_id, steam_genre_id),
    FOREIGN KEY (steam_app_id) REFERENCES jatekok(steam_app_id) ON DELETE CASCADE,
    FOREIGN KEY (steam_genre_id) REFERENCES steam_genres(steam_genre_id) ON DELETE CASCADE
);

-- Alap Steam kategóriák és műfajak beillesztése
INSERT INTO steam_categories (steam_category_id, name, description) VALUES
(1, 'Multi-player', 'Többjátékos mód'),
(2, 'Single-player', 'Egyjátékos mód'),
(9, 'Co-op', 'Kooperatív játék'),
(20, 'Steam Achievements', 'Steam teljesítmények'),
(22, 'Steam Cloud', 'Steam felhő mentés'),
(23, 'Steam Leaderboards', 'Steam ranglisták'),
(28, 'Full controller support', 'Teljes controller támogatás'),
(29, 'Steam Trading Cards', 'Steam gyűjtőkártyák'),
(30, 'Steam Workshop', 'Steam Workshop'),
(31, 'Steam Cloud Save', 'Steam felhő mentés'),
(35, 'Remote Play Together', 'Távoli játék együtt'),
(37, 'Remote Play on Phone', 'Távoli játék telefonon'),
(38, 'Remote Play on Tablet', 'Távoli játék tableten'),
(39, 'Remote Play on TV', 'Távoli játék TV-n'),
(41, 'Partial Controller Support', 'Részleges controller támogatás'),
(42, 'VR Support', 'VR támogatás');

INSERT INTO steam_genres (steam_genre_id, name, description) VALUES
(1, 'Action', 'Akció'),
(2, 'Strategy', 'Stratégia'),
(3, 'RPG', 'Szerepjáték'),
(4, 'Casual', 'Casual'),
(9, 'Racing', 'Verseny'),
(18, 'Sports', 'Sport'),
(23, 'Indie', 'Független'),
(25, 'Adventure', 'Kaland'),
(28, 'Simulation', 'Szimuláció'),
(29, 'Massively Multiplayer', 'MMO'),
(30, 'Free to Play', 'Ingyenes'),
(32, 'Early Access', 'Korai hozzáférés'),
(37, 'Violent', 'Erőszakos'),
(40, 'Nudity', 'Meztelenség'),
(41, 'Sexual Content', 'Szexuális tartalom'),
(42, 'Gore', 'Véres'),
(43, 'Documentary', 'Dokumentum'),
(44, 'Tutorial', 'Oktató'),
(45, 'Education', 'Oktatás');

COMMIT;
