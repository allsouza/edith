const { MongoDB } = require("./db.js");
const { TimeFormatter } = require("../utils/time-formatter.js");
const { StringUtils } = require("../utils/string-utils.js");

class AppHome {
  /*
  Populates the app home
  */
  static async open(event, client, context) {
    try {
      await client.views.publish({
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
                style: "primary",
                action_id: "create-pr-action"
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  "View pending requests from channels you are a member of. _(May take a few seconds to load)_"
              },
              accessory: {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Requests",
                  emoji: true
                },
                style: "primary",
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

  /*
    Opens a modal listing all open PRs in channels the user is part of
  */
  static async viewAllPRs(body, client, modalId = null) {
    try {
      if (modalId == null) modalId = await loadingModal(client, body);
      let channels = await client.users.conversations({
        token: process.env.SLACK_BOT_TOKEN,
        user: body.user.id,
        types: "public_channel, private_channel"
      });
      channels = channels.channels;
      const stats = await MongoDB.getAllStats();
      const PRReviews = {};
      for (const channel of channels) {
        const data = await MongoDB.listChannelPRs(channel.id);
        const channel_info = await client.conversations.info({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channel.id
        });
        if (data.length > 0)
          PRReviews[channel_info.channel.name] = {
            data: data.map(element => {
              return {
                ...element,
                channel_id: channel.id
              };
            }),
            stats: stats[channel.id]
          };
      }
      const blocks = createPRBlocks(PRReviews, body.user.id);
      client.views.update({
        token: process.env.SLACK_BOT_TOKEN,
        view_id: modalId,
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "All open PR Reviews",
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

function createPRBlocks(data, userId) {
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
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: ":timer_clock: Channel Stats:"
        }
      ]
    });
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Avg first reaction: ${TimeFormatter.toString(
            data[channel_name].stats.avg_first_interaction_in_secs
          )}`
        },
        {
          type: "mrkdwn",
          text: `Avg closing time: ${TimeFormatter.toString(
            data[channel_name].stats.avg_close_in_secs
          )}`
        }
      ]
    });
    blocks.push({ type: "divider" });

    for (const entry of data[channel_name].data) {
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
      const prData = JSON.stringify({
        pr_post_id: entry.pr_post_id,
        channel_id: entry.channel_id
      });

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
          value: prData,
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
          value: prData,
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
          value: prData,
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

async function loadingModal(client, body) {
  const modal = await client.views.open({
    token: process.env.SLACK_BOT_TOKEN,
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Locating Open Requests",
        emoji: true
      },
      close: {
        type: "plain_text",
        text: "Close",
        emoji: true
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Locating requests in all channels you are a member of."
          }
        },
        {
          type: "image",
          image_url:
            "https://cdn.dribbble.com/users/543872/screenshots/3440651/untitled-6.gif",
          alt_text: "loading"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Please be patient"
          }
        }
      ]
    }
  });
  return modal.view.id;
}

module.exports = { AppHome };
