CREATE TABLE "email_verification_otps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"otp" varchar(6) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_email_verification_otps_email" ON "email_verification_otps" USING btree ("email");