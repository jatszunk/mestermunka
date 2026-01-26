-- Rendszerkövetelmény rendszer frissítési szkript
-- Új táblák létrehozása a részletes rendszerkövetelményekhez

-- 1. Rendszerkövetelmény fő tábla
CREATE TABLE `system_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`game_id`) REFERENCES `jatekok`(`idjatekok`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Operációs rendszer követelmények
CREATE TABLE `os_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requirement_id` int(11) NOT NULL,
  `type` enum('minimum', 'recommended') NOT NULL,
  `os_name` varchar(50) NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `architecture` enum('32-bit', '64-bit', 'Both') DEFAULT '64-bit',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `system_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Processzor követelmények
CREATE TABLE `cpu_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requirement_id` int(11) NOT NULL,
  `type` enum('minimum', 'recommended') NOT NULL,
  `manufacturer` varchar(50) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `cores` int(11) DEFAULT NULL,
  `threads` int(11) DEFAULT NULL,
  `clock_speed` decimal(5,2) DEFAULT NULL COMMENT 'GHz',
  `architecture` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `system_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Memória követelmények
CREATE TABLE `memory_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requirement_id` int(11) NOT NULL,
  `type` enum('minimum', 'recommended') NOT NULL,
  `ram_size_gb` int(11) NOT NULL,
  `ram_type` varchar(20) DEFAULT NULL COMMENT 'DDR3, DDR4, DDR5',
  `speed_mhz` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `system_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Videokártya követelmények
CREATE TABLE `gpu_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requirement_id` int(11) NOT NULL,
  `type` enum('minimum', 'recommended') NOT NULL,
  `manufacturer` varchar(50) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `memory_gb` int(11) DEFAULT NULL,
  `memory_type` varchar(20) DEFAULT NULL COMMENT 'GDDR5, GDDR6, GDDR6X',
  `directx_version` varchar(10) DEFAULT NULL,
  `opengl_version` varchar(10) DEFAULT NULL,
  `ray_tracing` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `system_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Tárhely követelmények
CREATE TABLE `storage_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requirement_id` int(11) NOT NULL,
  `type` enum('minimum', 'recommended') NOT NULL,
  `storage_size_gb` int(11) NOT NULL,
  `storage_type` enum('HDD', 'SSD', 'NVMe SSD', 'Any') DEFAULT 'Any',
  `free_space_gb` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `system_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. Hálózati követelmények
CREATE TABLE `network_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requirement_id` int(11) NOT NULL,
  `type` enum('minimum', 'recommended') NOT NULL,
  `connection_type` enum('Broadband', 'Any') DEFAULT 'Any',
  `download_speed_mbps` int(11) DEFAULT NULL,
  `upload_speed_mbps` int(11) DEFAULT NULL,
  `ping_ms` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `system_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. Egyéb követelmények
CREATE TABLE `other_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requirement_id` int(11) NOT NULL,
  `type` enum('minimum', 'recommended') NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `system_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. Platform kompatibilitás
CREATE TABLE `platform_compatibility` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requirement_id` int(11) NOT NULL,
  `platform` enum('Windows', 'macOS', 'Linux', 'SteamOS', 'Console') NOT NULL,
  `supported` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `system_requirements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Minta adatok beillesztése (Project Castaway példa)
INSERT INTO `system_requirements` (`game_id`) VALUES (14);

-- Operációs rendszer követelmények
INSERT INTO `os_requirements` (`requirement_id`, `type`, `os_name`, `version`, `architecture`) VALUES
(1, 'minimum', 'Windows', '10', '64-bit'),
(1, 'recommended', 'Windows', '11', '64-bit'),
(1, 'minimum', 'macOS', '10.15', '64-bit'),
(1, 'recommended', 'macOS', '12.0', '64-bit'),
(1, 'minimum', 'Linux', 'Ubuntu 20.04', '64-bit'),
(1, 'recommended', 'Linux', 'Ubuntu 22.04', '64-bit');

-- Processzor követelmények
INSERT INTO `cpu_requirements` (`requirement_id`, `type`, `manufacturer`, `model`, `cores`, `threads`, `clock_speed`) VALUES
(1, 'minimum', 'Intel', 'Core i3-8100', 4, 4, 3.60),
(1, 'recommended', 'Intel', 'Core i5-10400', 6, 12, 4.30),
(1, 'minimum', 'AMD', 'Ryzen 3 1200', 4, 4, 3.10),
(1, 'recommended', 'AMD', 'Ryzen 5 3600', 6, 12, 3.60);

-- Memória követelmények
INSERT INTO `memory_requirements` (`requirement_id`, `type`, `ram_size_gb`, `ram_type`, `speed_mhz`) VALUES
(1, 'minimum', 8, 'DDR4', 2666),
(1, 'recommended', 16, 'DDR4', 3200);

-- Videokártya követelmények
INSERT INTO `gpu_requirements` (`requirement_id`, `type`, `manufacturer`, `model`, `memory_gb`, `memory_type`, `directx_version`) VALUES
(1, 'minimum', 'NVIDIA', 'GeForce GTX 1050 Ti', 4, 'GDDR5', '11'),
(1, 'recommended', 'NVIDIA', 'GeForce RTX 3060', 12, 'GDDR6', '12'),
(1, 'minimum', 'AMD', 'Radeon RX 570', 4, 'GDDR5', '12'),
(1, 'recommended', 'AMD', 'Radeon RX 6600 XT', 8, 'GDDR6', '12');

-- Tárhely követelmények
INSERT INTO `storage_requirements` (`requirement_id`, `type`, `storage_size_gb`, `storage_type`, `free_space_gb`) VALUES
(1, 'minimum', 20, 'SSD', 25),
(1, 'recommended', 20, 'NVMe SSD', 30);

-- Hálózati követelmények
INSERT INTO `network_requirements` (`requirement_id`, `type`, `connection_type`, `download_speed_mbps`) VALUES
(1, 'minimum', 'Broadband', 10),
(1, 'recommended', 'Broadband', 25);

-- Platform kompatibilitás
INSERT INTO `platform_compatibility` (`requirement_id`, `platform`, `supported`, `notes`) VALUES
(1, 'Windows', 1, 'Full support'),
(1, 'macOS', 1, 'Full support'),
(1, 'Linux', 1, 'Full support'),
(1, 'SteamOS', 1, 'Steam Deck compatible');

-- Egyéb követelmények
INSERT INTO `other_requirements` (`requirement_id`, `type`, `category`, `description`) VALUES
(1, 'minimum', 'Input', 'Keyboard and Mouse'),
(1, 'minimum', 'Audio', 'DirectX compatible sound card'),
(1, 'recommended', 'Input', 'Gamepad recommended for optimal experience');
