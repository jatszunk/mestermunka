-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Jan 21. 13:19
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
-- Tábla szerkezet ehhez a táblához `fejleszto`
--

CREATE TABLE `fejleszto` (
  `idfejleszto` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `twitter` varchar(50) DEFAULT NULL,
  `facebook` varchar(100) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `discord` varchar(100) DEFAULT NULL,
  `steam_developer` varchar(100) DEFAULT NULL,
  `epic_games` varchar(100) DEFAULT NULL,
  `founded_year` int(4) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_indie` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idfejleszto`),
  KEY `idx_nev` (`nev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `fejleszto`
--

INSERT INTO `fejleszto` (`idfejleszto`, `nev`) VALUES
(6, 'dfhs'),
(7, 'hfd'),
(8, 'dhf'),
(9, 'ahf'),
(10, 'hfa'),
(11, 'fah'),
(12, 'sdgag'),
(13, 'fgjd'),
(14, 'valaki'),
(15, 'Tezuka Takashi'),
(16, ' Mardonpol Inc.'),
(17, 'Valve'),
(18, 'PUBG Corporation');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalo`
--

CREATE TABLE `felhasznalo` (
  `idfelhasznalo` int(11) NOT NULL AUTO_INCREMENT,
  `felhasznalonev` varchar(50) NOT NULL UNIQUE,
  `email` varchar(100) NOT NULL UNIQUE,
  `jelszo` varchar(255) NOT NULL,
  `nev` varchar(100) DEFAULT NULL,
  `role` enum('user','gamedev','admin','moderator') NOT NULL DEFAULT 'user',
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `steam_profile` varchar(255) DEFAULT NULL,
  `discord_tag` varchar(50) DEFAULT NULL,
  `twitter_handle` varchar(50) DEFAULT NULL,
  `youtube_channel` varchar(255) DEFAULT NULL,
  `twitch_channel` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_banned` tinyint(1) DEFAULT 0,
  `ban_reason` text DEFAULT NULL,
  `ban_until` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `login_count` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idfelhasznalo`),
  KEY `idx_felhasznalonev` (`felhasznalonev`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `felhasznalo`
--

INSERT INTO `felhasznalo` (`idfelhasznalo`, `email`, `nev`, `jelszo`, `felhasznalonev`, `role`) VALUES
(1, 'admin@games.com', 'admin', 'aaaa', 'admin', 'admin'),
(2, 'korlev@hen.com', NULL, 'aaaa', 'admina', 'user'),
(3, 'valami@valami.com', NULL, 'aaaa', 'sdgds', 'user');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekextra`
--

CREATE TABLE `jatekextra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idjatekok` int(11) NOT NULL,
  `megjelenes` varchar(50) NOT NULL,
  `steam_link` varchar(255) NOT NULL,
  `jatek_elmeny` varchar(255) DEFAULT NULL,
  `reszletes_leiras` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_game_extra` (`idjatekok`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `jatekextra`
--

INSERT INTO `jatekextra` (`id`, `idjatekok`, `megjelenes`, `steam_link`, `jatek_elmeny`, `reszletes_leiras`, `created_at`) VALUES
(2, 14, '2024. szept. 23.', 'https://store.steampowered.com/app/1713350/Project_Castaway/', 'Vegyes', 'Project Castaway is a survival crafting title set in the Pacific Ocean. Live the life of a stranded castaway, with only yourself - and the island\'s inhabitants - for company! Sail the ocean, hunt, explore unique islands and gather resources as you fight for survival.', '2026-01-21 11:56:57'),
(3, 15, '2012. aug. 21.', 'https://store.steampowered.com/app/730/CounterStrike_2/', 'Nagyon Pozitív', 'Counter-Strike 2 is a multiplayer tactical first-person shooter, in which two teams, the Terrorists and Counter-Terrorists, compete to complete various objectives. The game includes two round-based objective scenarios: bomb defusal and hostage rescue, with the bomb defusal scenario making up the primary gameplay experience.', '2026-01-21 12:04:47'),
(4, 16, ' 2017. dec. 21.', 'https://store.steampowered.com/app/578080/PUBG_BATTLEGROUNDS/', 'Izgalmas.', 'A PUBG (PlayerUnknown\'s Battlegrounds) egy online battle royale játék, amelyben a játékosok egy szigetre dobtak ki, és versenyeznek az utolsó túlélőért. A játék során a játékosok fegyvereket, orvosi felszereléseket és más tárgyakat gyűjtenek, hogy segítsék őket a túlélésért. A játék különböző játékmódokban játszható, például a többjátékos módban, duóban vagy csapatban. A játék célja, hogy a játékosok tapasztalatait és stratégiaikat fejtsenek ki, miközben a terület szűkül, és a játékosok egyre intenzívebb konfliktusokba kényszerülnek. ', '2026-01-21 12:16:24');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok`
--

CREATE TABLE `jatekok` (
  `idjatekok` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL UNIQUE,
  `leiras` text DEFAULT NULL,
  `reszletes_leiras` longtext DEFAULT NULL,
  `idfejleszto` int(11) DEFAULT NULL,
  `idkiado` int(11) DEFAULT NULL,
  `ar` decimal(10,2) DEFAULT NULL,
  `penznem` varchar(3) DEFAULT 'HUF',
  `akcios_ar` decimal(10,2) DEFAULT NULL,
  `akcio_kezdete` datetime DEFAULT NULL,
  `akcio_vege` datetime DEFAULT NULL,
  `ertekeles` decimal(3,1) DEFAULT 0.0,
  `ertekelesek_szama` int(11) DEFAULT 0,
  `kepurl` varchar(255) DEFAULT NULL,
  `kepek` json DEFAULT NULL,
  `videok` json DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `background_url` varchar(255) DEFAULT NULL,
  `steam_link` varchar(255) DEFAULT NULL,
  `epic_games_link` varchar(255) DEFAULT NULL,
  `gog_link` varchar(255) DEFAULT NULL,
  `official_website` varchar(255) DEFAULT NULL,
  `megjelenes_datuma` date DEFAULT NULL,
  `megjelenes_allapot` enum('announced','early_access','released','delisted') DEFAULT 'released',
  `support_email` varchar(100) DEFAULT NULL,
  `discord_invite` varchar(255) DEFAULT NULL,
  `reddit_community` varchar(255) DEFAULT NULL,
  `facebook_page` varchar(255) DEFAULT NULL,
  `twitter_hashtag` varchar(50) DEFAULT NULL,
  `youtube_trailer` varchar(255) DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `subtitle_languages` json DEFAULT NULL,
  `voice_languages` json DEFAULT NULL,
  `age_rating` varchar(10) DEFAULT NULL,
  `content_warnings` json DEFAULT NULL,
  `features` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `dlc_count` int(11) DEFAULT 0,
  `expansion_count` int(11) DEFAULT 0,
  `season_pass` tinyint(1) DEFAULT 0,
  `multiplayer` tinyint(1) DEFAULT 0,
  `co_op` tinyint(1) DEFAULT 0,
  `online_multiplayer` tinyint(1) DEFAULT 0,
  `lan_support` tinyint(1) DEFAULT 0,
  `controller_support` tinyint(1) DEFAULT 0,
  `vr_support` tinyint(1) DEFAULT 0,
  `achievements` tinyint(1) DEFAULT 0,
  `cloud_save` tinyint(1) DEFAULT 0,
  `workshop_support` tinyint(1) DEFAULT 0,
  `mod_support` tinyint(1) DEFAULT 0,
  `trading_cards` tinyint(1) DEFAULT 0,
  `status` enum('draft','pending','approved','rejected','delisted') NOT NULL DEFAULT 'pending',
  `featured` tinyint(1) DEFAULT 0,
  `trending` tinyint(1) DEFAULT 0,
  `new_release` tinyint(1) DEFAULT 0,
  `coming_soon` tinyint(1) DEFAULT 0,
  `uploaded_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `wishlist_count` int(11) DEFAULT 0,
  `purchase_count` int(11) DEFAULT 0,
  `last_viewed` datetime DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idjatekok`),
  UNIQUE KEY `idx_slug` (`slug`),
  KEY `idx_nev` (`nev`),
  KEY `idx_fejleszto` (`idfejleszto`),
  KEY `idx_kiado` (`idkiado`),
  KEY `idx_ertekeles` (`ertekeles`),
  KEY `idx_ar` (`ar`),
  KEY `idx_status` (`status`),
  KEY `idx_megjelenes` (`megjelenes_datuma`),
  KEY `idx_featured` (`featured`),
  KEY `idx_trending` (`trending`),
  KEY `idx_uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `jatekok` 
--

INSERT INTO `jatekok` (`idjatekok`, `nev`, `slug`, `leiras`, `reszletes_leiras`, `idfejleszto`, `idkiado`, `ar`, `penznem`, `ertekeles`, `ertekelesek_szama`, `kepurl`, `megjelenes_datuma`, `languages`, `multiplayer`, `co_op`, `controller_support`, `achievements`, `cloud_save`, `status`, `uploaded_by`, `approved_at`, `approved_by`) VALUES
(14, 'Project Castaway', 'project-castaway', 'Project Castaway is a survival crafting title set in the Pacific Ocean.', 'Project Castaway is a survival crafting title set in the Pacific Ocean. Live the life of a stranded castaway, with only yourself - and the island\'s inhabitants - for company! Sail the ocean, hunt, explore unique islands and gather resources as you fight for survival.', 16, NULL, 3400.00, 'HUF', 5.0, 15, 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1713350/header.jpg?t=1768533750', '2024-09-23', '["magyar","english"]', 0, 1, 1, 0, 1, 'approved', 1, '2026-01-21 12:00:00', 1),
(15, 'Counter-Strike 2', 'counter-strike-2', 'A Counter-Strike több mint két évtizede kínál elit versengő élményt.', 'Counter-Strike 2 is a multiplayer tactical first-person shooter developed by Valve Corporation. The game is the fourth main entry in the Counter-Strike series.', 17, NULL, 0.00, 'HUF', 8.0, 150000, 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg?t=1749053861', '2012-08-21', '["magyar","english"]', 1, 1, 0, 1, 1, 'approved', 1, '2026-01-21 12:00:00', 1),
(16, 'PUBG: BATTLEGROUNDS', 'pubg-battlegrounds', 'PUBG: BATTLEGROUNDS, the high-stakes winner-take-all shooter that started the Battle Royale craze, is free-to-play!', 'PUBG: BATTLEGROUNDS is a battle royale game that pits 100 players against each other. The last player or team standing wins the match.', 18, NULL, 0.00, 'HUF', 7.0, 120000, 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/578080/841ea38bc58cabb70aef65365cf50bc2d79329d9/header.jpg?t=1764817633', '2017-12-21', '["magyar","english"]', 1, 0, 1, 1, 1, 'approved', 1, '2026-01-21 12:00:00', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok_kategoriak`
--

CREATE TABLE `jatekok_kategoriak` (
  `idjatekok` int(11) NOT NULL,
  `idkategoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `jatekok_kategoriak`
--

INSERT INTO `jatekok_kategoriak` (`idjatekok`, `idkategoria`) VALUES
(14, 14),
(15, 15),
(15, 16),
(15, 17),
(15, 18),
(15, 19),
(16, 20),
(16, 21),
(16, 22),
(16, 23);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok_platformok`
--

CREATE TABLE `jatekok_platformok` (
  `idjatekok` int(11) NOT NULL,
  `idplatform` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatek_videok`
--

CREATE TABLE `jatek_videok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idjatekok` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idjatekok` (`idjatekok`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `jatek_videok`
--

INSERT INTO `jatek_videok` (`id`, `idjatekok`, `url`) VALUES
(3, 14, 'https://youtu.be/1Y5f89tXNNo'),
(4, 14, 'https://youtu.be/BbGDuNVS2Nw'),
(5, 15, 'https://youtu.be/MFU6AGjVFWs'),
(6, 15, 'https://youtu.be/Fu2yFoiCdxE'),
(7, 16, 'https://youtu.be/e90WhwN2QdQ'),
(8, 16, 'https://youtu.be/tzzg6Z5oKGY');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kategoria`
--

CREATE TABLE `kategoria` (
  `idkategoria` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idkategoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `kategoria`
--

INSERT INTO `kategoria` (`idkategoria`, `nev`) VALUES
(1, 'sgfd'),
(2, 'dhf'),
(3, 'sdgfs'),
(4, 'hdfs'),
(5, 'fgd'),
(6, 'had'),
(7, 'af'),
(8, 'fdha'),
(9, 'ahf'),
(10, 'agd'),
(11, 'fgjd'),
(12, 'RPG'),
(13, 'többjátékos'),
(14, 'Survival, SandBox'),
(15, 'FPS'),
(16, 'Versengő'),
(17, 'Többjátékos'),
(18, 'Akció'),
(19, 'PVP'),
(20, 'Túlélő'),
(21, 'Lövöldözős'),
(22, 'Battle Royale'),
(23, 'FPS');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kiado`
--

CREATE TABLE `kiado` (
  `idkiado` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`idkiado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kommentek`
--

CREATE TABLE `kommentek` (
  `idkommentek` int(11) NOT NULL AUTO_INCREMENT,
  `idfelhasznalo` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `ertekeles` int(11) NOT NULL,
  `tartalom` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idkommentek`),
  KEY `idfelhasznalo` (`idfelhasznalo`),
  KEY `idjatekok` (`idjatekok`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `kommentek`
--

INSERT INTO `kommentek` (`idkommentek`, `idfelhasznalo`, `idjatekok`, `ertekeles`, `tartalom`) VALUES
(1, 2, 14, 8, 'Nagyon jó játék, szeretem a survival elemeket!'),
(2, 3, 14, 6, 'Kicsit unalmas volt, de a grafika szép.'),
(3, 2, 15, 10, 'A legjobb FPS játék valaha!'),
(4, 3, 15, 9, 'Sokat játszom, nagyon addictív.'),
(5, 2, 16, 7, 'Battle Royale jó, de van hova fejlődni.'),
(6, 3, 16, 8, 'Élvezem a játékot, barátokkal a legjobb.'),
(7, 1, 15, 10, 'Klasszikus, ami sosem unalmas.');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `platform`
--

CREATE TABLE `platform` (
  `idplatform` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idplatform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `promociok`
--

CREATE TABLE `promociok` (
  `idpromocio` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idpromocio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `promociosjatekok`
--

CREATE TABLE `promociosjatekok` (
  `idpromocio` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  PRIMARY KEY (`idpromocio`,`idjatekok`),
  KEY `idjatekok` (`idjatekok`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `rendszerkovetelmeny`
--

CREATE TABLE `rendszerkovetelmeny` (
  `idrendszerkovetelmeny` int(11) NOT NULL AUTO_INCREMENT,
  `minimum` varchar(255) DEFAULT NULL,
  `ajanlott` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idrendszerkovetelmeny`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `rendszerkovetelmeny`
--

INSERT INTO `rendszerkovetelmeny` (`idrendszerkovetelmeny`, `minimum`, `ajanlott`) VALUES
(1, 'sdf', 'gs'),
(2, 'fghsfghgfh', 'sfghsghgfhsfghgfh'),
(3, 'sgds', 'dsgsd'),
(4, 'hsf', 'dhsf'),
(5, 'i,u', ',iut'),
(6, 'dhfa', 'hdf'),
(7, 'dfha', 'dfha'),
(8, 'dhaf', 'hfa'),
(9, 'haf', 'dfh'),
(10, 'dsag', 'agd'),
(11, 'fgdj', 'gjfd'),
(12, 'nagyon gyengye', 'nagyon erős'),
(13, '-', '-'),
(14, 'Op. rendszer: Windows 10 Processzor: Intel Core i3-6100 or equivalent CPU Memória: 8 GB RAM Grafika: NVIDIA GeForce GTX 970 or AMD equivalent Tárhely: 4 GB szabad hely Egyéb megjegyzések: Does not work well with integrated GPUs', 'Op. rendszer: Windows 10 Processzor: Intel Core i5-9400 or equivalent CPU Memória: 12 GB RAM Grafika: NVidia GeForce RTX 2060 or AMD equivalent Tárhely: 5 GB szabad hely Egyéb megjegyzések: Does not work well with integrated GPUs'),
(15, 'Minimum: Op. rendszer: Windows® 10 Processzor: 4 szálas processzor — Intel® Core™ i5 750 vagy jobb Memória: 8 GB RAM Grafika: A videokártyának legalább 1 GB-osnak és DirectX 11 kompatibilisnak kell lennie, Shader Model 5.0 támogatással. DirectX: Verzió: 1', '-'),
(16, '64 bites processzor és operációs rendszer szükséges Op. rendszer: 64-bit Windows 10 Processzor: Intel Core i5-4430 / AMD FX-6300 Memória: 8 GB RAM Grafika: NVIDIA GeForce GTX 960 2GB / AMD Radeon R7 370 2GB DirectX: Verzió: 11 Hálózat: Széles sávú interne', '64 bites processzor és operációs rendszer szükséges Op. rendszer: 64-bit Windows 10 Processzor: Intel Core i5-6600K / AMD Ryzen 5 1600 Memória: 16 GB RAM Grafika: NVIDIA GeForce GTX 1060 3GB / AMD Radeon RX 580 4GB DirectX: Verzió: 11 Hálózat: Széles sávú');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD KEY `idx_felhasznalo_role` (`role`);

--
-- A tábla indexei `jatekok`
--
ALTER TABLE `jatekok`
  ADD KEY `idkiado` (`idkiado`),
  ADD KEY `idfejleszto` (`idfejleszto`),
  ADD KEY `idx_jatekok_status` (`status`),
  ADD KEY `idx_jatekok_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_jatekok_approved_by` (`approved_by`);

--
-- A tábla indexei `jatekok_kategoriak`
--
ALTER TABLE `jatekok_kategoriak`
  ADD KEY `idkategoria` (`idkategoria`);

--
-- A tábla indexei `jatekok_platformok`
--
ALTER TABLE `jatekok_platformok`
  ADD KEY `idplatform` (`idplatform`);

--
-- A tábla indexei `rendszerkovetelmeny`
--

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- Megkötések a kiírt táblákhoz
--

--
-- ÚJ PROFESSZIONÁLIS TÁBLÁK HOZZÁADÁSA
-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `wishlist` - Kívánságlista
--
CREATE TABLE `wishlist` (
  `idwishlist` int(11) NOT NULL AUTO_INCREMENT,
  `idfelhasznalo` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `priority` enum('low','medium','high','must_have') DEFAULT 'medium',
  `notify_on_sale` tinyint(1) DEFAULT 1,
  `notify_on_release` tinyint(1) DEFAULT 1,
  `price_alert` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idwishlist`),
  UNIQUE KEY `idx_user_game` (`idfelhasznalo`,`idjatekok`),
  KEY `idx_jatek` (`idjatekok`),
  FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo`(`idfelhasznalo`) ON DELETE CASCADE,
  FOREIGN KEY (`idjatekok`) REFERENCES `jatekok`(`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tábla szerkezet ehhez a táblához `jatek_kepek` - Játék képek kezelése
--
CREATE TABLE `jatek_kepek` (
  `idkep` int(11) NOT NULL AUTO_INCREMENT,
  `idjatekok` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `tipus` enum('header','background','screenshot','logo','banner','icon','other') DEFAULT 'screenshot',
  `cim` varchar(200) DEFAULT NULL,
  `leiras` text DEFAULT NULL,
  `sorrend` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idkep`),
  KEY `idx_jatek` (`idjatekok`),
  KEY `idx_tipus` (`tipus`),
  KEY `idx_sorrend` (`sorrend`),
  FOREIGN KEY (`idjatekok`) REFERENCES `jatekok`(`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tábla szerkezet ehhez a táblához `dlc` - Downloadable Content
--
CREATE TABLE `dlc` (
  `iddlc` int(11) NOT NULL AUTO_INCREMENT,
  `idjatekok` int(11) NOT NULL,
  `nev` varchar(200) NOT NULL,
  `leiras` text DEFAULT NULL,
  `ar` decimal(10,2) DEFAULT NULL,
  `penznem` varchar(3) DEFAULT 'HUF',
  `akcios_ar` decimal(10,2) DEFAULT NULL,
  `kepurl` varchar(255) DEFAULT NULL,
  `megjelenes_datuma` date DEFAULT NULL,
  `tipus` enum('expansion','dlc','season_pass','bundle','cosmetic','other') DEFAULT 'dlc',
  `is_required` tinyint(1) DEFAULT 0,
  `status` enum('draft','pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`iddlc`),
  KEY `idx_jatek` (`idjatekok`),
  KEY `idx_nev` (`nev`),
  FOREIGN KEY (`idjatekok`) REFERENCES `jatekok`(`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tábla szerkezet ehhez a táblához `achievements` - Játék teljesítmények
--
CREATE TABLE `achievements` (
  `idachievement` int(11) NOT NULL AUTO_INCREMENT,
  `idjatekok` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL,
  `ikon_url` varchar(255) DEFAULT NULL,
  `ikon_locked_url` varchar(255) DEFAULT NULL,
  `pontszam` int(11) DEFAULT 0,
  `rejtett` tinyint(1) DEFAULT 0,
  `sorrend` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idachievement`),
  KEY `idx_jatek` (`idjatekok`),
  KEY `idx_nev` (`nev`),
  FOREIGN KEY (`idjatekok`) REFERENCES `jatekok`(`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tábla szerkezet ehhez a táblához `tags` - Játék címkék
--
CREATE TABLE `tags` (
  `idtag` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(50) NOT NULL UNIQUE,
  `leiras` text DEFAULT NULL,
  `szin` varchar(7) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `hasznalatok_szama` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idtag`),
  KEY `idx_nev` (`nev`),
  KEY `idx_hasznalatok` (`hasznalatok_szama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tábla szerkezet ehhez a táblához `jatekok_tags` - Játék-tag kapcsolat
--
CREATE TABLE `jatekok_tags` (
  `idjatekok` int(11) NOT NULL,
  `idtag` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idjatekok`,`idtag`),
  KEY `idx_tag` (`idtag`),
  FOREIGN KEY (`idjatekok`) REFERENCES `jatekok`(`idjatekok`) ON DELETE CASCADE,
  FOREIGN KEY (`idtag`) REFERENCES `tags`(`idtag`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tábla szerkezet ehhez a táblához `reviews` - Részletes értékelések
--
CREATE TABLE `reviews` (
  `idreview` int(11) NOT NULL AUTO_INCREMENT,
  `idjatekok` int(11) NOT NULL,
  `idfelhasznalo` int(11) NOT NULL,
  `cim` varchar(200) DEFAULT NULL,
  `tartalom` longtext NOT NULL,
  `ertekeles` decimal(2,1) NOT NULL,
  `playtime_hours` decimal(8,1) DEFAULT NULL,
  `is_recommended` tinyint(1) DEFAULT 1,
  `helpful_count` int(11) DEFAULT 0,
  `funny_count` int(11) DEFAULT 0,
  `award_count` int(11) DEFAULT 0,
  `is_verified_purchase` tinyint(1) DEFAULT 0,
  `visibility` enum('public','friends_only','private') DEFAULT 'public',
  `is_edited` tinyint(1) DEFAULT 0,
  `edited_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idreview`),
  KEY `idx_jatek` (`idjatekok`),
  KEY `idx_felhasznalo` (`idfelhasznalo`),
  KEY `idx_ertekeles` (`ertekeles`),
  KEY `idx_created` (`created_at`),
  KEY `idx_recommended` (`is_recommended`),
  FOREIGN KEY (`idjatekok`) REFERENCES `jatekok`(`idjatekok`) ON DELETE CASCADE,
  FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo`(`idfelhasznalo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Alap adatok beillesztése az új táblákba
--

-- Kiadók adatok
INSERT INTO `kiado` (`idkiado`, `nev`, `leiras`, `website`, `is_verified`) VALUES
(1, 'Valve Corporation', 'American video game developer and digital distribution company', 'https://www.valvesoftware.com', 1),
(2, 'CD Projekt', 'Polish video game developer and publisher', 'https://www.cdprojekt.com', 1),
(3, 'Activision', 'American video game publisher', 'https://www.activision.com', 1),
(4, 'Electronic Arts', 'American video game company', 'https://www.ea.com', 1),
(5, 'Take-Two Interactive', 'American video game holding company', 'https://www.take2games.com', 1);

-- Tags adatok
INSERT INTO `tags` (`idtag`, `nev`, `leiras`, `szin`) VALUES
(1, 'Singleplayer', 'Games that can be played alone', '#2ECC71'),
(2, 'Multiplayer', 'Games that support multiple players', '#3498DB'),
(3, 'Co-op', 'Cooperative gameplay', '#9B59B6'),
(4, 'Open World', 'Games with large open environments', '#E67E22'),
(5, 'Story Rich', 'Games with strong narrative elements', '#E74C3C'),
(6, 'Atmospheric', 'Games with strong atmosphere', '#1ABC9C'),
(7, 'Difficult', 'Challenging games', '#34495E'),
(8, 'Relaxing', 'Casual and relaxing games', '#95A5A6'),
(9, 'Pixel Graphics', 'Games with pixel art style', '#F39C12'),
(10, '3D', 'Three-dimensional games', '#16A085'),
(11, '2D', 'Two-dimensional games', '#27AE60'),
(12, 'VR', 'Virtual reality games', '#8E44AD');

-- Foreign key constraint-ek hozzáadása a táblák létrehozása után
ALTER TABLE `jatekok` 
  ADD CONSTRAINT `fk_jatekok_fejleszto` FOREIGN KEY (`idfejleszto`) REFERENCES `fejleszto`(`idfejleszto`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_jatekok_kiado` FOREIGN KEY (`idkiado`) REFERENCES `kiado`(`idkiado`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_jatekok_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo`(`idfelhasznalo`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_jatekok_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `felhasznalo`(`idfelhasznalo`) ON DELETE SET NULL;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
