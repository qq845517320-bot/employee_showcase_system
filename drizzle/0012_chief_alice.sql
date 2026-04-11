CREATE TABLE `company_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`photoUrl` varchar(500) NOT NULL,
	`description` text,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_photos_id` PRIMARY KEY(`id`)
);
