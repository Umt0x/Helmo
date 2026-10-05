const API = "https://discord.com/api/v10";

export type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  email?: string | null;
};

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  /** Permission bits as a decimal string. */
  permissions: string;
};

const ADMINISTRATOR = BigInt(0x8);
const MANAGE_GUILD = BigInt(0x20);

export function isDiscordConfigured() {
  return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
}

export function redirectUri() {
  return `${process.env.AUTH_URL}/api/auth/callback`;
}

export function authorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "identify email guilds",
    state,
    prompt: "none",
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export async function exchangeCode(code: string): Promise<string> {
  const res = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
    }),
  });
  if (!res.ok) throw new Error(`Discord token exchange failed (${res.status})`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function discordGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Discord ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

export const fetchUser = (token: string) => discordGet<DiscordUser>("/users/@me", token);

/** Only the servers the user can actually configure: owner, admin or Manage Server. */
export async function fetchManageableGuilds(token: string): Promise<DiscordGuild[]> {
  const guilds = await discordGet<DiscordGuild[]>("/users/@me/guilds", token);
  return guilds.filter((g) => {
    const p = BigInt(g.permissions);
    return g.owner || (p & ADMINISTRATOR) !== BigInt(0) || (p & MANAGE_GUILD) !== BigInt(0);
  });
}

export function avatarUrl(user: { id: string; avatar: string | null }, size = 64) {
  return user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`
    : null;
}

export function guildIconUrl(guild: { guildId: string; icon: string | null }, size = 64) {
  return guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.png?size=${size}` : null;
}
