import { t2 as T, type PageDef } from "./types";

const ok = (en: string, tr: string) => ({ badge: T(en, tr), tone: "ok" as const });
const bad = (en: string, tr: string) => ({ badge: T(en, tr), tone: "bad" as const });
const warn = (en: string, tr: string) => ({ badge: T(en, tr), tone: "warn" as const });
const info = (en: string, tr: string) => ({ badge: T(en, tr), tone: "info" as const });

const ROLES = [T("Owner", "Sahip"), T("Admin", "Yönetici"), T("Moderator", "Moderatör"), T("Helper", "Yardımcı"), T("Member", "Üye")];

export const corePages: Record<string, PageDef> = {
  "stats/commands": {
    stats: [
      { label: T("Commands today", "Bugünkü komutlar"), value: "8,421", sub: "+6.2%", glow: "green" },
      { label: T("Unique users", "Tekil kullanıcı"), value: "1,094", sub: T("last 24 hours", "son 24 saat"), glow: "cyan" },
      { label: T("Success rate", "Başarı oranı"), value: "99.4%", sub: T("48 failed", "48 başarısız"), glow: "green" },
      { label: T("Avg. response", "Ort. yanıt"), value: "182 ms", sub: T("p95: 410 ms", "p95: 410 ms"), glow: "amber" },
    ],
    sections: [
      {
        title: T("Most used commands", "En çok kullanılan komutlar"),
        table: {
          cols: [T("Command", "Komut"), T("Uses", "Kullanım"), T("Users", "Kullanıcı"), T("Avg. time", "Ort. süre"), T("Status", "Durum")],
          rows: [
            [{ code: "/daily" }, "2,310", "902", "96 ms", ok("Healthy", "Sağlıklı")],
            [{ code: "/balance" }, "1,874", "811", "88 ms", ok("Healthy", "Sağlıklı")],
            [{ code: "/userinfo" }, "1,203", "640", "214 ms", ok("Healthy", "Sağlıklı")],
            [{ code: "/ban" }, "412", "37", "301 ms", ok("Healthy", "Sağlıklı")],
            [{ code: "/clear" }, "276", "52", "640 ms", warn("Slow", "Yavaş")],
            [{ code: "/meme" }, "190", "121", "1.2 s", bad("Failing", "Hata veriyor")],
          ],
        },
      },
    ],
  },
  "stats/voice": {
    stats: [
      { label: T("Voice hours today", "Bugünkü ses saati"), value: "412 h", sub: "+9.1%", glow: "green" },
      { label: T("Active now", "Şu an aktif"), value: "86", sub: T("in 14 channels", "14 kanalda"), glow: "cyan" },
      { label: T("Peak concurrent", "En yüksek eşzamanlı"), value: "212", sub: "21:30", glow: "amber" },
      { label: T("Avg. session", "Ort. oturum"), value: "47 min", sub: T("per member", "üye başına"), glow: "green" },
    ],
    sections: [
      {
        title: T("Busiest voice channels", "En yoğun ses kanalları"),
        table: {
          cols: [T("Channel", "Kanal"), T("Members", "Üye"), T("Hours", "Saat"), T("Peak", "Zirve")],
          rows: [
            ["🎮 Gaming 1", "34", "128 h", "62"],
            ["💬 Chill", "21", "96 h", "48"],
            ["🎵 Music", "17", "71 h", "39"],
            ["📚 Study", "9", "44 h", "18"],
          ],
        },
      },
    ],
  },

  "commands/custom": {
    sections: [
      {
        title: T("Custom commands", "Özel komutlar"),
        desc: T("Commands you created for your own server.", "Kendi sunucun için oluşturduğun komutlar."),
        table: {
          action: T("New command", "Yeni komut"),
          cols: [T("Command", "Komut"), T("Reply", "Yanıt"), T("Uses", "Kullanım"), T("Status", "Durum")],
          rows: [
            [{ code: "/rules" }, T("Posts the server rules embed", "Sunucu kuralları embed'ini gönderir"), "1,204", ok("Active", "Aktif")],
            [{ code: "/ip" }, T("Shows the Minecraft server address", "Minecraft sunucu adresini gösterir"), "980", ok("Active", "Aktif")],
            [{ code: "/apply" }, T("Sends the staff application link", "Yetkili başvuru linkini gönderir"), "312", ok("Active", "Aktif")],
            [{ code: "/event" }, T("Announces the weekly event", "Haftalık etkinliği duyurur"), "58", warn("Draft", "Taslak")],
          ],
        },
      },
    ],
  },
  "commands/permissions": {
    sections: [
      {
        title: T("Who can use what", "Kim neyi kullanabilir"),
        desc: T("Pick the roles allowed to run each command group.", "Her komut grubunu çalıştırabilecek rolleri seç."),
        rows: [
          { id: "mod", type: "chips", label: T("Moderation commands", "Moderasyon komutları"), options: ROLES, def: [0, 1, 2] },
          { id: "util", type: "chips", label: T("Utility commands", "Araç komutları"), options: ROLES, def: [0, 1, 2, 3, 4] },
          { id: "fun", type: "chips", label: T("Fun commands", "Eğlence komutları"), options: ROLES, def: [4] },
          { id: "eco", type: "chips", label: T("Economy commands", "Ekonomi komutları"), options: ROLES, def: [4] },
          { id: "dm", type: "toggle", label: T("Allow commands in DMs", "DM'de komutlara izin ver"), desc: T("Lets members use the bot in direct messages.", "Üyeler botu özel mesajda kullanabilir."), def: false },
        ],
      },
    ],
  },
  "commands/cooldowns": {
    sections: [
      {
        title: T("Cooldowns", "Bekleme süreleri"),
        desc: T("How long a member waits before reusing a command.", "Bir üyenin komutu tekrar kullanmadan önce beklemesi gereken süre."),
        rows: [
          { id: "mod", type: "slider", label: T("Moderation", "Moderasyon"), min: 0, max: 30, def: 3, unit: "s" },
          { id: "util", type: "slider", label: T("Utility", "Araçlar"), min: 0, max: 30, def: 5, unit: "s" },
          { id: "fun", type: "slider", label: T("Fun", "Eğlence"), min: 0, max: 60, def: 10, unit: "s" },
          { id: "eco", type: "slider", label: T("Economy", "Ekonomi"), min: 0, max: 60, def: 3, unit: "s" },
          { id: "staff", type: "toggle", label: T("Staff bypass cooldowns", "Yetkililer beklemeyi atlasın"), def: true },
        ],
      },
    ],
  },

  "bot-settings/profile": {
    sections: [
      {
        title: T("Bot profile", "Bot profili"),
        desc: T("How your bot looks to your members.", "Botun üyelerine nasıl göründüğü."),
        glow: "green",
        rows: [
          { id: "name", type: "text", label: T("Bot name", "Bot adı"), def: "Umt Bot" },
          { id: "avatar", type: "text", label: T("Avatar URL", "Avatar URL'si"), def: "https://cdn.example.com/avatar.png" },
          { id: "banner", type: "text", label: T("Banner URL", "Banner URL'si"), def: "", placeholder: "https://" },
          { id: "about", type: "text", label: T("About me", "Hakkında"), def: "Moderation, guard and fun for Umt Server." },
        ],
      },
    ],
  },
  "bot-settings/status": {
    sections: [
      {
        title: T("Status & activity", "Durum & aktivite"),
        rows: [
          { id: "status", type: "select", label: T("Status", "Durum"), options: [T("Online", "Çevrimiçi"), T("Idle", "Boşta"), T("Do not disturb", "Rahatsız etmeyin"), T("Invisible", "Görünmez")], def: 0 },
          { id: "type", type: "select", label: T("Activity type", "Aktivite türü"), options: [T("Playing", "Oynuyor"), T("Watching", "İzliyor"), T("Listening to", "Dinliyor"), T("Competing in", "Yarışıyor")], def: 1 },
          { id: "text", type: "text", label: T("Activity text", "Aktivite metni"), def: "over Umt Server" },
          { id: "rotate", type: "toggle", label: T("Rotate activities", "Aktiviteleri döndür"), desc: T("Cycles through a list every 30 seconds.", "Her 30 saniyede bir listeden değiştirir."), def: false },
        ],
      },
    ],
  },
  "bot-settings/prefix": {
    sections: [
      {
        title: T("Prefix & language", "Önek & dil"),
        rows: [
          { id: "prefix", type: "text", label: T("Command prefix", "Komut öneki"), desc: T("Used for text commands.", "Metin komutları için kullanılır."), def: "!" },
          { id: "slash", type: "toggle", label: T("Slash commands", "Slash komutları"), def: true },
          { id: "lang", type: "select", label: T("Bot language", "Bot dili"), options: ["Türkçe", "English"], def: 0 },
          { id: "tz", type: "select", label: T("Time zone", "Saat dilimi"), options: ["Europe/Istanbul (UTC+3)", "UTC", "Europe/London", "America/New_York"], def: 0 },
        ],
      },
    ],
  },
  "bot-settings/token": {
    sections: [
      {
        title: T("Bot token", "Bot tokeni"),
        desc: T(
          "Your bot runs on Helmo's hosting with this token. Never share it.",
          "Botun bu tokenle Helmo hosting üzerinde çalışır. Kimseyle paylaşma.",
        ),
        glow: "amber",
        rows: [
          { id: "token", type: "secret", label: T("Token", "Token"), def: "" },
          { id: "app", type: "text", label: T("Application ID", "Uygulama ID"), def: "123456789012345678" },
        ],
      },
      {
        title: T("Danger zone", "Tehlikeli bölge"),
        desc: T("Resetting the token restarts your bot.", "Tokeni sıfırlamak botunu yeniden başlatır."),
        glow: "red",
        rows: [{ id: "autorestart", type: "toggle", label: T("Restart bot automatically on crash", "Çökerse botu otomatik yeniden başlat"), def: true }],
      },
    ],
  },

  "audit-log/all": {
    sections: [
      {
        title: T("Recent activity", "Son hareketler"),
        table: {
          cols: [T("Time", "Zaman"), T("Actor", "Kişi"), T("Action", "İşlem"), T("Target", "Hedef"), T("Type", "Tür")],
          rows: [
            ["14:32", "umt", T("Banned a member", "Bir üyeyi yasakladı"), "spammer#0001", bad("Moderation", "Moderasyon")],
            ["14:10", "Helmo", T("Blocked a raid attempt", "Raid girişimini engelledi"), "12 accounts", warn("Guard", "Guard")],
            ["13:58", "aylin", T("Created a role", "Rol oluşturdu"), "@Event Team", info("Server", "Sunucu")],
            ["13:41", "kerem", T("Muted a member", "Bir üyeyi susturdu"), "toxic_user", bad("Moderation", "Moderasyon")],
            ["13:05", "—", T("Member joined", "Üye katıldı"), "newbie#4821", ok("Member", "Üye")],
            ["12:47", "umt", T("Changed channel permissions", "Kanal izinlerini değiştirdi"), "#announcements", info("Server", "Sunucu")],
          ],
        },
      },
    ],
  },
  "audit-log/members": {
    sections: [
      {
        title: T("Member events", "Üye olayları"),
        table: {
          cols: [T("Time", "Zaman"), T("Member", "Üye"), T("Event", "Olay"), T("Details", "Detay")],
          rows: [
            ["14:44", "newbie#4821", ok("Joined", "Katıldı"), T("Account age: 3 days", "Hesap yaşı: 3 gün")],
            ["14:21", "olduser", bad("Left", "Ayrıldı"), T("Member for 214 days", "214 gündür üye")],
            ["13:50", "mira", info("Role added", "Rol eklendi"), "@Member"],
            ["13:12", "deniz", info("Nickname", "Takma ad"), "deniz → Deniz ✨"],
          ],
        },
      },
    ],
  },
  "audit-log/server": {
    sections: [
      {
        title: T("Channel & role changes", "Kanal ve rol değişiklikleri"),
        table: {
          cols: [T("Time", "Zaman"), T("Actor", "Kişi"), T("Change", "Değişiklik"), T("Target", "Hedef")],
          rows: [
            ["13:58", "aylin", ok("Role created", "Rol oluşturuldu"), "@Event Team"],
            ["12:47", "umt", info("Permissions", "İzinler"), "#announcements"],
            ["11:30", "kerem", warn("Channel deleted", "Kanal silindi"), "#old-chat"],
            ["10:05", "umt", ok("Channel created", "Kanal oluşturuldu"), "#events"],
          ],
        },
      },
    ],
  },

  "voice-tokens/tokens": {
    stats: [
      { label: T("Active tokens", "Aktif token"), value: "12", sub: T("of 25 on your plan", "paketinde 25'ten"), glow: "green" },
      { label: T("Used today", "Bugün kullanılan"), value: "340", glow: "cyan" },
      { label: T("Expiring soon", "Yakında bitecek"), value: "3", glow: "amber" },
    ],
    sections: [
      {
        title: T("Voice tokens", "Ses tokenleri"),
        desc: T("Tokens members earn from time spent in voice channels.", "Üyelerin ses kanallarında geçirdiği süreden kazandığı tokenler."),
        table: {
          action: T("Create token", "Token oluştur"),
          cols: [T("Name", "Ad"), T("Value", "Değer"), T("Holders", "Sahip"), T("Expires", "Bitiş"), T("Status", "Durum")],
          rows: [
            ["Weekend Boost", "50", "128", T("in 2 days", "2 gün sonra"), warn("Expiring", "Bitiyor")],
            ["Study Hour", "10", "412", T("never", "asla"), ok("Active", "Aktif")],
            ["Event Pass", "100", "37", T("in 12 days", "12 gün sonra"), ok("Active", "Aktif")],
            ["Old Promo", "25", "0", T("expired", "süresi doldu"), bad("Expired", "Doldu")],
          ],
        },
      },
    ],
  },
  "voice-tokens/usage": {
    sections: [
      {
        title: T("Earning rules", "Kazanma kuralları"),
        rows: [
          { id: "rate", type: "slider", label: T("Tokens per minute in voice", "Seste dakika başına token"), min: 0, max: 10, def: 1 },
          { id: "afk", type: "toggle", label: T("Ignore AFK channel", "AFK kanalını yoksay"), def: true },
          { id: "muted", type: "toggle", label: T("Ignore muted members", "Susturulanları yoksay"), def: true },
          { id: "cap", type: "number", label: T("Daily cap", "Günlük limit"), def: 500, unit: "tokens", min: 0, max: 10000 },
        ],
      },
    ],
  },
  "voice-tokens/history": {
    sections: [
      {
        title: T("Token history", "Token geçmişi"),
        table: {
          cols: [T("Time", "Zaman"), T("Member", "Üye"), T("Token", "Token"), T("Change", "Değişim")],
          rows: [
            ["14:40", "mira", "Study Hour", ok("+10", "+10")],
            ["14:12", "deniz", "Weekend Boost", ok("+50", "+50")],
            ["13:55", "kerem", "Event Pass", bad("−100", "−100")],
            ["13:20", "aylin", "Study Hour", ok("+10", "+10")],
          ],
        },
      },
    ],
  },

  "guard/whitelist": {
    sections: [
      {
        title: T("Whitelist", "Beyaz liste"),
        desc: T("These members and bots are never punished by Guard.", "Bu üyeler ve botlar Guard tarafından asla cezalandırılmaz."),
        table: {
          action: T("Add to whitelist", "Beyaz listeye ekle"),
          cols: [T("Name", "Ad"), T("Type", "Tür"), T("Added by", "Ekleyen"), T("Added", "Eklenme")],
          rows: [
            ["umt", info("Owner", "Sahip"), "—", "2026-06-01"],
            ["aylin", ok("Admin", "Yönetici"), "umt", "2026-06-03"],
            ["MusicBot", warn("Bot", "Bot"), "umt", "2026-06-10"],
          ],
        },
      },
    ],
  },
  "guard/logs": {
    stats: [
      { label: T("Threats blocked (7d)", "Engellenen tehdit (7g)"), value: "37", glow: "green" },
      { label: T("Raids stopped", "Durdurulan raid"), value: "2", glow: "red" },
      { label: T("Spam removed", "Silinen spam"), value: "1,204", glow: "amber" },
    ],
    sections: [
      {
        title: T("Guard events", "Guard olayları"),
        table: {
          cols: [T("Time", "Zaman"), T("Module", "Modül"), T("Offender", "İhlal eden"), T("Action", "İşlem")],
          rows: [
            ["14:10", "Anti-Raid", "12 accounts", bad("Kicked", "Atıldı")],
            ["13:02", "Anti-Spam", "spam_acc", warn("Muted", "Susturuldu")],
            ["11:47", "Anti-Link", "newbie#4821", info("Message deleted", "Mesaj silindi")],
            ["09:30", "Anti-Nuke", "rogue_admin", bad("Roles removed", "Roller alındı")],
          ],
        },
      },
    ],
  },
};
