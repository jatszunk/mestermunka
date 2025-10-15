-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2025. Sze 10. 11:11
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
-- Adatbázis: `reklamoldal`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `ceg`
--

CREATE TABLE `ceg` (
  `idceg` int(11) NOT NULL,
  `nev` varchar(45) DEFAULT NULL,
  `leiras` varchar(45) DEFAULT NULL,
  `jatekaik` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalo`
--

CREATE TABLE `felhasznalo` (
  `idfelhasznalo` int(11) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `nev` varchar(45) DEFAULT NULL,
  `jelszo` varchar(45) DEFAULT NULL,
  `felhasznalonev` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok`
--

CREATE TABLE `jatekok` (
  `idjatekok` int(11) NOT NULL,
  `kiado` varchar(45) DEFAULT NULL,
  `kategoria` varchar(45) DEFAULT NULL,
  `ar` int(11) DEFAULT NULL,
  `platform` varchar(45) DEFAULT NULL,
  `fejleszto` varchar(45) DEFAULT NULL,
  `rendszerkovetelmeny` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `promociosjatekok`
--

CREATE TABLE `promociosjatekok` (
  `idpromociosjatekok` int(11) NOT NULL,
  `promociok` varchar(45) DEFAULT NULL,
  `jatekok` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `szoftverek`
--

CREATE TABLE `szoftverek` (
  `idszoftverek` int(11) NOT NULL,
  `fejleszto` varchar(45) DEFAULT NULL,
  `kiado` varchar(45) DEFAULT NULL,
  `ertekeles` varchar(45) DEFAULT NULL,
  `letoltesek` varchar(45) DEFAULT NULL,
  `platform` varchar(45) DEFAULT NULL,
  `rendszerkovetelmeny` varchar(45) DEFAULT NULL,
  `leiras` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `ceg`
--
ALTER TABLE `ceg`
  ADD PRIMARY KEY (`idceg`);

--
-- A tábla indexei `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD PRIMARY KEY (`idfelhasznalo`);

--
-- A tábla indexei `jatekok`
--
ALTER TABLE `jatekok`
  ADD PRIMARY KEY (`idjatekok`);

--
-- A tábla indexei `promociosjatekok`
--
ALTER TABLE `promociosjatekok`
  ADD PRIMARY KEY (`idpromociosjatekok`);

--
-- A tábla indexei `szoftverek`
--
ALTER TABLE `szoftverek`
  ADD PRIMARY KEY (`idszoftverek`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
