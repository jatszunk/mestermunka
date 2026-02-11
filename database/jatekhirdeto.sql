-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Feb 11. 11:17
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

DELIMITER $$
--
-- Eljárások
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserStatistics` (IN `user_id` INT)   BEGIN
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
END$$

DELIMITER ;

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
(5, ''),
(18, 'asf'),
(6, 'CD PROJEKT RED'),
(13, 'ConcernedApe'),
(16, 'Firaxis Games'),
(3, 'FromSoftware Inc.'),
(19, 'https://sunmed.hu/app/uploads/sites/2/2023/02/sun428-keto-cont-ketonszintmero-tesztcsik-onellenorzes'),
(11, 'KRAFTON'),
(4, 'Larian Studios'),
(10, 'Respawn Entertainment'),
(9, 'Rockstar Games'),
(15, 'SCS Software'),
(14, 'Supergiant Games'),
(17, 'Ubisoft'),
(12, 'Ubisoft Montreal'),
(1, 'Valve');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalo`
--

CREATE TABLE `felhasznalo` (
  `idfelhasznalo` int(11) NOT NULL,
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

INSERT INTO `felhasznalo` (`idfelhasznalo`, `felhasznalonev`, `email`, `jelszo`, `szerepkor`, `regisztracio_datum`, `nev`, `aktiv`, `utolso_belepes`, `bio`, `avatar`, `favoriteGenres`, `preferredPlatforms`, `country`, `birthYear`, `discord`, `twitter`, `youtube`, `twitch`) VALUES
(1, 'admin', 'admin@example.com', 'admin', 'admin', '2026-02-03 15:42:55', 'Admin', 1, '2026-02-03 16:08:39', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'gamedev', 'gamedev@gamedev.com', 'gamedev', 'gamedev', '2026-02-03 16:08:13', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'csabusa', 'jatszukmeg@gmail.com', 'aaaa', 'admin', '2026-02-04 07:12:24', 'csabusa1', 1, NULL, '', '', '[]', '[]', '', 0, '', '', '', ''),
(4, 'dev', 'asd@gmail.com', 'dev', 'gamedev', '2026-02-11 07:59:13', NULL, 1, '2026-02-11 08:01:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'nagy.peter_1770804246804gdn8', 'nagy.peter@email.com', '5glyfmvw', 'felhasznalo', '2026-02-11 10:04:06', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(6, 'kiss.anna_1770804246812ollp', 'kiss.anna@email.com', 'ae6wg9ac', 'felhasznalo', '2026-02-11 10:04:06', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(7, 'szabo.gabor_1770804246816z6ao', 'szabo.gabor@email.com', 'njm4ydrn', 'felhasznalo', '2026-02-11 10:04:06', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(8, 'toth.eva_1770804246822w419', 'toth.eva@email.com', '53sqvchs', 'felhasznalo', '2026-02-11 10:04:06', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(9, 'varga.istvan_1770804246828o3fe', 'varga.istvan@email.com', '8v6kgryr', 'felhasznalo', '2026-02-11 10:04:06', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(10, 'nagy.peter_17708043024341jxp', 'nagy.peter@email.com', '2x3g99kb', 'felhasznalo', '2026-02-11 10:05:02', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(11, 'kiss.anna_1770804302438rczf', 'kiss.anna@email.com', 'ca2atv47', 'felhasznalo', '2026-02-11 10:05:02', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(12, 'szabo.gabor_1770804302442g7ke', 'szabo.gabor@email.com', '47yf3qim', 'felhasznalo', '2026-02-11 10:05:02', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(13, 'toth.eva_1770804302446eonk', 'toth.eva@email.com', 'ylpzmmxf', 'felhasznalo', '2026-02-11 10:05:02', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(14, 'varga.istvan_1770804302449ebnh', 'varga.istvan@email.com', 'cs30utg9', 'felhasznalo', '2026-02-11 10:05:02', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(15, 'nagy.peter_177080430262736kd', 'nagy.peter@email.com', 'm8ow30l7', 'felhasznalo', '2026-02-11 10:05:02', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(16, 'kiss.anna_17708043026341cac', 'kiss.anna@email.com', '3amf2h8r', 'felhasznalo', '2026-02-11 10:05:02', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(17, 'szabo.gabor_177080430263830lf', 'szabo.gabor@email.com', 'm2ehgtvg', 'felhasznalo', '2026-02-11 10:05:02', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(18, 'toth.eva_17708043026430hgd', 'toth.eva@email.com', '4thqtqcn', 'felhasznalo', '2026-02-11 10:05:02', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(19, 'varga.istvan_17708043026462w1q', 'varga.istvan@email.com', 'ryt5489b', 'felhasznalo', '2026-02-11 10:05:02', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(20, 'nagy.peter_17708043027839bjc', 'nagy.peter@email.com', 'fkkdv3rb', 'felhasznalo', '2026-02-11 10:05:02', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(21, 'kiss.anna_1770804302787d1js', 'kiss.anna@email.com', '3sf77xkd', 'felhasznalo', '2026-02-11 10:05:02', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(22, 'szabo.gabor_1770804302790x2nk', 'szabo.gabor@email.com', '03xt51ac', 'felhasznalo', '2026-02-11 10:05:02', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(23, 'toth.eva_1770804302794x7nk', 'toth.eva@email.com', '66o3ljkk', 'felhasznalo', '2026-02-11 10:05:02', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(24, 'varga.istvan_1770804302798gybk', 'varga.istvan@email.com', '7tia46wk', 'felhasznalo', '2026-02-11 10:05:02', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(25, 'nagy.peter_1770804302938h24l', 'nagy.peter@email.com', 'at4oqslr', 'felhasznalo', '2026-02-11 10:05:02', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(26, 'kiss.anna_1770804302944sioc', 'kiss.anna@email.com', '3o342szq', 'felhasznalo', '2026-02-11 10:05:02', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(27, 'szabo.gabor_1770804302949t4ah', 'szabo.gabor@email.com', '13fl9ef8', 'felhasznalo', '2026-02-11 10:05:02', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(28, 'toth.eva_17708043029545yce', 'toth.eva@email.com', 'i9541trh', 'felhasznalo', '2026-02-11 10:05:02', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(29, 'varga.istvan_1770804302959aq95', 'varga.istvan@email.com', 'n3uqe70z', 'felhasznalo', '2026-02-11 10:05:02', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(30, 'nagy.peter_1770804303090l72g', 'nagy.peter@email.com', '9o9ab46p', 'felhasznalo', '2026-02-11 10:05:03', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(31, 'kiss.anna_1770804303093pkur', 'kiss.anna@email.com', 'e92os1v5', 'felhasznalo', '2026-02-11 10:05:03', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(32, 'szabo.gabor_1770804303096ivlk', 'szabo.gabor@email.com', 'lvit1obl', 'felhasznalo', '2026-02-11 10:05:03', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(33, 'toth.eva_1770804303099sq8p', 'toth.eva@email.com', 'hbvtf77g', 'felhasznalo', '2026-02-11 10:05:03', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(34, 'varga.istvan_1770804303101h6as', 'varga.istvan@email.com', '2mmrsj62', 'felhasznalo', '2026-02-11 10:05:03', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(35, 'nagy.peter_1770804303236u5cm', 'nagy.peter@email.com', 'xz44axdj', 'felhasznalo', '2026-02-11 10:05:03', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(36, 'kiss.anna_1770804303242kusi', 'kiss.anna@email.com', 'r3wrvkiz', 'felhasznalo', '2026-02-11 10:05:03', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(37, 'szabo.gabor_1770804303247kffi', 'szabo.gabor@email.com', 't4wc2gne', 'felhasznalo', '2026-02-11 10:05:03', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(38, 'toth.eva_17708043032517yr8', 'toth.eva@email.com', 'z8h3umqx', 'felhasznalo', '2026-02-11 10:05:03', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(39, 'varga.istvan_17708043032557mni', 'varga.istvan@email.com', 'o7gneyya', 'felhasznalo', '2026-02-11 10:05:03', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(40, 'nagy.peter_1770804303378j99s', 'nagy.peter@email.com', '6dhg0hz6', 'felhasznalo', '2026-02-11 10:05:03', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(41, 'kiss.anna_17708043033828036', 'kiss.anna@email.com', 'oa5gf7xu', 'felhasznalo', '2026-02-11 10:05:03', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(42, 'szabo.gabor_1770804303385mkwr', 'szabo.gabor@email.com', 'zhtdmnwh', 'felhasznalo', '2026-02-11 10:05:03', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(43, 'toth.eva_1770804303387ufhc', 'toth.eva@email.com', 'flxe51km', 'felhasznalo', '2026-02-11 10:05:03', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(44, 'varga.istvan_1770804303390yk0w', 'varga.istvan@email.com', 'vi99cx4w', 'felhasznalo', '2026-02-11 10:05:03', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(45, 'nagy.peter_1770804303534x1l9', 'nagy.peter@email.com', 't3g4d4cd', 'felhasznalo', '2026-02-11 10:05:03', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(46, 'kiss.anna_1770804303539wf2m', 'kiss.anna@email.com', 'ke53u2h5', 'felhasznalo', '2026-02-11 10:05:03', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(47, 'szabo.gabor_17708043035484gcz', 'szabo.gabor@email.com', 'ydebruzd', 'felhasznalo', '2026-02-11 10:05:03', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(48, 'toth.eva_1770804303551ae6q', 'toth.eva@email.com', 'upr2y4ks', 'felhasznalo', '2026-02-11 10:05:03', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(49, 'varga.istvan_1770804303565eizs', 'varga.istvan@email.com', '3vr4rbvx', 'felhasznalo', '2026-02-11 10:05:03', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(50, 'nagy.peter_1770804303680wddr', 'nagy.peter@email.com', 'ov06vjuk', 'felhasznalo', '2026-02-11 10:05:03', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(51, 'kiss.anna_1770804303685tewb', 'kiss.anna@email.com', 'vjxvda5x', 'felhasznalo', '2026-02-11 10:05:03', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(52, 'szabo.gabor_1770804303687qufx', 'szabo.gabor@email.com', 'jy1wej3h', 'felhasznalo', '2026-02-11 10:05:03', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(53, 'toth.eva_177080430369039dw', 'toth.eva@email.com', 'rzh1596r', 'felhasznalo', '2026-02-11 10:05:03', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(54, 'varga.istvan_1770804303693yk5u', 'varga.istvan@email.com', 'pxppw99u', 'felhasznalo', '2026-02-11 10:05:03', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(55, 'nagy.peter_17708043038227zdw', 'nagy.peter@email.com', '4hvuq2ud', 'felhasznalo', '2026-02-11 10:05:03', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(56, 'kiss.anna_1770804303826blwd', 'kiss.anna@email.com', '2024s7de', 'felhasznalo', '2026-02-11 10:05:03', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(57, 'szabo.gabor_1770804303831pvud', 'szabo.gabor@email.com', 'qxb5yf97', 'felhasznalo', '2026-02-11 10:05:03', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(58, 'toth.eva_17708043038351aw3', 'toth.eva@email.com', 'dlp0di2q', 'felhasznalo', '2026-02-11 10:05:03', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(59, 'varga.istvan_1770804303838hmcf', 'varga.istvan@email.com', 'gg2debb9', 'felhasznalo', '2026-02-11 10:05:03', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(60, 'nagy.peter_17708043039678paz', 'nagy.peter@email.com', '68mtqdh1', 'felhasznalo', '2026-02-11 10:05:03', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(61, 'kiss.anna_17708043039708dxq', 'kiss.anna@email.com', '5ljx7isk', 'felhasznalo', '2026-02-11 10:05:03', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(62, 'szabo.gabor_1770804303972c51r', 'szabo.gabor@email.com', '40o59ygm', 'felhasznalo', '2026-02-11 10:05:03', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(63, 'toth.eva_17708043039759m9o', 'toth.eva@email.com', '890gzyts', 'felhasznalo', '2026-02-11 10:05:03', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(64, 'varga.istvan_1770804303977h26c', 'varga.istvan@email.com', 'mc1bns2i', 'felhasznalo', '2026-02-11 10:05:03', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(65, 'nagy.peter_1770804304124e09g', 'nagy.peter@email.com', 'vprz1tjn', 'felhasznalo', '2026-02-11 10:05:04', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(66, 'kiss.anna_1770804304129qcfl', 'kiss.anna@email.com', 'o1th5edp', 'felhasznalo', '2026-02-11 10:05:04', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(67, 'szabo.gabor_1770804304134vo5l', 'szabo.gabor@email.com', 'ddqs5lso', 'felhasznalo', '2026-02-11 10:05:04', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(68, 'toth.eva_1770804304139twij', 'toth.eva@email.com', '4mqfj19a', 'felhasznalo', '2026-02-11 10:05:04', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(69, 'varga.istvan_1770804304146ia5m', 'varga.istvan@email.com', 'o7f8dore', 'felhasznalo', '2026-02-11 10:05:04', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(70, 'nagy.peter_1770804304290756g', 'nagy.peter@email.com', 'u9b9ogt6', 'felhasznalo', '2026-02-11 10:05:04', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(71, 'kiss.anna_1770804304293crgi', 'kiss.anna@email.com', 'xr1fkhx8', 'felhasznalo', '2026-02-11 10:05:04', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(72, 'szabo.gabor_1770804304295d24g', 'szabo.gabor@email.com', '7mth9mq9', 'felhasznalo', '2026-02-11 10:05:04', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(73, 'toth.eva_1770804304297hpse', 'toth.eva@email.com', 'hoiq58h3', 'felhasznalo', '2026-02-11 10:05:04', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(74, 'varga.istvan_17708043043005df7', 'varga.istvan@email.com', 'g1g5w5pc', 'felhasznalo', '2026-02-11 10:05:04', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(75, 'nagy.peter_1770804304456s3hj', 'nagy.peter@email.com', 'rqfo2u2j', 'felhasznalo', '2026-02-11 10:05:04', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(76, 'kiss.anna_17708043044613z9r', 'kiss.anna@email.com', 'bdvasuuv', 'felhasznalo', '2026-02-11 10:05:04', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(77, 'szabo.gabor_17708043044669vsr', 'szabo.gabor@email.com', 'jzo28dzo', 'felhasznalo', '2026-02-11 10:05:04', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(78, 'toth.eva_1770804304470ra3d', 'toth.eva@email.com', 'lawx12tu', 'felhasznalo', '2026-02-11 10:05:04', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(79, 'varga.istvan_17708043044755wib', 'varga.istvan@email.com', 'ofo6m1w7', 'felhasznalo', '2026-02-11 10:05:04', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(80, 'nagy.peter_1770804304618lkrn', 'nagy.peter@email.com', '6u4d5m5a', 'felhasznalo', '2026-02-11 10:05:04', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(81, 'kiss.anna_177080430462235ms', 'kiss.anna@email.com', '4z9qmm6l', 'felhasznalo', '2026-02-11 10:05:04', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(82, 'szabo.gabor_1770804304626ghds', 'szabo.gabor@email.com', 'z7ask5yp', 'felhasznalo', '2026-02-11 10:05:04', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(83, 'toth.eva_1770804304630a2iq', 'toth.eva@email.com', 'n8raqwsd', 'felhasznalo', '2026-02-11 10:05:04', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(84, 'varga.istvan_177080430463487ac', 'varga.istvan@email.com', 'c38tiam3', 'felhasznalo', '2026-02-11 10:05:04', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(85, 'nagy.peter_177080430478430h9', 'nagy.peter@email.com', 'jz26b0xh', 'felhasznalo', '2026-02-11 10:05:04', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(86, 'kiss.anna_177080430479157mr', 'kiss.anna@email.com', 'wdq6inv2', 'felhasznalo', '2026-02-11 10:05:04', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(87, 'szabo.gabor_177080430479419e9', 'szabo.gabor@email.com', 'xttq5t5m', 'felhasznalo', '2026-02-11 10:05:04', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(88, 'toth.eva_177080430479790jp', 'toth.eva@email.com', 'om8saxoh', 'felhasznalo', '2026-02-11 10:05:04', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(89, 'varga.istvan_17708043048014bjm', 'varga.istvan@email.com', '3n8qo8pn', 'felhasznalo', '2026-02-11 10:05:04', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(90, 'nagy.peter_1770804304952035c', 'nagy.peter@email.com', 'how84cem', 'felhasznalo', '2026-02-11 10:05:04', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(91, 'kiss.anna_1770804304957exd3', 'kiss.anna@email.com', '433trn1b', 'felhasznalo', '2026-02-11 10:05:04', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(92, 'szabo.gabor_1770804304960s0qu', 'szabo.gabor@email.com', '4xahir6d', 'felhasznalo', '2026-02-11 10:05:04', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(93, 'toth.eva_1770804304963ctgq', 'toth.eva@email.com', 'es1snmvk', 'felhasznalo', '2026-02-11 10:05:04', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(94, 'varga.istvan_17708043049683wav', 'varga.istvan@email.com', 'xabb35ao', 'felhasznalo', '2026-02-11 10:05:04', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(95, 'nagy.peter_17708043050979w3g', 'nagy.peter@email.com', 'vp9bkb9a', 'felhasznalo', '2026-02-11 10:05:05', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(96, 'kiss.anna_17708043051017bh9', 'kiss.anna@email.com', 'd9y8todl', 'felhasznalo', '2026-02-11 10:05:05', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(97, 'szabo.gabor_17708043051069zf6', 'szabo.gabor@email.com', '517p3to4', 'felhasznalo', '2026-02-11 10:05:05', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(98, 'toth.eva_1770804305112eztj', 'toth.eva@email.com', 'iuwfipv3', 'felhasznalo', '2026-02-11 10:05:05', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(99, 'varga.istvan_17708043051165ycw', 'varga.istvan@email.com', 'lz1vyiar', 'felhasznalo', '2026-02-11 10:05:05', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(100, 'nagy.peter_1770804305254itwg', 'nagy.peter@email.com', 'mzgl1vlq', 'felhasznalo', '2026-02-11 10:05:05', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(101, 'kiss.anna_17708043052561uox', 'kiss.anna@email.com', 'mit2b6z4', 'felhasznalo', '2026-02-11 10:05:05', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(102, 'szabo.gabor_177080430525831je', 'szabo.gabor@email.com', '8865rmem', 'felhasznalo', '2026-02-11 10:05:05', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(103, 'toth.eva_1770804305260pb6h', 'toth.eva@email.com', 'a69dnunb', 'felhasznalo', '2026-02-11 10:05:05', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(104, 'varga.istvan_17708043052628mon', 'varga.istvan@email.com', 'n9lkw2j8', 'felhasznalo', '2026-02-11 10:05:05', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(105, 'nagy.peter_177080430540181en', 'nagy.peter@email.com', 'vv4cu1ec', 'felhasznalo', '2026-02-11 10:05:05', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(106, 'kiss.anna_1770804305406g9or', 'kiss.anna@email.com', 'g5mch77b', 'felhasznalo', '2026-02-11 10:05:05', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(107, 'szabo.gabor_17708043054100m1s', 'szabo.gabor@email.com', 'aotdnuri', 'felhasznalo', '2026-02-11 10:05:05', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(108, 'toth.eva_1770804305413bha3', 'toth.eva@email.com', '4ct3784q', 'felhasznalo', '2026-02-11 10:05:05', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(109, 'varga.istvan_1770804305420uv8x', 'varga.istvan@email.com', '9jle3bqc', 'felhasznalo', '2026-02-11 10:05:05', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(110, 'nagy.peter_177080430556120ha', 'nagy.peter@email.com', 'w4s8xf8j', 'felhasznalo', '2026-02-11 10:05:05', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(111, 'kiss.anna_1770804305564hssp', 'kiss.anna@email.com', 'g9oquxpa', 'felhasznalo', '2026-02-11 10:05:05', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(112, 'szabo.gabor_17708043055664s58', 'szabo.gabor@email.com', 'h9i3b8ov', 'felhasznalo', '2026-02-11 10:05:05', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(113, 'toth.eva_1770804305567bo4c', 'toth.eva@email.com', 'a5yvih5u', 'felhasznalo', '2026-02-11 10:05:05', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(114, 'varga.istvan_1770804305569sas8', 'varga.istvan@email.com', 'on735cqh', 'felhasznalo', '2026-02-11 10:05:05', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(115, 'nagy.peter_1770804305734nuol', 'nagy.peter@email.com', '7gy7en73', 'felhasznalo', '2026-02-11 10:05:05', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(116, 'kiss.anna_1770804305739yf2n', 'kiss.anna@email.com', 'nx22gjw2', 'felhasznalo', '2026-02-11 10:05:05', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(117, 'szabo.gabor_1770804305745umou', 'szabo.gabor@email.com', 'u2z8npum', 'felhasznalo', '2026-02-11 10:05:05', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(118, 'toth.eva_17708043057498ckd', 'toth.eva@email.com', 'sx3wc20s', 'felhasznalo', '2026-02-11 10:05:05', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(119, 'varga.istvan_1770804305752cgr8', 'varga.istvan@email.com', '36fvm9ep', 'felhasznalo', '2026-02-11 10:05:05', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(120, 'nagy.peter_1770804306026mlre', 'nagy.peter@email.com', 'n4k1rpg6', 'felhasznalo', '2026-02-11 10:05:06', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(121, 'kiss.anna_1770804306027eka8', 'kiss.anna@email.com', 'xkkr6hlc', 'felhasznalo', '2026-02-11 10:05:06', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(122, 'szabo.gabor_1770804306029ojcc', 'szabo.gabor@email.com', 't5jfxq39', 'felhasznalo', '2026-02-11 10:05:06', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(123, 'toth.eva_1770804306031vmi9', 'toth.eva@email.com', '1kbh5dlh', 'felhasznalo', '2026-02-11 10:05:06', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(124, 'varga.istvan_17708043060339f0p', 'varga.istvan@email.com', 'kp4uws6n', 'felhasznalo', '2026-02-11 10:05:06', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(125, 'nagy.peter_1770804306188e8ir', 'nagy.peter@email.com', 'vntcm6um', 'felhasznalo', '2026-02-11 10:05:06', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(126, 'kiss.anna_1770804306192h9bd', 'kiss.anna@email.com', 'ozxvqb3k', 'felhasznalo', '2026-02-11 10:05:06', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(127, 'szabo.gabor_1770804306196f0ba', 'szabo.gabor@email.com', 'de9ew99m', 'felhasznalo', '2026-02-11 10:05:06', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(128, 'toth.eva_1770804306202e34p', 'toth.eva@email.com', '6j9h3pse', 'felhasznalo', '2026-02-11 10:05:06', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(129, 'varga.istvan_17708043062059z2b', 'varga.istvan@email.com', 'tk1arke8', 'felhasznalo', '2026-02-11 10:05:06', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(130, 'nagy.peter_17708043063537i4g', 'nagy.peter@email.com', '1yykbdwn', 'felhasznalo', '2026-02-11 10:05:06', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(131, 'kiss.anna_1770804306358vvb8', 'kiss.anna@email.com', 'ia89z5ma', 'felhasznalo', '2026-02-11 10:05:06', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(132, 'szabo.gabor_1770804306360wske', 'szabo.gabor@email.com', 'ebegbhhh', 'felhasznalo', '2026-02-11 10:05:06', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(133, 'toth.eva_17708043063638gzp', 'toth.eva@email.com', 'smlzmdcg', 'felhasznalo', '2026-02-11 10:05:06', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(134, 'varga.istvan_1770804306365h6jd', 'varga.istvan@email.com', 'ffotqukm', 'felhasznalo', '2026-02-11 10:05:06', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(135, 'nagy.peter_1770804306527lts6', 'nagy.peter@email.com', '46ans41r', 'felhasznalo', '2026-02-11 10:05:06', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(136, 'kiss.anna_1770804306531zmjt', 'kiss.anna@email.com', 'm5ufhna4', 'felhasznalo', '2026-02-11 10:05:06', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(137, 'szabo.gabor_1770804306535fhlq', 'szabo.gabor@email.com', 'llw8evjk', 'felhasznalo', '2026-02-11 10:05:06', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(138, 'toth.eva_1770804306540y46b', 'toth.eva@email.com', '4siu2wyy', 'felhasznalo', '2026-02-11 10:05:06', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(139, 'varga.istvan_17708043065450gzv', 'varga.istvan@email.com', 'jzmbj6pb', 'felhasznalo', '2026-02-11 10:05:06', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(140, 'nagy.peter_1770804306703yfpm', 'nagy.peter@email.com', 'zadl6q6c', 'felhasznalo', '2026-02-11 10:05:06', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(141, 'kiss.anna_177080430670993r8', 'kiss.anna@email.com', '0r5yf8yp', 'felhasznalo', '2026-02-11 10:05:06', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(142, 'szabo.gabor_1770804306712dnc4', 'szabo.gabor@email.com', 'shbeef4d', 'felhasznalo', '2026-02-11 10:05:06', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(143, 'toth.eva_1770804306716ouvb', 'toth.eva@email.com', 'swem5ydk', 'felhasznalo', '2026-02-11 10:05:06', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(144, 'varga.istvan_17708043067197ibm', 'varga.istvan@email.com', 'xjbk6ku1', 'felhasznalo', '2026-02-11 10:05:06', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(145, 'nagy.peter_1770804306884qcat', 'nagy.peter@email.com', 'yhv1qlcj', 'felhasznalo', '2026-02-11 10:05:06', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(146, 'kiss.anna_17708043068873zyj', 'kiss.anna@email.com', 'sqbl3vhi', 'felhasznalo', '2026-02-11 10:05:06', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(147, 'szabo.gabor_177080430689447mt', 'szabo.gabor@email.com', 'k4m2gzvv', 'felhasznalo', '2026-02-11 10:05:06', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(148, 'toth.eva_1770804306897wfr3', 'toth.eva@email.com', 'llne2z77', 'felhasznalo', '2026-02-11 10:05:06', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(149, 'varga.istvan_1770804306900xypt', 'varga.istvan@email.com', '8kl8i07h', 'felhasznalo', '2026-02-11 10:05:06', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(150, 'nagy.peter_177080430705854s8', 'nagy.peter@email.com', '3427gcjn', 'felhasznalo', '2026-02-11 10:05:07', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(151, 'kiss.anna_1770804307063x9ck', 'kiss.anna@email.com', 'p7az316k', 'felhasznalo', '2026-02-11 10:05:07', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(152, 'szabo.gabor_1770804307065ajne', 'szabo.gabor@email.com', 'zpcib8vv', 'felhasznalo', '2026-02-11 10:05:07', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(153, 'toth.eva_1770804307068o2tn', 'toth.eva@email.com', 'osa0urc2', 'felhasznalo', '2026-02-11 10:05:07', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(154, 'varga.istvan_1770804307071v28c', 'varga.istvan@email.com', 'i3md95lu', 'felhasznalo', '2026-02-11 10:05:07', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(155, 'nagy.peter_1770804307241r2ak', 'nagy.peter@email.com', 'g4xez621', 'felhasznalo', '2026-02-11 10:05:07', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(156, 'kiss.anna_17708043072452yuh', 'kiss.anna@email.com', 'tu2xjp2p', 'felhasznalo', '2026-02-11 10:05:07', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(157, 'szabo.gabor_17708043072483cxu', 'szabo.gabor@email.com', 'zhc4pdln', 'felhasznalo', '2026-02-11 10:05:07', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(158, 'toth.eva_1770804307252xg2k', 'toth.eva@email.com', 'y8mc9r3d', 'felhasznalo', '2026-02-11 10:05:07', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(159, 'varga.istvan_17708043072562sbt', 'varga.istvan@email.com', 'rj4vmufp', 'felhasznalo', '2026-02-11 10:05:07', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(160, 'nagy.peter_17708043074097m1j', 'nagy.peter@email.com', 'eiplo1cp', 'felhasznalo', '2026-02-11 10:05:07', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(161, 'kiss.anna_1770804307414jl4l', 'kiss.anna@email.com', '5d9l02lw', 'felhasznalo', '2026-02-11 10:05:07', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(162, 'szabo.gabor_1770804307418vbsl', 'szabo.gabor@email.com', 'wfae8tfu', 'felhasznalo', '2026-02-11 10:05:07', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(163, 'toth.eva_1770804307421ut77', 'toth.eva@email.com', 'ccwk29j2', 'felhasznalo', '2026-02-11 10:05:07', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(164, 'varga.istvan_1770804307424bfkp', 'varga.istvan@email.com', 'syroad4c', 'felhasznalo', '2026-02-11 10:05:07', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(165, 'nagy.peter_1770804307582f93g', 'nagy.peter@email.com', 'vdsldl5c', 'felhasznalo', '2026-02-11 10:05:07', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(166, 'kiss.anna_1770804307585jsab', 'kiss.anna@email.com', 'l8sw5eaf', 'felhasznalo', '2026-02-11 10:05:07', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(167, 'szabo.gabor_17708043075875mlf', 'szabo.gabor@email.com', '7kqm0s4c', 'felhasznalo', '2026-02-11 10:05:07', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(168, 'toth.eva_1770804307589piub', 'toth.eva@email.com', '1jli41hs', 'felhasznalo', '2026-02-11 10:05:07', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(169, 'varga.istvan_177080430759139a7', 'varga.istvan@email.com', '87ycm0jl', 'felhasznalo', '2026-02-11 10:05:07', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(170, 'nagy.peter_1770804307738vruq', 'nagy.peter@email.com', 't71akbw5', 'felhasznalo', '2026-02-11 10:05:07', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(171, 'kiss.anna_17708043077444xls', 'kiss.anna@email.com', 'qta3iu6p', 'felhasznalo', '2026-02-11 10:05:07', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(172, 'szabo.gabor_177080430774714td', 'szabo.gabor@email.com', 'ktut5igd', 'felhasznalo', '2026-02-11 10:05:07', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(173, 'toth.eva_1770804307750lync', 'toth.eva@email.com', '406e8dnk', 'felhasznalo', '2026-02-11 10:05:07', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(174, 'varga.istvan_17708043077538mu5', 'varga.istvan@email.com', '9z0pg0gg', 'felhasznalo', '2026-02-11 10:05:07', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(175, 'nagy.peter_1770804307907pa3h', 'nagy.peter@email.com', 'm63jozgv', 'felhasznalo', '2026-02-11 10:05:07', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(176, 'kiss.anna_17708043079113dse', 'kiss.anna@email.com', 'bx2bwqo7', 'felhasznalo', '2026-02-11 10:05:07', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(177, 'szabo.gabor_17708043079157mvr', 'szabo.gabor@email.com', '2d0bgbki', 'felhasznalo', '2026-02-11 10:05:07', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(178, 'toth.eva_17708043079193dbf', 'toth.eva@email.com', '125p7bkv', 'felhasznalo', '2026-02-11 10:05:07', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(179, 'varga.istvan_17708043079237hr8', 'varga.istvan@email.com', 'qg8g64z6', 'felhasznalo', '2026-02-11 10:05:07', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(180, 'nagy.peter_17708043080751taf', 'nagy.peter@email.com', '7us6i39q', 'felhasznalo', '2026-02-11 10:05:08', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(181, 'kiss.anna_1770804308079kekm', 'kiss.anna@email.com', 'a480bb7x', 'felhasznalo', '2026-02-11 10:05:08', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(182, 'szabo.gabor_1770804308083clvq', 'szabo.gabor@email.com', 'uobxuur9', 'felhasznalo', '2026-02-11 10:05:08', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(183, 'toth.eva_1770804308086vnve', 'toth.eva@email.com', '5wudj0g9', 'felhasznalo', '2026-02-11 10:05:08', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(184, 'varga.istvan_1770804308088tvaa', 'varga.istvan@email.com', '0p2wcudf', 'felhasznalo', '2026-02-11 10:05:08', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(185, 'nagy.peter_1770804308175e4wl', 'nagy.peter@email.com', '929ligq8', 'felhasznalo', '2026-02-11 10:05:08', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(186, 'kiss.anna_17708043081793f7q', 'kiss.anna@email.com', 'jj87njnn', 'felhasznalo', '2026-02-11 10:05:08', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(187, 'szabo.gabor_1770804308181afv8', 'szabo.gabor@email.com', '1zhwonwd', 'felhasznalo', '2026-02-11 10:05:08', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(188, 'toth.eva_17708043081849x6f', 'toth.eva@email.com', '5tv1cd4w', 'felhasznalo', '2026-02-11 10:05:08', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(189, 'varga.istvan_1770804308187d7gm', 'varga.istvan@email.com', 'dw441b1c', 'felhasznalo', '2026-02-11 10:05:08', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(190, 'nagy.peter_1770804308449omri', 'nagy.peter@email.com', '4b4xipsk', 'felhasznalo', '2026-02-11 10:05:08', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(191, 'kiss.anna_1770804308464g7cs', 'kiss.anna@email.com', 'x3eqkrv9', 'felhasznalo', '2026-02-11 10:05:08', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(192, 'szabo.gabor_1770804308470i1v8', 'szabo.gabor@email.com', 'lbbuqsbc', 'felhasznalo', '2026-02-11 10:05:08', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(193, 'toth.eva_1770804308473inmd', 'toth.eva@email.com', '6955tuxr', 'felhasznalo', '2026-02-11 10:05:08', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(194, 'varga.istvan_1770804308477k0ps', 'varga.istvan@email.com', 'tb5srri7', 'felhasznalo', '2026-02-11 10:05:08', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(195, 'nagy.peter_1770804308624u5n4', 'nagy.peter@email.com', 'fo5mufid', 'felhasznalo', '2026-02-11 10:05:08', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(196, 'kiss.anna_1770804308628axda', 'kiss.anna@email.com', 'fmeruepj', 'felhasznalo', '2026-02-11 10:05:08', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(197, 'szabo.gabor_1770804308633csmv', 'szabo.gabor@email.com', '2sb0dpm6', 'felhasznalo', '2026-02-11 10:05:08', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(198, 'toth.eva_1770804308636rz7f', 'toth.eva@email.com', 'rhfl7221', 'felhasznalo', '2026-02-11 10:05:08', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(199, 'varga.istvan_17708043086396ttt', 'varga.istvan@email.com', '15wrlwof', 'felhasznalo', '2026-02-11 10:05:08', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(200, 'nagy.peter_1770804308813c8v4', 'nagy.peter@email.com', 'mpcaawcy', 'felhasznalo', '2026-02-11 10:05:08', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(201, 'kiss.anna_1770804308818susb', 'kiss.anna@email.com', '4no63buc', 'felhasznalo', '2026-02-11 10:05:08', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(202, 'szabo.gabor_17708043088231isn', 'szabo.gabor@email.com', 'vubhk2ls', 'felhasznalo', '2026-02-11 10:05:08', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(203, 'toth.eva_17708043088279oal', 'toth.eva@email.com', '8lcfjrmi', 'felhasznalo', '2026-02-11 10:05:08', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(204, 'varga.istvan_17708043088329lfp', 'varga.istvan@email.com', 'sc2w3g7j', 'felhasznalo', '2026-02-11 10:05:08', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(205, 'nagy.peter_1770804308985qj1k', 'nagy.peter@email.com', 'hn161xuk', 'felhasznalo', '2026-02-11 10:05:08', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(206, 'kiss.anna_1770804308989d1wl', 'kiss.anna@email.com', '2nr2nwai', 'felhasznalo', '2026-02-11 10:05:08', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(207, 'szabo.gabor_1770804308990p5jj', 'szabo.gabor@email.com', '01uxgmlo', 'felhasznalo', '2026-02-11 10:05:08', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(208, 'toth.eva_1770804308991d226', 'toth.eva@email.com', 'yr8kj0fn', 'felhasznalo', '2026-02-11 10:05:08', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(209, 'varga.istvan_177080430899233g3', 'varga.istvan@email.com', '4wrc4jtv', 'felhasznalo', '2026-02-11 10:05:08', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(210, 'nagy.peter_1770804309174na6l', 'nagy.peter@email.com', 'dkts7mph', 'felhasznalo', '2026-02-11 10:05:09', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(211, 'kiss.anna_1770804309178bnxa', 'kiss.anna@email.com', 'jwlu5tlg', 'felhasznalo', '2026-02-11 10:05:09', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(212, 'szabo.gabor_1770804309182j07d', 'szabo.gabor@email.com', 'h720lcr7', 'felhasznalo', '2026-02-11 10:05:09', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(213, 'toth.eva_1770804309186m52b', 'toth.eva@email.com', 'b1geb9nb', 'felhasznalo', '2026-02-11 10:05:09', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(214, 'varga.istvan_1770804309190p848', 'varga.istvan@email.com', 'bcaa60no', 'felhasznalo', '2026-02-11 10:05:09', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(215, 'nagy.peter_1770804309374fcie', 'nagy.peter@email.com', '9ego1uus', 'felhasznalo', '2026-02-11 10:05:09', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(216, 'kiss.anna_1770804309378wg7i', 'kiss.anna@email.com', 'prask63e', 'felhasznalo', '2026-02-11 10:05:09', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(217, 'szabo.gabor_1770804309381sm8g', 'szabo.gabor@email.com', 'nnox778s', 'felhasznalo', '2026-02-11 10:05:09', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(218, 'toth.eva_17708043093865ymb', 'toth.eva@email.com', '5n9ti0ce', 'felhasznalo', '2026-02-11 10:05:09', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(219, 'varga.istvan_1770804309389zxum', 'varga.istvan@email.com', 'luzokuej', 'felhasznalo', '2026-02-11 10:05:09', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(220, 'nagy.peter_1770804309554bysp', 'nagy.peter@email.com', 'oemlj00n', 'felhasznalo', '2026-02-11 10:05:09', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(221, 'kiss.anna_1770804309559bpxb', 'kiss.anna@email.com', '0qcewr4m', 'felhasznalo', '2026-02-11 10:05:09', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(222, 'szabo.gabor_1770804309562dwjv', 'szabo.gabor@email.com', 'qaragmvl', 'felhasznalo', '2026-02-11 10:05:09', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(223, 'toth.eva_1770804309565hr2r', 'toth.eva@email.com', 'rbvkrr4e', 'felhasznalo', '2026-02-11 10:05:09', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(224, 'varga.istvan_1770804309569l1f9', 'varga.istvan@email.com', 'x3mrgdff', 'felhasznalo', '2026-02-11 10:05:09', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(225, 'nagy.peter_17708043097300h5e', 'nagy.peter@email.com', 'dxdb80yc', 'felhasznalo', '2026-02-11 10:05:09', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(226, 'kiss.anna_177080430973412w4', 'kiss.anna@email.com', 'lkjh7w1t', 'felhasznalo', '2026-02-11 10:05:09', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(227, 'szabo.gabor_1770804309737h15k', 'szabo.gabor@email.com', 'acwtxw93', 'felhasznalo', '2026-02-11 10:05:09', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(228, 'toth.eva_1770804309740jxdj', 'toth.eva@email.com', 'yt16j5jm', 'felhasznalo', '2026-02-11 10:05:09', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(229, 'varga.istvan_1770804309745ykz8', 'varga.istvan@email.com', 'g7hs7ei2', 'felhasznalo', '2026-02-11 10:05:09', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(230, 'nagy.peter_1770804309912hm2g', 'nagy.peter@email.com', 'ckd45rdb', 'felhasznalo', '2026-02-11 10:05:09', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(231, 'kiss.anna_1770804309915fx1v', 'kiss.anna@email.com', 'vszcqmpr', 'felhasznalo', '2026-02-11 10:05:09', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(232, 'szabo.gabor_1770804309918a3eh', 'szabo.gabor@email.com', 'xp6ujqs2', 'felhasznalo', '2026-02-11 10:05:09', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(233, 'toth.eva_1770804309920wuf9', 'toth.eva@email.com', '42e5408w', 'felhasznalo', '2026-02-11 10:05:09', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(234, 'varga.istvan_1770804309921xgkb', 'varga.istvan@email.com', '2ey4rul5', 'felhasznalo', '2026-02-11 10:05:09', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(235, 'nagy.peter_17708043100823xgi', 'nagy.peter@email.com', '8vb4imqe', 'felhasznalo', '2026-02-11 10:05:10', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(236, 'kiss.anna_1770804310086x5i5', 'kiss.anna@email.com', 'fb7yfnaf', 'felhasznalo', '2026-02-11 10:05:10', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(237, 'szabo.gabor_1770804310090o1sw', 'szabo.gabor@email.com', 'jfpemiku', 'felhasznalo', '2026-02-11 10:05:10', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(238, 'toth.eva_17708043100934e25', 'toth.eva@email.com', '1q0g873i', 'felhasznalo', '2026-02-11 10:05:10', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(239, 'varga.istvan_17708043100972uwp', 'varga.istvan@email.com', 'i061x5hf', 'felhasznalo', '2026-02-11 10:05:10', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(240, 'nagy.peter_1770804310269pnun', 'nagy.peter@email.com', '113p826d', 'felhasznalo', '2026-02-11 10:05:10', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(241, 'kiss.anna_1770804310272jxbb', 'kiss.anna@email.com', '0rcwjr6b', 'felhasznalo', '2026-02-11 10:05:10', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(242, 'szabo.gabor_1770804310275dl28', 'szabo.gabor@email.com', 'ofujc0sd', 'felhasznalo', '2026-02-11 10:05:10', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(243, 'toth.eva_1770804310278qrw4', 'toth.eva@email.com', 'pqzoyslm', 'felhasznalo', '2026-02-11 10:05:10', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(244, 'varga.istvan_1770804310281q77p', 'varga.istvan@email.com', '95qxcwjl', 'felhasznalo', '2026-02-11 10:05:10', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(245, 'nagy.peter_1770804310461181f', 'nagy.peter@email.com', 'yxuo5th5', 'felhasznalo', '2026-02-11 10:05:10', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(246, 'kiss.anna_1770804310464jmz7', 'kiss.anna@email.com', 'k1wmh476', 'felhasznalo', '2026-02-11 10:05:10', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(247, 'szabo.gabor_17708043104665x7a', 'szabo.gabor@email.com', 'oyn0dbeo', 'felhasznalo', '2026-02-11 10:05:10', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(248, 'toth.eva_1770804310469ohof', 'toth.eva@email.com', '1p1dwmpa', 'felhasznalo', '2026-02-11 10:05:10', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(249, 'varga.istvan_1770804310472xjci', 'varga.istvan@email.com', 'qbskgtam', 'felhasznalo', '2026-02-11 10:05:10', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(250, 'nagy.peter_1770804310655m2bj', 'nagy.peter@email.com', '357u2hgu', 'felhasznalo', '2026-02-11 10:05:10', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(251, 'kiss.anna_1770804310658n6h8', 'kiss.anna@email.com', 'ffr0zygv', 'felhasznalo', '2026-02-11 10:05:10', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(252, 'szabo.gabor_1770804310661cuxs', 'szabo.gabor@email.com', 'rxu5i1dt', 'felhasznalo', '2026-02-11 10:05:10', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(253, 'toth.eva_177080431066448az', 'toth.eva@email.com', '0f0q2nuh', 'felhasznalo', '2026-02-11 10:05:10', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(254, 'varga.istvan_17708043106650og9', 'varga.istvan@email.com', 'ume765mh', 'felhasznalo', '2026-02-11 10:05:10', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(255, 'nagy.peter_1770804310821zmvf', 'nagy.peter@email.com', '8qw59n6e', 'felhasznalo', '2026-02-11 10:05:10', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(256, 'kiss.anna_17708043108264t4k', 'kiss.anna@email.com', 'jwhkgggd', 'felhasznalo', '2026-02-11 10:05:10', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(257, 'szabo.gabor_1770804310832530x', 'szabo.gabor@email.com', 'q5uq5fog', 'felhasznalo', '2026-02-11 10:05:10', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(258, 'toth.eva_177080431083506ww', 'toth.eva@email.com', 'y7bomg5m', 'felhasznalo', '2026-02-11 10:05:10', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(259, 'varga.istvan_1770804310838xwqf', 'varga.istvan@email.com', 'isaceqd6', 'felhasznalo', '2026-02-11 10:05:10', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(260, 'nagy.peter_17708043109940q0t', 'nagy.peter@email.com', '9sso8ito', 'felhasznalo', '2026-02-11 10:05:10', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL);
INSERT INTO `felhasznalo` (`idfelhasznalo`, `felhasznalonev`, `email`, `jelszo`, `szerepkor`, `regisztracio_datum`, `nev`, `aktiv`, `utolso_belepes`, `bio`, `avatar`, `favoriteGenres`, `preferredPlatforms`, `country`, `birthYear`, `discord`, `twitter`, `youtube`, `twitch`) VALUES
(261, 'kiss.anna_1770804310997oqnb', 'kiss.anna@email.com', 'hl7k9o2b', 'felhasznalo', '2026-02-11 10:05:10', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(262, 'szabo.gabor_1770804310998xk2d', 'szabo.gabor@email.com', '9tnayd7w', 'felhasznalo', '2026-02-11 10:05:10', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(263, 'toth.eva_1770804311000be49', 'toth.eva@email.com', 'cd7jrmlj', 'felhasznalo', '2026-02-11 10:05:11', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(264, 'varga.istvan_1770804311002z5b2', 'varga.istvan@email.com', '2u6qhxp5', 'felhasznalo', '2026-02-11 10:05:11', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(265, 'nagy.peter_17708043111727exl', 'nagy.peter@email.com', 'tucph3ub', 'felhasznalo', '2026-02-11 10:05:11', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(266, 'kiss.anna_177080431117659ph', 'kiss.anna@email.com', 'oi8y7yag', 'felhasznalo', '2026-02-11 10:05:11', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(267, 'szabo.gabor_1770804311180jfjl', 'szabo.gabor@email.com', 'lzl2x587', 'felhasznalo', '2026-02-11 10:05:11', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(268, 'toth.eva_1770804311185jjmv', 'toth.eva@email.com', 'oxh1tja4', 'felhasznalo', '2026-02-11 10:05:11', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(269, 'varga.istvan_1770804311188ok9w', 'varga.istvan@email.com', '9ktn83fw', 'felhasznalo', '2026-02-11 10:05:11', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(270, 'nagy.peter_1770804311362tnrt', 'nagy.peter@email.com', 'nprg2zcq', 'felhasznalo', '2026-02-11 10:05:11', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(271, 'kiss.anna_17708043113659nze', 'kiss.anna@email.com', 'lp394ski', 'felhasznalo', '2026-02-11 10:05:11', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(272, 'szabo.gabor_1770804311368jsz7', 'szabo.gabor@email.com', 'sz6r7ba8', 'felhasznalo', '2026-02-11 10:05:11', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(273, 'toth.eva_1770804311370yr48', 'toth.eva@email.com', 'g2dd7cev', 'felhasznalo', '2026-02-11 10:05:11', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(274, 'varga.istvan_1770804311372af4a', 'varga.istvan@email.com', 'c6jzspvi', 'felhasznalo', '2026-02-11 10:05:11', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(275, 'nagy.peter_1770804311543tmwv', 'nagy.peter@email.com', '8iyinacf', 'felhasznalo', '2026-02-11 10:05:11', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(276, 'kiss.anna_177080431154674k4', 'kiss.anna@email.com', '1t6gfu8k', 'felhasznalo', '2026-02-11 10:05:11', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(277, 'szabo.gabor_1770804311549zxtj', 'szabo.gabor@email.com', 'i52b2pig', 'felhasznalo', '2026-02-11 10:05:11', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(278, 'toth.eva_1770804311552bya6', 'toth.eva@email.com', '5410k1wu', 'felhasznalo', '2026-02-11 10:05:11', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(279, 'varga.istvan_17708043115551skb', 'varga.istvan@email.com', '7s7l9f5t', 'felhasznalo', '2026-02-11 10:05:11', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(280, 'nagy.peter_1770804311732xx0j', 'nagy.peter@email.com', 'kaw6siqk', 'felhasznalo', '2026-02-11 10:05:11', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(281, 'kiss.anna_1770804311735ncdb', 'kiss.anna@email.com', 'd7w5ri1r', 'felhasznalo', '2026-02-11 10:05:11', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(282, 'szabo.gabor_1770804311738cqty', 'szabo.gabor@email.com', 'w8w66cy4', 'felhasznalo', '2026-02-11 10:05:11', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(283, 'toth.eva_1770804311740y2rp', 'toth.eva@email.com', 'sy7g5acf', 'felhasznalo', '2026-02-11 10:05:11', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(284, 'varga.istvan_1770804311743u4q5', 'varga.istvan@email.com', 'f4hexpxh', 'felhasznalo', '2026-02-11 10:05:11', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(285, 'nagy.peter_17708043119015bwe', 'nagy.peter@email.com', 'zfrcfde8', 'felhasznalo', '2026-02-11 10:05:11', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(286, 'kiss.anna_1770804311906mp7n', 'kiss.anna@email.com', 'y7zamz3a', 'felhasznalo', '2026-02-11 10:05:11', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(287, 'szabo.gabor_1770804311911wqw4', 'szabo.gabor@email.com', '3mrpvmli', 'felhasznalo', '2026-02-11 10:05:11', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(288, 'toth.eva_1770804311914v0fi', 'toth.eva@email.com', 'g7n6cvk5', 'felhasznalo', '2026-02-11 10:05:11', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(289, 'varga.istvan_1770804311916abz5', 'varga.istvan@email.com', '9cpxqn3j', 'felhasznalo', '2026-02-11 10:05:11', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(290, 'nagy.peter_17708043121775evg', 'nagy.peter@email.com', 'hu2afn7k', 'felhasznalo', '2026-02-11 10:05:12', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(291, 'kiss.anna_1770804312179yarm', 'kiss.anna@email.com', 'b6u27qab', 'felhasznalo', '2026-02-11 10:05:12', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(292, 'szabo.gabor_1770804312181rz9i', 'szabo.gabor@email.com', 'c1muq988', 'felhasznalo', '2026-02-11 10:05:12', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(293, 'toth.eva_1770804312184xt65', 'toth.eva@email.com', 's9zfjvdl', 'felhasznalo', '2026-02-11 10:05:12', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(294, 'varga.istvan_1770804312186v0pe', 'varga.istvan@email.com', 'f7zu592f', 'felhasznalo', '2026-02-11 10:05:12', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(295, 'nagy.peter_1770804312368np0f', 'nagy.peter@email.com', '13y8k4vj', 'felhasznalo', '2026-02-11 10:05:12', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(296, 'kiss.anna_1770804312373s6bk', 'kiss.anna@email.com', '3z94hexn', 'felhasznalo', '2026-02-11 10:05:12', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(297, 'szabo.gabor_177080431237602o8', 'szabo.gabor@email.com', '5i4sladk', 'felhasznalo', '2026-02-11 10:05:12', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(298, 'toth.eva_1770804312379cj66', 'toth.eva@email.com', 'ld8m2x1r', 'felhasznalo', '2026-02-11 10:05:12', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(299, 'varga.istvan_17708043123824w8v', 'varga.istvan@email.com', 'uzc18rz9', 'felhasznalo', '2026-02-11 10:05:12', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(300, 'nagy.peter_1770804312905p6cb', 'nagy.peter@email.com', 'm6g9r9t7', 'felhasznalo', '2026-02-11 10:05:12', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(301, 'kiss.anna_17708043129190ngr', 'kiss.anna@email.com', '3n76ydpp', 'felhasznalo', '2026-02-11 10:05:12', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(302, 'szabo.gabor_1770804312922sbye', 'szabo.gabor@email.com', 'vup7gcln', 'felhasznalo', '2026-02-11 10:05:12', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(303, 'toth.eva_1770804312925o2q3', 'toth.eva@email.com', '8jnksrzl', 'felhasznalo', '2026-02-11 10:05:12', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(304, 'varga.istvan_1770804312928dqhp', 'varga.istvan@email.com', 'cbxlmkr9', 'felhasznalo', '2026-02-11 10:05:12', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL),
(305, 'nagy.peter_1770804313570cqki', 'nagy.peter@email.com', 'qhp31hoi', 'felhasznalo', '2026-02-11 10:05:13', 'Nagy Péter', 1, NULL, NULL, NULL, NULL, NULL, NULL, 22, NULL, NULL, NULL, NULL),
(306, 'kiss.anna_1770804313582n6cw', 'kiss.anna@email.com', 'hmdqclqf', 'felhasznalo', '2026-02-11 10:05:13', 'Kiss Anna', 1, NULL, NULL, NULL, NULL, NULL, NULL, 21, NULL, NULL, NULL, NULL),
(307, 'szabo.gabor_17708043135876hgf', 'szabo.gabor@email.com', 'tnjsamnu', 'felhasznalo', '2026-02-11 10:05:13', 'Szabó Gábor', 1, NULL, NULL, NULL, NULL, NULL, NULL, 23, NULL, NULL, NULL, NULL),
(308, 'toth.eva_1770804313592ixsh', 'toth.eva@email.com', '4fjrz9o4', 'felhasznalo', '2026-02-11 10:05:13', 'Tóth Éva', 1, NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL),
(309, 'varga.istvan_1770804313595t4rf', 'varga.istvan@email.com', 'oe22j7pd', 'felhasznalo', '2026-02-11 10:05:13', 'Varga István', 1, NULL, NULL, NULL, NULL, NULL, NULL, 24, NULL, NULL, NULL, NULL);

--
-- Eseményindítók `felhasznalo`
--
DELIMITER $$
CREATE TRIGGER `update_user_login` AFTER UPDATE ON `felhasznalo` FOR EACH ROW BEGIN
    IF NEW.utolso_belepes != OLD.utolso_belepes THEN
        UPDATE felhasznalo 
        SET utolso_belepes = CURRENT_TIMESTAMP 
        WHERE idfelhasznalo = NEW.idfelhasznalo;
    END IF;
END
$$
DELIMITER ;

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

--
-- A tábla adatainak kiíratása `game_collection`
--

INSERT INTO `game_collection` (`id`, `idfelhasznalo`, `idjatekok`, `status`, `rating`, `notes`, `added_at`, `updated_at`) VALUES
(1, 3, 1, 'owned', NULL, NULL, '2026-02-04 07:49:52', '2026-02-04 07:49:52'),
(2, 4, 1, 'owned', NULL, NULL, '2026-02-11 08:06:27', '2026-02-11 08:06:27');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekextra`
--

CREATE TABLE `jatekextra` (
  `idjatekok` int(11) NOT NULL,
  `megjelenes` varchar(100) NOT NULL,
  `steam_link` varchar(500) NOT NULL,
  `jatek_elmeny` varchar(255) DEFAULT NULL,
  `reszletes_leiras` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `jatekextra`
--

INSERT INTO `jatekextra` (`idjatekok`, `megjelenes`, `steam_link`, `jatek_elmeny`, `reszletes_leiras`) VALUES
(1, '2023-09-27', 'https://store.steampowered.com/app/730/', 'Feszes, kompetitív élmény, ahol az economy és a csapatutility ugyanannyira számít, mint a célzás. A legjobb pillanatok azok, amikor egy kör „tankönyvszerűen” lemegy: jó info, jó rotate, tiszta belépés, stabil utójáték. Ha szereted a rangsorolt versenyhang', 'Counter-Strike 2 extra rétege ott kezdődik, hogy a játék nem próbál mindenkit ugyanúgy kiszolgálni, hanem egy nagyon világos szabályrendszerben kéri a tudatos játékot. A kör elején a cél többnyire nem a hősködés, hanem a kontroll megszerzése: olyan pozíciók elfoglalása, amelyekből információt nyersz és reakcióidőt adsz a csapatnak. A középjátékban az ellenfél szándékának olvasása a kulcs: mennyi utilityt használtak, hol láttad őket utoljára, és mennyire valószínű a gyors rotáció. A kör vége gyakran a fegyelmen múlik: ne add el az előnyt felesleges peekkel, figyelj a trade lehetőségekre, és számolj az idővel (plant/defuse).\r\n\r\nA CS2-ben az apró dolgok nagy különbséget csinálnak. Egy plusz 2 másodperc türelem egy szögben, egy jobb füst időzítés, vagy egy okos visszalépés többet érhet, mint egy látványos frag. Az is nagy előny, ha a csapatnak vannak egyszerű, újrahasznosítható tervei: például „A default”, „B split”, „mid control → late execute”. Nem kell minden körben új stratégiát kitalálni; az a lényeg, hogy legyen egy stabil alap, amit az információk alapján módosítotok. A gyakorlás legjobb formája ezért a pályaspecifikus rutin: pár smoke, pár belépési út, és a kommunikáció fegyelmezése.\r\n\r\nHa a célod a fejlődés, állíts fel mérhető fókuszt: 1) crosshair placement és mozgás, 2) utility alapok, 3) döntéshozatal (mikro: peek/hold; makro: rotate/eco). A játék olyan, mint egy kompetitív sport: a jó szokások (trade, fegyelem, info) hosszú távon kiemelnek, a rossz szokások (kapkodás, felesleges fight) pedig visszahúznak. Ezért tölti ki könnyen „fél oldalt” a részletes leírás: mert a CS2 valódi ereje a mélységben van.'),
(2, '2013-07-09', 'https://store.steampowered.com/app/570/', 'A játék legerősebb része a csapatjáték: ha van 1-2 ismerős, akikkel rendszeresen játszol, sokkal gyorsabban áll össze a stratégia és élvezetesebb a fejlődés. A legjobb meccsek azok, ahol a map kontroll, a vision és a csapatharcok egy terv részei, nem csak', 'ta 2-ben az „extra” valójában az, hogy a játék nem csak mechanika, hanem információmenedzsment is. A wardolás nem egy kötelező teher, hanem a csapat szeme: jó visionnel előre látod a gankeket, biztonságosabb a farm, és te választod meg, hol legyen a következő fight. A Roshan körüli játék (időzítés, terület, smoke, buyback) külön mini-játék a meccsben, és sokszor ez dönti el a végjátékot. A buyback rendszer miatt a „meccs vége” sosem teljesen biztos: egy rossz highground push visszaüthet, ezért a fegyelmezett döntések és az objektív fókusz óriási érték.\r\n\r\nA hősök közötti szinergia és counterek is rengeteg variációt adnak. Nem csak arról van szó, hogy „melyik hős erős”, hanem arról is, hogy a csapatod kompozíciója mit tud: van-e initiation, van-e burst, van-e sustain, tudtok-e tornyot ütni, és milyen gyorsan skáláztok. Ha ezt megtanulod olvasni, a draft és a játék közbeni item döntések sokkal tudatosabbak lesznek. Például egy extra dispel item vagy egy időben megvett BKB teljesen átírhatja a csapatharcot.\r\n\r\nTanuláshoz a legjobb módszer, ha „kicsiben” kezdesz: játszol pár egyszerűbb, világos szerepű hőst, figyeled a minimapot, és célokat tűzöl ki (pl. 10 percig ne halj meg feleslegesen, 15 percre legyen meg a core item, 20 perc körül legyen legalább 2 objektív). A Dota 2 ettől lesz igazán jó: mert amikor a csapatod együtt gondolkodik, a győzelem nem csak gyors reflex, hanem közös terv eredménye.'),
(3, '2022-02-25', 'https://store.steampowered.com/app/1245620/', 'Az ELDEN RING akkor a legjobb, amikor nem „kipipálni” akarod, hanem felfedezni: a játék folyamatosan jutalmazza, ha letérsz az útról, és nem félsz más megoldásokat kipróbálni. A kihívás magas, de a szabadság miatt mindig van „okos” út: új felszerelés, más', 'extra réteget a felkészülés és a tudatos útvonalválasztás adja. Egy területet nem csak végigrohansz, hanem megfigyeled: hol vannak a veszélyes ellenfelek, melyik ponton érdemes előbb tisztítani, és hol lehet biztonságosabban visszavonulni. A build fejlesztése közben érdemes prioritásokat tartani: a túlélhetőség (Vigor) sokkal több hibát enged meg, és ettől a harc tanulhatóbb lesz. A fegyverfejlesztés az egyik legjobb „befektetés”, mert közvetlen sebzésnövekedést ad, így nem kell órákig szinteket farmolni. A spirit ash rendszer pedig lehetőséget ad arra, hogy bizonyos bossokat és encountereket más tempóban játssz: a figyelem megoszlik, te pedig tisztábban látod a támadásmintát.\r\n\r\nA bossoknál az extra tipp az, hogy ne csak a „győzelemre” figyelj, hanem a megértésre: egy próbálkozás lehet sikeres akkor is, ha csak azt tanulod meg, melyik támadás után van biztos büntető ablak, és mikor kell feltétlenül távolságot tartani. Ha ezt a hozzáállást veszed fel, a játék kevésbé frusztráló, és sokkal inkább egy fejlődési folyamat lesz. A nyílt világ ezt támogatja: bármikor dönthetsz úgy, hogy másik irányba mész, másik dungeonben szerzel upgrade-et, és később visszajössz.\r\n\r\nVégül: az ELDEN RING „fél oldalnyi” extra leírása azért indokolt, mert az élmény nem csak a harcról szól. A felfedezés, a hangulat, a tájképek, a rejtett történetdarabok és a build-kísérletezés együtt adja azt az érzést, hogy a játékban mindig van még egy titok, egy új út, vagy egy új ötlet, ami megéri a következő órát.'),
(4, '2023-08-03', 'https://store.steampowered.com/app/1086940/', 'A játék élménye akkor a legerősebb, ha nem sietsz: beszélgetsz, kipróbálsz alternatív megoldásokat, és hagyod, hogy a következmények „éljenek”. A harc taktikus és kreatív, a sztori pedig végig motivál, mert a karakterek és a döntések személyesnek érződnek', 'BG3 extra része abban van, hogy a játék folyamatosan visszaadja az irányítást a játékosnak. Egy helyzetet nem csak „végigküzdesz”, hanem megtervezhetsz: lopakodsz, pozíciót fogsz, csapdát állítasz, vagy épp tárgyalsz. Sok küldetésnél többféle út vezet célhoz, és ezek tényleg más élményt adnak; ez a rendszer ritka erősség. A csapatdinamika is fontos: a társak nem csak statok, hanem személyiségek, akik reagálnak a döntéseidre, és ezzel együtt változnak a kapcsolatok, a dialógusok és néha az egész történet iránya.\r\n\r\nA taktikai harcban az extra trükk az, hogy a „biztos” megoldás helyett sokszor a kreatív a jobb. Egy jól elhelyezett kontroll spell, egy reakció okos használata, vagy a terep manipulálása (magasság, szűk átjáró, csúszós felület) sokkal többet ér, mint a puszta sebzés. A koncentrációs varázslatok menedzselése külön mini-játék: tudnod kell, mikor érdemes kockáztatni a fenntartást, és mikor kell inkább biztosra menni. Ha ezt megtanulod, a harc kevésbé „dobókocka-szerencse”, és sokkal inkább egy stratégiai feladvány.\r\n\r\nA fejlődés során az extra tartalom a build-szabadság: többféle csapatot lehet összeállítani, és a játék ezt nem bünteti, hanem támogatja. Emiatt érdemes kísérletezni: egy új feat vagy spell nem csak erősebbé tesz, hanem új megoldási útvonalakat nyit. Ha pedig kooperatív módban játszol, még nagyobb lesz az élmény, mert a döntéseket és a harcot is közösen alakítjátok, és a „káosz” sokszor viccesen emlékezetes helyzeteket szül.'),
(6, '2020-12-10', 'https://store.steampowered.com/app/1091500/', 'A játék élménye akkor a legjobb, ha a buildedet tudatosan felépíted, és nem csak a fő sztorit „letolod”, hanem a karakterközpontú mellékszálakat is végigjátszod. Night City erősen atmoszférikus, és a különböző megközelítések (hack/stealth/gunplay) miatt s', 'Cyberpunk 2077 extra rétegét a felkészülés és a „megközelítés” adja. Egy helyszínre nem csak bemész, hanem döntesz: felderíted a kamerákat, megnézed, van-e hátsó bejárat, és hogy a küldetés célját lehet-e csendben megoldani. Netrunnerként például a harc sokszor már a belépés előtt elkezdődik: pingelsz, jelölöd az ellenfeleket, kikapcsolod a rendszereket, és csak akkor mozdulsz, amikor előnyben vagy. Harcosabb builddel a cyberware képességek (mozgás, túlélés, extra sebzés) adják a ritmust: gyorsan pozíciót váltasz, büntetsz, és nem hagyod, hogy bekerítsenek.\r\n\r\nA fejlődés során érdemes célokat adni magadnak: például egy adott stílusra optimalizálsz (stealth + quickhack, vagy shotgun + mobility). Ettől a loot is értelmet nyer, mert nem minden „jobb”, csak az jobb, ami a buildedhez illik. A mellékküldetések és fixerek feladatai segítenek kipróbálni a rendszereket, és közben a város is „kibomlik”: karakterek, helyek, konfliktusok kapcsolódnak össze. A játék egyik legjobb része, amikor rájössz, hogy a döntéseid nem csak a végén számítanak, hanem már a közben: ki él, ki haragszik, kivel kötöd meg az alkut.\r\n\r\nHa a cél egy fél oldalt kitöltő extra leírás, akkor itt van a lényeg: a Cyberpunk 2077 nem egyetlen „jó” játékmód. Inkább egy eszköztár, amiből felépítesz egy saját V-t, és a város helyzeteire a saját módszereiddel reagálsz. Ez adja a szabadság érzetét, és ettől lesz igazán élvezhető hosszú távon.'),
(7, '2015-05-19', 'https://store.steampowered.com/app/292030/', 'A játék élménye akkor a legerősebb, ha hagyod, hogy a mellékküldetések „eltérítsenek”: sokszor ezek adják a legjobb történeteket. A harc felkészülésre épít, a világ pedig tele van apró részletekkel, amik miatt érdemes lassabban, figyelmesen haladni.', 'A Witcher 3 extra rétegét a világ és a történet összefonódása adja. Sok RPG-ben a mellékküldetés csak jutalomért van, itt viszont gyakran a világ megértéséhez kell: egy falu problémája, egy régi átok, egy háborús helyzet vagy egy személyes tragédia mind olyan történet, ami hozzáad a nagy egészhez. A döntések nem mindig azonnal csapódnak le; néha órákkal később látod, hogy egy korábbi választás milyen következménnyel járt. Ettől a világ következetesnek és hitelesnek érződik.\r\n\r\nA harcban az extra tudatosság abban van, hogy nem ugyanúgy állsz bele minden helyzetbe. Ha előre olvasol bestiáriumot, kiválasztod a megfelelő olajat, és felkészülsz bombával vagy főzettel, akkor a játék „szakmai” oldalát éled meg: tényleg szörnyvadász vagy, nem csak kardos karakter. Az alchemy build különösen hálás, mert a főzetek, decoctionok és megfelelő tolerancia menedzsment teljesen más tempót ad. A sign build pedig a kontroll és a védelem oldaláról teszi stratégiaivá a küzdelmet.\r\n\r\nFelfedezésnél az extra élmény a hangulat: a tájak, a zene és a kisebb jelenetek (útszéli események, beszélgetések, apró nyomok) miatt a játék nem csak feladatlista. Ha szeretnéd, hogy a részletes leírás „fél oldalt” töltsön, akkor itt a lényeg: a Witcher 3 nem siettet, hanem azt kéri, hogy merülj bele, és engedd, hogy a döntések és a történetek dolgozzanak benned.'),
(8, '2019-12-05', 'https://store.steampowered.com/app/1174180/', 'A játék élménye akkor a legerősebb, ha nem sietsz: a részletek, a felfedezés és a történet együtt adja azt a ritka „western életérzést”, ami kevés játékban ennyire hiteles. A küldetések filmesek, de a világ a két küldetés között is folyamatosan történetek', 'Az extra réteg az, hogy az RDR2 nem csak egy nyílt világ, hanem egy hangulat-gép. Ha figyelsz, rengeteg apró jelből áll össze: a táborban hallott beszélgetésekből, az út közbeni véletlen találkozásokból, a vadon hangjaiból, a városok eltérő „kultúrájából”. A játék sokszor jutalmazza a kíváncsiságot: egy mellékes útvonalon találsz egy érdekes helyszínt, egy furcsa karaktert, vagy egy kis történetet, ami később is megmarad. \r\n\r\nA küldetések közben az extra tipp az, hogy kezeld úgy, mintha egy tervet hajtanál végre: figyeld, hol vannak a menekülési útvonalak, mennyire akarsz feltűnést, és mennyire vállalod a nyílt konfliktust. A harc nem akar „arcade” lenni; sokkal jobban működik, ha türelmes vagy, és hagyod, hogy a helyzet kibontakozzon. A fegyverek és a Dead Eye rendszer akkor ad jó érzést, ha kontrolláltan használod, nem pánikból.\r\n\r\nA fejlődésnél a legjobb hozzáállás, ha nem a „maxolás” a cél, hanem a szerepjáték: milyen Arthur-t játszol, mennyire vagy becsületes, és mit tartasz elfogadhatónak. Ettől a játék személyesebb lesz. Ha pedig szeretnéd, hogy a részletes leírás tényleg fél oldalt töltsön, itt a lényeg: az RDR2 értéke az időben van. Minél több időt töltesz a világban, annál több apró részletet veszel észre, és annál jobban működik a hangulat.'),
(9, '2019-02-04', 'https://store.steampowered.com/app/1172470/', 'Az Apex a legjobb, ha csapatban játszol és kommunikálsz: a jó pozíció, a fókuszált target hívások és a tudatos resetek sokkal stabilabbá teszik a meccseket. A mozgás és a képességek miatt a fightok kreatívak és látványosak.', 'Az extra réteg az Apexben a rotáció és az információ. Sok BR-ben elég „jól lőni”, itt viszont a harmadik fél veszélye és a körök tempója miatt a tudatos mozgás óriási előny. Ha megtanulod, hogy mikor kell pozíciót fogni, mikor kell kerülni, és mikor érdemes csak egy gyors pickért bemenni, sokkal több top helyezésed lesz. A legendaválasztásnál is érdemes csapatban gondolkodni: legyen valami, ami információt ad, legyen valami, ami rotációt segít, és legyen valami, ami fightot indít vagy megtart.\r\n\r\nA loot és a harc ritmusa is fontos. Nem kell mindent felvenni; a gyors döntések (milyen fegyver, milyen optic, mennyi heal) időt spórolnak, és csökkentik a sebezhetőséget. Fight után a „reset” gyakran fontosabb, mint a loot: gyógyítás, pajzs csere, pozíció felvétele, és csak utána a készlet rendezése. Ha ezt csapatban fegyelmezetten csináljátok, sokkal ritkábban haltok meg egy váratlan harmadik féltől.\r\n\r\nVégül az Apex extra élménye a fejlődés: ahogy jobb lesz a mozgásod, a célzásod és a döntéseid, egyre többször érzed azt, hogy te irányítod a meccset, nem csak reagálsz. Ezért tud a részletes leírás hosszú lenni: mert a játék valódi erőssége a tempó és a taktika együtt.'),
(10, '2017-12-21', 'https://store.steampowered.com/app/578080/', 'A PUBG akkor adja a legjobb élményt, ha türelmesen játszol: információt gyűjtesz, okosan rotálsz, és a fightokat előnyből vállalod be. A gunplay jutalmazza a gyakorlást, és a „chicken dinner” érzés kifejezetten megdolgozott siker.', 'Az extra réteg a PUBG-ben a döntések időzítésében van. Nem csak az számít, hogy hova esel le, hanem az is, hogy mikor lépsz tovább: ha túl sokat lootolsz, a kör rákényszerít egy rossz rotációra; ha túl hamar indulsz, olyan helyen futsz át, ahol könnyű leszedni. A jó játékos ezért menet közben tervez: nézi a következő kört, figyeli a jármű lehetőségeket, és úgy választ útvonalat, hogy legyen cover és legyen „exit”. \r\n\r\nA csapatharcoknál az extra fegyelem a kulcs. A koordinált push, a kereszttűz felépítése, és a gyors revive/cover döntések gyakran többet érnek, mint egyéni hero play. A utility (gránátok, füst) szintén sokkal fontosabb, mint amilyennek elsőre tűnik: füsttel át lehet kelni nyílt terepen vagy revive-ot biztosítani, gránáttal pedig ki lehet kényszeríteni az ellenfelet a fedezékből. Ha ezt tudatosan használod, a fightok kevésbé „random”, és sokkal inkább kontrolláltak lesznek.\r\n\r\nVégül a PUBG extra élménye a feszültség: kevés játék tudja azt a csendes, koncentrált hangulatot, amikor már csak páran vagytok, és minden lépés számít. Ha szereted a magas tétű, taktikázós BR-t, itt rengeteg órányi fejlődés és tanulható mélység van.'),
(11, '2015-12-01', 'https://store.steampowered.com/app/359550/', 'A Siege akkor a legjobb, ha csapatban kommunikáltok: drónolás, calloutok, utility trade és tudatos time management kell hozzá. Ha szereted a lassabb, feszült köröket és a „kitaláljuk a megoldást” jellegű játékot, nagyon rá lehet kattanni.', 'Az extra réteg a Siege-ben az, hogy a körök elején nem az a cél, hogy fraget szerezz, hanem hogy információt és területet nyerj. Támadóként az első 30-60 másodpercben drónokkal fel kell térképezni, hol vannak a defenderek, milyen denial van, és milyen útvonal a legbiztonságosabb. Védekezőként az extra tudatosság abban van, hogy a setup nem „random reinforce”, hanem terv: rotate, pixel/vonal, crossfire, és olyan utility, ami időt nyer. Az idő a védekező barátja, ezért minden másodperc számít.\r\n\r\nA másik extra elem a utility csere. A Siege-ben a legtöbb erős pozíciót nem lövéssel, hanem eszközökkel bontod: gránát, EMP, breach charge, hard breach, drón, flash – ezek mind arra valók, hogy kényszerítsd az ellenfelet reagálni. Ha ezt megtanulod, a körök kevésbé lesznek kapkodósak, és sokkal inkább „kontrolláltak”. A jó csapat nem egyszerre rohan, hanem lépésről lépésre zárja le a kockázatot: flank watch, crossfire, refrag távolság.\r\n\r\nVégül az extra élmény a tanulás: minden pályán vannak tipikus megoldások, és minden operátor hoz egy saját mini-szabályrendszert. Ha ezt a tanulást szereted, a Siege évekig ad tartalmat. Ha nem, akkor frusztráló lehet. A játék ezért különleges: nem csak lőni tanít, hanem gondolkodni és csapatban játszani.'),
(12, '2016-02-26', 'https://store.steampowered.com/app/413150/', 'A játék élménye akkor a legjobb, ha nem akarod „tökéletesen” játszani: hagyod, hogy a napok sodorjanak, és élvezed a lassú, biztos fejlődést. A relax rész és a felfedezés jó arányban váltja egymást, ezért hosszú távon is kényelmes.', 'Az extra réteg a Stardew-ben az, hogy a játék nagyon jól kezeli a motivációt: mindig van egy közeli cél (ma még megöntözöm, ma még lemegyek pár szintet a bányába) és egy távoli cél (új épület, jobb eszköz, új terület). Ha elkezdesz egy saját „rendet” felépíteni a farmon, a játék szinte meditációs: ugyanazokat a mozdulatokat ismétled, közben mégis látod, hogy a birtokod fejlődik. \r\n\r\nA másik extra elem a rugalmasság. Ha valami nem tetszik (például a halászat), a játék nem büntet meg érte; van más út is a haladáshoz. Ha pedig szereted az optimalizálást, a későbbi öntözés, feldolgozás és pénztermelés építése nagyon kielégítő. Kooperatív játékban ez még jobb, mert a feladatok természetesen oszlanak meg, és a farm tényleg közös projekt lesz. A Stardew azért működik ennyire jól, mert egyszerre ad pihenést és célt, és mindkettőt a saját tempódban.'),
(13, '2020-09-17', 'https://store.steampowered.com/app/1145360/', 'A Hades akkor a legjobb, ha kísérletezel: nem ragaszkodsz görcsösen egyetlen buildhez, hanem megnézed, milyen boon-szinergiák jönnek össze. A kudarc is előrelépés, mert mindig kapsz valami új dialógust vagy fejlődési lehetőséget.', 'Az extra réteg a Hadesben a tudatos döntéshozatal. Nem csak az számít, hogy gyorsan ütsz, hanem hogy a run elejétől egy irányba építkezel: milyen fő sebzést használsz, milyen kiegészítő effektek támogatják (pl. stacking, crit, DOT), és milyen védelmi eszközökkel teszed stabilabbá a runodat. A keepsake-ek és az, hogy melyik istent „célzod”, egyfajta stratégiai kontrollt ad a véletlenen belül, és ettől lesz a játék fairnek érződő.\r\n\r\nA fegyverek aspektusai az extra kísérletezést adják: ugyanaz a fegyver más aspektussal más tempót, más prioritást kíván. Ha erre ráérzel, a játék új szintre kerül, mert nem csak „nyers erővel” játszol, hanem stílussal. A bossoknál az extra tipp a türelem: sokszor nem a folyamatos DPS a nyerő, hanem a biztos ablakok, a tiszta dodge és a túlélés. A Hades ettől válik hosszú távon élvezhetővé: mert a játék megtanít jobban játszani, és közben mindig ad új kombinációkat kipróbálni.'),
(14, '2012-10-19', 'https://store.steampowered.com/app/227300/', 'Az ETS2 a legjobb „kikapcsolós” játékok egyike: ha szereted a nyugodt tempót és azt, hogy közben mégis haladsz (jobb kamion, több pénz, nagyobb cég), nagyon könnyű belecsúszni hosszabb sessionökbe.', 'Az extra réteg az ETS2-ben a beállításokban és a rutinban van. Ha kicsit realisztikusabbra húzod a vezetést (stabilitás, fék, károk), a játék sokkal „súlyosabb” és hitelesebb lesz, és ettől a fuvarok is izgalmasabbak. A másik extra elem a gazdaság: érdemes úgy fejleszteni, hogy a kamionod és a sofőrjeid folyamatosan termeljenek, miközben te a hosszabb, jobban fizető fuvarokat vállalod. A garázsok és a sofőrök idővel stabil alapot adnak, és a játék átvált „vezetés + menedzsment” kombinációra.\r\n\r\nA harmadik extra a felfedezés. Ha nem mindig a leggyorsabb autópályás útvonalat választod, sokkal több hangulatot kapsz: kisebb utak, városok, tájak, és néha kihívásosabb szakaszok. Sokaknak pont ez a lényeg: egy relax élmény, ahol közben „utazol” is. Emiatt a részletes leírás hosszú: mert a játék értéke nem egyetlen feature, hanem az, ahogy a nyugodt vezetés és a fokozatos fejlődés összeáll egy komfortos ciklussá.'),
(15, '2016-10-21', 'https://store.steampowered.com/app/289070/', 'A Civ VI legjobb része az, hogy mindig ad egy következő célt: befejezek egy districtet, felhúzok egy csodát, vagy még gyorsan kikutatok egy tech-et. Ha szereted a hosszú távú tervezést és a „dominó” jellegű stratégiát, könnyen beszippant.', 'Az extra réteg a Civ VI-ban a várostervezés és a policy-k kezelése. Ha megtanulod az adjacency logikát (campus hegy mellett, commercial hub folyó mellett, ipari zóna bányák mellett, stb.), a birodalmad sokkal hatékonyabb lesz, és ugyanabból a térképből többet hozol ki. A policy kártyák pedig azért erősek, mert rugalmasan tudsz reagálni: amikor építkezel, építkezésre váltasz, amikor háborúzol, háborús bónuszokra, és így tovább. Ez a „helyzethez igazítás” sokkal fontosabb, mint elsőre tűnik.\r\n\r\nA másik extra elem a timing: mikor terjeszkedsz, mikor fejlesztesz infrastruktúrát, mikor indítasz háborút, és mikor váltasz győzelmi célra. Sok meccs ott dől el, hogy túl későn commitálsz egy győzelmi típusra, vagy túl sokat háborúzol rossz időben. Ha ezt tudatosan kezeled, a Civ VI kevésbé lesz „random”, és sokkal inkább kontrollált stratégiai építkezés. Ezért szerethető: hosszú, de végig döntésekkel teli.'),
(16, '2019-03-15', 'https://store.steampowered.com/app/2221490/', 'A játék élménye co-opban a legerősebb: ha összehangoltan mozogtok fedezékről fedezékre, és a buildjeitek kiegészítik egymást, a küldetések sokkal „profi” érzést adnak. A loot akkor élvezetes, ha célzottan egy buildet fejlesztesz, nem csak összevissza cser', 'Az extra réteg a Division 2-ben a build finomhangolása és a szerepek tudatos felosztása. Ha csapatban játszotok, nem kell mindenkinek ugyanazt csinálnia: lehet egy stabil DPS, egy skill build (turret/drone/CC), és egy támogatóbb karakter. Ettől a nehezebb küldetések is kezelhetőbbek, és kevésbé lesz „spongy” az ellenfél, mert jobban kontrolláljátok a harcot.\r\n\r\nA másik extra elem az, hogy mikor váltasz nehézségre. Érdemes addig feljebb lépni, amíg még stabilan tudtok haladni, mert a túl nagy ugrás frusztráló. Ha viszont pont jó a kihívás, a loot minősége és a fejlődés érzése nagyon motiváló. A Division 2 hosszú távon akkor működik, ha célokat adsz magadnak: egy konkrét set összerakása, egy fegyver tökéletesítése, vagy egy adott játékmód (küldetés, open world, PVP) fókuszálása.');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok`
--

CREATE TABLE `jatekok` (
  `idjatekok` int(11) NOT NULL,
  `nev` varchar(255) NOT NULL,
  `idfejleszto` int(11) NOT NULL,
  `ar` decimal(10,2) NOT NULL DEFAULT 0.00,
  `penznem` varchar(10) DEFAULT 'FT',
  `idrendszerkovetelmeny` int(11) DEFAULT NULL,
  `leiras` text DEFAULT NULL,
  `ertekeles` decimal(3,2) NOT NULL DEFAULT 0.00,
  `kepurl` varchar(500) DEFAULT NULL,
  `status` enum('approved','pending','rejected') NOT NULL DEFAULT 'approved',
  `uploaded_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `megjelenes` varchar(50) DEFAULT NULL,
  `steam_link` varchar(500) DEFAULT NULL,
  `jatek_elmeny` text DEFAULT NULL,
  `reszletes_leiras` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `jatekok`
--

INSERT INTO `jatekok` (`idjatekok`, `nev`, `idfejleszto`, `ar`, `penznem`, `idrendszerkovetelmeny`, `leiras`, `ertekeles`, `kepurl`, `status`, `uploaded_by`, `approved_at`, `approved_by`, `rejection_reason`, `megjelenes`, `steam_link`, `jatek_elmeny`, `reszletes_leiras`, `created_at`, `updated_at`) VALUES
(1, 'Counter-Strike 2', 1, 0.00, 'FT', 4, 'Kompetitív 5v5 taktikai FPS rövid körökkel, economy rendszerrel és csapatfókuszú játékmenettel.', 9.20, 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2023-09-27', 'https://store.steampowered.com/app/730/', 'A CS2 élménye egyszerre feszült és nagyon jutalmazó: minden körben érzed, hogy a döntéseid (pozíció, tempó, kommunikáció) azonnal számítanak. Ha csapatban játszol, a jól időzített utility és a tiszta callok elképesztően sokat dobnak az összképen, és egy „tökéletesen lehozott” kör kifejezetten elégedetté tesz. Solo queue-ban inkább a kiszámíthatatlanság dominál, de még ott is sokat segít, ha tudatosan játszol economy-val és nem erőlteted a felesleges párharcokat. A játék abban erős, hogy a fejlődés kézzel fogható: pár nap fókuszált gyakorlás után jobb lesz a crosshair placement, stabilabb a spray, és okosabbak a döntések. Összességében gyors, kompetitív és hosszú távon is motiváló, mert mindig van mit csiszolni.', 'A Counter-Strike 2 a taktikai, körökre osztott kompetitív FPS-ek egyik legtisztább formája, ahol a nyers célzás csak az egyik összetevő. A meccsek gerincét az economy rendszer adja: körönként mérlegelned kell, hogy full buy, force-buy vagy eco a helyes döntés, és ezt nem egyénileg, hanem csapatszinten érdemes kezelni. Egyetlen rossz vásárlás könnyen több körön át tartó hátrányt okozhat, ezért fontos megérteni a veszteségi bónuszt, a fegyvermentést, és azt, hogy mikor érdemes kockáztatni a fordításért. A pályákon a siker kulcsa a kontroll: információt kell gyűjteni (hangok, spotok, ellenfél utility), területet kell nyerni, majd a megszerzett előnyből dönteni az execute és a rotate között.\r\n\r\nA utility-használat a játék egyik legmélyebb rétege. A füst nem csak „eltakarás”: tempót diktál, leválasztja a védőket, és biztonságosabbá teszi a belépést vagy a retake-et. A vakuk hatékonysága időzítésen múlik; egy jól eldobott „popflash” gyakran ingyen fraget jelent, míg a rossz vaku a csapatot vakítja és eladja a belépést. A molotovok és HE-k pozíciókat kényszerítenek, megszakítják a defuse-t, vagy gyengítik az ellenfelet még a párharc előtt. Ha komolyan fejlődni akarsz, érdemes pályánként pár alap smoke-ot és belépési mintát megtanulni, mert ezek stabil, ismételhető köröket adnak.\r\n\r\nA mechanikai rész (recoil kontroll, spray transfer, counter-strafe, tracking) természetesen fontos, de a magasabb szinten a döntéshozatal különbözteti meg a játékosokat. Mikor kérsz agresszívan információt? Mikor esel vissza, hogy ne add el a kör elejét? Mikor mented a fegyvert, mert a következő kör fontosabb? A kommunikáció rövid, pontos calloutokkal működik: ellenség száma, helye, utility állapot, és a szándék (tartom / rotálok / visszaesek). A CS2 ezért hosszú távon is élvezetes: egyszerre jutalmazza a gyakorlást és a gondolkodást, és minden meccsben benne van a lehetőség, hogy okosabb játékkal fordíts.', '2026-02-03 15:43:23', '2026-02-03 15:43:23'),
(2, 'Dota 2', 1, 0.00, 'FT', 5, '5v5 MOBA mély hős-, item- és csapatstratégiával, ahol a döntések és a koordináció hosszú távon többet érnek, mint az egyéni villanások.', 5.00, 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2013-07-09', 'https://store.steampowered.com/app/570/', 'A Dota 2 élménye „sakkszerű”, de közben végig akciódús: folyamatosan mérlegelsz, hogy farmolj, harcolj, vagy objektívet vegyél. A legjobb pillanatok akkor jönnek, amikor a csapat egy terv mentén mozog: jól időzített smoke, pontos vision, és egy koordinált csapatharc, ahol minden ulti a megfelelő célra megy. Kezdőként kifejezetten nehéz lehet, mert sok a hős, az item és a mechanika, de ha lépésről lépésre tanulsz (1-2 role, 3-4 hős, alap item build), a fejlődés gyorsan érezhető. A játék sokszor feszült, mert egy rossz döntés drágán megbosszulja magát, ugyanakkor pont ezért nagyon jutalmazó, amikor „helyesen” olvasod a mapet. Összességében mély, kompetitív, és hosszú távon is újra meg újra tanulható.', 'A Dota 2 a csapatstratégia és a döntéshozatal játéka, ahol a meccs tempóját a lane fázis és az erőcsúcsok (power spike-ok) adják. Az elején a cél nem az, hogy mindenáron ölés legyen, hanem hogy stabilan meglegyen a farm, és közben kontrolláld a hullámot: last hit, deny, pull, stack – ezek mind apró előnyöket építenek. A midgame-ben a térkép válik főszereplővé: vision (ward/deward), információ, és a rotációk. Egy jó csapat nem csak reagál, hanem előkészít: pushol egy lanet, közben smoke-kal területet nyer, majd objektívet vesz (torony, Roshan), amikor az ellenfél rossz helyen van.\r\n\r\nA csapatharcok a Dota 2 csúcspontjai, és itt látszik a különbség a „random fight” és a tervezett összecsapás között. Fontos a target priority (kit kell elsőnek kiiktatni), a spell-lánc (stun → burst → control), és az, hogy ki mennyi információt mutat a pályán. Gyakori hiba, hogy a csapat túl korán kezd harcolni – a Dota viszont sokszor azt jutalmazza, ha előbb a mapet rendezed (wave-ek kitolása), és csak utána vállalsz kockázatot. A döntések súlya miatt a kommunikáció nagy előny: „ultim ready”, „no buyback”, „fight top”, „play for Roshan” típusú rövid callokkal a csapat sokkal stabilabb.\r\n\r\nA meta és az itemizáció folyamatosan változik, ezért a tanulás sosem ér véget. A jó hír, hogy nem kell egyszerre mindent tudni: ha kiválasztasz egy szerepet (support/offlane/mid/carry) és 3-5 komfort hőst, megtanulod a lane alapokat, és figyeled az objektíveket, máris értelmesebb meccseket kapsz. A Dota 2 így válik fél oldalnyi „részletes leírássá”: mert a játék mélysége abban van, hogy a jó döntések egymásra épülnek, és ettől lesz a győzelem nem csak szerencse, hanem tudatos munka.', '2026-02-03 15:45:25', '2026-02-04 07:48:50'),
(3, 'ELDEN RING', 3, 19383.00, 'FT', 6, 'Nyílt világú akció-RPG sötét fantasy hangulattal, felfedezéssel, kemény bossokkal és szabadon építhető karakterrel.', 9.60, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2022-02-25', 'https://store.steampowered.com/app/1245620/', 'Az ELDEN RING élménye a felfedezés és a „megtanulom–legyőzöm” érzés kombinációja. A játék elején sok minden veszélyesnek tűnik, de ahogy kiismered a mozgást, a támadásritmusokat és a saját builded erősségeit, egyre magabiztosabb lesz a haladás. A legjobb pillanatok azok, amikor egy korábban reménytelennek tűnő boss hirtelen „érthetővé” válik: rájössz, mikor kell türelmesnek lenni, mikor érdemes agresszíven büntetni, és mikor kell egyszerűen visszalépni. A nyílt világ miatt a játék ritkán állít falhoz, mert ha elakadsz, elmehetsz másfelé, fejlődhetsz, felszedhetsz új eszközöket, és később visszatérhetsz. Összességében kemény, de igazságosnak érződő, és nagyon jutalmazza a kíváncsiságot.', 'Az ELDEN RING részletesen nézve egy nagy „eszköztár” a játékos kezében: a siker nem egyetlen reflexen múlik, hanem azon, hogy hogyan használod a rendszereket. A harc alapja a ritmus és a pozicionálás. A dodge és a stamina menedzsment mellett sokszor az a döntő, hogy milyen távolságban állsz, mikor vállalsz be egy hosszabb animációt, és mikor szakítod meg a támadást a biztonság kedvéért. A bossok mintázatai tanulhatók, de a játék szereti variálni a tempót: késleltetett csapásokkal, területet lefedő támadásokkal és „büntető” kombókkal kényszerít arra, hogy ne autopilótán játssz.\r\n\r\nA build szabadság adja a játék másik felét. A statok (Vigor, Endurance, mind), fegyverek, varázslatok és Ash of War-ok olyan kombinációkat engednek, amelyek teljesen más stílust hoznak. Melee builddel a közelharci időzítés a fő; mágusként az erőforrások, a távolság és a cast ablakok kezelése lesz fontos; faith/arcane irányokkal pedig status effektek, buffok és hibrid megoldások jönnek be. A talizmánok és fegyverinfúziók finomhangolják a karaktert, és ha szeretsz „kísérletezni”, itt tényleg van értelme új összeállításokat próbálni.\r\n\r\nA nyílt világ szerkezete azt jutalmazza, ha figyelsz a környezetre. A rejtett katakombák, barlangok és mini-dungeonök nem csak kitöltő tartalmak: gyakran buildet erősítő jutalmakat adnak (spirit ash, upgrade mat, új varázs). A játék ezért sokszor nem lineáris kihívás, hanem felfedezés-alapú fejlődés: a kíváncsiságod közvetlenül erősebbé tesz. A haladás közben a „checkpoint” rendszer és a gyors utazás csökkenti a frusztrációt, de a veszélyérzet megmarad, mert a következő sarkon mindig lehet valami új. Ez a kettősség – szabadság és fenyegetés – adja az ELDEN RING jellegzetes, fél oldalt is megtöltő élményét.', '2026-02-03 15:46:43', '2026-02-03 16:09:47'),
(4, 'Baldur\'s Gate 3', 4, 19383.00, 'FT', 7, 'Történetközpontú, körökre osztott RPG a D&D világában, erős szerepjátékkal, döntésekkel és taktikai harccal.', 5.00, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2023-08-03', 'https://store.steampowered.com/app/1086940/', 'A BG3 élménye olyan, mintha egy kiemelkedően jó asztali szerepjáték kampányt játszanál végig, csak itt minden jelenet látványos és következményes. A legnagyobb erőssége, hogy a döntéseid tényleg számítanak: nem csak egy párbeszéd-opciót választasz, hanem gyakran a küldetés teljes szerkezetét alakítod át. A harc körökre osztott, ezért van időd gondolkodni, tervezni, és kreatív megoldásokat kipróbálni; ez nem a gyors reflexekről, hanem a jó döntésekről szól. Különösen erős, amikor egy nehéz találkozót nem „túlerővel”, hanem ötlettel oldasz meg: jobb pozíció, okos spell, környezet használata. Összességében történetben és karakterekben nagyon erős, és könnyű belemerülni órákra.', 'A Baldur\'s Gate 3 részletesen egy olyan CRPG, amely a szerepjátékot és a taktikát nem külön kezeli, hanem összeolvasztja. A párbeszédekben gyakran nem egy „jó” és „rossz” gomb van, hanem árnyalt választások: kinek hiszel, mit hallgatsz el, mit vállalsz fel, és milyen árat fizetsz érte. A játék ezt nem csak egy későbbi cutscene-ben „pipálja ki”, hanem visszacsatolja: más NPC-k, más kapcsolatok, más következmények nyílnak. Emiatt érdemes lassan játszani, beszélni, felfedezni, és figyelni a részletekre, mert sokszor a legjobb megoldás nem a nyilvánvaló.\r\n\r\nA harcrendszer körökre osztott, és a D&D logikáját követi: akciók, bónusz akciók, reakciók, koncentráció, mentődobások. Ez a gyakorlatban azt jelenti, hogy a csapatösszeállítás és a szerepek fontosak. Kell valaki, aki kontrollál (pl. immobilize, silence, fear), kell burst, kell védelem és gyógyítás, és kell egy olyan karakter, aki a terepet jól használja. A magasság, a takarás, a choke pointok és a környezeti elemek (robbanó hordó, tűz, sav, jeges felület) konkrétan csatákat fordítanak meg. A siker gyakran azon múlik, hogy előre gondolkodsz: honnan érkezik az ellenfél, milyen közelharcos fenyegetés van, és hol tudod megszakítani a vonalukat.\r\n\r\nA karakterépítés rengeteg variációt ad: class, sub-class, feat, spell választás, valamint a felszerelés és az itemekből jövő extra képességek. A játék egyik legjobb része, hogy a build nem csak számokban erősít, hanem új opciókat ad a pályán és párbeszédekben is. Emiatt a BG3 újrajátszhatósága nagyon magas: más csapat, más morál, más döntések, és máris egy új történetérzetet kapsz. Ha szereted a történetet, a szerepjátékot és a taktikai harcokat, itt tényleg megkapod azt az élményt, ami egy fél oldalt is simán megtölt.', '2026-02-03 16:04:55', '2026-02-04 07:24:46'),
(6, 'Cyberpunk 2077', 6, 19383.00, 'FT', 9, 'Nyílt világú akció-RPG Night Cityben: küldetések, karakterépítés, lövöldözés/hack/stealth megközelítések és erős hangulat.', 8.80, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2020-12-10', 'https://store.steampowered.com/app/1091500/', 'A Cyberpunk 2077 élménye leginkább a hangulatról szól: Night City egyszerre lenyűgöző és nyomasztó, és könnyű csak úgy „belecsúszni” egy esti játékba. A küldetések akkor a legerősebbek, amikor többféle megoldást adnak: lopakodsz, beszélsz, hackelsz, vagy vállalod a nyílt harcot, és közben a builded tényleg érezhetően alakítja, mennyire vagy hatékony. A játékmenet jó érzéssel jutalmazza, ha okosan készülsz: megfelelő cyberware, perkek és fegyverek mellett egy nehezebb helyzet is kezelhetővé válik. A város bejárása külön élmény, mert a környezet, a zene és a neon esztétika folyamatosan fenntartja a „cyberpunk” érzetet. Összességében sztoriban és atmoszférában erős, és akkor működik a legjobban, ha a mellékszálakat is hagyod kibontakozni.', 'A Cyberpunk 2077 részletesen egy build-alapú, küldetésvezérelt nyílt világú akció-RPG, ahol a szabadság nem csak abban áll, hogy merre mész, hanem abban is, hogy hogyan oldasz meg helyzeteket. A karakterfejlesztés több rétegen keresztül ad választási lehetőséget: perkek, attribútumok, cyberware és fegyverstílusok. Ha netrunner irányba mész, a harc a gyorshackek és a pozicionálás körül forog: kamerák, ping, zavarás, túlterhelés, kontroll. Ha a nyílt harcot szereted, a fegyverkezelés, a fedezék és az időzítés lesz domináns, és sokszor a mozgás (dash, slide, sarkok tartása) adja a különbséget. Stealth-nél a türelem és az útvonaltervezés számít: figyeled az őrjáratot, a kamerákat, és a ki-be útvonalat.\r\n\r\nA küldetések erőssége ott jön ki, amikor a játék nem csak „lődd le” feladatra redukál, hanem információt ad és választást kér. Sokszor már az előkészület is része a feladatnak: felderítés, belépési pont keresése, alternatív út, mellékcél. A párbeszédekben a statok és perkek gyakran nyitnak extra opciót, és ez jó érzés, mert a builded nem csak harcban, hanem történetben is számít. A loot és a crafting jellegű rendszerek inkább támogatják a játékstílust: megtalálod a kedvenc fegyvered, felhúzod, és a harc „a tiéd” lesz.\r\n\r\nA nyílt világú rész akkor él igazán, ha nem rohansz. A városnegyedek hangulata eltér, és a mellékküldetések sokszor adnak olyan történeteket, amelyek önmagukban is emlékezetesek. Ha az a cél, hogy fél oldalt is megtöltsön a leírás, akkor pont ez a lényege: a Cyberpunk 2077 nem csak egy fő sztori, hanem egy hangulat, amit a bejárás, a karakterépítés és a döntések együtt adnak.', '2026-02-03 16:10:51', '2026-02-03 16:10:51'),
(7, 'The Witcher 3: Wild Hunt', 6, 12876.00, 'FT', 11, 'Történetvezérelt fantasy akció-RPG nyílt világgal, nyomozással, döntésekkel és emlékezetes mellékküldetésekkel.', 9.50, 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2015-05-19', 'https://store.steampowered.com/app/292030/', 'A Witcher 3 élménye leginkább abban erős, hogy a világ „élőnek” érződik: nem csak célpontok vannak a térképen, hanem történetek, sorsok és következmények. A harc egyszerre dinamikus és felkészülés-központú: a megfelelő olaj, főzet vagy jel sokszor többet számít, mint a nyers sebzés. A legjobb pillanatok akkor jönnek, amikor egy mellékküldetés váratlanul morálisan nehéz döntést kér, és nincs tökéletes válasz, csak vállalható. A felfedezés kellemes tempójú: a tájak, a zene és a hangulat sokszor önmagában is „utazásélmény”. Összességében epikus, de közben intim történet is, és könnyű úgy érezni, hogy tényleg egy karakter bőrében élsz.', 'A The Witcher 3 részletesen egy olyan nyílt világú RPG, amely a történetmesélést nem csak a fő sztorira bízza. A mellékküldetések gyakran külön novellák: saját konfliktussal, érdekes szereplőkkel és olyan befejezésekkel, amelyek a döntéseidből következnek. Ez a struktúra azért működik, mert a játék világában a „szörnyvadászat” nem öncélú harc, hanem ürügy arra, hogy beleláss a falvak, városok és frakciók problémáiba. Geralt karaktere pedig pont attól hiteles, hogy nem mindent irányít, csak a saját kódját próbálja tartani egy kaotikus világban.\r\n\r\nA harcban a felkészülés a kulcs. A bestiárium és a nyomozás jellegű részek (nyomok követése, helyszín elemzése, tanúk meghallgatása) értelmet adnak annak, hogy miért viszel magaddal különböző olajokat, bombákat és főzeteket. Sok ellenfél ellen a „helyes” eszköz látványosan megkönnyíti a küzdelmet, és ettől a harc kevésbé repetitív: más a ritmus egy páncélos bandita ellen, és más egy gyors, mérgező szörny esetében. A jelek (Quen, Igni, Yrden, Axii, Aard) nem csak kiegészítők, hanem a stílusod részei, és a jól időzített jel gyakran megment.\r\n\r\nA felfedezés során a játék nem kényszerít állandó rohanásra. A környezet, az időjárás, a falvak hangjai és a zene együtt adnak egy nagyon erős atmoszférát. A fejlődés sem csak „szintek” kérdése: a felszerelés (különösen a witcher szettek) és a build (combat/alchemy/sign) más és más játékérzetet ad. A Witcher 3 azért tölt ki könnyen fél oldalt, mert a nagy történet mellett folyamatosan apró, emberi történeteket mesél, és ettől lesz igazán emlékezetes.', '2026-02-03 16:12:36', '2026-02-03 16:12:36'),
(8, 'Red Dead Redemption 2', 9, 22823.00, 'FT', 12, 'Nyílt világú western akció-kaland erős történettel, részletes világgal és sokféle tevékenységgel.', 9.60, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2019-12-05', 'https://store.steampowered.com/app/1174180/', 'Az RDR2 élménye lassabb, „belemerülős” tempójú, és pont ettől működik: a világ annyira részletes, hogy érdemes figyelni a hangokra, a fényekre, a kisebb eseményekre is. A történet erős, és ahogy haladsz, egyre jobban érzed a feszültséget a banda belső törései körül; sok jelenet kifejezetten emlékezetes. A játékmenet nem csak lövöldözés: vadászat, lovaglás, felfedezés, táborélet, mellékes találkozások adják a „western mindennapokat”. A legjobb pillanatok gyakran nem is küldetés közben jönnek, hanem akkor, amikor csak mész a tájon, és valami spontán történik. Összességében nagyon hangulatos, és akkor adja a legtöbbet, ha hagyod, hogy a játék tempója rád ragadjon.', 'A Red Dead Redemption 2 részletesen egy „élő világ” szimuláció és egy történetvezérelt akció-kaland keveréke. A játék ereje nem az, hogy állandóan pörget, hanem az, hogy meggyőz arról: ez a világ létezik akkor is, ha te nem épp küldetést pipálsz. A városoknak és településeknek saját ritmusa van, az NPC-k reagálnak, a vadon pedig nem díszlet, hanem rendszer: időjárás, állatok, nyomok, vadászat. Ezért a felfedezés külön élmény, és a legtöbb játékost az fogja meg, hogy a világ részletei „összeállnak” egy hangulattá.\r\n\r\nA történet Arthur Morgan köré épül, és fokozatosan bontja ki, hogyan roppan meg a banda a külső nyomás és a belső konfliktusok miatt. A küldetések gyakran filmesek, de közben a játék sokszor rád bízza a részleteket: hogyan közelítesz meg egy helyzetet, mennyire vagy óvatos, mennyire vállalsz kockázatot. A Dead Eye rendszer és a fegyverhasználat jól támogatja a „western párbaj” érzetet, de a harc nem csak a célzásról szól: fontos a fedezék, a mozgás, a távolság, és az, hogy mikor lépsz előre.\r\n\r\nA melléktevékenységek nem puszta filler tartalmak. A vadászat például egy teljes loop: felkészülés, megfelelő fegyver, nyomkövetés, megfelelő lövés, majd a zsákmány kezelése és felhasználása. A táborhoz kapcsolódó rendszerek pedig azt az érzést adják, hogy a banda egy közösség, nem csak „quest giver”. A becsület/honor rendszer finoman tereli a játékhangulatot: nem kényszerít, de visszahat a világ reakcióira és a karakter érzetére. Emiatt az RDR2 könnyen „fél oldalt” kitölt: mert az élmény a történet, a világ és a tempó együttese, nem csak a küldetéslista.', '2026-02-03 16:15:01', '2026-02-03 16:15:01'),
(9, 'Apex Legends', 10, 0.00, 'FT', 13, 'Gyors, csapatközpontú battle royale FPS legendákkal, képességekkel és pörgős gunplay-jel.', 8.70, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2019-02-04', 'https://store.steampowered.com/app/1172470/', 'Az Apex élménye nagyon „flow” alapú: a mozgás, a lövés és a csapatösszhang együtt adja a jó meccseket. A legjobb érzés, amikor a squad egyszerre mozog, ugyanarra fókuszál, és a fightok nem kapkodásból, hanem előnyből indulnak. A legendák képességei miatt a játék sokkal inkább taktikus, mint sok más BR: lehet védekezni, információt szerezni, vagy agresszíven kezdeményezni. Kezdőként gyorsan jönnek a látványos pillanatok, de hosszú távon a döntéshozatal és a pozicionálás hozza a stabil eredményt. Összességében pörgős, kompetitív, és akkor a legjobb, ha van 1-2 fix társ, akikkel tudtok kommunikálni.', 'Az Apex Legends részletesen egy squad-alapú battle royale, ahol a „mechanika” és a „taktika” egyensúlyban van. A gunplay gyors és pontos, de a játék nem engedi, hogy csak aimre építs: a pozíció, a cover, a magassági előny és a rotáció legalább annyit számít. A mozgásrendszer (csúszás, mászás, gyors irányváltás) miatt a harc dinamikus, és sokszor az nyer, aki jobban kezeli a távolságot: mikor közelít, mikor resetel, mikor vált targetet. A TTK és a pajzs/gyógyítás rendszere lehetőséget ad a „reset fight” jellegű játékra, ezért a csapatharcok több hullámban zajlanak: sebzés, visszavonulás, gyógyítás, újranyitás.\r\n\r\nA legendák képességei adják a játék mély rétegét. Információs legendákkal (scan, tracking) biztonságosabb a rotáció és könnyebb elkerülni a harmadik felet. Védelmi karakterekkel területet tudtok tartani és időt nyerni, támadó legendákkal pedig gyorsan indíthattok vagy zárhattok fightot. A csapatösszeállítás nem csak „meta”, hanem stílus: van, aki a kontrollt szereti (biztos pozíció, lassabb játék), van, aki a tempót (agresszív push, gyors rotáció).\r\n\r\nA döntéshozatal a meccsek igazi gerince. Mikor érdemes fightolni, és mikor jobb továbbmenni? Mennyire kockázatos a lootolás, ha a kör zár? Hol lesz a következő jó pozíció, és hogyan mentek oda úgy, hogy ne legyetek nyílt terepen? Az Apex akkor adja a fél oldalt kitöltő „részletes” élményt, amikor elkezded ezt tudatosan kezelni: rotációt tervezel, előre gondolkodsz a körökkel, és a fightokat nem véletlenül vállalod be, hanem előnyből. Ettől lesz a játék hosszú távon is izgalmas és fejlődhető.', '2026-02-03 16:19:45', '2026-02-03 16:19:45'),
(10, 'PUBG: BATTLEGROUNDS', 11, 0.00, 'FT', 14, 'Taktikus battle royale FPS realisztikusabb gunplay-jel, nagy pályákkal és magas tétű túlélő körökkel.', 8.40, 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2017-12-21', 'https://store.steampowered.com/app/578080/', 'A PUBG élménye feszült és „magas tétű”, mert a gunplay keményebb, a hibákat gyorsabban megbünteti, és egy rossz pozícióból nehéz visszajönni. A legjobb meccsek azok, amikor okosan rotálsz, jó időben veszel pozíciót a körre, és nem vállalsz felesleges fightot nyílt terepen. A fegyverek visszarúgása és a lövöldözés kifejezetten „súlyos” érzetű, ezért a gyakorlás nagyon sokat dob a teljesítményen. A játék tempója változatos: van, hogy hosszabb ideig csak mozogsz és információt gyűjtesz, aztán hirtelen néhány másodperc alatt dől el minden. Összességében azoknak a legjobb, akik szeretik a taktikus, türelmesebb BR-stílust, és élvezik a realisztikusabb lövöldét.', 'A PUBG: BATTLEGROUNDS részletesen a battle royale műfaj egyik „keményebb” iskolája. A siker nem csak a jó célzáson múlik, hanem azon, hogy hogyan olvasod a kört, milyen útvonalon rotálsz, és mikor döntesz úgy, hogy harc helyett inkább pozíciót fogsz. A map control itt szó szerint élet-halál: nyílt terepen könnyű lekapni, ezért fontos a cover-ek, dombok, falak, épületek és járművek tudatos használata. A járművek külön réteget adnak: gyors rotációt tesznek lehetővé, de közben zajt csinálnak, és célponttá tesznek, tehát mérlegelni kell a kockázatot.\r\n\r\nA gunplay a PUBG védjegye: a recoil erős, a fegyverek kezelése tanulást igényel, és a felszerelés (scope, muzzle, grip) tényleg számít. A jó lootolás nem azt jelenti, hogy mindent felveszel, hanem hogy egy koherens „loadoutot” építesz: egy stabil közeli fegyver + egy közép/táv fegyver, megfelelő heal és utility. A fightokban sokszor a türelem nyer: információt gyűjtesz, figyelsz a hangokra, és csak akkor vállalsz párharcot, amikor előnyben vagy.\r\n\r\nA körök kezelése a játék egyik legfontosabb készsége. Ha túl későn indulsz, a kék zóna kényszerít rossz útvonalra; ha túl korán fogsz pozíciót, könnyen belefutsz harmadik félbe. A csapatjáték (duo/squad) különösen izgalmas, mert a kommunikáció és a szerepek (scout, anchor, fragger) stabilabbá teszik a döntéseket. A PUBG ezért tud fél oldalt kitölteni: a játék igazi ereje a feszültség és a taktika, amit a realisztikusabb lövöldözés és a kör menedzsment együtt hoz létre.', '2026-02-03 16:20:45', '2026-02-03 16:20:45'),
(11, 'Tom Clancy\'s Rainbow Six Siege', 12, 0.00, 'FT', 15, 'Taktikai 5v5 FPS rombolható környezettel, operátor képességekkel és nagyon erős csapatfókuszú játékmenettel.', 5.00, 'https://cdn.cloudflare.steamstatic.com/steam/apps/359550/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2015-12-01', 'https://store.steampowered.com/app/359550/', 'A Siege élménye feszült és kifejezetten taktikus: egyetlen rossz drónolás, rossz rotate vagy túl korai peek az egész kört elviheti. A legjobb pillanatok akkor jönnek, amikor a csapat terv szerint játszik: információt gyűjt, utilityvel készít elő egy breach-et, és trade-ekkel stabilan lezárja a kört. A rombolhatóság miatt a pályák „élnek”: ugyanaz a site más és más lehet, attól függően, hol nyitsz, hol védesz és milyen operátorokat hozol. Kezdőként sok a tanulnivaló (map knowledge, callout, gadgetek), de ha rászánod az időt, nagyon jutalmazó, mert a fejlődés látványos. Összességében ez egy olyan kompetitív FPS, ahol a csapatmunka és a tudatosság gyakran fontosabb, mint a puszta aim.', 'A Rainbow Six Siege részletesen egy információ- és utility-központú taktikai FPS. A körök ritmusa a felkészülési fázissal indul: védekezőként megerősítesz, rotate-okat vágsz, gadgeteket raksz, és felépíted a védelmi tervet; támadóként drónolsz, felderítesz, és a breach/entry útvonalat készíted elő. A Siege egyik legfontosabb leckéje, hogy a „lövöldözés” csak a kör vége, az eleje inkább sakkszerű: információt szerzel és előnyt építesz. Egy jól elhelyezett drón vagy egy jó kamerás call gyakran többet ér, mint egy vakon bevállalt párharc.\r\n\r\nA rombolhatóság adja a játék egyedi karakterét. Falak, padlók, plafonok nyithatók, így a pályák több szinten játszhatók: vertikális pressure, crossfire, rotate és flank útvonalak épülnek ki. Emiatt a map knowledge nem csak azt jelenti, hogy „tudod merre van a site”, hanem azt is, hogy tudod, milyen vonalak nyílnak, hol lehet safe rotate, és hol tud az ellenfél előnyt szerezni. A védekezés sokszor időmenedzsment: minél többet késleltetsz, annál nagyobb nyomás alá kerül a támadó, mert fogy az idő. A támadás pedig lépésről lépésre bontás: info → map control → utility trade → execute.\r\n\r\nAz operátorok és gadgetek miatt a csapatösszeállítás kulcsfontosságú. Nem csak „melyik erős”, hanem hogy együtt mit tudtok: van-e hard breach, van-e denial, van-e info, van-e flank watch, van-e entry. A kör közben a mikro döntések (mikro-drónolás, refrag, crosshair discipline) és a makró döntések (hol nyitunk, mikor rotálunk, mikor commitálunk) együtt adnak stabil teljesítményt. A Siege ezért tölt ki könnyen fél oldalt: mert a játék mélysége a rombolhatóság, az információ és a csapatutility metszetében van, és ettől lesz egyszerre feszült és nagyon jutalmazó.', '2026-02-03 16:22:07', '2026-02-04 07:43:26'),
(12, 'Stardew Valley', 13, 4827.00, 'FT', 16, 'Nyugodt farm-szimulátor, ahol gazdálkodsz, felfedezel, kapcsolatokat építesz és saját tempóban fejleszted a birtokod.', 5.00, 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2016-02-26', 'https://store.steampowered.com/app/413150/', 'A Stardew Valley élménye megnyugtató és nagyon „ráérős”: nem kényszerít, inkább finoman terel, és közben folyamatosan ad kis célokat. A legjobb érzés az, amikor a farm lassan átalakul: az első pár parcellából később rendezett ültetvény, állattartás, feldolgozás és egy jól működő napi rutin lesz. A játék jól keveri a pihenős részeket (ültetés, aratás, halászat) a felfedezéssel (bánya, tárgyak, kis titkok), ezért ritkán válik unalmassá. A város lakói és a kapcsolatrendszer sokat hozzáad: ahogy megismered őket, a világ személyesebb lesz. Összességében ez egy „komfort játék”, ami mégis meglepően mély, ha hosszabb távon játszol.', 'A Stardew Valley részletesen egy olyan élet-szimulátor, amely a szabadságot nem a végtelen tartalomból, hanem a jól összerakott ciklusokból adja. A napok struktúrája egyszerű: reggel megtervezed, mit csinálsz, napközben végrehajtod, este pedig érzed a haladást. Ez a haladás kicsi, de állandó: egy új eszköz, egy új épület, egy jobb öntözőrendszer, egy új recept, vagy egyszerűen több pénz. Ettől a játék nagyon addiktív, de a jó értelemben: mindig van egy „még egy nap” érzés.\r\n\r\nA farm fejlesztése több irányba vihető. Lehet növényközpontú, állattartás-központú, vagy feldolgozásra építő (keg, preserve jar, artisan termékek). Az optimalizálás nem kötelező, de ha szereted a tervezést, rengeteg örömöt ad: mikor legyen az ültetés, hogyan legyen az öntözés, mibe érdemes befektetni. A bányászat és a harc jellegű részek extra feszültséget hoznak, és jó ellenpontot adnak a nyugodt farm-élethez. A halászat egy külön mini-játék, ami szintén megosztó, de sokaknak pont ez ad változatosságot.\r\n\r\nA kapcsolatok és közösségi célok a játék „lelke”. A városlakók történetei apró darabokból állnak össze, és a fesztiválok, események, valamint a közösségi központ feladatok adnak egy tágabb ívet a játéknak. Kooperatív módban a játék még erősebb, mert megoszthatjátok a feladatokat, és a farm tényleg közös projekt lesz. Stardew ezért tölt ki könnyen fél oldalt: mert egyszerűnek látszik, de a rendszerei együtt egy nagyon gazdag, nyugodt, mégis motiváló élményt adnak.', '2026-02-03 16:24:06', '2026-02-04 07:34:59'),
(13, 'Hades', 14, 8046.00, 'FT', 17, 'Gyors, akciódús roguelike dungeon crawler görög mitológiai hangulattal, rengeteg build variációval és erős történetmeséléssel.', 9.30, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2020-09-17', 'https://store.steampowered.com/app/1145360/', 'A Hades élménye elképesztően pörgős és jutalmazó, mert minden runban érzed, hogy tanulsz: jobban mozogsz, jobban időzítesz, és okosabban választasz boonokat. A harc nagyon „kattogós” jó értelemben: gyors dodgek, pontos ütések, és folyamatos döntések, miközben a pályák és ellenfelek nem engednek unatkozni. A legjobb része, hogy a kudarc nem büntetés, hanem tartalom: visszamész a House of Hadesbe, kapsz új dialógust, fejlődsz, és újra próbálod. A build variációk miatt a játék sokáig friss marad, mert ugyanaz a fegyver is teljesen más stílusban működhet. Összességében addiktív, nagyon jól kiegyensúlyozott és tele van karakterrel.', 'A Hades részletesen egy olyan roguelike, ami a „még egy run” érzést tökéletesre csiszolja. A játékmenet alapja egyszerű: kijutsz az Alvilágból, de a részletek adják a mélységet. A fegyverek (és azok aspektusai) teljesen más tempót és döntéseket hoznak: van, ami közelharcos és agresszív, van, ami távolsági kontrollt igényel. A boon rendszer pedig azt jelenti, hogy minden run egy új kombinációs feladat: milyen istentől kapsz képességet, hogyan szinergizálnak, és mennyire építesz kritre, DOT-ra, burstre vagy védelemre. A döntések láncolódnak: egy korai boon meghatározza, mit érdemes később keresni, és a jó runok sokszor „összeállnak” egy világos iránnyá.\r\n\r\nA harc ritmusa a mobilitásról és a prioritásról szól. A pályák tele vannak olyan ellenfelekkel, akik különböző fenyegetést jelentenek, ezért fontos, hogy tudd, kit kell először leszedni, és mikor érdemes resetelni a pozíciót. A bossok pedig látványos csúcspontok: nem csak erősebbek, hanem tanítanak is, mert rávesznek a tiszta mintafelismerésre és időzítésre. A játék közben a meta-progression (mirror, keepsake-ek, fegyver upgrade) olyan „kicsi, de állandó” fejlődést ad, ami csökkenti a frusztrációt, de nem veszi el a kihívást.\r\n\r\nA történet és a karakterek itt nem díszletek, hanem motiváció. A dialógusok sokasága miatt a játék meglepően „élő”: a karakterek reagálnak a teljesítményedre, a döntéseidre és arra, hogy meddig jutottál. Emiatt a Hades nem csak mechanikai játék, hanem hangulat és sztori is, ami ritka a roguelike-ok között. Ezért tölti ki könnyen fél oldalt a részletes leírás: mert a Hades egyszerre remek akciójáték és egy nagyon szerethető, folyamatosan reagáló világ.', '2026-02-03 16:25:22', '2026-02-03 16:25:22'),
(14, 'Euro Truck Simulator 2', 15, 6444.00, 'FT', 18, 'Kamionszimulátor Európa útjain: fuvarok, vállalkozásépítés, teherautó-testreszabás és nyugodt, utazós hangulat.', 9.00, 'https://cdn.cloudflare.steamstatic.com/steam/apps/227300/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2012-10-19', 'https://store.steampowered.com/app/227300/', 'Az ETS2 élménye kifejezetten relax: bekapcsolod, felveszel egy fuvart, és egyszer csak azon kapod magad, hogy „még egy városig elmegyek”. A játék nem a reflexeket kéri, hanem a figyelmet és a tempót: sávváltás, előzés, kanyarok, sebességhatárok, parkolás. A legjobb része a hangulat, mert az utak, a táj és a rádió/zenék együtt egy „utazás” érzetet adnak, amit kevés játék tud így. Közben van cél is: pénzt keresel, bővítesz, jobb kamiont veszel, és felépítesz egy céget. Összességében nyugodt, meditatív és meglepően addiktív, ha szereted a szimulátorokat.', 'Az Euro Truck Simulator 2 részletesen egy olyan szimulátor, amely egyszerre ad „vezetésélményt” és hosszú távú menedzsmentet. A vezetés része a játék magja: a tömeg és a féktáv számít, a kanyarokat nem lehet „videójátékosan” bevenni, és a figyelmetlenség (túl gyors kanyar, rossz besorolás, késői fékezés) azonnal érződik. Emiatt a játék ritmusa lelassít, és pont ettől működik: nem rohan, hanem hagyja, hogy a távolságoknak súlya legyen. Sok játékosnak ez a „kikapcsolás” része: nincs állandó stressz, csak egy útvonal, egy határidő és egy kamion.\r\n\r\nA vállalkozásépítés adja a mélységet. Kezdetben kisebb fuvarokat vállalsz, majd ahogy nő a bevétel, jönnek a fejlesztések: jobb motor, jobb váltó, kényelmi és teljesítmény tuning, majd a saját garázs és alkalmazott sofőrök. Ettől a játék nem csak „vezetés”, hanem projekt: pénzügyi döntések, tervezés, és egy fokozatosan bővülő flotta. A fuvarok változatossága (távolság, súly, útvonal, idő) miatt a „még egy” érzés sokáig megmarad.\r\n\r\nA térkép és a felfedezés a harmadik pillér. Városról városra haladsz, autópályán és kisebb utakon, és közben egyre több helyet nyitsz meg, ami motivációt ad a hosszú utakhoz is. Ha szereted a realisztikusabb vezetési beállításokat (pl. kormány, kuplung, váltó), a játék különösen jó, de kontrollerrel is élvezhető. Az ETS2 ezért tölti ki könnyen fél oldalt: mert a nyugodt vezetés, a hosszú távú fejlődés és a felfedezés együtt egy nagyon stabil, komfortos játékélményt ad.', '2026-02-03 16:26:24', '2026-02-03 16:26:24'),
(15, 'Sid Meier\'s Civilization VI', 16, 19334.00, 'FT', 19, 'Körökre osztott 4X stratégia: városépítés, technológia, kultúra, diplomácia és háború a kőkorszaktól a modern korig.', 9.10, 'https://cdn.cloudflare.steamstatic.com/steam/apps/289070/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2016-10-21', 'https://store.steampowered.com/app/289070/', 'A Civ VI élménye a klasszikus „csak még egy kör”: mindig van egy közeli cél, ami miatt nem akarsz kilépni. A játék akkor működik a legjobban, amikor a saját stratégiád szépen összeáll: jó városhelyek, okos district tervezés, és olyan döntések, amik hosszú távon kifizetődnek. A diplomácia és a háború között jó az egyensúly: lehet békésen fejlődni, de ha kell, komoly konfliktusok is kialakulnak. A map és a felfedezés erős, mert az első 50-100 körben rengeteg „ismeretlen” dolog történik, ami izgalmassá teszi a kezdést. Összességében mély, újrajátszható, és kiváló, ha szereted a gondolkodós játékokat.', 'A Civilization VI részletesen egy 4X stratégia, ahol a döntéseid láncolata sok körrel később ér be. A siker alapja a tervezés: hova rakod a városokat, milyen erőforrásokat biztosítasz, és hogyan építed fel a termelés/tudomány/kultúra arányt. A district rendszer külön réteg, mert nem csak „építesz valamit”, hanem a térképen helyezel el infrastruktúrát, ami adjacency bónuszokkal erősödik. Ezért a várostervezés már a legelső köröktől stratégiai: hegyek, folyók, csodák, és a későbbi bővülés mind számít.\r\n\r\nA játékmenet közben folyamatosan mérlegelsz. Felfedezel és terjeszkedsz, de közben figyelned kell a barbárokra, a szomszédokra és a diplomáciai helyzetre. A háború akkor hatékony, ha célja van: terület, erőforrás, vagy egy fenyegetés megszüntetése. A békés játék pedig akkor erős, ha a gazdaságot és a növekedést stabilan felépíted. A különböző győzelmi feltételek (tudomány, kultúra, vallás, dominancia, diplomácia) miatt a játék nem „egy helyes” út, hanem többféle stratégiai ív, és ez adja az újrajátszhatóságot.\r\n\r\nA Civ VI egyik erőssége, hogy a középső és késői játékban is ad döntéseket: kormányformák, policy kártyák, szövetségek, kereskedelmi útvonalak, és a fejlődő hadsereg mind alakítják a birodalmat. Ha szereted a hosszú távú építkezést, a Civ VI nagyon hálás, mert minden körben kapsz valami „kicsi előrelépést”, ami összeadódik. Ezért könnyű fél oldalt írni róla: mert a játék lényege a rendszerek összjátéka, nem egyetlen feature.', '2026-02-03 16:28:07', '2026-02-03 16:28:07'),
(16, 'Tom Clancy\'s The Division 2', 17, 9665.00, 'FT', 20, 'Kooperatív, külső nézetes looter-shooter Washington D.C.-ben: küldetések, buildelés, endgame és PVP/PVE zónák.', 8.20, 'https://cdn.cloudflare.steamstatic.com/steam/apps/2221490/header.jpg', 'approved', NULL, NULL, NULL, NULL, '2019-03-15', 'https://store.steampowered.com/app/2221490/', 'A Division 2 élménye akkor a legjobb, ha 1-3 baráttal játszol: a fedezékrendszer és a szerepek (sebzés, support, tankosabb build) együtt nagyon jól működnek. A küldetések stabil, „taktikus lövölde” hangulatot adnak, ahol számít a pozíció és az, hogy mikor nyitsz vagy mikor resetelsz. A looter rész motiváló, mert folyamatosan finomítod a buildedet: talentek, setek, fegyverek és statok alapján. A világ hangulata erős, különösen amikor csak bejárod a várost, és közben open world eventekbe futsz. Összességében ez egy jó „hosszú távú” co-op játék, ha szereted a fejlődést és a gear alapú optimalizálást.', 'A The Division 2 részletesen egy cover shooter és looter RPG hibrid, ahol a fejlődés nagy része a felszerelés és a build logikájából jön. A harc alapja a fedezék: ha nyíltan állsz, gyorsan büntet a játék, viszont jól választott pozícióval és okos mozgással nagyon kontrollált fightokat lehet csinálni. A küldetések során a pályák gyakran több hullámban dobják az ellenfeleket, ezért fontos az erőforrás menedzsment: armor kit, skill cooldown, lőszer, és az, hogy mikor vállalsz agresszív push-t. A csapatjáték előnye itt kézzelfogható: egy jó healer/support vagy crowd control skill teljesen át tudja fordítani a nehéz helyzeteket.\r\n\r\nA loot és build rendszer adja a játék hosszú távú gerincét. Nem csak „nagyobb szám = jobb”, hanem szinergiák vannak: bizonyos talentek egymásra épülnek, set bónuszok meghatározzák a stílust, és a fegyverek viselkedése is más-más. Emiatt a játék kifejezetten jutalmazza, ha célzottan építkezel: például crit alapú DPS, skill powerre építő technikus, vagy túlélésre és csapatsegítésre optimalizált build. Az endgame tartalom (nehézségi szintek, specializációk, változó események) akkor működik a legjobban, ha van motivációd finomhangolni a karaktert.\r\n\r\nA nyílt világ réteg sem csak díszlet. A map tele van elfoglalható pontokkal, eventekkel és frakcióharcokkal, és ettől a város „mozog”. PVP-ben (Dark Zone jelleg) pedig megjelenik a feszültség, mert a loot és a kockázat együtt emeli a tétet. Ezért tölti ki könnyen fél oldalt a részletes leírás: mert a Division 2 lényege a taktikus harc + buildelés + hosszú távú fejlődés hármasa.', '2026-02-03 16:31:10', '2026-02-03 16:31:10'),
(18, 'https://sunmed.hu/app/uploads/sites/2/2023/02/sun428-keto-cont-ketonszintmero-tesztcsik-onellenorzesre-50-db-doboz-1.jpg', 19, 0.00, 'USD', NULL, 'https://sunmed.hu/app/uploads/sites/2/2023/02/sun428-keto-cont-ketonszintmero-tesztcsik-onellenorzesre-50-db-doboz-1.jpg', 5.00, 'https://sunmed.hu/app/uploads/sites/2/2023/02/sun428-keto-cont-ketonszintmero-tesztcsik-onellenorzesre-50-db-doboz-1.jpg', 'rejected', 4, NULL, NULL, 'szar', NULL, NULL, NULL, NULL, '2026-02-11 08:02:38', '2026-02-11 08:03:39');

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
(1, 1),
(1, 6),
(1, 7),
(1, 8),
(2, 3),
(2, 7),
(2, 8),
(2, 10),
(3, 1),
(3, 2),
(3, 4),
(3, 15),
(4, 2),
(4, 3),
(4, 4),
(4, 11),
(6, 1),
(6, 2),
(6, 4),
(6, 15),
(7, 1),
(7, 2),
(7, 4),
(7, 15),
(8, 1),
(8, 2),
(8, 15),
(8, 25),
(9, 1),
(9, 6),
(9, 7),
(9, 8),
(9, 16),
(10, 1),
(10, 6),
(10, 7),
(10, 8),
(10, 16),
(11, 1),
(11, 3),
(11, 6),
(11, 7),
(11, 8),
(12, 2),
(12, 11),
(12, 25),
(12, 59),
(13, 1),
(13, 2),
(13, 63),
(14, 25),
(14, 59),
(15, 3),
(15, 7),
(15, 69),
(15, 70),
(16, 1),
(16, 7),
(16, 11),
(16, 15);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok_platformok`
--

CREATE TABLE `jatekok_platformok` (
  `idjatekok` int(11) NOT NULL,
  `idplatform` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `jatekok_platformok`
--

INSERT INTO `jatekok_platformok` (`idjatekok`, `idplatform`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatek_videok`
--

CREATE TABLE `jatek_videok` (
  `id` int(11) NOT NULL,
  `idjatekok` int(11) NOT NULL,
  `url` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `jatek_videok`
--

INSERT INTO `jatek_videok` (`id`, `idjatekok`, `url`) VALUES
(1, 1, 'https://www.youtube.com/watch?v=nSE38xjMLqE'),
(2, 1, 'https://www.youtube.com/watch?v=c80dVYcL69E'),
(3, 1, 'https://www.youtube.com/watch?v=YB-4SybUJyc'),
(4, 2, 'https://www.youtube.com/watch?v=ceQ2XFS1tUo'),
(5, 2, 'https://www.youtube.com/watch?v=-v19Aa4H5hs'),
(6, 2, 'https://www.youtube.com/watch?v=F0evM-hBlcI'),
(7, 3, 'https://www.youtube.com/watch?v=rHoDGkpktPE'),
(8, 3, 'https://www.youtube.com/watch?v=jentG1Cyp9s'),
(9, 3, 'https://www.youtube.com/watch?v=OT8if6DXOFQ'),
(10, 4, 'https://www.youtube.com/watch?v=1T22wNvoNiU'),
(11, 4, 'https://www.youtube.com/watch?v=OcP0WdH7rTs'),
(12, 4, 'https://www.youtube.com/watch?v=jNY7AEQ59-8'),
(13, 6, 'https://www.youtube.com/watch?v=UnA7tepsc7s'),
(14, 6, 'https://www.youtube.com/watch?v=YApuEWtG30w'),
(15, 6, 'https://www.youtube.com/watch?v=sJbexcm4Trk'),
(16, 7, 'https://www.youtube.com/watch?v=XHrskkHf958'),
(17, 7, 'https://www.youtube.com/watch?v=1-l29HlKkXU'),
(18, 7, 'https://www.youtube.com/watch?v=c0i88t0Kacs'),
(19, 8, 'https://www.youtube.com/watch?v=SXvQ1nK4oxk'),
(20, 8, 'https://www.youtube.com/watch?v=g-WKpapqVU8'),
(21, 8, 'https://www.youtube.com/watch?v=F63h3v9QV7w'),
(22, 9, 'https://www.youtube.com/watch?v=innmNewjkuk'),
(23, 9, 'https://www.youtube.com/watch?v=oQtHENM_GZU'),
(24, 9, 'https://www.youtube.com/watch?v=oshvcDjEKZc'),
(25, 10, 'https://www.youtube.com/watch?v=fDLAFIhfFy4'),
(26, 10, 'https://www.youtube.com/watch?v=c215QLferhs'),
(27, 10, 'https://www.youtube.com/watch?v=7DUdAnO09U8'),
(28, 11, 'https://www.youtube.com/watch?v=RPY3TQSolm4'),
(29, 11, 'https://www.youtube.com/watch?v=lsMGmdavlJU'),
(30, 11, 'https://www.youtube.com/watch?v=BI9fgQY0d5I'),
(31, 12, 'https://www.youtube.com/watch?v=ot7uXNQskhs'),
(32, 12, 'https://www.youtube.com/watch?v=8A7A1X1TVNc'),
(33, 12, 'https://www.youtube.com/watch?v=GyfhTdWTJnY'),
(34, 13, 'https://www.youtube.com/watch?v=91t0ha9x0AE'),
(35, 13, 'https://www.youtube.com/watch?v=Bz8l935Bv0Y'),
(36, 13, 'https://www.youtube.com/watch?v=EYUdG_KRSz4'),
(37, 14, 'https://www.youtube.com/watch?v=2kWxiKEpWYU'),
(38, 14, 'https://www.youtube.com/watch?v=xlTuC18xVII'),
(39, 14, 'https://www.youtube.com/watch?v=5uvwfskYwl0'),
(40, 15, 'https://www.youtube.com/watch?v=5KdE0p2joJw'),
(41, 15, 'https://www.youtube.com/watch?v=pYk_zkA19Nw'),
(42, 15, 'https://www.youtube.com/watch?v=1XzLcAH1MFw'),
(43, 16, 'https://www.youtube.com/watch?v=jF9OG_2NH4M'),
(44, 16, 'https://www.youtube.com/watch?v=sli7AbX2bEk'),
(45, 16, 'https://www.youtube.com/watch?v=7PMW8Lu80EE');

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
(70, '4X'),
(1, 'Akció'),
(6, 'FPS'),
(2, 'Kaland'),
(11, 'Kooperatív'),
(69, 'Körökre osztott'),
(74, 'Looter shooter'),
(10, 'MOBA'),
(15, 'Nyílt világ'),
(8, 'PVP'),
(63, 'Roguelike'),
(4, 'RPG'),
(25, 'Sandbox'),
(71, 'Singleplayer'),
(5, 'Sport'),
(3, 'Stratégia'),
(59, 'Szimulátor'),
(7, 'Többjátékos'),
(16, 'Túlélő');

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
  `datum` timestamp NOT NULL DEFAULT current_timestamp(),
  `modositva` timestamp NULL DEFAULT NULL,
  `status` enum('active','hidden','deleted') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `kommentek`
--

INSERT INTO `kommentek` (`idkommentek`, `idjatekok`, `idfelhasznalo`, `tartalom`, `ertekeles`, `datum`, `modositva`, `status`) VALUES
(1, 4, 3, 'asd', 5.00, '2026-02-04 07:24:46', NULL, 'active'),
(2, 12, 3, 'dfdafa', 5.00, '2026-02-04 07:34:59', NULL, 'active'),
(3, 11, 3, 'kurva komment', 5.00, '2026-02-04 07:43:26', NULL, 'active'),
(4, 2, 3, 'dasd', 5.00, '2026-02-04 07:48:50', NULL, 'active'),
(5, 2, 4, 'fdsf', 5.00, '2026-02-11 08:05:57', NULL, 'active'),
(6, 2, 4, 'dsf', 5.00, '2026-02-11 08:05:58', NULL, 'active'),
(7, 11, 4, 'dsfds', 5.00, '2026-02-11 08:06:01', NULL, 'active');

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
(4, 'Nintendo'),
(1, 'PC'),
(2, 'PlayStation'),
(3, 'Xbox');

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
(8, '', ''),
(3, 'Minimum: macOS 10.12, 4GB RAM', 'Ajánlott: macOS 11.0, 8GB RAM'),
(1, 'Minimum: Windows 10, 4GB RAM, 2GB VRAM', 'Ajánlott: Windows 10, 8GB RAM, 4GB VRAM'),
(2, 'Minimum: Windows 7, 2GB RAM, 1GB VRAM', 'Ajánlott: Windows 10, 4GB RAM, 2GB VRAM'),
(16, 'OS: Windows 10; CPU: 2.0 GHz; RAM: 2 GB; GPU: 256 MB; DirectX: 10; Storage: 1 GB', 'OS: Windows 11; CPU: 2.5 GHz; RAM: 4 GB; GPU: 1 GB; DirectX: 11; Storage: 1 GB'),
(17, 'OS: Windows 10; CPU: Dual Core 2.4 GHz; RAM: 4 GB; GPU: 1 GB VRAM (DX11); DirectX: 11; Storage: 15 GB', 'OS: Windows 11; CPU: Quad Core 3.0 GHz; RAM: 8 GB; GPU: 2 GB+ VRAM (DX11/DX12); DirectX: 11/12; Storage: 15 GB'),
(18, 'OS: Windows 10; CPU: Dual Core 2.4 GHz; RAM: 4 GB; GPU: 1 GB VRAM (DX11); DirectX: 11; Storage: 25 GB', 'OS: Windows 11; CPU: Quad Core 3.0 GHz; RAM: 8 GB; GPU: 2 GB+ VRAM; DirectX: 11/12; Storage: 25 GB'),
(5, 'OS: Windows 10; CPU: Dual-core 2.8 GHz; RAM: 4 GB; GPU: 1 GB VRAM; DirectX: 11; Storage: 60 GB', 'OS: Windows 11; CPU: Quad-core 3.2 GHz; RAM: 8 GB; GPU: 2 GB+ VRAM; DirectX: 11/12; Storage: 60 GB'),
(4, 'OS: Windows 10; CPU: Intel Core i5 (4 szál); RAM: 8 GB; GPU: GTX 1060 / RX 580; DirectX: 11/12; Storage: 85 GB', 'OS: Windows 11; CPU: Intel Core i7 / Ryzen 7; RAM: 16 GB; GPU: RTX 2060+; DirectX: 12; Storage: 85 GB'),
(12, 'OS: Windows 10; CPU: Intel Core i5-2500K / AMD FX-6300; RAM: 8 GB; GPU: GTX 770 2GB / R9 280 3GB; DirectX: 12; Storage: 150 GB', 'OS: Windows 11; CPU: Intel Core i7-4770K / AMD Ryzen 5 1500X; RAM: 12 GB; GPU: GTX 1060 6GB / RX 480 4GB; DirectX: 12; Storage: 150 GB'),
(9, 'OS: Windows 10; CPU: Intel Core i5-3570K / AMD FX-8310; RAM: 8 GB; GPU: GTX 970 / RX 470; DirectX: 12; Storage: 80 GB', 'OS: Windows 11; CPU: Intel Core i7-4790 / AMD Ryzen 3 3200G; RAM: 12 GB; GPU: RTX 2060 / RX 5700 XT; DirectX: 12; Storage: 80 GB'),
(6, 'OS: Windows 10; CPU: Intel Core i5-8400 / Ryzen 3 3300X; RAM: 12 GB; GPU: GTX 1060 3GB / RX 580 4GB; DirectX: 12; Storage: 60 GB', 'OS: Windows 11; CPU: Intel Core i7-8700K / Ryzen 5 3600X; RAM: 16 GB; GPU: GTX 1070 8GB / RX Vega 56 8GB; DirectX: 12; Storage: 60 GB'),
(19, 'OS: Windows 10; CPU: Intel i3 2.5 GHz / AMD Phenom II 2.6 GHz; RAM: 4 GB; GPU: GTX 450 / HD 5570; DirectX: 11; Storage: 17 GB', 'OS: Windows 11; CPU: Intel i5 3.0 GHz / AMD Ryzen 3; RAM: 8 GB; GPU: GTX 970 / RX 580; DirectX: 11/12; Storage: 17 GB'),
(15, 'OS: Windows 10; CPU: Intel i3-560 / AMD Phenom II X4 945; RAM: 6 GB; GPU: GTX 460 / HD 5870; DirectX: 11; Storage: 85 GB', 'OS: Windows 11; CPU: Intel i5-2500K / AMD Ryzen 5 1600; RAM: 8 GB; GPU: GTX 970 / RX 580; DirectX: 11/12; Storage: 85 GB'),
(13, 'OS: Windows 10; CPU: Intel i3-6300 / Ryzen 3 1200; RAM: 6 GB; GPU: GTX 660 / HD 7850; DirectX: 11; Storage: 75 GB', 'OS: Windows 11; CPU: Intel i5 / Ryzen 5; RAM: 8 GB; GPU: GTX 970 / RX 580; DirectX: 11; Storage: 75 GB'),
(7, 'OS: Windows 10; CPU: Intel i5 4690 / AMD FX 8350; RAM: 8 GB; GPU: GTX 970 / RX 480; DirectX: 11/12; Storage: 150 GB', 'OS: Windows 11; CPU: Intel i7 8700K / AMD Ryzen 5 3600; RAM: 16 GB; GPU: RTX 2060+ / RX 5700 XT; DirectX: 12; Storage: 150 GB'),
(11, 'OS: Windows 10; CPU: Intel i5-2500K / AMD FX-6300; RAM: 6 GB; GPU: GTX 660 / HD 7870; DirectX: 11; Storage: 50 GB', 'OS: Windows 11; CPU: Intel i7-3770 / AMD FX-8350; RAM: 8 GB; GPU: GTX 770 / R9 290; DirectX: 11; Storage: 50 GB'),
(20, 'OS: Windows 10; CPU: Intel i5-2500K / AMD FX-6350; RAM: 8 GB; GPU: GTX 670 / R9 280X; DirectX: 11; Storage: 70 GB', 'OS: Windows 11; CPU: Intel i7-4790 / AMD Ryzen 5 1500X; RAM: 16 GB; GPU: GTX 970 / RX 480; DirectX: 11/12; Storage: 70 GB'),
(14, 'OS: Windows 10; CPU: Intel i5-4430 / AMD FX-6300; RAM: 8 GB; GPU: GTX 960 2GB / R7 370 2GB; DirectX: 11; Storage: 50 GB', 'OS: Windows 11; CPU: Intel i5-6600K / AMD Ryzen 5 1600; RAM: 16 GB; GPU: GTX 1060 3GB / RX 580 4GB; DirectX: 11; Storage: 50 GB');

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
-- A tábla adatainak kiíratása `wishlist`
--

INSERT INTO `wishlist` (`id`, `idfelhasznalo`, `idjatekok`, `created_at`) VALUES
(1, 3, 2, '2026-02-04 07:49:54'),
(3, 4, 1, '2026-02-11 08:06:29');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `fejleszto`
--
ALTER TABLE `fejleszto`
  ADD PRIMARY KEY (`idfejleszto`),
  ADD UNIQUE KEY `uq_fejleszto_nev` (`nev`);

--
-- A tábla indexei `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD PRIMARY KEY (`idfelhasznalo`),
  ADD UNIQUE KEY `uq_felhasznalo_felhasznalonev` (`felhasznalonev`),
  ADD KEY `idx_felhasznalo_szerepkor` (`szerepkor`),
  ADD KEY `idx_felhasznalo_aktiv` (`aktiv`);

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
-- A tábla indexei `jatekextra`
--
ALTER TABLE `jatekextra`
  ADD PRIMARY KEY (`idjatekok`);

--
-- A tábla indexei `jatekok`
--
ALTER TABLE `jatekok`
  ADD PRIMARY KEY (`idjatekok`),
  ADD KEY `idx_jatekok_status` (`status`),
  ADD KEY `idx_jatekok_idfejleszto` (`idfejleszto`),
  ADD KEY `idx_jatekok_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_jatekok_approved_by` (`approved_by`),
  ADD KEY `idx_jatekok_idrendszerkovetelmeny` (`idrendszerkovetelmeny`),
  ADD KEY `idx_jatekok_ertekeles` (`ertekeles`),
  ADD KEY `idx_jatekok_created_at` (`created_at`);

--
-- A tábla indexei `jatekok_kategoriak`
--
ALTER TABLE `jatekok_kategoriak`
  ADD PRIMARY KEY (`idjatekok`,`idkategoria`),
  ADD KEY `idx_jk_idkategoria` (`idkategoria`);

--
-- A tábla indexei `jatekok_platformok`
--
ALTER TABLE `jatekok_platformok`
  ADD PRIMARY KEY (`idjatekok`,`idplatform`),
  ADD KEY `idx_jp_idplatform` (`idplatform`);

--
-- A tábla indexei `jatek_videok`
--
ALTER TABLE `jatek_videok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_jatek_videok_idjatekok` (`idjatekok`);

--
-- A tábla indexei `kategoria`
--
ALTER TABLE `kategoria`
  ADD PRIMARY KEY (`idkategoria`),
  ADD UNIQUE KEY `uq_kategoria_nev` (`nev`);

--
-- A tábla indexei `kommentek`
--
ALTER TABLE `kommentek`
  ADD PRIMARY KEY (`idkommentek`),
  ADD KEY `idx_kommentek_idjatekok` (`idjatekok`),
  ADD KEY `idx_kommentek_idfelhasznalo` (`idfelhasznalo`),
  ADD KEY `idx_kommentek_status` (`status`),
  ADD KEY `idx_kommentek_datum` (`datum`);

--
-- A tábla indexei `platform`
--
ALTER TABLE `platform`
  ADD PRIMARY KEY (`idplatform`),
  ADD UNIQUE KEY `uq_platform_nev` (`nev`);

--
-- A tábla indexei `rendszerkovetelmeny`
--
ALTER TABLE `rendszerkovetelmeny`
  ADD PRIMARY KEY (`idrendszerkovetelmeny`),
  ADD UNIQUE KEY `uq_rendszerkovetelmeny_min_rec` (`minimum`,`ajanlott`);

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
  MODIFY `idfejleszto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT a táblához `felhasznalo`
--
ALTER TABLE `felhasznalo`
  MODIFY `idfelhasznalo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=310;

--
-- AUTO_INCREMENT a táblához `game_collection`
--
ALTER TABLE `game_collection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `jatekok`
--
ALTER TABLE `jatekok`
  MODIFY `idjatekok` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT a táblához `jatek_videok`
--
ALTER TABLE `jatek_videok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT a táblához `kategoria`
--
ALTER TABLE `kategoria`
  MODIFY `idkategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT a táblához `kommentek`
--
ALTER TABLE `kommentek`
  MODIFY `idkommentek` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `platform`
--
ALTER TABLE `platform`
  MODIFY `idplatform` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT a táblához `rendszerkovetelmeny`
--
ALTER TABLE `rendszerkovetelmeny`
  MODIFY `idrendszerkovetelmeny` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT a táblához `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `game_collection`
--
ALTER TABLE `game_collection`
  ADD CONSTRAINT `fk_collection_game` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_collection_user` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatekextra`
--
ALTER TABLE `jatekextra`
  ADD CONSTRAINT `fk_jatekextra_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatekok`
--
ALTER TABLE `jatekok`
  ADD CONSTRAINT `fk_jatekok_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_jatekok_fejleszto` FOREIGN KEY (`idfejleszto`) REFERENCES `fejleszto` (`idfejleszto`),
  ADD CONSTRAINT `fk_jatekok_rendszerkovetelmeny` FOREIGN KEY (`idrendszerkovetelmeny`) REFERENCES `rendszerkovetelmeny` (`idrendszerkovetelmeny`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_jatekok_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE SET NULL;

--
-- Megkötések a táblához `jatekok_kategoriak`
--
ALTER TABLE `jatekok_kategoriak`
  ADD CONSTRAINT `fk_jk_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_jk_kategoria` FOREIGN KEY (`idkategoria`) REFERENCES `kategoria` (`idkategoria`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatekok_platformok`
--
ALTER TABLE `jatekok_platformok`
  ADD CONSTRAINT `fk_jp_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_jp_platform` FOREIGN KEY (`idplatform`) REFERENCES `platform` (`idplatform`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatek_videok`
--
ALTER TABLE `jatek_videok`
  ADD CONSTRAINT `fk_jatek_videok_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE;

--
-- Megkötések a táblához `kommentek`
--
ALTER TABLE `kommentek`
  ADD CONSTRAINT `fk_kommentek_jatek` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_kommentek_user` FOREIGN KEY (`idfelhasznalo`) REFERENCES `felhasznalo` (`idfelhasznalo`) ON DELETE CASCADE;

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
