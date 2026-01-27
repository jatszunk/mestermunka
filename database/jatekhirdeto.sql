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
  `idfejleszto` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `idfelhasznalo` int(11) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `nev` varchar(45) DEFAULT NULL,
  `jelszo` varchar(45) DEFAULT NULL,
  `felhasznalonev` varchar(45) DEFAULT NULL,
  `role` enum('user','gamedev','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `megjelenes` varchar(50) NOT NULL,
  `steam_link` varchar(255) NOT NULL,
  `jatek_elmeny` varchar(255) DEFAULT NULL,
  `reszletes_leiras` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `idjatekok` int(11) NOT NULL,
  `nev` varchar(100) DEFAULT NULL,
  `idkiado` int(11) DEFAULT NULL,
  `idfejleszto` int(11) DEFAULT NULL,
  `ar` varchar(255) DEFAULT NULL,
  `idrendszerkovetelmeny` int(11) DEFAULT NULL,
  `leiras` varchar(255) DEFAULT NULL,
  `ertekeles` int(11) NOT NULL,
  `kepurl` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  `uploaded_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `jatekok`
--

INSERT INTO `jatekok` (`idjatekok`, `nev`, `idkiado`, `idfejleszto`, `ar`, `idrendszerkovetelmeny`, `leiras`, `ertekeles`, `kepurl`, `status`, `uploaded_by`, `approved_at`, `approved_by`) VALUES
(14, 'Project Castaway', NULL, 16, '3400', 14, 'Project Castaway is a survival crafting title set in the Pacific Ocean. Live the life of a stranded castaway, with only yourself - and the island\'s inhabitants - for company! Sail the ocean, hunt, explore unique islands and gather resources as you fight f', 5, 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1713350/header.jpg?t=1768533750', 'approved', 1, '2026-01-21 12:00:00', 1),
(15, 'Counter-Strike 2', NULL, 17, 'Ingyenes', 15, 'A Counter-Strike több mint két évtizede kínál elit versengő élményt, melyet játékosok milliói formálnak a világ minden tájáról. És most megkezdődik a CS történetének következő fejezete. Ez a Counter‑Strike 2.', 8, 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg?t=1749053861', 'approved', 1, '2026-01-21 12:00:00', 1),
(16, 'PUBG: BATTLEGROUNDS', NULL, 18, 'Ingyenes', 16, 'PUBG: BATTLEGROUNDS, the high-stakes winner-take-all shooter that started the Battle Royale craze, is free-to-play! Drop into diverse maps, loot unique weapons and supplies, and survive in an ever-shrinking zone where every turn could be your last.', 7, 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/578080/841ea38bc58cabb70aef65365cf50bc2d79329d9/header.jpg?t=1764817633', 'approved', 1, '2026-01-21 12:00:00', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok_kategoriak`
--

CREATE TABLE `jatekok_kategoriak` (
  `idjatekok` int(11) NOT NULL,
  `idkategoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatek_videok`
--

CREATE TABLE `jatek_videok` (
  `id` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `idkategoria` int(11) NOT NULL,
  `nev` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `idkiado` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kommentek`
--

CREATE TABLE `kommentek` (
  `idkommentek` int(11) NOT NULL,
  `idfelhasznalo` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `ertekeles` int(11) NOT NULL,
  `tartalom` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `idplatform` int(11) NOT NULL,
  `nev` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `promociok`
--

CREATE TABLE `promociok` (
  `idpromocio` int(11) NOT NULL,
  `nev` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `promociosjatekok`
--

CREATE TABLE `promociosjatekok` (
  `idpromocio` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- A tábla indexei `fejleszto`
--
ALTER TABLE `fejleszto`
  ADD PRIMARY KEY (`idfejleszto`);

--
-- A tábla indexei `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD PRIMARY KEY (`idfelhasznalo`),
  ADD KEY `idx_felhasznalo_role` (`role`);

--
-- A tábla indexei `jatekextra`
--
ALTER TABLE `jatekextra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_game_extra` (`idjatekok`);

--
-- A tábla indexei `jatekok`
--
ALTER TABLE `jatekok`
  ADD PRIMARY KEY (`idjatekok`),
  ADD KEY `idkiado` (`idkiado`),
  ADD KEY `idfejleszto` (`idfejleszto`),
  ADD KEY `idrendszerkovetelmeny` (`idrendszerkovetelmeny`),
  ADD KEY `idx_jatekok_status` (`status`),
  ADD KEY `idx_jatekok_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_jatekok_approved_by` (`approved_by`);

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
-- A tábla indexei `jatek_videok`
--
ALTER TABLE `jatek_videok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idjatekok` (`idjatekok`);

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
  ADD KEY `idfelhasznalo` (`idfelhasznalo`),
  ADD KEY `idjatekok` (`idjatekok`);

--
-- A tábla indexei `platform`
--
ALTER TABLE `platform`
  ADD PRIMARY KEY (`idplatform`);

--
-- A tábla indexei `promociok`
--
ALTER TABLE `promociok`
  ADD PRIMARY KEY (`idpromocio`);

--
-- A tábla indexei `promociosjatekok`
--
ALTER TABLE `promociosjatekok`
  ADD PRIMARY KEY (`idpromocio`,`idjatekok`),
  ADD KEY `idjatekok` (`idjatekok`);

--
-- A tábla indexei `rendszerkovetelmeny`
--
ALTER TABLE `rendszerkovetelmeny`
  ADD PRIMARY KEY (`idrendszerkovetelmeny`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `fejleszto`
--
ALTER TABLE `fejleszto`
  MODIFY `idfejleszto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT a táblához `felhasznalo`
--
ALTER TABLE `felhasznalo`
  MODIFY `idfelhasznalo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `jatekextra`
--
ALTER TABLE `jatekextra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `jatekok`
--
ALTER TABLE `jatekok`
  MODIFY `idjatekok` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT a táblához `jatek_videok`
--
ALTER TABLE `jatek_videok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT a táblához `kategoria`
--
ALTER TABLE `kategoria`
  MODIFY `idkategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT a táblához `kiado`
--
ALTER TABLE `kiado`
  MODIFY `idkiado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kommentek`
--
ALTER TABLE `kommentek`
  MODIFY `idkommentek` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `platform`
--
ALTER TABLE `platform`
  MODIFY `idplatform` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `promociok`
--
ALTER TABLE `promociok`
  MODIFY `idpromocio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `rendszerkovetelmeny`
--
ALTER TABLE `rendszerkovetelmeny`
  MODIFY `idrendszerkovetelmeny` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `jatekextra`
--
ALTER TABLE `jatekextra`
  ADD CONSTRAINT `fk_jatekextra_jatekok` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatekok`
--
ALTER TABLE `jatekok`
  ADD CONSTRAINT `jatekok_ibfk_1` FOREIGN KEY (`idkiado`) REFERENCES `kiado` (`idkiado`) ON DELETE CASCADE,
  ADD CONSTRAINT `jatekok_ibfk_2` FOREIGN KEY (`idfejleszto`) REFERENCES `fejleszto` (`idfejleszto`) ON DELETE CASCADE,
  ADD CONSTRAINT `jatekok_ibfk_3` FOREIGN KEY (`idrendszerkovetelmeny`) REFERENCES `rendszerkovetelmeny` (`idrendszerkovetelmeny`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo`(`idfelhasznalo`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `felhasznalo`(`idfelhasznalo`) ON DELETE SET NULL;

--
-- Megkötések a táblához `jatekok_kategoriak`
--
ALTER TABLE `jatekok_kategoriak`
  ADD CONSTRAINT `jatekok_kategoriak_ibfk_1` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `jatekok_kategoriak_ibfk_2` FOREIGN KEY (`idkategoria`) REFERENCES `kategoria` (`idkategoria`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatekok_platformok`
--
ALTER TABLE `jatekok_platformok`
  ADD CONSTRAINT `jatekok_platformok_ibfk_1` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `jatekok_platformok_ibfk_2` FOREIGN KEY (`idplatform`) REFERENCES `platform` (`idplatform`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatek_videok`
--
ALTER TABLE `jatek_videok`
  ADD CONSTRAINT `fk_jatek_videok_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE;

--
-- Megkötések a táblához `kommentek`
--
ALTER TABLE `kommentek`
  ADD CONSTRAINT `kommentek_ibfk_1` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE,
  ADD CONSTRAINT `kommentek_ibfk_2` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE;

--
-- Megkötések a táblához `promociosjatekok`
--
ALTER TABLE `promociosjatekok`
  ADD CONSTRAINT `promociosjatekok_ibfk_1` FOREIGN KEY (`idpromocio`) REFERENCES `promociok` (`idpromocio`) ON DELETE CASCADE,
  ADD CONSTRAINT `promociosjatekok_ibfk_2` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
