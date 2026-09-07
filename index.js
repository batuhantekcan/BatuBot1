const tmi = require("tmi.js");

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: ["batu68t"]
});

client.connect();

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  const command = message.toLowerCase().trim();

  if (command === "!hello") {
    client.say(channel, `👋 Willkommen im Stream von batu68t, @${tags.username}! 🔥🎮`);
  }

  if (command === "!socials") {
    client.say(channel, "🔥 Batu's Socials | TikTok: @clutchbybatu | Instagram: @batu.t68");
  }

  if (command === "!tiktok") {
    client.say(channel, "🎮 TikTok von Batu: @clutchbybatu 🔥 Folgt gerne für Warzone Clips!");
  }

  if (command === "!insta") {
    client.say(channel, "📸 Instagram von Batu: @batu.t68 🔥 Folgt gerne!");
  }

  if (command === "!commands") {
    client.say(channel, "🤖 BatuBot1 Befehle: !socials • !tiktok • !insta • !rank • !loadout • !sens • !hello");
  }

  if (command === "!rank") {
    client.say(channel, "🏆 Batu ist aktuell im Ranked unterwegs! 🔥🎮");
  }

  if (command === "!loadout") {
    client.say(channel, "🔫 Batu's aktuelles Warzone-Loadout? Fragt einfach im Chat 😈🔥");
  }

  if (command === "!sens") {
    client.say(channel, "🎯 Batu's Warzone Sens? Controller-Settings gibt's auf Anfrage 😈🔥");
  }
});

client.on("connected", () => {
  console.log("🤖 BatuBot1 ist verbunden!");
});
