const fs = require("fs-extra");

module.exports = {
  config: {
    name: "prefix",
    version: "2.0",
    author: "Evariste recode",
    countDown: 5,
    role: 0,
    description: "Changer ou afficher le préfixe du bot",
    category: "config",
    guide: {
      fr: "{pn} <nouveau prefix> : change le prefix dans la conversation\n{pn} <nouveau prefix> -g : change le prefix global (admin seulement)\n{pn} reset : réinitialise le prefix local"
    }
  },

  onStart: async ({ message, role, args, event, threadsData }) => {
    const { threadID, senderID } = event;
    const botName = global.GoatBot.config.name || "𝚂𝚄𝙿𝚁𝙴𝙼𝙴 ㋛ᗷOT";

    // Affichage stylisé si l'utilisateur écrit simplement "prefix"
    if (!args[0]) {
      const prefix = global.utils.getPrefix(threadID);
      return message.reply(
`/)    /)───────◆
(｡•ㅅ•｡) ❥${botName}
╭∪─∪───────◆
╰🙂 C'est mon préfixe, tu vois pas ? ➤ ${prefix}`
      );
    }

    // Réinitialisation
    if (args[0].toLowerCase() === "reset") {
      await threadsData.set(threadID, null, "data.prefix");
      return message.reply(`✅ Prefix local réinitialisé : ${global.GoatBot.config.prefix}`);
    }

    const newPrefix = args[0];
    const isGlobal = args[1] === "-g";

    if (isGlobal) {
      if (role < 2) return message.reply("🚫 Seul un admin peut changer le prefix global !");
      return message.reply("🛑 Réagis à ce message pour confirmer le changement du prefix **global**.", (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          type: "prefix",
          author: senderID,
          setGlobal: true,
          newPrefix,
          messageID: info.messageID
        });
      });
    } else {
      return message.reply("💬 Réagis à ce message pour confirmer le changement du prefix **de cette conversation**.", (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          type: "prefix",
          author: senderID,
          setGlobal: false,
          threadID,
          newPrefix,
          messageID: info.messageID
        });
      });
    }
  },

  onReaction: async ({ event, Reaction, message, threadsData }) => {
    const { userID } = event;
    const { author, setGlobal, newPrefix, threadID } = Reaction;

    if (userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(`🌐 Nouveau prefix global : ${newPrefix}`);
    } else {
      await threadsData.set(threadID, newPrefix, "data.prefix");
      return message.reply(`✅ Nouveau prefix pour cette conversation : ${newPrefix}`);
    }
  },

  onChat: async ({ event, message }) => {
    const { body, threadID } = event;
    if (body?.trim().toLowerCase() === "prefix") {
      const prefix = global.utils.getPrefix(threadID);
      const botName = global.GoatBot.config.name || "𝚂𝚄𝙿𝚁𝙴𝙼𝙴 ㋛ᗷOT";
      return message.reply(
`/)    /)───────◆
(｡•ㅅ•｡) ❥${botName}
╭∪─∪───────◆
╰🙂 C'est mon préfixe, tu vois pas ? ➤ ${prefix}`
      );
    }
  }
};
