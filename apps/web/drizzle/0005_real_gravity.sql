CREATE TABLE "mod_actions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"action" text NOT NULL,
	"target_id" text,
	"moderator_id" text NOT NULL,
	"reason" text,
	"duration_min" integer,
	"auto" boolean DEFAULT false NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "mod_actions_guild_target_idx" ON "mod_actions" USING btree ("guild_id","target_id","action","at");