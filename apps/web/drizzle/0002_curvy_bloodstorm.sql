CREATE TABLE "bots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"discord_bot_id" text NOT NULL,
	"token_enc" text NOT NULL,
	"status" text DEFAULT 'offline' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_modules" (
	"guild_id" text NOT NULL,
	"module" text NOT NULL,
	"bot_id" uuid NOT NULL,
	CONSTRAINT "guild_modules_guild_id_module_pk" PRIMARY KEY("guild_id","module")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" text DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE "bots" ADD CONSTRAINT "bots_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guild_modules" ADD CONSTRAINT "guild_modules_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bots_discord_bot_id_idx" ON "bots" USING btree ("discord_bot_id");