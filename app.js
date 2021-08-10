// This example shows basic use of modals.
// It uses slash commands, views.open, and views.update
// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const {PRReview, postPRReviewRequest} = require("./pr-review.js");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listen for a slash command invocation
app.command('/pr_review', async ({ ack, payload, context }) => {
  PRReview.initialModal(ack, payload, context, app);
});

// Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
// You must set up a Request URL under Interactive Components on your app configuration page
app.action('button_abc', async ({ ack, body, context }) => {
  // Acknowledge the button request
  ack();

  try {
    const result = await app.client.views.update({
      token: context.botToken,
      // Pass the view_id
      view_id: body.view.id,
      // View payload with updated blocks
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.view('view_1', ({ ack, body, view, context, response_urls }) => {
  // Acknowledge the view_submission event
  ack();
  
  // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verifcation of their submission

  // Assume there's an input block with `test_input` as the block_id and `dreamy_input` as the action_id
  const val = view['state']['values']['pr_summary']['summary_input'];
  const user = body['user']['id'];
  debugger
  postPRReviewRequest(response_urls['channel_id'], view)
  
  // You'll probably want to store these values somewhere
  console.log(val);
  console.log(user);
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
