CREATE TABLE `showcase_backgrounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`backgroundUrl` varchar(500) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT false,
	`displayMode` enum('all','core_bones','honors') NOT NULL DEFAULT 'all',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `showcase_backgrounds_id` PRIMARY KEY(`id`)
);
