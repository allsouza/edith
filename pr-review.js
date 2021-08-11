class PRReview {
  static async initialModal(ack, payload, context, app) {
    // Acknowledge the command request
    ack();
    try {
      const result = await app.client.views.open(
      { 
        token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: payload.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'PR Review'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'pr_summary',
            label: {
              type: 'plain_text',
              text: 'PR Summary'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'summary_input',
              multiline: false
            }
          },
          {
            type: 'input',
            block_id: 'pr_service',
            label: {
              type: 'plain_text',
              text: 'Service'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'service_input',
              multiline: false
            }
          },
          {
            type: 'input',
            block_id: 'pr_link',
            label: {
              type: 'plain_text',
              text: 'PR Link'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'link_input',
              multiline: false
            }
          },
          {
            type: 'input',
            block_id: 'pr_notes',
            optional: true,
            label: {
              type: 'plain_text',
              text: 'PR Notes'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'notes_input',
              multiline: true
            }
          },
          {
            type: 'input',
            block_id: 'channel_select',
            optional: true,
            label: {
              type: 'plain_text',
              text: 'PR Review Request to be posted on '
            },
            element: {
              action_id: 'channel_select',
              type: 'conversations_select',
              response_url_enabled: true,
              default_to_current_conversation: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
  });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
  
  static async postPRReviewRequest(id, data, app) {
    try {
      // debugger
      const message = "<@{here}>Hiiii";
      console.log("Inside post message");
      debugger
      const result = await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: id,
        text: "<@U029MQ7BJ5R> Hi there."
      });
      console.log(result)
    } catch(error) {
      console.error(error)
    }
  }
}

module.exports = { PRReview };
