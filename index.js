const tls = require("tls");

const username = process.env.BOT_USERNAME;
let token = process.env.OAUTH_TOKEN;

if (!token.startsWith("oauth:")) {
  token = "oauth:" + token;
}

const socket = tls.connect(6697, "irc.chat.twitch.tv", () => {
  console.log("🔌 Verbindung zu Twitch hergestellt!");

  socket.write(`PASS ${token}\r\n`);
  socket.write(`NICK ${username}\r\n`);
  socket.write(`JOIN #batu68t\r\n`);
});

socket.setEncoding("utf8");

socket.on("data", (data) => {
  console.log(data.trim());

  if (data.startsWith("PING")) {
    socket.write("PONG :tmi.twitch.tv\r\n");
  }

  if (data.includes(" PRIVMSG #batu68t :")) {
    const parts = data.split(" PRIVMSG #batu68t :");
    const message = parts[1]?.trim();

    if (!message) return;

    const usernameMatch = data.match(/:([^!]+)!/);
    const viewer = usernameMatch ? usernameMatch[1] : "Viewer";

    if (message.toLowerCase() === "!hello") {
      socket.write(
        `PRIVMSG #batu68t :👋 Willkommen im Stream von batu68t, @${viewer}! 🔥🎮\r\n`
      );
    }

    if (message.toLowerCase() === "!socials") {
      socket.write(
        `PRIVMSG #batu68t :🔥 Batu's Socials | TikTok: @clutchbybatu | Instagram: @batu.t68\r\n`
      );
    }

    if (message.toLowerCase() === "!tiktok") {
      socket.write(
        `PRIVMSG #batu68t :🎮 TikTok von Batu: @clutchbybatu 🔥 Folgt gerne für Warzone Clips!\r\n`
      );
    }

    if (message.toLowerCase() === "!insta") {
      socket.write(
        `PRIVMSG #batu68t :📸 Instagram von Batu: @batu.t68 🔥 Folgt gerne!\r\n`
      );
    }

    if (message.toLowerCase() === "!commands") {
      socket.write(
        `PRIVMSG #batu68t :🤖 BatuBot1 Befehle: !socials • !tiktok • !insta • !rank • !loadout • !sens • !hello\r\n`
      );
    }

    if (message.toLowerCase() === "!rank") {
      socket.write(
        `PRIVMSG #batu68t :🏆 Batu ist aktuell im Ranked unterwegs! 🔥🎮\r\n`
      );
    }

    if (message.toLowerCase() === "!loadout") {
      socket.write(
        `PRIVMSG #batu68t :🔫 Batu's aktuelles Warzone-Loadout? Fragt einfach im Chat 😈🔥\r\n`
      );
    }

    if (message.toLowerCase() === "!sens") {
      socket.write(
        `PRIVMSG #batu68t :🎯 Batu's Warzone Sens? Controller-Settings gibt's auf Anfrage 😈🔥\r\n`
      );
    }
  }
});

socket.on("error", (error) => {
  console.log("❌ Fehler:", error.message);
});

socket.on("close", () => {
  console.log("❌ Verbindung geschlossen.");
});
