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
          callback_id: "view_1",
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
    try {
      const summary = data.state.values.pr_summary.summary_input.value;
      const link = data.state.values.pr_link.link_input.value;
      const service = data.state.values.pr_service.service_input.value;
      const notes = data.state.values.pr_notes.notes_input.value;
      const channel_id = data.state.values.channel_select.channel_select.selected_conversation;
      
      const message = `Hey team, <@${user_id}> would like your help reviewing their Pull Request for ${service}. \n _Summary: ${summary}_`;

      const result = await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
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
      // console.log(result);
    } catch (error) {
      debugger
      if(error.data.errors[0].includes("invalid url")) {
        debugger
      }
      console.error(error);
    }
  }
}

module.exports = { PRReview };
