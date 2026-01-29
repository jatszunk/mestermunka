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
  PRIMARY KEY (`idfelhasznalo`),
  UNIQUE KEY `uq_felhasznalo_felhasznalonev` (`felhasznalonev`)
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
  `ar` varchar(50) NOT NULL,
  `idrendszerkovetelmeny` int(11) DEFAULT NULL,
  `leiras` text DEFAULT NULL,
  `ertekeles` decimal(3,2) NOT NULL DEFAULT 0.00,
  `kepurl` varchar(500) DEFAULT NULL,

  `status` enum('approved','pending','rejected') NOT NULL DEFAULT 'approved',
  `uploaded_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,

  PRIMARY KEY (`idjatekok`),
  KEY `idx_jatekok_status` (`status`),
  KEY `idx_jatekok_idfejleszto` (`idfejleszto`),
  KEY `idx_jatekok_uploaded_by` (`uploaded_by`),
  KEY `idx_jatekok_approved_by` (`approved_by`),
  KEY `idx_jatekok_idrendszerkovetelmeny` (`idrendszerkovetelmeny`),
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
  PRIMARY KEY (`idkommentek`),
  KEY `idx_kommentek_idjatekok` (`idjatekok`),
  KEY `idx_kommentek_idfelhasznalo` (`idfelhasznalo`),
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
('Minimum: Windows 10, 4GB RAM, 2GB VRAM','Ajánlott: Windows 10, 8GB RAM, 4GB VRAM');

COMMIT;
