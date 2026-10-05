import { t2 as T, type PageDef } from "./types";

const ok = (en: string, tr: string) => ({ badge: T(en, tr), tone: "ok" as const });
const bad = (en: string, tr: string) => ({ badge: T(en, tr), tone: "bad" as const });
const warn = (en: string, tr: string) => ({ badge: T(en, tr), tone: "warn" as const });
const info = (en: string, tr: string) => ({ badge: T(en, tr), tone: "info" as const });

const CHANNELS = ["#general", "#welcome", "#logs", "#announcements", "#bot-commands"];

export const serverPages: Record<string, PageDef> = {
  system: {
    sections: [
      {
        title: T("Systems", "Sistemler"),
        desc: T("Switch whole parts of the bot on or off.", "Botun bölümlerini tek tek aç veya kapat."),
        glow: "green",
        rows: [
          { id: "bot", type: "toggle", label: T("Bot", "Bot"), desc: T("Master switch. Off means the bot stops answering.", "Ana şalter. Kapalıyken bot yanıt vermez."), def: true },
          { id: "commands", type: "toggle", label: T("Commands", "Komutlar"), def: true },
          { id: "guard", type: "toggle", label: T("Guard", "Guard"), def: true },
          { id: "voice", type: "toggle", label: T("Voice tokens", "Ses tokenleri"), def: true },
          { id: "audit", type: "toggle", label: T("Audit log", "Denetim kaydı"), def: true },
          { id: "tasks", type: "toggle", label: T("Tasks", "Görevler"), def: false },
          { id: "tickets", type: "toggle", label: T("Tickets", "Destek talepleri"), def: false },
        ],
      },
    ],
  },

  "general/basics": {
    sections: [
      {
        title: T("Server basics", "Sunucu temelleri"),
        rows: [
          { id: "name", type: "text", label: T("Display name", "Görünen ad"), def: "Umt Server" },
          { id: "logs", type: "select", label: T("Log channel", "Log kanalı"), options: CHANNELS, def: 2 },
          { id: "cmdch", type: "select", label: T("Command channel", "Komut kanalı"), options: CHANNELS, def: 4 },
          { id: "embed", type: "toggle", label: T("Use embeds for replies", "Yanıtlarda embed kullan"), def: true },
          { id: "dmerr", type: "toggle", label: T("Send errors by DM", "Hataları DM ile gönder"), def: false },
        ],
      },
    ],
  },
  "general/welcome": {
    sections: [
      {
        title: T("Welcome message", "Karşılama mesajı"),
        glow: "green",
        rows: [
          { id: "on", type: "toggle", label: T("Send welcome message", "Karşılama mesajı gönder"), def: true },
          { id: "ch", type: "select", label: T("Channel", "Kanal"), options: CHANNELS, def: 1 },
          { id: "text", type: "text", label: T("Message", "Mesaj"), def: "Welcome {user} to {server}!" },
          { id: "dm", type: "toggle", label: T("Also send by DM", "Ayrıca DM ile gönder"), def: false },
        ],
      },
      {
        title: T("Leave message", "Ayrılma mesajı"),
        rows: [
          { id: "loff", type: "toggle", label: T("Send leave message", "Ayrılma mesajı gönder"), def: false },
          { id: "ltext", type: "text", label: T("Message", "Mesaj"), def: "{user} left the server." },
        ],
      },
    ],
  },
  "general/language": {
    sections: [
      {
        title: T("Language & region", "Dil & bölge"),
        rows: [
          { id: "lang", type: "select", label: T("Server language", "Sunucu dili"), options: ["Türkçe", "English"], def: 0 },
          { id: "tz", type: "select", label: T("Time zone", "Saat dilimi"), options: ["Europe/Istanbul (UTC+3)", "UTC", "Europe/London", "America/New_York"], def: 0 },
          { id: "date", type: "select", label: T("Date format", "Tarih biçimi"), options: ["DD.MM.YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], def: 0 },
        ],
      },
    ],
  },

  "roles/permissions": {
    sections: [
      {
        title: T("Role permissions", "Rol izinleri"),
        table: {
          action: T("New role", "Yeni rol"),
          cols: [T("Role", "Rol"), T("Members", "Üye"), T("Manage server", "Sunucuyu yönet"), T("Moderate", "Moderasyon"), T("Status", "Durum")],
          rows: [
            ["@Owner", "1", ok("Yes", "Evet"), ok("Yes", "Evet"), info("Locked", "Kilitli")],
            ["@Admin", "3", ok("Yes", "Evet"), ok("Yes", "Evet"), ok("Active", "Aktif")],
            ["@Moderator", "8", bad("No", "Hayır"), ok("Yes", "Evet"), ok("Active", "Aktif")],
            ["@Helper", "14", bad("No", "Hayır"), bad("No", "Hayır"), ok("Active", "Aktif")],
            ["@Member", "1,224", bad("No", "Hayır"), bad("No", "Hayır"), ok("Active", "Aktif")],
          ],
        },
      },
    ],
  },
  "roles/reaction": {
    sections: [
      {
        title: T("Reaction roles", "Tepki rolleri"),
        desc: T("Members pick roles by reacting to a message.", "Üyeler bir mesaja tepki vererek rol seçer."),
        table: {
          action: T("New reaction role", "Yeni tepki rolü"),
          cols: [T("Message", "Mesaj"), T("Emoji", "Emoji"), T("Role", "Rol"), T("Uses", "Kullanım")],
          rows: [
            ["#roles / pick a game", "🎮", "@Gamer", "412"],
            ["#roles / pick a game", "🎵", "@Music", "198"],
            ["#roles / notifications", "🔔", "@Announcements", "980"],
          ],
        },
      },
    ],
  },
  "roles/auto": {
    sections: [
      {
        title: T("Auto roles", "Otomatik roller"),
        rows: [
          { id: "join", type: "chips", label: T("Give on join", "Katılınca ver"), options: ["@Member", "@Newcomer", "@Notify"], def: [0, 1] },
          { id: "bot", type: "chips", label: T("Give to bots", "Botlara ver"), options: ["@Bot", "@Integration"], def: [0] },
          { id: "delay", type: "number", label: T("Delay before giving", "Vermeden önce bekleme"), def: 0, unit: T("minutes", "dakika"), min: 0, max: 1440 },
          { id: "verify", type: "toggle", label: T("Wait for verification", "Doğrulamayı bekle"), def: true },
        ],
      },
    ],
  },

  "punishments/rules": {
    sections: [
      {
        title: T("Punishment rules", "Ceza kuralları"),
        desc: T("What happens when a rule is broken.", "Bir kural çiğnendiğinde ne olacağı."),
        rows: [
          { id: "spam", type: "select", label: T("Spam", "Spam"), options: [T("Warn", "Uyar"), T("Mute", "Sustur"), T("Kick", "At"), T("Ban", "Yasakla")], def: 1 },
          { id: "insult", type: "select", label: T("Insults", "Hakaret"), options: [T("Warn", "Uyar"), T("Mute", "Sustur"), T("Kick", "At"), T("Ban", "Yasakla")], def: 1 },
          { id: "ads", type: "select", label: T("Advertising", "Reklam"), options: [T("Warn", "Uyar"), T("Mute", "Sustur"), T("Kick", "At"), T("Ban", "Yasakla")], def: 3 },
          { id: "mute", type: "number", label: T("Default mute length", "Varsayılan susturma süresi"), def: 30, unit: T("minutes", "dakika"), min: 1, max: 10080 },
          { id: "dm", type: "toggle", label: T("Tell the member by DM", "Üyeye DM ile bildir"), def: true },
        ],
      },
    ],
  },
  "punishments/warns": {
    sections: [
      {
        title: T("Warn system", "Uyarı sistemi"),
        glow: "amber",
        rows: [
          { id: "on", type: "toggle", label: T("Enable warns", "Uyarıları aç"), def: true },
          { id: "mute", type: "slider", label: T("Auto-mute after", "Şu kadar uyarıda sustur"), min: 1, max: 10, def: 3, unit: T("warns", "uyarı") },
          { id: "kick", type: "slider", label: T("Auto-kick after", "Şu kadar uyarıda at"), min: 1, max: 15, def: 5, unit: T("warns", "uyarı") },
          { id: "ban", type: "slider", label: T("Auto-ban after", "Şu kadar uyarıda yasakla"), min: 1, max: 20, def: 8, unit: T("warns", "uyarı") },
          { id: "expire", type: "number", label: T("Warns expire after", "Uyarılar şu sürede silinir"), def: 30, unit: T("days", "gün"), min: 0, max: 365 },
        ],
      },
    ],
  },
  "punishments/roles": {
    sections: [
      {
        title: T("Mute & jail roles", "Susturma & hapis rolleri"),
        rows: [
          { id: "muterole", type: "select", label: T("Mute role", "Susturma rolü"), options: ["@Muted", "@Silenced"], def: 0 },
          { id: "jailrole", type: "select", label: T("Jail role", "Hapis rolü"), options: ["@Jailed", "@Restricted"], def: 0 },
          { id: "jailch", type: "select", label: T("Jail channel", "Hapis kanalı"), options: ["#jail", "#timeout"], def: 0 },
          { id: "keep", type: "toggle", label: T("Remove other roles while jailed", "Hapisteyken diğer rolleri al"), def: true },
        ],
      },
    ],
  },

  "staff/roles": {
    sections: [
      {
        title: T("Staff roles", "Yetkili rolleri"),
        rows: [
          { id: "staff", type: "chips", label: T("Roles counted as staff", "Yetkili sayılan roller"), options: ["@Admin", "@Moderator", "@Helper", "@Trial"], def: [0, 1, 2] },
          { id: "log", type: "toggle", label: T("Log staff actions", "Yetkili işlemlerini kaydet"), def: true },
          { id: "stats", type: "toggle", label: T("Track staff activity", "Yetkili aktivitesini takip et"), def: true },
        ],
      },
    ],
  },
  "staff/ranks": {
    sections: [
      {
        title: T("Rank ladder", "Yetki basamakları"),
        desc: T("Staff move up as they reach each requirement.", "Yetkililer her şartı sağladıkça yükselir."),
        table: {
          action: T("Add rank", "Basamak ekle"),
          cols: [T("Rank", "Basamak"), T("Needs", "Şart"), T("Members", "Üye"), T("Auto-promote", "Otomatik terfi")],
          rows: [
            ["@Trial", T("—", "—"), "5", ok("On", "Açık")],
            ["@Helper", T("7 days · 200 msgs", "7 gün · 200 mesaj"), "14", ok("On", "Açık")],
            ["@Moderator", T("30 days · 1,000 msgs", "30 gün · 1.000 mesaj"), "8", warn("Manual", "Elle")],
            ["@Admin", T("Owner approval", "Sahip onayı"), "3", warn("Manual", "Elle")],
          ],
        },
      },
    ],
  },
  "staff/logs": {
    sections: [
      {
        title: T("Staff activity", "Yetkili aktivitesi"),
        table: {
          cols: [T("Staff", "Yetkili"), T("Actions (7d)", "İşlem (7g)"), T("Voice (7d)", "Ses (7g)"), T("Last seen", "Son görülme"), T("Status", "Durum")],
          rows: [
            ["umt", "86", "14 h", T("now", "şimdi"), ok("Active", "Aktif")],
            ["aylin", "54", "9 h", T("2 h ago", "2 sa önce"), ok("Active", "Aktif")],
            ["kerem", "31", "4 h", T("1 day ago", "1 gün önce"), warn("Low", "Düşük")],
            ["mira", "3", "0 h", T("6 days ago", "6 gün önce"), bad("Inactive", "Pasif")],
          ],
        },
      },
    ],
  },

  "tasks/list": {
    sections: [
      {
        title: T("Tasks", "Görevler"),
        desc: T("Goals members and staff can complete for rewards.", "Üye ve yetkililerin ödül için tamamlayabileceği hedefler."),
        table: {
          action: T("New task", "Yeni görev"),
          cols: [T("Task", "Görev"), T("For", "Kimin için"), T("Goal", "Hedef"), T("Reward", "Ödül"), T("Status", "Durum")],
          rows: [
            [T("Chat 100 messages", "100 mesaj yaz"), T("Members", "Üyeler"), "100", "50 🪙", ok("Active", "Aktif")],
            [T("Spend 2 hours in voice", "Seste 2 saat geçir"), T("Members", "Üyeler"), "120 min", "80 🪙", ok("Active", "Aktif")],
            [T("Handle 10 tickets", "10 talep çöz"), T("Staff", "Yetkililer"), "10", "200 🪙", ok("Active", "Aktif")],
            [T("Invite 5 friends", "5 arkadaş davet et"), T("Members", "Üyeler"), "5", "150 🪙", warn("Paused", "Durduruldu")],
          ],
        },
      },
    ],
  },
  "tasks/goals": {
    stats: [
      { label: T("Completed this week", "Bu hafta tamamlanan"), value: "312", glow: "green" },
      { label: T("In progress", "Devam eden"), value: "148", glow: "cyan" },
      { label: T("Goal", "Hedef"), value: "500", sub: T("62% reached", "%62 tamamlandı"), glow: "amber" },
    ],
    sections: [
      {
        title: T("Weekly goals", "Haftalık hedefler"),
        rows: [
          { id: "msgs", type: "number", label: T("Messages per member", "Üye başına mesaj"), def: 150, min: 0, max: 5000 },
          { id: "voice", type: "number", label: T("Voice minutes per member", "Üye başına ses dakikası"), def: 120, min: 0, max: 5000 },
          { id: "reset", type: "select", label: T("Resets on", "Sıfırlanma günü"), options: [T("Monday", "Pazartesi"), T("Sunday", "Pazar")], def: 0 },
        ],
      },
    ],
  },
  "tasks/rewards": {
    sections: [
      {
        title: T("Rewards", "Ödüller"),
        rows: [
          { id: "type", type: "select", label: T("Reward type", "Ödül türü"), options: [T("Coins", "Coin"), T("Role", "Rol"), T("Voice token", "Ses tokeni")], def: 0 },
          { id: "mult", type: "slider", label: T("Reward multiplier", "Ödül çarpanı"), min: 1, max: 5, def: 1, unit: "×" },
          { id: "announce", type: "toggle", label: T("Announce completed tasks", "Tamamlanan görevleri duyur"), def: true },
        ],
      },
    ],
  },

  "more/tickets": {
    stats: [
      { label: T("Open", "Açık"), value: "7", glow: "amber" },
      { label: T("Closed (7d)", "Kapanan (7g)"), value: "58", glow: "green" },
      { label: T("Avg. reply", "Ort. yanıt"), value: "12 min", glow: "cyan" },
    ],
    sections: [
      {
        title: T("Ticket settings", "Talep ayarları"),
        rows: [
          { id: "on", type: "toggle", label: T("Enable tickets", "Talepleri aç"), def: true },
          { id: "cat", type: "select", label: T("Category", "Kategori"), options: ["Support", "Billing", "Reports"], def: 0 },
          { id: "limit", type: "number", label: T("Open tickets per member", "Üye başına açık talep"), def: 2, min: 1, max: 10 },
          { id: "transcript", type: "toggle", label: T("Save transcripts", "Konuşma dökümünü kaydet"), def: true },
        ],
      },
      {
        title: T("Open tickets", "Açık talepler"),
        table: {
          cols: [T("Ticket", "Talep"), T("Member", "Üye"), T("Opened", "Açılış"), T("Status", "Durum")],
          rows: [
            ["#0412", "deniz", T("10 min ago", "10 dk önce"), warn("Waiting", "Bekliyor")],
            ["#0411", "mira", T("1 h ago", "1 sa önce"), info("In progress", "İşlemde")],
            ["#0409", "joker42", T("5 h ago", "5 sa önce"), info("In progress", "İşlemde")],
          ],
        },
      },
    ],
  },
  "more/giveaways": {
    sections: [
      {
        title: T("Giveaways", "Çekilişler"),
        table: {
          action: T("New giveaway", "Yeni çekiliş"),
          cols: [T("Prize", "Ödül"), T("Entries", "Katılım"), T("Winners", "Kazanan"), T("Ends", "Bitiş"), T("Status", "Durum")],
          rows: [
            ["Discord Nitro", "812", "1", T("in 2 days", "2 gün sonra"), ok("Running", "Sürüyor")],
            ["500 🪙", "340", "3", T("in 5 h", "5 saat sonra"), ok("Running", "Sürüyor")],
            ["VIP Role", "204", "2", T("ended", "bitti"), info("Finished", "Bitti")],
          ],
        },
      },
    ],
  },
  "more/levels": {
    sections: [
      {
        title: T("Level system", "Seviye sistemi"),
        glow: "green",
        rows: [
          { id: "on", type: "toggle", label: T("Enable levels", "Seviyeleri aç"), def: true },
          { id: "xp", type: "slider", label: T("XP per message", "Mesaj başına XP"), min: 1, max: 50, def: 15, unit: "xp" },
          { id: "cd", type: "slider", label: T("XP cooldown", "XP bekleme süresi"), min: 0, max: 120, def: 60, unit: "s" },
          { id: "announce", type: "select", label: T("Level-up message", "Seviye atlama mesajı"), options: [T("In channel", "Kanalda"), T("By DM", "DM ile"), T("Off", "Kapalı")], def: 0 },
          { id: "voice", type: "toggle", label: T("Give XP in voice", "Seste XP ver"), def: true },
        ],
      },
    ],
  },
  "more/economy": {
    stats: [
      { label: T("Coins in circulation", "Dolaşımdaki coin"), value: "2.4M", glow: "amber" },
      { label: T("Richest member", "En zengin üye"), value: "48,120", sub: "mira", glow: "green" },
      { label: T("Daily claims", "Günlük alım"), value: "902", glow: "cyan" },
    ],
    sections: [
      {
        title: T("Economy settings", "Ekonomi ayarları"),
        rows: [
          { id: "on", type: "toggle", label: T("Enable economy", "Ekonomiyi aç"), def: true },
          { id: "name", type: "text", label: T("Currency name", "Para birimi adı"), def: "Coins" },
          { id: "daily", type: "number", label: T("Daily reward", "Günlük ödül"), def: 100, min: 0, max: 100000 },
          { id: "tax", type: "slider", label: T("Transfer tax", "Transfer vergisi"), min: 0, max: 30, def: 5, unit: "%" },
        ],
      },
    ],
  },
};
