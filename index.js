const tls = require("tls");
const https = require("https");

const username = process.env.BOT_USERNAME;
let token = process.env.OAUTH_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token.startsWith("oauth:")) {
  token = "oauth:" + token;
}

const accessToken = token.replace("oauth:", "");
const channel = "batu68t";

let socket;
let broadcasterId;
let botUserId;

function sendChat(message) {
  if (socket) {
    socket.write(`PRIVMSG #${channel} :${message}\r\n`);
  }
}

function twitchRequest(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: "api.twitch.tv",
      path,
      method,
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }, response => {
      let data = "";

      response.on("data", chunk => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    request.on("error", reject);

    if (body) {
      request.write(JSON.stringify(body));
    }

    request.end();
  });
}

function connectChat() {
  socket = tls.connect({
    host: "irc.chat.twitch.tv",
    port: 6697,
    rejectUnauthorized: false
  }, () => {
    console.log("🔌 Verbindung zu Twitch hergestellt!");

    socket.write(
      "CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands\r\n"
    );

    socket.write(`PASS ${token}\r\n`);
    socket.write(`NICK ${username}\r\n`);
    socket.write(`JOIN #${channel}\r\n`);
  });

  socket.setEncoding("utf8");

  socket.on("data", data => {
    console.log(data.trim());

    if (data.startsWith("PING")) {
      socket.write("PONG :tmi.twitch.tv\r\n");
    }

    if (data.includes(` PRIVMSG #${channel} :`)) {
      const parts = data.split(` PRIVMSG #${channel} :`);
      const message = parts[1]?.trim();

      if (!message) return;

      const match = data.match(/:([^!]+)!/);
      const viewer = match ? match[1] : "Viewer";

      if (message === "!hello") {
        sendChat(`👋 Willkommen im Stream von batu68t, @${viewer}! 🔥🎮`);
      }

      if (message === "!socials") {
        sendChat("🔥 Batu's Socials | TikTok: @clutchbybatu | Instagram: @batu.t68");
      }

      if (message === "!tiktok") {
        sendChat("🎮 TikTok von Batu: @clutchbybatu 🔥 Folgt gerne für Warzone Clips!");
      }

      if (message === "!insta") {
        sendChat("📸 Instagram von Batu: @batu.t68 🔥 Folgt gerne!");
      }

      if (message === "!commands") {
        sendChat("🤖 BatuBot Befehle: !socials • !tiktok • !insta • !rank • !loadout • !sens • !settings • !wins • !warzone");
      }

      if (message === "!rank") {
        sendChat("🏆 Batu ist aktuell im Ranked unterwegs! 🔥🎮");
      }

      if (message === "!loadout") {
        sendChat("🔫 Batu's aktuelles Warzone-Loadout? Fragt einfach im Chat 😈🔥");
      }

      if (message === "!sens") {
        sendChat("🎯 Batu's Warzone Sens? Controller-Settings gibt's auf Anfrage 😈🔥");
      }

      if (message === "!settings") {
        sendChat("⚙️ Batu's Warzone Settings: Controller, Sens, Aim & Movement – fragt ihn einfach! 🎮🔥");
      }

      if (message === "!wins") {
        sendChat("🏆 Batu's Warzone Wins: Heute wird auf Sieg gespielt! 🔥🎮");
      }

      if (message === "!warzone") {
        sendChat("🎮 Willkommen bei batu68t! Hier gibt's Warzone, Ranked & jede Menge Sweaty Gameplay 🔥💀");
      }
    }
  });

  socket.on("close", () => {
    console.log("❌ Chat-Verbindung geschlossen.");
  });
}

async function startFollowSystem() {
  try {
    const users = await twitchRequest(
      `/helix/users?login=${channel}&login=${username}`
    );

    if (!users.data) {
      console.log("❌ Twitch-Benutzer konnten nicht gefunden werden.");
      return;
    }

    for (const user of users.data) {
      if (user.login.toLowerCase() === channel.toLowerCase()) {
        broadcasterId = user.id;
      }

      if (user.login.toLowerCase() === username.toLowerCase()) {
        botUserId = user.id;
      }
    }

    console.log("📺 Kanal-ID:", broadcasterId);
    console.log("🤖 Bot-ID:", botUserId);

    const ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

    ws.addEventListener("open", () => {
      console.log("❤️ Follow-System verbunden!");
    });

    ws.addEventListener("message", async event => {
      const message = JSON.parse(event.data);

      if (message.metadata.message_type === "session_welcome") {
        const sessionId = message.payload.session.id;

        console.log("✅ EventSub verbunden!");

        const result = await twitchRequest(
          "/helix/eventsub/subscriptions",
          "POST",
          {
            type: "channel.follow",
            version: "2",
            condition: {
              broadcaster_user_id: broadcasterId,
              moderator_user_id: botUserId
            },
            transport: {
              method: "websocket",
              session_id: sessionId
            }
          }
        );

        console.log("❤️ Follow-System aktiviert:", result);
      }

      if (message.metadata.message_type === "notification") {
        if (message.metadata.subscription_type === "channel.follow") {
          const follower = message.payload.event.user_name;

          sendChat(
            `❤️🔥 Danke für den Follow, @${follower}! Willkommen bei Batu! 🎮`
          );

          console.log(`❤️ Neuer Follow von ${follower}`);
        }
      }
    });

    ws.addEventListener("error", error => {
      console.log("❌ EventSub Fehler:", error.message);
    });

  } catch (error) {
    console.log("❌ Follow-System Fehler:", error.message);
  }
}

connectChat();
startFollowSystem();
