class PRReview {
  static async initialModal(ack, payload, context, app) {
    // Acknowledge the command request
    ack();
  // debugger
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
  
  static async postPRReviewRequest(id, data) {
    try {
      const message = "Hiiii";
      console.log(data);
      const result = await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: id,
        text: message
      });
      console.log(result)
    } catch(error) {
      
    }
  }
}

module.exports = { PRReview };
