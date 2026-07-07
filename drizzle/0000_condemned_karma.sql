CREATE TYPE "public"."recurrence" AS ENUM('daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255),
	"color" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" varchar(3) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(255) NOT NULL,
	"decimalPlaces" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"deviceIdentifier" varchar(255) NOT NULL,
	"platform" varchar(255) NOT NULL,
	"refreshTokenHash" varchar(255),
	"isRevoked" boolean DEFAULT false NOT NULL,
	"expiresAt" timestamp,
	"lastUsedAt" timestamp DEFAULT now() NOT NULL,
	"lastSyncAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"obligationId" uuid NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"sent" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_obligationId_unique" UNIQUE("obligationId")
);
--> statement-breakpoint
CREATE TABLE "obligations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"categoryId" uuid NOT NULL,
	"currencyCode" varchar(3) NOT NULL,
	"title" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"recurrence" "recurrence",
	"nextDueDate" timestamp NOT NULL,
	"reminderDays" integer NOT NULL,
	"lastPaidAt" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"note" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "recurring_transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"categoryId" uuid NOT NULL,
	"currencyCode" varchar(3) NOT NULL,
	"type" "transaction_type" NOT NULL,
	"recurrence" "recurrence" NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"nextOccurrenceAt" timestamp NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saving_contributions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"goalId" uuid NOT NULL,
	"transactionId" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saving_goals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"targetAmount" numeric(10, 2) NOT NULL,
	"currencyCode" varchar(3) NOT NULL,
	"deadline" timestamp NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"categoryId" uuid,
	"currencyCode" varchar(3),
	"amount" numeric(10, 2) NOT NULL,
	"exchangeRate" numeric(10, 2) NOT NULL,
	"baseCurrencyAmount" numeric(10, 2) NOT NULL,
	"description" varchar(255),
	"transactionDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"baseCurrency" varchar(3),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_obligationId_obligations_id_fk" FOREIGN KEY ("obligationId") REFERENCES "public"."obligations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_currencyCode_currencies_code_fk" FOREIGN KEY ("currencyCode") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_currencyCode_currencies_code_fk" FOREIGN KEY ("currencyCode") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saving_contributions" ADD CONSTRAINT "saving_contributions_goalId_saving_goals_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."saving_goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saving_contributions" ADD CONSTRAINT "saving_contributions_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saving_goals" ADD CONSTRAINT "saving_goals_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saving_goals" ADD CONSTRAINT "saving_goals_currencyCode_currencies_code_fk" FOREIGN KEY ("currencyCode") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_currencyCode_currencies_code_fk" FOREIGN KEY ("currencyCode") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_baseCurrency_currencies_code_fk" FOREIGN KEY ("baseCurrency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_category_per_user" ON "categories" USING btree ("id","userId");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_currency_code" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_device_per_user" ON "devices" USING btree ("deviceIdentifier","userId");--> statement-breakpoint
CREATE INDEX "idx_rec_trans_user_active_next" ON "recurring_transactions" USING btree ("userId","isActive","nextOccurrenceAt");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_name" ON "users" USING btree ("id");