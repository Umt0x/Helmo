CREATE TABLE "bot_guilds" (
	"bot_id" uuid NOT NULL,
	"guild_id" text NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bot_guilds_bot_id_guild_id_pk" PRIMARY KEY("bot_id","guild_id")
);
--> statement-breakpoint
ALTER TABLE "bot_guilds" ADD CONSTRAINT "bot_guilds_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;