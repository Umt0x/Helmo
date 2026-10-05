import {
  BarChart3,
  SquareTerminal,
  Bot,
  BookOpen,
  Mic,
  Shield,
  Power,
  SlidersHorizontal,
  BadgeCheck,
  Gavel,
  UserCog,
  ListChecks,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/i18n/en";

export type NavKey = keyof Dictionary["nav"];

export type NavItem = {
  key: NavKey;
  href: string;
  icon: LucideIcon;
  children?: { key: NavKey; href: string }[];
};

export const coreNav: NavItem[] = [
  {
    key: "stats",
    href: "stats",
    icon: BarChart3,
    children: [
      { key: "statsGuild", href: "stats/guild" },
      { key: "statsHosting", href: "stats/hosting" },
      { key: "statsCommands", href: "stats/commands" },
      { key: "statsVoice", href: "stats/voice" },
    ],
  },
  {
    key: "commands",
    href: "commands",
    icon: SquareTerminal,
    children: [
      { key: "cmdList", href: "commands/list" },
      { key: "cmdCustom", href: "commands/custom" },
      { key: "cmdPerms", href: "commands/permissions" },
      { key: "cmdCooldowns", href: "commands/cooldowns" },
    ],
  },
  {
    key: "bot",
    href: "bot-settings",
    icon: Bot,
    children: [
      { key: "botList", href: "bot-settings/bots" },
      { key: "botProfile", href: "bot-settings/profile" },
      { key: "botStatus", href: "bot-settings/status" },
      { key: "botPrefix", href: "bot-settings/prefix" },
      { key: "botToken", href: "bot-settings/token" },
    ],
  },
  {
    key: "audit",
    href: "audit-log",
    icon: BookOpen,
    children: [
      { key: "auditAll", href: "audit-log/all" },
      { key: "auditMod", href: "audit-log/moderation" },
      { key: "auditMembers", href: "audit-log/members" },
      { key: "auditServer", href: "audit-log/server" },
    ],
  },
  {
    key: "voice",
    href: "voice-tokens",
    icon: Mic,
    children: [
      { key: "voiceTokens", href: "voice-tokens/tokens" },
      { key: "voiceUsage", href: "voice-tokens/usage" },
      { key: "voiceHistory", href: "voice-tokens/history" },
    ],
  },
  {
    key: "guard",
    href: "guard",
    icon: Shield,
    children: [
      { key: "guardOverview", href: "guard/overview" },
      { key: "guardWhitelist", href: "guard/whitelist" },
      { key: "guardLogs", href: "guard/logs" },
    ],
  },
];

export const serverNav: NavItem[] = [
  { key: "system", href: "system", icon: Power },
  {
    key: "general",
    href: "general",
    icon: SlidersHorizontal,
    children: [
      { key: "genBasic", href: "general/basics" },
      { key: "genWelcome", href: "general/welcome" },
      { key: "genLanguage", href: "general/language" },
    ],
  },
  {
    key: "roles",
    href: "roles",
    icon: BadgeCheck,
    children: [
      { key: "rolePerms", href: "roles/permissions" },
      { key: "roleReaction", href: "roles/reaction" },
      { key: "roleAuto", href: "roles/auto" },
    ],
  },
  {
    key: "punish",
    href: "punishments",
    icon: Gavel,
    children: [
      { key: "punishRules", href: "punishments/rules" },
      { key: "punishWarn", href: "punishments/warns" },
      { key: "punishRoles", href: "punishments/roles" },
    ],
  },
  {
    key: "staff",
    href: "staff",
    icon: UserCog,
    children: [
      { key: "staffRoles", href: "staff/roles" },
      { key: "staffRanks", href: "staff/ranks" },
      { key: "staffLogs", href: "staff/logs" },
    ],
  },
  {
    key: "tasks",
    href: "tasks",
    icon: ListChecks,
    children: [
      { key: "taskList", href: "tasks/list" },
      { key: "taskGoals", href: "tasks/goals" },
      { key: "taskRewards", href: "tasks/rewards" },
    ],
  },
  {
    key: "more",
    href: "more",
    icon: Sparkles,
    children: [
      { key: "moreTickets", href: "more/tickets" },
      { key: "moreGiveaways", href: "more/giveaways" },
      { key: "moreLevels", href: "more/levels" },
      { key: "moreEconomy", href: "more/economy" },
    ],
  },
];

/** Finds the nav key (page title) for a /dashboard/... pathname. */
export function findNavKey(pathname: string): NavKey | undefined {
  const path = pathname.replace(/^\/dashboard\//, "");
  for (const item of [...coreNav, ...serverNav]) {
    if (item.href === path) return item.key;
    const child = item.children?.find((c) => c.href === path);
    if (child) return child.key;
  }
  return undefined;
}
