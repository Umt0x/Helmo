CREATE TABLE "guild_channels" (
	"guild_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"name" text NOT NULL,
	"type" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "guild_channels_guild_id_channel_id_pk" PRIMARY KEY("guild_id","channel_id")
);
--> statement-breakpoint
CREATE TABLE "guild_counters" (
	"guild_id" text PRIMARY KEY NOT NULL,
	"case_seq" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_roles" (
	"guild_id" text NOT NULL,
	"role_id" text NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"color" integer DEFAULT 0 NOT NULL,
	"managed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "guild_roles_guild_id_role_id_pk" PRIMARY KEY("guild_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "mutes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"user_id" text NOT NULL,
	"bot_id" uuid NOT NULL,
	"role_id" text NOT NULL,
	"case_no" integer,
	"expires_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mod_actions" ADD COLUMN "case_no" integer;--> statement-breakpoint
ALTER TABLE "mutes" ADD CONSTRAINT "mutes_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mutes_active_expiry_idx" ON "mutes" USING btree ("active","expires_at");