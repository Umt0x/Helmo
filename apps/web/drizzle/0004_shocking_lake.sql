CREATE TABLE "command_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bot_id" uuid NOT NULL,
	"guild_id" text,
	"command" text NOT NULL,
	"outcome" text NOT NULL,
	"duration_ms" integer,
	"error_id" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bot_heartbeats" ADD COLUMN "up_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bot_heartbeats" ADD COLUMN "loop_lag_ms" integer;--> statement-breakpoint
ALTER TABLE "command_events" ADD CONSTRAINT "command_events_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "command_events_bot_at_idx" ON "command_events" USING btree ("bot_id","at");