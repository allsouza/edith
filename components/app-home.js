const { MongoDB } = require("./db.js");
const { TimeFormatter } = require('../utils/time-formatter.js');
const { StringUtils } = require('../utils/string-utils.js');

class AppHome {
  static async showPRs(event, client, context) {
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
debugger
    try {
      const blocks = createBlocks(PRReviews, event.user);
      const result = await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          callback_id: "home_view",
          blocks: blocks
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
}

function createBlocks(data, userId) {
  const blocks = [];
  
  for(const channel_name of Object.keys(data)) {
    blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: `Open PR Reviews in ${channel_name}`,
          emoji: true
        }
      });
    
    for(const entry of data[channel_name]) {
       let emoji;
      switch (entry.status) {
        case "reviewed":
          emoji = "reviewed";
          break;
        case "approved":
          emoji = "approved";
          break;
        default:
          emoji = "hourglass_flowing_sand";
          break;
      }

      const createdAt = TimeFormatter.createdAt(entry.created_at, new Date());

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${entry.author}>'s ${entry.service} review request:`
        }
      });

      blocks.push({
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Status:*\n:${emoji}: \t${StringUtils.capitalizeFirstLetter(
              entry.status
            )}`
          },
          {
            type: "mrkdwn",
            text: `*Summary:*\n${entry.summary}`
          },
          {
            type: "mrkdwn",
            text: `*Created:*\n${createdAt}`
          },
          {
            type: "mrkdwn",
            text: `*Notes:*\n${entry.notes ? entry.notes : ""}`
          }
        ]
      });

      const buttons = [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: ":eyes: Take a look "
          },
          value: "view",
          url: `${entry.link}`,
          action_id: "link-button-action"
        }
      ];

      if (entry.author == userId) {
        buttons.push({
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: ":white_check_mark: Merged"
          },
          style: "primary",
          value: entry.pr_post_id,
          action_id: "merged-button-action"
        });
      } else {
        buttons.push({
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: ":approved: Approve"
          },
          style: "primary",
          value: entry.pr_post_id,
          action_id: "approve-pr-action"
        });
        buttons.push({
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: ":reviewed: Review"
          },
          style: "danger",
          value: entry.pr_post_id,
          action_id: "review-pr-action"
        });
      }
      blocks.push({
        type: "actions",
        elements: buttons
      });

      blocks.push({ type: "divider" });
    }
    blocks.push({type: "divider"})
  }
  return blocks;
}

module.exports = { AppHome };
