module.exports = {
  config: {
    name: "supprime",
    version: "3.1",
    author: "Evariste",
    role: 0, // Tout le monde peut tenter, vérification manuelle dans onStart
    shortDescription: "Supprimer un membre du groupe (admin bot ou UID autorisé)",
    longDescription: "Supprime un membre par UID, mention ou message répondu. Protège les UID royaux.",
    category: "admin",
    guide: "{pn} <UID> | en réponse | en mention"
  },

  onStart: async function ({ api, event, args, usersData, role }) {
    // UIDs royaux protégés
    const protectedUIDs = [
      "100093009031914", // UID de Evariste 👑
      "61571572433426"   // Autre UID royal (exemple)
    ];

    const executorUID = event.senderID;

    // Vérifie si l'utilisateur est autorisé (bot admin ou UID autorisé manuellement)
    const isAuthorized =
      role === 2 || // Admin bot
      protectedUIDs.includes(executorUID); // UID autorisé

    if (!isAuthorized) {
      return api.sendMessage("🚫 Tu n'as pas l'autorisation pour exécuter cette commande.", event.threadID);
    }

    // Détermination de la cible
    let targetUID = null;

    if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else if (args[0] && !isNaN(args[0])) {
      targetUID = args[0];
    }

    if (!targetUID) {
      return api.sendMessage("⚠️ Utilisation : supprime <UID> ou via réponse ou mention.", event.threadID);
    }

    // Protection contre la suppression des UID royaux
    if (protectedUIDs.includes(targetUID)) {
      return api.sendMessage("👑 Impossible de supprimer ce roi suprême.", event.threadID);
    }

    try {
      await api.removeUserFromGroup(targetUID, event.threadID);
      const userData = await usersData.get(targetUID);
      const name = userData?.name || `UID ${targetUID}`;
      return api.sendMessage(`✅ ${name} a été supprimé du groupe par 𝗘𝘃𝗮𝗿𝗶𝘀𝘁𝗲𝗕𝗼𝘁.`, event.threadID);
    } catch (err) {
      return api.sendMessage(`❌ Erreur lors de la suppression :\n${err.message}`, event.threadID);
    }
  }
};
