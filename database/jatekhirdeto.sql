-- Minimal schema for the project (only tables actually used by the app)
-- Target: MariaDB/MySQL
-- IMPORTANT: This script is DESTRUCTIVE for the target database.
-- If you want to keep your current DB, import into a new DB name and update backend/server.js accordingly.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP DATABASE IF EXISTS `jatekhirdeto`;
CREATE DATABASE `jatekhirdeto` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `jatekhirdeto`;

-- ===== USERS =====
CREATE TABLE `felhasznalo` (
  `idfelhasznalo` int(11) NOT NULL AUTO_INCREMENT,
  `felhasznalonev` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `jelszo` varchar(255) NOT NULL,
  `szerepkor` enum('felhasznalo','admin','gamedev') NOT NULL DEFAULT 'felhasznalo',
  `regisztracio_datum` timestamp NOT NULL DEFAULT current_timestamp(),
  `nev` varchar(100) DEFAULT NULL,
  `aktiv` tinyint(1) NOT NULL DEFAULT 1,
  `utolso_belepes` timestamp NULL DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `favoriteGenres` json DEFAULT NULL,
  `preferredPlatforms` json DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `birthYear` int(11) DEFAULT NULL,
  `discord` varchar(100) DEFAULT NULL,
  `twitter` varchar(100) DEFAULT NULL,
  `youtube` varchar(200) DEFAULT NULL,
  `twitch` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idfelhasznalo`),
  UNIQUE KEY `uq_felhasznalo_felhasznalonev` (`felhasznalonev`),
  KEY `idx_felhasznalo_szerepkor` (`szerepkor`),
  KEY `idx_felhasznalo_aktiv` (`aktiv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===== DEVELOPERS =====
CREATE TABLE `fejleszto` (
  `idfejleszto` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  PRIMARY KEY (`idfejleszto`),
  UNIQUE KEY `uq_fejleszto_nev` (`nev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===== SYSTEM REQUIREMENTS =====
CREATE TABLE `rendszerkovetelmeny` (
  `idrendszerkovetelmeny` int(11) NOT NULL AUTO_INCREMENT,
  `minimum` varchar(255) DEFAULT NULL,
  `ajanlott` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idrendszerkovetelmeny`),
  UNIQUE KEY `uq_rendszerkovetelmeny_min_rec` (`minimum`,`ajanlott`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===== CATEGORIES / PLATFORMS =====
CREATE TABLE `kategoria` (
  `idkategoria` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  PRIMARY KEY (`idkategoria`),
  UNIQUE KEY `uq_kategoria_nev` (`nev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `platform` (
  `idplatform` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  PRIMARY KEY (`idplatform`),
  UNIQUE KEY `uq_platform_nev` (`nev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===== GAMES =====
CREATE TABLE `jatekok` (
  `idjatekok` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(255) NOT NULL,
  `idfejleszto` int(11) NOT NULL,
  `ar` decimal(10,2) NOT NULL DEFAULT 0.00,
  `idrendszerkovetelmeny` int(11) DEFAULT NULL,
  `leiras` text DEFAULT NULL,
  `ertekeles` decimal(3,2) NOT NULL DEFAULT 0.00,
  `kepurl` varchar(500) DEFAULT NULL,
  `status` enum('approved','pending','rejected') NOT NULL DEFAULT 'approved',
  `uploaded_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`idjatekok`),
  KEY `idx_jatekok_status` (`status`),
  KEY `idx_jatekok_idfejleszto` (`idfejleszto`),
  KEY `idx_jatekok_uploaded_by` (`uploaded_by`),
  KEY `idx_jatekok_approved_by` (`approved_by`),
  KEY `idx_jatekok_idrendszerkovetelmeny` (`idrendszerkovetelmeny`),
  KEY `idx_jatekok_ertekeles` (`ertekeles`),
  KEY `idx_jatekok_created_at` (`created_at`),
  CONSTRAINT `fk_jatekok_fejleszto` FOREIGN KEY (`idfejleszto`) REFERENCES `fejleszto` (`idfejleszto`) ON DELETE RESTRICT,
  CONSTRAINT `fk_jatekok_rendszerkovetelmeny` FOREIGN KEY (`idrendszerkovetelmeny`) REFERENCES `rendszerkovetelmeny` (`idrendszerkovetelmeny`) ON DELETE SET NULL,
  CONSTRAINT `fk_jatekok_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE SET NULL,
  CONSTRAINT `fk_jatekok_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `jatekok_kategoriak` (
  `idjatekok` int(11) NOT NULL,
  `idkategoria` int(11) NOT NULL,
  PRIMARY KEY (`idjatekok`,`idkategoria`),
  KEY `idx_jk_idkategoria` (`idkategoria`),
  CONSTRAINT `fk_jk_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  CONSTRAINT `fk_jk_kategoria` FOREIGN KEY (`idkategoria`) REFERENCES `kategoria` (`idkategoria`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `jatekok_platformok` (
  `idjatekok` int(11) NOT NULL,
  `idplatform` int(11) NOT NULL,
  PRIMARY KEY (`idjatekok`,`idplatform`),
  KEY `idx_jp_idplatform` (`idplatform`),
  CONSTRAINT `fk_jp_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  CONSTRAINT `fk_jp_platform` FOREIGN KEY (`idplatform`) REFERENCES `platform` (`idplatform`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===== GAME EXTRA + VIDEOS =====
CREATE TABLE `jatekextra` (
  `idjatekok` int(11) NOT NULL,
  `megjelenes` varchar(100) NOT NULL,
  `steam_link` varchar(500) NOT NULL,
  `jatek_elmeny` varchar(255) DEFAULT NULL,
  `reszletes_leiras` text NOT NULL,
  PRIMARY KEY (`idjatekok`),
  CONSTRAINT `fk_jatekextra_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `jatek_videok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idjatekok` int(11) NOT NULL,
  `url` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jatek_videok_idjatekok` (`idjatekok`),
  CONSTRAINT `fk_jatek_videok_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===== COMMENTS =====
CREATE TABLE `kommentek` (
  `idkommentek` int(11) NOT NULL AUTO_INCREMENT,
  `idjatekok` int(11) NOT NULL,
  `idfelhasznalo` int(11) NOT NULL,
  `tartalom` text NOT NULL,
  `ertekeles` decimal(3,2) DEFAULT NULL,
  `datum` timestamp NOT NULL DEFAULT current_timestamp(),
  `modositva` timestamp NULL DEFAULT NULL,
  `status` enum('active','hidden','deleted') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`idkommentek`),
  KEY `idx_kommentek_idjatekok` (`idjatekok`),
  KEY `idx_kommentek_idfelhasznalo` (`idfelhasznalo`),
  KEY `idx_kommentek_status` (`status`),
  KEY `idx_kommentek_datum` (`datum`),
  CONSTRAINT `fk_kommentek_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  CONSTRAINT `fk_kommentek_user` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===== WISHLIST + COLLECTION (used by endpoints) =====
CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idfelhasznalo` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_game_wishlist` (`idfelhasznalo`,`idjatekok`),
  KEY `idfelhasznalo_wishlist` (`idfelhasznalo`),
  KEY `idjatekok_wishlist` (`idjatekok`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_game` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `game_collection` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idfelhasznalo` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `status` enum('owned','played','completed','abandoned') NOT NULL DEFAULT 'owned',
  `rating` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_game_collection` (`idfelhasznalo`,`idjatekok`),
  KEY `idfelhasznalo_collection` (`idfelhasznalo`),
  KEY `idjatekok_collection` (`idjatekok`),
  KEY `status_collection` (`status`),
  CONSTRAINT `fk_collection_user` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE,
  CONSTRAINT `fk_collection_game` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed basic data
INSERT INTO felhasznalo (felhasznalonev,email,jelszo,szerepkor,nev) VALUES
('admin','admin@example.com','admin','admin','Admin')
ON DUPLICATE KEY UPDATE felhasznalonev = VALUES(felhasznalonev);

INSERT IGNORE INTO `kategoria` (`nev`) VALUES
('Akció'),('Kaland'),('Stratégia'),('RPG'),('Sport');

INSERT IGNORE INTO `platform` (`nev`) VALUES
('PC'),('PlayStation'),('Xbox'),('Nintendo');

INSERT IGNORE INTO `rendszerkovetelmeny` (`minimum`,`ajanlott`) VALUES
('Minimum: Windows 10, 4GB RAM, 2GB VRAM','Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
('Minimum: Windows 7, 2GB RAM, 1GB VRAM','Ajánlott: Windows 10, 4GB RAM, 2GB VRAM'),
('Minimum: macOS 10.12, 4GB RAM','Ajánlott: macOS 11.0, 8GB RAM');

-- ===== STORED PROCEDURES =====

-- Játék átlagos értékelésének frissítése
DELIMITER //
CREATE PROCEDURE UpdateGameRating(IN game_id INT)
BEGIN
    DECLARE avg_rating DECIMAL(3,2) DEFAULT 0.00;
    
    SELECT COALESCE(AVG(ertekeles), 0.00) INTO avg_rating
    FROM kommentek 
    WHERE idjatekok = game_id AND status = 'active' AND ertekeles IS NOT NULL;
    
    UPDATE jatekok 
    SET ertekeles = avg_rating, updated_at = CURRENT_TIMESTAMP
    WHERE idjatekok = game_id;
END //
DELIMITER ;

-- Felhasználói statisztikák lekérdezése
DELIMITER //
CREATE PROCEDURE GetUserStatistics(IN user_id INT)
BEGIN
    SELECT 
        f.felhasznalonev,
        f.szerepkor,
        f.regisztracio_datum,
        f.utolso_belepes,
        COUNT(DISTINCT k.idkommentek) as kommentek_szama,
        COALESCE(AVG(k.ertekeles), 0) as atlagos_ertekeles,
        COUNT(DISTINCT CASE WHEN gc.status = 'completed' THEN gc.idjatekok END) as befejezett_jatekok,
        COUNT(DISTINCT w.idjatekok) as wishlist_jatekok
    FROM felhasznalo f
    LEFT JOIN kommentek k ON f.idfelhasznalo = k.idfelhasznalo AND k.status = 'active'
    LEFT JOIN game_collection gc ON f.idfelhasznalo = gc.idfelhasznalo
    LEFT JOIN wishlist w ON f.idfelhasznalo = w.idfelhasznalo
    WHERE f.idfelhasznalo = user_id
    GROUP BY f.idfelhasznalo;
END //
DELIMITER ;

-- ===== TRIGGERS =====

-- Komment hozzáadásakor frissíti a játék értékelését
DELIMITER //
CREATE TRIGGER after_comment_insert
AFTER INSERT ON kommentek
FOR EACH ROW
BEGIN
    CALL UpdateGameRating(NEW.idjatekok);
END //
DELIMITER ;

-- Komment módosításakor frissíti a játék értékelését
DELIMITER //
CREATE TRIGGER after_comment_update
AFTER UPDATE ON kommentek
FOR EACH ROW
BEGIN
    IF NEW.ertekeles != OLD.ertekeles OR NEW.status != OLD.status THEN
        CALL UpdateGameRating(NEW.idjatekok);
    END IF;
END //
DELIMITER ;

-- Komment törlésekor frissíti a játék értékelését
DELIMITER //
CREATE TRIGGER after_comment_delete
AFTER DELETE ON kommentek
FOR EACH ROW
BEGIN
    CALL UpdateGameRating(OLD.idjatekok);
END //
DELIMITER ;

-- Felhasználó bejelentkezésének időpontját frissíti
DELIMITER //
CREATE TRIGGER update_user_login
AFTER UPDATE ON felhasznalo
FOR EACH ROW
BEGIN
    IF NEW.utolso_belepes != OLD.utolso_belepes THEN
        UPDATE felhasznalo 
        SET utolso_belepes = CURRENT_TIMESTAMP 
        WHERE idfelhasznalo = NEW.idfelhasznalo;
    END IF;
END //
DELIMITER ;

-- Játék státusz változásakor logolja az eseményt
DELIMITER //
CREATE TRIGGER log_game_status_change
AFTER UPDATE ON jatekok
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO jatekok (nev, idfejleszto, ar, status, leiras)
        VALUES (
            CONCAT('LOG: ', OLD.nev, ' status changed from ', OLD.status, ' to ', NEW.status),
            1, 0.00, 'approved', 
            CONCAT('Status changed at: ', CURRENT_TIMESTAMP)
        );
    END IF;
END //
DELIMITER ;

COMMIT;
