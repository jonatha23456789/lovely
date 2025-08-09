const axios = require('axios');

module.exports = {
  config: {
    name: "time",
    aliases: [], // Add aliases if needed
    version: "1.0.0",
    author: "Ayanfe", // Replace with your preferred name
    countDown: 5, // Cooldown time in seconds
    role: 0, // 0 = Everyone, 1 = Admin, 2 = Bot Owner
    shortDescription: "Get the current time of a location",
    longDescription: "Fetches the current time and timezone for a specified location.",
    category: "utilities", // Change category if needed
    guide: "{pn} <location>\nExample: {pn} New York",
  },
  
  onStart: async function ({ args, message }) {
    const location = args.join(' '); // Get location from user input

    // Validate location
    if (!location) {
      return message.reply("⚠ | Please provide a location. Example: 'New York', 'London', 'Tokyo'");
    }

    const url = `https://romeo-time.onrender.com/timezone?location=${encodeURIComponent(location)}`;

    try {
      // Fetch time from the API
      const response = await axios.get(url);
      const { date_time_txt, timezone } = response.data;

      if (!date_time_txt) {
        return message.reply("❌ | Could not retrieve time for the specified location. Please check the location name.");
      }

      // Format and send the response
      const responseMessage = `🌍 Current Time:\n\n` +
        `🕒 Location: ${location}\n` +
        `🕰 Current Time: ${date_time_txt}\n` +
        `🌐 Time Zone: ${timezone}`;
        
      return message.reply(responseMessage);
    } catch (error) {
      console.error("Failed to fetch time:", error);
      return message.reply("⚠ | An error occurred while fetching the time.");
    }
  },
}
