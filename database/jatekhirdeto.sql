-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Jan 27. 13:08
-- Kiszolgáló verziója: 10.4.28-MariaDB
-- PHP verzió: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `jatekhirdeto`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `developer_stats`
--

CREATE TABLE `developer_stats` (
  `developerUsername` varchar(255) NOT NULL,
  `totalGames` int(11) DEFAULT 0,
  `approvedGames` int(11) DEFAULT 0,
  `pendingGames` int(11) DEFAULT 0,
  `rejectedGames` int(11) DEFAULT 0,
  `totalDownloads` int(11) DEFAULT 0,
  `totalRatings` int(11) DEFAULT 0,
  `averageRating` decimal(3,2) DEFAULT 0.00,
  `totalRevenue` decimal(15,2) DEFAULT 0.00,
  `lastGameUpload` timestamp NULL DEFAULT NULL,
  `lastActivity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `fejleszto`
--

CREATE TABLE `fejleszto` (
  `idfejleszto` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL,
  `weboldal` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalo`
--

CREATE TABLE `felhasznalo` (
  `idfelhasznalo` int(11) NOT NULL,
  `felhasznalonev` varchar(50) NOT NULL,
  `jelszo` varchar(255) NOT NULL,
  `nev` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `szerepkor` enum('felhasznalo','admin','gamedev') DEFAULT 'felhasznalo',
  `regisztracio_datum` timestamp NOT NULL DEFAULT current_timestamp(),
  `bio` text DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `favoriteGenres` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`favoriteGenres`)),
  `preferredPlatforms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferredPlatforms`)),
  `country` varchar(100) DEFAULT NULL,
  `birthYear` int(11) DEFAULT NULL,
  `discord` varchar(100) DEFAULT NULL,
  `twitter` varchar(100) DEFAULT NULL,
  `youtube` varchar(200) DEFAULT NULL,
  `twitch` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `felhasznalo`
--

INSERT INTO `felhasznalo` (`idfelhasznalo`, `felhasznalonev`, `jelszo`, `nev`, `email`, `szerepkor`, `regisztracio_datum`, `bio`, `avatar`, `favoriteGenres`, `preferredPlatforms`, `country`, `birthYear`, `discord`, `twitter`, `youtube`, `twitch`) VALUES
(1, 'testuser', '12345', NULL, 'test@test.com', 'felhasznalo', '2026-01-27 11:41:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'admin', 'admin', NULL, 'asd@gmail.com', 'admin', '2026-01-27 11:43:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'testuser2', '12345', NULL, 'test2@test.com', 'felhasznalo', '2026-01-27 11:50:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'testuser3', '12345', NULL, 'test3@test.com', 'felhasznalo', '2026-01-27 11:50:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'testuser4', '12345', NULL, 'test4@test.com', 'felhasznalo', '2026-01-27 12:04:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `games_extended`
--

CREATE TABLE `games_extended` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `developer` varchar(255) NOT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `releaseDate` date DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`categories`)),
  `platforms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`platforms`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `videos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`videos`)),
  `systemRequirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`systemRequirements`)),
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `languages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`languages`)),
  `ageRating` varchar(50) DEFAULT NULL,
  `multiplayer` tinyint(1) DEFAULT 0,
  `gameMode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gameMode`)),
  `estimatedPlaytime` varchar(100) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `socialLinks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`socialLinks`)),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `uploadDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewDate` timestamp NULL DEFAULT NULL,
  `reviewer` varchar(255) DEFAULT NULL,
  `rejectionReason` text DEFAULT NULL,
  `developer_username` varchar(255) NOT NULL,
  `downloads` int(11) DEFAULT 0,
  `averageRating` decimal(3,2) DEFAULT 0.00,
  `ratingCount` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eseményindítók `games_extended`
--
DELIMITER $$
CREATE TRIGGER `update_developer_stats_after_game_upload` AFTER INSERT ON `games_extended` FOR EACH ROW BEGIN
  INSERT INTO developer_stats (developerUsername, totalGames, lastGameUpload)
  VALUES (NEW.developer_username, 1, NEW.uploadDate)
  ON DUPLICATE KEY UPDATE
    totalGames = totalGames + 1,
    lastGameUpload = NEW.uploadDate;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_developer_stats_after_status_change` AFTER UPDATE ON `games_extended` FOR EACH ROW BEGIN
  IF OLD.status != NEW.status THEN
    UPDATE developer_stats 
    SET 
      approvedGames = (SELECT COUNT(*) FROM games_extended WHERE developer_username = NEW.developer_username AND status = 'approved'),
      pendingGames = (SELECT COUNT(*) FROM games_extended WHERE developer_username = NEW.developer_username AND status = 'pending'),
      rejectedGames = (SELECT COUNT(*) FROM games_extended WHERE developer_username = NEW.developer_username AND status = 'rejected'),
      lastActivity = CURRENT_TIMESTAMP
    WHERE developerUsername = NEW.developer_username;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_activity`
--

CREATE TABLE `game_activity` (
  `id` int(11) NOT NULL,
  `gameId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `activityType` enum('download','rating','comment','wishlist_add','collection_add') NOT NULL,
  `activityData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`activityData`)),
  `activityDate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_collection`
--

CREATE TABLE `game_collection` (
  `id` int(11) NOT NULL,
  `idfelhasznalo` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `status` enum('owned','played','completed','abandoned') NOT NULL DEFAULT 'owned',
  `rating` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_downloads`
--

CREATE TABLE `game_downloads` (
  `id` int(11) NOT NULL,
  `gameId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `downloadDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `ipAddress` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eseményindítók `game_downloads`
--
DELIMITER $$
CREATE TRIGGER `update_game_stats_after_download` AFTER INSERT ON `game_downloads` FOR EACH ROW BEGIN
  UPDATE game_stats 
  SET 
    totalDownloads = (SELECT COUNT(*) FROM game_downloads WHERE gameId = NEW.gameId),
    lastUpdated = CURRENT_TIMESTAMP
  WHERE gameId = NEW.gameId;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_moderation_history`
--

CREATE TABLE `game_moderation_history` (
  `id` int(11) NOT NULL,
  `gameId` int(11) NOT NULL,
  `moderatorUsername` varchar(255) NOT NULL,
  `actionType` enum('approved','rejected','suspended','deleted','edited') NOT NULL,
  `previousStatus` varchar(50) DEFAULT NULL,
  `newStatus` varchar(50) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `actionData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`actionData`)),
  `actionDate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_ratings`
--

CREATE TABLE `game_ratings` (
  `id` int(11) NOT NULL,
  `gameId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `rating` decimal(3,2) NOT NULL CHECK (`rating` >= 0 and `rating` <= 10),
  `comment` text DEFAULT NULL,
  `reviewDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `helpfulCount` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eseményindítók `game_ratings`
--
DELIMITER $$
CREATE TRIGGER `update_game_stats_after_rating` AFTER INSERT ON `game_ratings` FOR EACH ROW BEGIN
  UPDATE game_stats 
  SET 
    totalRatings = (SELECT COUNT(*) FROM game_ratings WHERE gameId = NEW.gameId),
    averageRating = (SELECT AVG(rating) FROM game_ratings WHERE gameId = NEW.gameId),
    lastUpdated = CURRENT_TIMESTAMP
  WHERE gameId = NEW.gameId;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_recommendations`
--

CREATE TABLE `game_recommendations` (
  `id` int(11) NOT NULL,
  `gameId` int(11) NOT NULL,
  `recommendedGameId` int(11) NOT NULL,
  `recommendationType` enum('similar','popular','new','trending') DEFAULT 'similar',
  `score` decimal(3,2) DEFAULT 0.00,
  `algorithm` varchar(100) DEFAULT NULL,
  `createdDate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_reports`
--

CREATE TABLE `game_reports` (
  `id` int(11) NOT NULL,
  `gameId` int(11) NOT NULL,
  `reporterUsername` varchar(255) NOT NULL,
  `reportType` enum('inappropriate_content','copyright_violation','malware','spam','other') NOT NULL,
  `reportReason` text NOT NULL,
  `status` enum('pending','under_review','resolved','dismissed') DEFAULT 'pending',
  `moderatorUsername` varchar(255) DEFAULT NULL,
  `moderatorNotes` text DEFAULT NULL,
  `createdDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolvedDate` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_stats`
--

CREATE TABLE `game_stats` (
  `gameId` int(11) NOT NULL,
  `totalDownloads` int(11) DEFAULT 0,
  `totalRatings` int(11) DEFAULT 0,
  `averageRating` decimal(3,2) DEFAULT 0.00,
  `totalWishlist` int(11) DEFAULT 0,
  `totalCollection` int(11) DEFAULT 0,
  `lastUpdated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_tags`
--

CREATE TABLE `game_tags` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(7) DEFAULT '#27e8ff',
  `usageCount` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `game_tags`
--

INSERT INTO `game_tags` (`id`, `name`, `description`, `color`, `usageCount`) VALUES
(1, 'Action', 'Akció játékok', '#ff6b6b', 0),
(2, 'Adventure', 'Kaland játékok', '#4ecdc4', 0),
(3, 'RPG', 'Szerepjátékok', '#f9ca24', 0),
(4, 'Strategy', 'Stratégiai játékok', '#5f27cd', 0),
(5, 'Sports', 'Sport játékok', '#00d2d3', 0),
(6, 'Racing', 'Verseny játékok', '#ee5a24', 0),
(7, 'Horror', 'Horrort játékok', '#8b008b', 0),
(8, 'Puzzle', 'Logikai játékok', '#2c3e50', 0),
(9, 'Platformer', 'Platform ugrós játékok', '#e67e22', 0),
(10, 'Shooter', 'Lövöldözős játékok', '#e74c3c', 0),
(11, 'MMO', 'Többjátékos online játékok', '#9b59b6', 0),
(12, 'Simulation', 'Szimulátor játékok', '#34495e', 0),
(13, 'Indie', 'Független fejlesztésű játékok', '#95a5a6', 0),
(14, 'Co-op', 'Kooperatív játékok', '#16a085', 0),
(15, 'Multiplayer', 'Többjátékos', '#2980b9', 0),
(16, 'Single Player', 'Egyjátékos', '#27ae60', 0),
(17, 'VR', 'Virtuális valóság', '#8e44ad', 0),
(18, 'Free to Play', 'Ingyenes játékok', '#27ae60', 0),
(19, 'Early Access', 'Korai hozzáférés', '#f39c12', 0),
(20, 'Cross-platform', 'Keresztplatformos', '#3498db', 0),
(21, 'Retro', 'Retro stílusú', '#95a5a6', 0),
(22, 'Casual', 'Könnyedű játékok', '#1abc9c', 0),
(23, 'Hardcore', 'Kemény mag játékok', '#e74c3c', 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `game_tag_relations`
--

CREATE TABLE `game_tag_relations` (
  `gameId` int(11) NOT NULL,
  `tagId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok`
--

CREATE TABLE `jatekok` (
  `idjatekok` int(11) NOT NULL,
  `nev` varchar(255) NOT NULL,
  `leiras` text DEFAULT NULL,
  `kepurl` varchar(500) DEFAULT NULL,
  `ar` int(11) DEFAULT 0,
  `idfejleszto` int(11) NOT NULL,
  `idkiado` int(11) DEFAULT NULL,
  `megjelenesi_datum` date DEFAULT NULL,
  `status` enum('approved','pending','rejected') DEFAULT 'approved',
  `uploaded_by` int(11) DEFAULT NULL,
  `ertekeles` decimal(3,2) DEFAULT 0.00,
  `idrendszerkovetelmeny` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok_kategoriak`
--

CREATE TABLE `jatekok_kategoriak` (
  `idjatekok` int(11) NOT NULL,
  `idkategoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok_platformok`
--

CREATE TABLE `jatekok_platformok` (
  `idjatekok` int(11) NOT NULL,
  `idplatform` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kategoria`
--

CREATE TABLE `kategoria` (
  `idkategoria` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `kategoria`
--

INSERT INTO `kategoria` (`idkategoria`, `nev`) VALUES
(1, 'Akció'),
(2, 'Kaland'),
(3, 'Stratégia'),
(4, 'RPG'),
(5, 'Sport'),
(6, 'Akció'),
(7, 'Kaland'),
(8, 'Stratégia'),
(9, 'RPG'),
(10, 'Sport'),
(11, 'Akció'),
(12, 'Kaland'),
(13, 'Stratégia'),
(14, 'RPG'),
(15, 'Sport'),
(16, 'Akció'),
(17, 'Kaland'),
(18, 'Stratégia'),
(19, 'RPG'),
(20, 'Sport'),
(21, 'Akció'),
(22, 'Kaland'),
(23, 'Stratégia'),
(24, 'RPG'),
(25, 'Sport'),
(26, 'Akció'),
(27, 'Kaland'),
(28, 'Stratégia'),
(29, 'RPG'),
(30, 'Sport'),
(31, 'Akció'),
(32, 'Kaland'),
(33, 'Stratégia'),
(34, 'RPG'),
(35, 'Sport'),
(36, 'Akció'),
(37, 'Kaland'),
(38, 'Stratégia'),
(39, 'RPG'),
(40, 'Sport'),
(41, 'Akció'),
(42, 'Kaland'),
(43, 'Stratégia'),
(44, 'RPG'),
(45, 'Sport'),
(46, 'Akció'),
(47, 'Kaland'),
(48, 'Stratégia'),
(49, 'RPG'),
(50, 'Sport');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kiado`
--

CREATE TABLE `kiado` (
  `idkiado` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL,
  `weboldal` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kommentek`
--

CREATE TABLE `kommentek` (
  `idkommentek` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `idfelhasznalo` int(11) NOT NULL,
  `tartalom` text NOT NULL,
  `ertekeles` decimal(3,2) DEFAULT NULL,
  `datum` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `platform`
--

CREATE TABLE `platform` (
  `idplatform` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `platform`
--

INSERT INTO `platform` (`idplatform`, `nev`) VALUES
(1, 'PC'),
(2, 'PlayStation'),
(3, 'Xbox'),
(4, 'Nintendo'),
(5, 'PC'),
(6, 'PlayStation'),
(7, 'Xbox'),
(8, 'Nintendo'),
(9, 'PC'),
(10, 'PlayStation'),
(11, 'Xbox'),
(12, 'Nintendo'),
(13, 'PC'),
(14, 'PlayStation'),
(15, 'Xbox'),
(16, 'Nintendo'),
(17, 'PC'),
(18, 'PlayStation'),
(19, 'Xbox'),
(20, 'Nintendo'),
(21, 'PC'),
(22, 'PlayStation'),
(23, 'Xbox'),
(24, 'Nintendo'),
(25, 'PC'),
(26, 'PlayStation'),
(27, 'Xbox'),
(28, 'Nintendo'),
(29, 'PC'),
(30, 'PlayStation'),
(31, 'Xbox'),
(32, 'Nintendo'),
(33, 'PC'),
(34, 'PlayStation'),
(35, 'Xbox'),
(36, 'Nintendo'),
(37, 'PC'),
(38, 'PlayStation'),
(39, 'Xbox'),
(40, 'Nintendo'),
(41, 'PC'),
(42, 'PlayStation'),
(43, 'Xbox'),
(44, 'Nintendo');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `rendszerkovetelmeny`
--

CREATE TABLE `rendszerkovetelmeny` (
  `idrendszerkovetelmeny` int(11) NOT NULL,
  `minimum` varchar(255) DEFAULT NULL,
  `ajanlott` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `rendszerkovetelmeny`
--

INSERT INTO `rendszerkovetelmeny` (`idrendszerkovetelmeny`, `minimum`, `ajanlott`) VALUES
(1, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(2, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(3, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(4, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(5, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(6, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(7, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(8, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(9, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(10, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(11, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `idfelhasznalo` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `developer_stats`
--
ALTER TABLE `developer_stats`
  ADD PRIMARY KEY (`developerUsername`);

--
-- A tábla indexei `fejleszto`
--
ALTER TABLE `fejleszto`
  ADD PRIMARY KEY (`idfejleszto`);

--
-- A tábla indexei `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD PRIMARY KEY (`idfelhasznalo`),
  ADD UNIQUE KEY `felhasznalonev` (`felhasznalonev`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `games_extended`
--
ALTER TABLE `games_extended`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_developer` (`developer_username`),
  ADD KEY `idx_releaseDate` (`releaseDate`),
  ADD KEY `idx_price` (`price`),
  ADD KEY `idx_rating` (`averageRating`),
  ADD KEY `idx_games_extended_status` (`status`),
  ADD KEY `idx_games_extended_developer` (`developer_username`),
  ADD KEY `idx_games_extended_release_date` (`releaseDate`),
  ADD KEY `idx_games_extended_price` (`price`),
  ADD KEY `idx_games_extended_rating` (`averageRating`);

--
-- A tábla indexei `game_activity`
--
ALTER TABLE `game_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_game_activity_game_id` (`gameId`),
  ADD KEY `idx_game_activity_username` (`username`),
  ADD KEY `idx_game_activity_type` (`activityType`),
  ADD KEY `idx_game_activity_date` (`activityDate`);

--
-- A tábla indexei `game_collection`
--
ALTER TABLE `game_collection`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_game_collection` (`idfelhasznalo`,`idjatekok`),
  ADD KEY `idfelhasznalo_collection` (`idfelhasznalo`),
  ADD KEY `idjatekok_collection` (`idjatekok`),
  ADD KEY `status_collection` (`status`);

--
-- A tábla indexei `game_downloads`
--
ALTER TABLE `game_downloads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`),
  ADD KEY `idx_game_downloads_game_id` (`gameId`),
  ADD KEY `idx_game_downloads_date` (`downloadDate`);

--
-- A tábla indexei `game_moderation_history`
--
ALTER TABLE `game_moderation_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gameId` (`gameId`),
  ADD KEY `moderatorUsername` (`moderatorUsername`);

--
-- A tábla indexei `game_ratings`
--
ALTER TABLE `game_ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_game_rating` (`gameId`,`username`),
  ADD KEY `idx_game_ratings_game_id` (`gameId`),
  ADD KEY `idx_game_ratings_username` (`username`),
  ADD KEY `idx_game_ratings_rating` (`rating`);

--
-- A tábla indexei `game_recommendations`
--
ALTER TABLE `game_recommendations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_recommendation` (`gameId`,`recommendedGameId`,`recommendationType`),
  ADD KEY `recommendedGameId` (`recommendedGameId`);

--
-- A tábla indexei `game_reports`
--
ALTER TABLE `game_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gameId` (`gameId`),
  ADD KEY `reporterUsername` (`reporterUsername`),
  ADD KEY `moderatorUsername` (`moderatorUsername`);

--
-- A tábla indexei `game_stats`
--
ALTER TABLE `game_stats`
  ADD PRIMARY KEY (`gameId`);

--
-- A tábla indexei `game_tags`
--
ALTER TABLE `game_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- A tábla indexei `game_tag_relations`
--
ALTER TABLE `game_tag_relations`
  ADD PRIMARY KEY (`gameId`,`tagId`),
  ADD KEY `tagId` (`tagId`);

--
-- A tábla indexei `jatekok`
--
ALTER TABLE `jatekok`
  ADD PRIMARY KEY (`idjatekok`),
  ADD KEY `idfejleszto` (`idfejleszto`),
  ADD KEY `idkiado` (`idkiado`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idrendszerkovetelmeny` (`idrendszerkovetelmeny`);

--
-- A tábla indexei `jatekok_kategoriak`
--
ALTER TABLE `jatekok_kategoriak`
  ADD PRIMARY KEY (`idjatekok`,`idkategoria`),
  ADD KEY `idkategoria` (`idkategoria`);

--
-- A tábla indexei `jatekok_platformok`
--
ALTER TABLE `jatekok_platformok`
  ADD PRIMARY KEY (`idjatekok`,`idplatform`),
  ADD KEY `idplatform` (`idplatform`);

--
-- A tábla indexei `kategoria`
--
ALTER TABLE `kategoria`
  ADD PRIMARY KEY (`idkategoria`);

--
-- A tábla indexei `kiado`
--
ALTER TABLE `kiado`
  ADD PRIMARY KEY (`idkiado`);

--
-- A tábla indexei `kommentek`
--
ALTER TABLE `kommentek`
  ADD PRIMARY KEY (`idkommentek`),
  ADD KEY `idjatekok` (`idjatekok`),
  ADD KEY `idfelhasznalo` (`idfelhasznalo`);

--
-- A tábla indexei `platform`
--
ALTER TABLE `platform`
  ADD PRIMARY KEY (`idplatform`);

--
-- A tábla indexei `rendszerkovetelmeny`
--
ALTER TABLE `rendszerkovetelmeny`
  ADD PRIMARY KEY (`idrendszerkovetelmeny`);

--
-- A tábla indexei `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_game_wishlist` (`idfelhasznalo`,`idjatekok`),
  ADD KEY `idfelhasznalo_wishlist` (`idfelhasznalo`),
  ADD KEY `idjatekok_wishlist` (`idjatekok`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `fejleszto`
--
ALTER TABLE `fejleszto`
  MODIFY `idfejleszto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `felhasznalo`
--
ALTER TABLE `felhasznalo`
  MODIFY `idfelhasznalo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `games_extended`
--
ALTER TABLE `games_extended`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `game_activity`
--
ALTER TABLE `game_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `game_collection`
--
ALTER TABLE `game_collection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `game_downloads`
--
ALTER TABLE `game_downloads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `game_moderation_history`
--
ALTER TABLE `game_moderation_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `game_ratings`
--
ALTER TABLE `game_ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `game_recommendations`
--
ALTER TABLE `game_recommendations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `game_reports`
--
ALTER TABLE `game_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `game_tags`
--
ALTER TABLE `game_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT a táblához `jatekok`
--
ALTER TABLE `jatekok`
  MODIFY `idjatekok` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kategoria`
--
ALTER TABLE `kategoria`
  MODIFY `idkategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT a táblához `kiado`
--
ALTER TABLE `kiado`
  MODIFY `idkiado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kommentek`
--
ALTER TABLE `kommentek`
  MODIFY `idkommentek` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `platform`
--
ALTER TABLE `platform`
  MODIFY `idplatform` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT a táblához `rendszerkovetelmeny`
--
ALTER TABLE `rendszerkovetelmeny`
  MODIFY `idrendszerkovetelmeny` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `developer_stats`
--
ALTER TABLE `developer_stats`
  ADD CONSTRAINT `developer_stats_ibfk_1` FOREIGN KEY (`developerUsername`) REFERENCES `felhasznalo` (`felhasznalonev`);

--
-- Megkötések a táblához `games_extended`
--
ALTER TABLE `games_extended`
  ADD CONSTRAINT `games_extended_ibfk_1` FOREIGN KEY (`developer_username`) REFERENCES `felhasznalo` (`felhasznalonev`);

--
-- Megkötések a táblához `game_activity`
--
ALTER TABLE `game_activity`
  ADD CONSTRAINT `game_activity_ibfk_1` FOREIGN KEY (`gameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_activity_ibfk_2` FOREIGN KEY (`username`) REFERENCES `felhasznalo` (`felhasznalonev`);

--
-- Megkötések a táblához `game_collection`
--
ALTER TABLE `game_collection`
  ADD CONSTRAINT `fk_collection_game` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_collection_user` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE;

--
-- Megkötések a táblához `game_downloads`
--
ALTER TABLE `game_downloads`
  ADD CONSTRAINT `game_downloads_ibfk_1` FOREIGN KEY (`gameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_downloads_ibfk_2` FOREIGN KEY (`username`) REFERENCES `felhasznalo` (`felhasznalonev`);

--
-- Megkötések a táblához `game_moderation_history`
--
ALTER TABLE `game_moderation_history`
  ADD CONSTRAINT `game_moderation_history_ibfk_1` FOREIGN KEY (`gameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_moderation_history_ibfk_2` FOREIGN KEY (`moderatorUsername`) REFERENCES `felhasznalo` (`felhasznalonev`);

--
-- Megkötések a táblához `game_ratings`
--
ALTER TABLE `game_ratings`
  ADD CONSTRAINT `game_ratings_ibfk_1` FOREIGN KEY (`gameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_ratings_ibfk_2` FOREIGN KEY (`username`) REFERENCES `felhasznalo` (`felhasznalonev`);

--
-- Megkötések a táblához `game_recommendations`
--
ALTER TABLE `game_recommendations`
  ADD CONSTRAINT `game_recommendations_ibfk_1` FOREIGN KEY (`gameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_recommendations_ibfk_2` FOREIGN KEY (`recommendedGameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `game_reports`
--
ALTER TABLE `game_reports`
  ADD CONSTRAINT `game_reports_ibfk_1` FOREIGN KEY (`gameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_reports_ibfk_2` FOREIGN KEY (`reporterUsername`) REFERENCES `felhasznalo` (`felhasznalonev`),
  ADD CONSTRAINT `game_reports_ibfk_3` FOREIGN KEY (`moderatorUsername`) REFERENCES `felhasznalo` (`felhasznalonev`);

--
-- Megkötések a táblához `game_stats`
--
ALTER TABLE `game_stats`
  ADD CONSTRAINT `game_stats_ibfk_1` FOREIGN KEY (`gameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `game_tag_relations`
--
ALTER TABLE `game_tag_relations`
  ADD CONSTRAINT `game_tag_relations_ibfk_1` FOREIGN KEY (`gameId`) REFERENCES `games_extended` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_tag_relations_ibfk_2` FOREIGN KEY (`tagId`) REFERENCES `game_tags` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatekok`
--
ALTER TABLE `jatekok`
  ADD CONSTRAINT `jatekok_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_10` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_11` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_12` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_13` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_14` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_15` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_16` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_17` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_18` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_19` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_20` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_21` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_22` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_23` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_24` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_25` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_26` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_27` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_28` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_29` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_30` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_31` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_32` FOREIGN KEY (`idrendszerkovetelmeny`) REFERENCES `rendszerkovetelmeny` (`idrendszerkovetelmeny`),
  ADD CONSTRAINT `jatekok_ibfk_33` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_34` FOREIGN KEY (`idrendszerkovetelmeny`) REFERENCES `rendszerkovetelmeny` (`idrendszerkovetelmeny`),
  ADD CONSTRAINT `jatekok_ibfk_35` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_36` FOREIGN KEY (`idrendszerkovetelmeny`) REFERENCES `rendszerkovetelmeny` (`idrendszerkovetelmeny`),
  ADD CONSTRAINT `jatekok_ibfk_4` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_5` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_6` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_7` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_8` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`),
  ADD CONSTRAINT `jatekok_ibfk_9` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`);

--
-- Megkötések a táblához `jatekok_kategoriak`
--
ALTER TABLE `jatekok_kategoriak`
  ADD CONSTRAINT `fk_jatek_kategoria` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_kategoria_jatek` FOREIGN KEY (`idkategoria`) REFERENCES `kategoria` (`idkategoria`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatekok_platformok`
--
ALTER TABLE `jatekok_platformok`
  ADD CONSTRAINT `fk_jatek_platform` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_platform_jatek` FOREIGN KEY (`idplatform`) REFERENCES `platform` (`idplatform`) ON DELETE CASCADE;

--
-- Megkötések a táblához `kommentek`
--
ALTER TABLE `kommentek`
  ADD CONSTRAINT `fk_komment_felhasznalo` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_komment_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE;

--
-- Megkötések a táblához `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `fk_wishlist_game` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
