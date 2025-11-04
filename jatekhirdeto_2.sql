-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2025. Nov 04. 09:40
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `felhasznalo`
--

INSERT INTO `felhasznalo` (`idfelhasznalo`, `email`, `nev`, `jelszo`, `felhasznalonev`) VALUES
(1, 'admin@games.com', 'admin', 'aaaa', 'admin'),
(2, 'felhasznalo@games.com', 'csaba', 'aaaa', 'csaba'),
(4, 'asd@gmail.com', NULL, 'aaa', 'aaa');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok`
--

CREATE TABLE `jatekok` (
  `idjatekok` int(11) NOT NULL,
  `nev` varchar(100) DEFAULT NULL,
  `idkiado` int(11) DEFAULT NULL,
  `idfejleszto` int(11) DEFAULT NULL,
  `idkategoria` int(11) DEFAULT NULL,
  `ar` varchar(255) DEFAULT NULL,
  `idplatform` int(11) DEFAULT NULL,
  `idrendszerkovetelmeny` int(11) DEFAULT NULL,
  `jatekleiras` varchar(255) DEFAULT NULL,
  `ertekeles` int(11) NOT NULL,
  `idkommentek` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kategoria`
--

CREATE TABLE `kategoria` (
  `idkategoria` int(11) NOT NULL,
  `nev` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `idfelhesznalo` int(11) NOT NULL,
  `fertekeles` int(11) NOT NULL,
  `tartalom` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id` int(11) NOT NULL,
  `minimum` varchar(255) NOT NULL,
  `ajanlott` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD PRIMARY KEY (`idfelhasznalo`);

--
-- A tábla indexei `jatekok`
--
ALTER TABLE `jatekok`
  ADD PRIMARY KEY (`idjatekok`),
  ADD KEY `idkiado` (`idkiado`),
  ADD KEY `idfejleszto` (`idfejleszto`),
  ADD KEY `idkategoria` (`idkategoria`),
  ADD KEY `idplatform` (`idplatform`),
  ADD KEY `rendszerkovetelmeny` (`idrendszerkovetelmeny`);

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
  ADD KEY `idfelhesznalo` (`idfelhesznalo`);

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
  ADD PRIMARY KEY (`id`);

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
  MODIFY `idfelhasznalo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `jatekok`
--
ALTER TABLE `jatekok`
  MODIFY `idjatekok` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kategoria`
--
ALTER TABLE `kategoria`
  MODIFY `idkategoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kiado`
--
ALTER TABLE `kiado`
  MODIFY `idkiado` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `jatekok`
--
ALTER TABLE `jatekok`
  ADD CONSTRAINT `jatekok_ibfk_1` FOREIGN KEY (`idkiado`) REFERENCES `kiado` (`idkiado`),
  ADD CONSTRAINT `jatekok_ibfk_2` FOREIGN KEY (`idfejleszto`) REFERENCES `fejleszto` (`idfejleszto`),
  ADD CONSTRAINT `jatekok_ibfk_3` FOREIGN KEY (`idkategoria`) REFERENCES `kategoria` (`idkategoria`),
  ADD CONSTRAINT `jatekok_ibfk_4` FOREIGN KEY (`idplatform`) REFERENCES `platform` (`idplatform`);

--
-- Megkötések a táblához `promociosjatekok`
--
ALTER TABLE `promociosjatekok`
  ADD CONSTRAINT `promociosjatekok_ibfk_1` FOREIGN KEY (`idpromocio`) REFERENCES `promociok` (`idpromocio`),
  ADD CONSTRAINT `promociosjatekok_ibfk_2` FOREIGN KEY (`idjatekok`) REFERENCES `jatekok` (`idjatekok`);

--
-- Megkötések a táblához `rendszerkovetelmeny`
--
ALTER TABLE `rendszerkovetelmeny`
  ADD CONSTRAINT `rendszerkovetelmeny_ibfk_1` FOREIGN KEY (`id`) REFERENCES `jatekok` (`idrendszerkovetelmeny`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
