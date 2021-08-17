const { MongoDB } = require("./db.js");
const { TimeFormatter } = require("../utils/time-formatter.js");
const { StringUtils } = require("../utils/string-utils.js");

class AppHome {
  static async open(event, client, context) {
    debugger;
    try {
      const result = await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",

          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "Welcome to E.D.I.T.H.",
                emoji: true
              }
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text:
                  "This is app is meant to be an assistant to developers using slack to coordinate work.",
                emoji: true
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "plain_text",
                  text: "Available tasks:",
                  emoji: true
                }
              ]
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Create a PR Review request"
              },
              accessory: {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Create Request",
                  emoji: true
                },
                value: "click_me_123",
                action_id: "create-pr-action"
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "View pending requests from channels you are a member of"
              },
              accessory: {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Requests",
                  emoji: true
                },
                value: "click_me_123",
                action_id: "view-all-prs-action"
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: "_Developed by Andre Souza_"
                }
              ]
            }
          ]
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  static async viewAllPRs(body, client, payload) {
    let channels = await client.users.conversations({
      token: process.env.SLACK_BOT_TOKEN,
      user: body.user.id,
      types: "public_channel, private_channel"
    });
    channels = channels.channels;
    const PRReviews = {};
    for (const channel of channels) {
      const data = await MongoDB.listChannelPRs(channel.id);
      const channel_info = await client.conversations.info({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channel.id
      });
      if (data.length > 0) PRReviews[channel_info.channel.name] = data;
    }
    try {
      const blocks = createBlocks(PRReviews, body.user.id);
      const result = await client.views.open({
        token: process.env.SLACK_BOT_TOKEN,
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "All O",
            emoji: true
          },
          close: {
            type: "plain_text",
            text: "Close",
            emoji: true
          },
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

  for (const channel_name of Object.keys(data)) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: `Open PR Reviews in ${channel_name}`,
        emoji: true
      }
    });

    for (const entry of data[channel_name]) {
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
    blocks.push({ type: "divider" });
  }
  return blocks;
}

module.exports = { AppHome };
