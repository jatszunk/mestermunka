-- Adatbázis módosítások a role rendszerhez és jóváhagyási folyamathoz

-- 1. Role mező hozzáadása a felhasználókhoz
ALTER TABLE `felhasznalo` ADD COLUMN `role` ENUM('user', 'gamedev', 'admin') NOT NULL DEFAULT 'user';

-- 2. Játék státusz mező hozzáadása
ALTER TABLE `jatekok` ADD COLUMN `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending';

-- 3. GameDev által feltöltött játékhoz kapcsolódó mező
ALTER TABLE `jatekok` ADD COLUMN `uploaded_by` INT NULL;

-- 4. Külső kulcs a feltöltőhöz
ALTER TABLE `jatekok` ADD CONSTRAINT `fk_uploaded_by` 
FOREIGN KEY (`uploaded_by`) REFERENCES `felhasznalo`(`idfelhasznalo`) ON DELETE SET NULL;

-- 5. Jóváhagyás időpontja és adminja
ALTER TABLE `jatekok` ADD COLUMN `approved_at` TIMESTAMP NULL;
ALTER TABLE `jatekok` ADD COLUMN `approved_by` INT NULL;

-- 6. Külső kulcs a jóváhagyó adminhoz
ALTER TABLE `jatekok` ADD CONSTRAINT `fk_approved_by` 
FOREIGN KEY (`approved_by`) REFERENCES `felhasznalo`(`idfelhasznalo`) ON DELETE SET NULL;

-- 7. Elutasítás oka
ALTER TABLE `jatekok` ADD COLUMN `rejection_reason` TEXT NULL;

-- 8. Mezők frissítése a meglévő adatokhoz
UPDATE `felhasznalo` SET `role` = 'admin' WHERE `felhasznalonev` = 'admin';

-- 9. Meglévő játékok jóváhagyása
UPDATE `jatekok` SET `status` = 'approved', `approved_at` = NOW() WHERE `status` = 'pending';

-- 10. Indexek a jobb teljesítményért
CREATE INDEX `idx_jatekok_status` ON `jatekok`(`status`);
CREATE INDEX `idx_jatekok_uploaded_by` ON `jatekok`(`uploaded_by`);
CREATE INDEX `idx_felhasznalo_role` ON `felhasznalo`(`role`);
