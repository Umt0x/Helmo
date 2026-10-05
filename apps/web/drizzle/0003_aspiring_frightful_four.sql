CREATE TABLE "bot_heartbeats" (
	"bot_id" uuid PRIMARY KEY NOT NULL,
	"seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ping_ms" integer,
	"guild_count" integer DEFAULT 0 NOT NULL,
	"worker_id" text,
	"rss_mb" integer
);
--> statement-breakpoint
ALTER TABLE "bot_heartbeats" ADD CONSTRAINT "bot_heartbeats_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;