CREATE TABLE `companySettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255),
	`address` varchar(255),
	`phone` varchar(20),
	`email` varchar(320),
	`licenseNumber` varchar(255),
	`logoUrl` varchar(512),
	`logoKey` varchar(255),
	`primaryColor` varchar(7) DEFAULT '#475569',
	`accentColor` varchar(7) DEFAULT '#22c55e',
	`defaultTerms` longtext,
	`defaultPaymentTerms` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companySettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lineItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(512) NOT NULL,
	`unit` varchar(50) DEFAULT 'each',
	`unitPrice` decimal(10,2) NOT NULL,
	`isTemplate` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lineItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientAddress` varchar(512),
	`clientEmail` varchar(320),
	`clientPhone` varchar(20),
	`templateId` int,
	`status` enum('draft','sent','viewed','signed','declined') NOT NULL DEFAULT 'draft',
	`scopeOfWork` longtext,
	`pricingData` json,
	`timeline` longtext,
	`terms` longtext,
	`subtotal` decimal(12,2) DEFAULT '0',
	`tax` decimal(12,2) DEFAULT '0',
	`discount` decimal(12,2) DEFAULT '0',
	`total` decimal(12,2) DEFAULT '0',
	`pdfUrl` varchar(512),
	`pdfKey` varchar(255),
	`sentAt` timestamp,
	`viewedAt` timestamp,
	`signedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`signerName` varchar(255) NOT NULL,
	`signatureDataUrl` longtext,
	`ipAddress` varchar(45),
	`signedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('monthly','lifetime') NOT NULL,
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`status` enum('active','canceled','past_due') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`trade` varchar(255) NOT NULL,
	`category` varchar(255),
	`scopeTemplate` longtext,
	`termsTemplate` longtext,
	`timelineTemplate` longtext,
	`isDefault` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
