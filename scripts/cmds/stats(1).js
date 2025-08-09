const os = require('os');
const { bold, thin } = require("fontstyles");

module.exports = {
  config: {
    name: 'stats',
    aliases: ['botinfo', 'system'],
    version: '1.0',
    author: '𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿',
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot system stats',
    longDescription: {
      id: 'Display bot system stats',
      en: 'Display bot system stats',
    },
    category: 'system',
    guide: {
      id: '{pn}: Display bot system stats',
      en: '{pn}: Display bot system stats',
    },
  },
  onStart: async function ({ message, event, usersData, threadsData, api }) {
    const startTime = Date.now();
    const users = await usersData.getAll();
    const groups = await threadsData.getAll();
    const uptime = process.uptime();
    const sentMessage = await message.reply(thin("🔄 Loading system stats…"));

    try {
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercentage = (usedMemory / totalMemory * 100).toFixed(2);

      const cpuUsage = os.loadavg();
      const cpuCores = os.cpus().length;
      const cpuModel = os.cpus()[0].model;
      const nodeVersion = process.version;
      const platform = os.platform();
      const networkInterfaces = os.networkInterfaces();

      const networkInfo = Object.entries(networkInterfaces)
        .map(([interfaceName, addresses]) => {
          return `• ${interfaceName}: ${addresses.map(addr => `${addr.family}: ${addr.address}`).join(', ')}`;
        })
        .join('\n');

      const endTime = Date.now();
      const botPing = endTime - startTime;

      const messageContent = `🖥 ${bold("System Statistics")}:\n\n` +
        `• Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
        `• Memory Usage: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB\n` +
        `• Total Memory: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB\n` +
        `• Free Memory: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB\n` +
        `• Memory Usage Percentage: ${memoryUsagePercentage}%\n` +
        `• CPU Usage (1m): ${cpuUsage[0].toFixed(2)}%\n` +
        `• CPU Usage (5m): ${cpuUsage[1].toFixed(2)}%\n` +
        `• CPU Usage (15m): ${cpuUsage[2].toFixed(2)}%\n` +
        `• CPU Cores: ${cpuCores}\n` +
        `• CPU Model: ${cpuModel}\n` +
        `• Node.js Version: ${nodeVersion}\n` +
        `• Platform: ${platform}\n` +
        `• Ping: ${botPing}ms\n` +
        `• Total Users: ${users.length}\n` +
        `• Total Groups: ${groups.length}\n\n` +
        `🌐 ${bold("Network Interfaces")}:\n${networkInfo}`;

      // Delete the "loading" message and send a new one
      await api.deleteMessage(sentMessage.messageID);
      return message.reply(thin(messageContent));
    } catch (err) {
      console.error(err);
      // If an error occurs, edit the original message or send a new one
      return message.reply("❌ An error occurred while fetching system statistics.");
    }
  },
}
