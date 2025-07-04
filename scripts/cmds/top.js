module.exports = {
  config: {
    name: "topriche",
    version: "1.3",
    author: "Evariste & ChatGPT",
    role: 2,
    shortDescription: "Affiche ou restaure le top des riches",
    longDescription: "Affiche le top 20 des plus riches ou restaure leur solde depuis un message ou directement en argument",
    category: "économie",
    guide: {
      fr: "{pn} → Affiche le top 20\n{pn} restore (en réponse à un message ou avec le texte directement)"
    }
  },

  onStart: async function ({ message, args, usersData, event }) {
    const isRestore = args[0] === "restore";

    // ----- RESTORE MODE -----
    if (isRestore) {
      let text = "";

      if (event.messageReply?.body) {
        text = event.messageReply.body;
      } else {
        text = args.slice(1).join(" ");
      }

      if (!text) return message.reply("❌ Fournis le top en argument ou réponds à un message contenant le classement.");

      const lignes = text.split("\n");
      const regexAvecUID = /^\d+\.\s(.+)\s(\d{10,})\s:\s([\d,\.]+)\$/;
      const regexSansUID = /^\d+\.\s(.+?)\s:\s([\d,\.]+)\$/;

      let success = 0, fail = 0;
      const allUsers = await usersData.getAll();

      for (const ligne of lignes) {
        let match = ligne.match(regexAvecUID);
        let uid, nom, montant;

        if (match) {
          nom = match[1];
          uid = match[2];
          montant = parseInt(match[3].replace(/[^\d]/g, ""));
        } else {
          match = ligne.match(regexSansUID);
          if (!match) continue;

          nom = match[1];
          montant = parseInt(match[2].replace(/[^\d]/g, ""));

          const user = allUsers.find(u => u.name?.toLowerCase() === nom.toLowerCase());
          if (!user) {
            fail++;
            continue;
          }
          uid = user.userID;
        }

        try {
          await usersData.set(uid, { money: montant });
          success++;
        } catch (e) {
          console.log(`❌ Erreur avec ${uid} : ${e.message}`);
          fail++;
        }
      }

      return message.reply(`♻️ Restauration terminée !\n✅ Utilisateurs mis à jour : ${success}\n❌ Échecs : ${fail}`);
    }

    // ----- DISPLAY MODE -----
    const allUsers = await usersData.getAll();
    const topUsers = allUsers
      .filter(u => u.money > 0)
      .sort((a, b) => b.money - a.money)
      .slice(0, 20);

    if (topUsers.length === 0) return message.reply("❌ Aucun utilisateur riche trouvé.");

    const list = topUsers.map((u, i) =>
      `${i + 1}. ${u.name || "Inconnu"} (${u.userID}) : ${u.money}$`
    ).join("\n");

    return message.reply(`📊 Top 20 des utilisateurs les plus riches :\n\n${list}`);
  }
};
