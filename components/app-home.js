const { MongoDB } = require("./db.js");

class AppHome {
  static async open(event, client, context) {
    let channels = await client.users.conversations({
      token: process.env.SLACK_BOT_TOKEN,
      user: event.user,
      types: "public_channel, private_channel"
    });
    channels = channels.channels;
    const PRReviews = {};
    for (const channel of channels) {
      const data = await MongoDB.listChannelPRs(channel.id);
      if (data.length > 0) PRReviews[channel.id] = data;
    }

    const result = client.views.publish({
      user_id: event.user
    });
  }
}

module.exports = { AppHome };
