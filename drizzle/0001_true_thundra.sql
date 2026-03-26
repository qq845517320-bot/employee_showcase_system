CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`departmentId` int NOT NULL,
	`position` varchar(100) NOT NULL,
	`level` varchar(50) NOT NULL,
	`joinDate` timestamp NOT NULL,
	`workPhoto` varchar(500),
	`jobResponsibilities` text,
	`motto` text,
	`status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
	`isCoreBone` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `honors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`description` text,
	`awardDate` timestamp NOT NULL,
	`isNew` boolean NOT NULL DEFAULT true,
	`icon` varchar(50) NOT NULL DEFAULT 'trophy',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `honors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playback_strategies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`displayMode` enum('all','core_bones','honors') NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT false,
	`autoPlayInterval` int NOT NULL DEFAULT 5000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playback_strategies_id` PRIMARY KEY(`id`),
	CONSTRAINT `playback_strategies_name_unique` UNIQUE(`name`)
);
