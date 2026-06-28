-- Chạy thủ công nếu DB_SYNCHRONIZE=false
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(64) NOT NULL,
  `message` text NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_contact_messages_createdAt` (`createdAt`),
  KEY `IDX_contact_messages_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
