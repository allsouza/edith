const { MongoDB } = require("./db.js");
const { TimeFormatter } = require("../utils/time-formatter.js");
const { StringUtils } = require("../utils/string-utils.js");

const OPEN = "open";
const REVIEWED = "reviewed";
const APPROVED = "approved";

class PRReview {
  static async initialModal(ack, payload, context, app) {
    // Acknowledge the command request
    ack();
    try {
      const result = await app.client.views.open({
        token: context.botToken,
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: payload.trigger_id,
        // View payload
        view: {
          type: "modal",
          // View identifier
          callback_id: "pr_review_modal_view",
          title: {
            type: "plain_text",
            text: "PR Review"
          },
          blocks: [
            {
              type: "input",
              block_id: "pr_summary",
              label: {
                type: "plain_text",
                text: "PR Summary"
              },
              element: {
                type: "plain_text_input",
                action_id: "summary_input",
                multiline: false
              }
            },
            {
              type: "input",
              block_id: "pr_service",
              label: {
                type: "plain_text",
                text: "Service"
              },
              element: {
                type: "plain_text_input",
                action_id: "service_input",
                multiline: false
              }
            },
            {
              type: "input",
              block_id: "pr_link",
              label: {
                type: "plain_text",
                text: "PR Link"
              },
              element: {
                type: "plain_text_input",
                action_id: "link_input",
                multiline: false
              }
            },
            {
              type: "input",
              block_id: "pr_notes",
              optional: true,
              label: {
                type: "plain_text",
                text: "PR Notes"
              },
              element: {
                type: "plain_text_input",
                action_id: "notes_input",
                multiline: true
              }
            },
            {
              type: "input",
              block_id: "channel_select",
              optional: true,
              label: {
                type: "plain_text",
                text: "PR Review Request to be posted on "
              },
              element: {
                action_id: "channel_select",
                type: "conversations_select",
                response_url_enabled: true,
                default_to_current_conversation: true
              }
            }
          ],
          submit: {
            type: "plain_text",
            text: "Submit"
          }
        }
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  static async postPRReviewRequest(user_id, data, app) {
    const token = process.env.SLACK_BOT_TOKEN;
    const summary = data.state.values.pr_summary.summary_input.value;
    const link = data.state.values.pr_link.link_input.value;
    const service = data.state.values.pr_service.service_input.value;
    const notes = data.state.values.pr_notes.notes_input.value;
    const channel_id =
      data.state.values.channel_select.channel_select.selected_conversation;

    try {
      const message = `:bitbucket: *Hey team, please review this ${service} PR for <@${user_id}>*. :bitbucket: \n _Summary: ${summary}_`;

      const result = await app.client.chat.postMessage({
        token: token,
        channel: channel_id,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: message
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Take a look :eyes:",
                emoji: true
              },
              value: "link_button",
              url: link,
              action_id: "link-button-action"
            }
          },
          {
            type: "divider"
          }
        ]
      });

      if (notes != null) {
        app.client.chat.postMessage({
          token: token,
          channel: channel_id,
          thread_ts: result.message.ts,
          text: `PR Notes: ${notes}`
        });
      }
      
      app.client.chat.postMessage({
        token: token,
        cha
      })

      const dbObject = {
        summary: data.state.values.pr_summary.summary_input.value,
        notes: data.state.values.pr_notes.notes_input.value,
        service: data.state.values.pr_service.service_input.value,
        link: data.state.values.pr_link.link_input.value,
        status: "open",
        author: user_id,
        created_at: new Date(),
        pr_post_id: result.message.ts
      };
      //Save to DB
      await MongoDB.savePR(channel_id, dbObject);
    } catch (error) {
      if (error.data && error.data.errors[0].includes("invalid url")) {
        app.client.chat.postEphemeral({
          token: token,
          channel: channel_id,
          text:
            "Invalid PR link! Make sure your link is correct and try again.",
          user: user_id
        });
      }
      console.error(error);
    }
  }

  static async fetchPendingPRs(payload, app) {
    const channel_id = payload.channel_id;
    const channel_name = payload.channel_name;
    const user_id = payload.user_id;
    const data = await MongoDB.listChannelPRs(channel_id);
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `Open PR Reviews in ${channel_name}`,
          emoji: true
        }
      }
    ];

    //Populates the block with entries from DB
    data.forEach(entry => {
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
            text: `*Status:*\n:${emoji}: \t${StringUtils.capitalizeFirstLetter(entry.status)}`
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

      blocks.push({
        type: "actions",
        elements: [
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
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":approved: Approve"
            },
            style: "primary",
            value: entry.pr_post_id,
            action_id: "approve-pr-action"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":reviewed: Review"
            },
            style: "danger",
            value: entry.pr_post_id,
            action_id: "review-pr-action"
          }
        ]
      });

      blocks.push({ type: "divider" });
    });

    // Returns result to user
    app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel_id,
      blocks: blocks,
      text: "Pending PRs should appear here",
      user: user_id
    });
  }

  static async computeReaction(event, client) {
    const channel = event.item.channel;
    debugger;
    if (event.reaction == REVIEWED || event.reaction == APPROVED) {
      const dbEntry = await MongoDB.findPR(channel, event.item.ts);
      if (dbEntry) {
        client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: dbEntry.author,
          text: `:${event.reaction}: Your PR was ${event.reaction} by <@${event.user}>`
        });

        switch (event.reaction) {
          case REVIEWED:
            if (dbEntry.status == OPEN)
              await MongoDB.updateStatus(channel, dbEntry._id, REVIEWED);
            break;
          case APPROVED:
            if (dbEntry.status == REVIEWED || dbEntry.status == OPEN)
              await MongoDB.updateStatus(channel, dbEntry._id, APPROVED);
            break;
        }
      }
    }
  }

  static async takeAction(body, client) {
    const event = {
      reaction: body.actions[0].action_id.includes("review")
        ? REVIEWED
        : APPROVED,
      item: {
        ts: body.actions[0].value,
        channel: body.channel.id
      },
      user: body.user.id
    };
    this.computeReaction(event, client);
  }

  static async mergedPR() {}
}

module.exports = { PRReview };
