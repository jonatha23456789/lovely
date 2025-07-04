module.exports = {
  config: {
    name: "ajoute",
    version: "3.1",
    author: "Evariste",
    role: 0, // Ouvert à tous, vérification manuelle ensuite
    shortDescription: "Ajoute un utilisateur dans le groupe (UID, mention, réponse)",
    longDescription: "Ajoute un membre via son UID, une mention ou une réponse. Réservé aux admins bot ou UID autorisés.",
    category: "admin",
    guide: "{pn} <UID> | en réponse | en mention"
  },

  onStart: async function ({ api, event, args, role, usersData }) {
    const authorizedUIDs = [
      "100093009031914", // 👑 Evariste
      "61571572433426"   // Autre UID autorisé
    ];

    const executorUID = event.senderID;

    const isAuthorized = role === 2 || authorizedUIDs.includes(executorUID);

    if (!isAuthorized) {
      return api.sendMessage("🚫 Tu n'as pas l'autorisation pour utiliser cette commande.", event.threadID);
    }

    // Identification de l'utilisateur cible
    let targetUID = null;

    if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else if (args[0] && !isNaN(args[0])) {
      targetUID = args[0];
    }

    if (!targetUID) {
      return api.sendMessage("⚠️ Utilisation : ajoute <UID> ou via réponse/mention.", event.threadID);
    }

    try {
      // Vérifier si déjà présent
      const threadInfo = await api.getThreadInfo(event.threadID);
      if (threadInfo.participantIDs.includes(targetUID)) {
        return api.sendMessage("ℹ️ Cet utilisateur est déjà dans le groupe.", event.threadID);
      }

      // Ajout dans le groupe
      await api.addUserToGroup(targetUID, event.threadID);

      const userData = await usersData.get(targetUID);
      const name = userData?.name || `UID ${targetUID}`;

      return api.sendMessage(`✅ ${name} a été ajouté au groupe par 𝗘𝘃𝗮𝗿𝗶𝘀𝘁𝗲𝗕𝗼𝘁.`, event.threadID);
    } catch (err) {
      return api.sendMessage(`❌ Erreur lors de l'ajout :\n${err.message}`, event.threadID);
    }
  }
};
