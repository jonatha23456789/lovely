const fs = require("fs").promises;
const animeCharacters = [
  "Feu - Pouvoir des flammes 🔥",
  "Air - Pouvoir des vents 🌪️",
  "Terre - Pouvoir de la stabilité 🌏",
  "Eau - Pouvoir de la vie 🌊",
  "Arbres - Pouvoir de la protection 🌲",
  "Pierre - Pouvoir de la stabilité ⛰️",
  "Soleil - Pouvoir de la lumière ☀️",
];

module.exports = {
  config: {
    name: "experience",
    version: "1.0",
    aliases:["exp"], 
    author: "Hussein",
    countDown: 60,
    role: 0,
    shortDescription: "Obtenir des informations utilisateur et image",
    longDescription: "Obtenez des informations utilisateur et image via mention",
    category: "Informations",
  },

  onStart: async function ({ event, message, usersData, api, args, threadsData }) {
    try {
      const uid1 = event.senderID;
      const uid2 = Object.keys(event.mentions)[0];
      let uid;

      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) {
            uid = match[1];
          }
        }
      }

      if (!uid) {
        uid = event.type === "message_reply" ? event.messageReply.senderID : uid2 || uid1;
      }

      let bankData;
      try {
        bankData = JSON.parse(await fs.readFile("bank.json", "utf8")) || {};
      } catch (error) {
        console.error("Erreur lors de la lecture de bank.json :", error.message);
        bankData = {};
      }

      api.getUserInfo(uid, async (err, userInfo) => {
        if (err) {
          return message.reply("Échec de la récupération des informations utilisateur.");
        }

        const avatarUrl = await usersData.getAvatarUrl(uid);
        const messageCounts = await getMessageCounts(api, event.threadID);
        const rank = getRank(userInfo[uid].exp, messageCounts[uid]);
        const balance = bankData[uid]?.bank !== undefined && !isNaN(bankData[uid].bank)
          ? bankData[uid].bank
          : 0;
        const userIndex = animeCharacters.findIndex(character => character === userInfo[uid].name);
        const randomCharacter = animeCharacters[Math.floor(Math.random() * animeCharacters.length)];

        const genderText = userInfo[uid]?.gender === 1 ? "" : userInfo[uid]?.gender === 2 ? "Garçon" : "🏳️‍🌈 LGBT";

        const members = await threadsData.get(event.threadID, "members");
        const memberCount = members && members.length > 0 ? members.length : 0;

        const userIsFriend = userInfo[uid].isFriend ? "✅ Oui" : "❌ Non";
        const isBirthdayToday = userInfo[uid].isBirthday ? "✅ Oui" : "❌ Non";

        const userInformation = `\t\t•——[Informations]——•\n\n❏Votre nom👤: 『${userInfo[uid].name}』\n❏Votre genre♋: 『${genderText}』\n❏Votre classement🧿: 『${rank}』\n❏Banque💰: 『${balance}💲』\n❏Nombre de membres 💐 : 『${memberCount}』\n❏Nombre de vos messages 📩: 『${messageCounts[uid] || 0}』\n❏Est-ce un ami✅ : 『${userIsFriend}』\n❏Est-ce votre anniversaire aujourd'hui🎉 : 『${isBirthdayToday}』\n❏Votre élément🌟: 『${userIndex !== -1 ? animeCharacters[userIndex] : randomCharacter}』`;


        message.reply({
          body: userInformation,
          attachment: await global.utils.getStreamFromURL(avatarUrl),
        });
      });

      const findMember = members.find(user => user.userID == uid);
      if (!findMember) {
        members.push({
          userID: uid,
          name: await usersData.getName(uid),
          nickname: null,
          inGroup: true,
          count: 1,
        });
      } else {
        findMember.count += 1;
      }
      await threadsData.set(event.threadID, members, "members");
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier bank.json :", error.message);
    }
  },

  onChat: async ({ usersData, threadsData, event }) => {
    try {
      const { senderID, threadID } = event;
      const members = await threadsData.get(threadID, "members");

      if (!members.some(member => member.userID === senderID)) {
        members.push({
          userID: senderID,
          name: await api.getProfile(senderID).name,
        });
      }

      await threadsData.set(threadID, members, "members");
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier bank.json :", error.message);
    }
  },
};

async function getMessageCounts(api, threadId) {
  try {
    const participants = await api.getThreadInfo(threadId, { participantIDs: true });
    const messageCounts = {};

    participants.participantIDs.forEach(participantId => {
      messageCounts[participantId] = 0;
    });

    const messages = await api.getThreadHistory(threadId, 1000);
    messages.forEach(message => {
      const messageSender = message.senderID;
      if (messageCounts[messageSender] !== undefined) {
        messageCounts[messageSender]++;
      }
    });

    return messageCounts;
  } catch (error) {
    console.error("Erreur lors de la récupération des comptes de messages :", error.message);
    return {};
  }
}

function getRank(exp, messageCount) {
  if (messageCount >= 10000) return 'Héros🥇';
  if (messageCount >= 5000) return '🥈Grand';
  if (messageCount >= 3000) return '👑Légendaire';
  if (messageCount >= 2000) return 'Actif🔥 Fort';
  if (messageCount >= 1000) return '🌠Actif';
  if (messageCount >= 500) return 'Réactif🏅 Fort';
  if (messageCount >= 300) return '🎖️Réactif';
  if (messageCount >= 200) return '🌟Réactif';
  if (messageCount >= 100) return '✨Pas mal';
  if (messageCount >= 50) return '👾Débutant';
  if (messageCount >= 10) return '🗿Idole';
  return 'Mort⚰️';
}
