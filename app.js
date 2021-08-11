// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const {PRReview} = require("./pr-review.js");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listen for a slash command invocation
app.command('/pr_review', async ({ ack, payload, context }) => {
  PRReview.initialModal(ack, payload, context, app);
});

app.view('pr_review_modal_view', ({ ack, body, view }) => {
  ack(); 
  PRReview.postPRReviewRequest(body.user.id, view, app)
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
