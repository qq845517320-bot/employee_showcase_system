ALTER TABLE `playback_strategies` MODIFY COLUMN `displayMode` enum('all','core_bones') NOT NULL;--> statement-breakpoint
ALTER TABLE `showcase_backgrounds` MODIFY COLUMN `displayMode` enum('all','core_bones') NOT NULL DEFAULT 'all';--> statement-breakpoint
ALTER TABLE `honors` ADD `category` enum('班组之星','集团级奖项','公司级奖项') DEFAULT '班组之星' NOT NULL;