const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "NTKhang - Refondu par Evariste",
    countDown: 5,
    role: 0,
    description: {
      en: "Voir l'utilisation des commandes"
    },
    category: "info",
    guide: {
      en: "{pn} [vide | <nom de la commande>]\n{pn} setmedia: définir un média (image/gif/vidéo)"
    },
    priority: 1
  },

  langs: {
    en: {
      helpList:
        "╭━━━━━━━━━━━━━━━━━━━━╮\n" +
        "┃ 🤖 𝐁𝐎𝐓 : %1\n" +
        "┃ 📜 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬 : %3\n" +
        "┃ 💬 𝐏𝐫𝐞𝐟𝐢𝐱 : %4\n" +
        "╰━━━━━━━━━━━━━━━━━━━━╯\n" +
        "%2\n" +
        "────────────────────\n" +
        "✍️ Créé avec ❤️ par 𝐄𝐯𝐚𝐫𝐢𝐬𝐭𝐞\n" +
        "Utilise %4help <commande> pour plus d'infos",
      commandNotFound: "La commande \"%1\" n'existe pas"
    }
  },

  onStart: async function ({ message, args, event, threadsData, getLang, role, globalData }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // setmedia
    if (args[0]?.toLowerCase() === "setmedia") {
      const attachment = event.messageReply?.attachments?.[0];
      if (!attachment) return message.reply("❌ Réponds à une image/gif/vidéo.");
      if (!["photo", "video", "animated_image"].includes(attachment.type))
        return message.reply("❌ Format non supporté.");

      try {
        const ext = attachment.type === "photo" ? "jpg" : attachment.type === "video" ? "mp4" : "gif";
        const mediaPath = path.join(process.cwd(), `assets/help_media.${ext}`);
        const { data } = await axios.get(attachment.url, { responseType: "arraybuffer" });
        fs.ensureDirSync(path.dirname(mediaPath));
        fs.writeFileSync(mediaPath, Buffer.from(data));
        return message.reply("✅ Média enregistré avec succès !");
      } catch (err) {
        return message.reply("❌ Erreur : " + err.message);
      }
    }

    // help list
    const botName = global.GoatBot.config.name || "MonBot";
    const categorized = {};
    let totalCommands = 0;

    for (const [name, cmd] of commands) {
      if (cmd.config.role > 1 && role < cmd.config.role) continue;
      const cat = (cmd.config.category || "utility").toLowerCase();
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(name);
      totalCommands++;
    }

    let helpText = "";
    for (const [cat, list] of Object.entries(categorized)) {
      helpText += `\n━━━ ${cat.toUpperCase()} ━━━\n`;
      for (let i = 0; i < list.length; i += 6) {
        helpText += list.slice(i, i + 6).join(", ") + "\n";
      }
    }

    helpText += `\n━━━ 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 ━━━\nRejoins la boîte d'assistance\n${prefix}callad pour contacter les admins`;

    const finalMessage = getLang("helpList", botName, helpText, totalCommands, prefix);
    const sendData = { body: finalMessage };

    // media
    const mediaExtensions = [".gif", ".jpg", ".jpeg", ".png", ".mp4"];
    for (const ext of mediaExtensions) {
      const filePath = path.join(process.cwd(), `assets/help_media${ext}`);
      if (fs.existsSync(filePath)) {
        sendData.attachment = fs.createReadStream(filePath);
        break;
      }
    }

    return message.reply(sendData);
  }
};
