const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "🌍|  lovely-𝐁𝐨𝐭-𝐕2"; // changing this wont change the goatbot V2 of list cmd it is just a decoyy

module.exports = {
  config: {
    name: "help",
    version: "1.17",
    author: "NTKhang", // modified by Hk
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "system",
    guide: {
      en: "{pn} / help cmdName ",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "╭──────🎀\n│➣ ᏞϴᏙᎬᏞᎽ ᎪᏆ シ \n╰──────────────🎀\n";

      msg += `━━━━━━━━━━━━━━━━\n`; // replace with your name 

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }


      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += ` ╭─シ🌪✨${category.toUpperCase()}✨🌪\n`;


          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 3).map((item) => `│  🌿 ✘.${item}—シ🌿\n`);
            msg += ` ${cmds.join(" ".repeat(Math.max(1, 10 - cmds.join("").length)))}`;
          }

          msg += ` ╰──────────────シ\n`;
        }
      });

      const totalCommands = commands.size;
      msg += `𝐀𝐜𝐭𝐮𝐞𝐥𝐥𝐞𝐦𝐞𝐧𝐭 𝐥𝐞 𝗹𝗼𝘃𝗲𝗹𝘆 𝗮𝗶 𝗻'𝗮 𝗾𝘂𝗲  🎶${totalCommands}𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬🎶\n`;
      msg += `𝐒𝐚𝐢𝐬𝐢𝐬 ${prefix}𝗵𝗲𝗹𝗽 𝘀𝘂𝗶𝘃𝗶 𝗱𝘂 𝗻𝗼𝗺 𝗱𝗲 𝗹𝗮 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗽𝗼𝘂𝗿 𝗮𝘃𝗼𝗶𝗿 𝗽𝗹𝘂𝘀 𝗱𝗲 𝗱𝗲𝘁𝗮𝗶𝗹 𝘀𝘂𝗿 𝗹𝗮 𝗰𝗼𝗺𝗺𝗮𝗻𝗱\n━━━━━━━━━━━━━━━\n`;
      msg += `╭───────⌾\n│📣...|\n│➣ 𝗟𝗼𝘃𝗲𝗹𝘆 𝗔𝗶 シ\n│🌿| 𝐎𝐰𝐧𝐞𝐫 :𝗛𝗞シ  \n│\n│🌪| 𝐋𝐢𝐧𝐤'𝐬 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 :\n│ \n╰──────────────⌾`; // its not decoy so change it if you want 

      const helpListImages = [
"https://i.ibb.co/LX4cwwSX/image.jpg",
"https://i.ibb.co/LX4cwwSX/image.jpg",
        // Add more image links as needed
      ];

      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage),
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "No description" : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭── NAME ────シ
  │ ${configCommand.name}
  ├── INFO
  │ Description: ${longDescription}
  │ Other names: ${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"}
  │ Other names in your group: Do not have
  │ Version: ${configCommand.version || "1.0"}
  │ Role: ${roleText}
  │ Time per command: ${configCommand.countDown || 1}s
  │ Author: ${author}
  ├── Usage
  │ ${usage}
  ├── Notes
  │ The content inside <XXXXX> can be changed
  │ The content inside [a|b|c] is a or b or c
  ╰━━━━━━━シ`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
	}
