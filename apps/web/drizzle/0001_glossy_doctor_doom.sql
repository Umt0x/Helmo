CREATE TABLE "guild_settings" (
	"guild_id" text NOT NULL,
	"page" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guild_settings_guild_id_page_pk" PRIMARY KEY("guild_id","page")
);
--> statement-breakpoint
ALTER TABLE "guild_settings" ADD CONSTRAINT "guild_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;