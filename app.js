// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const { PRReview } = require("./components/pr-review.js");
const { MongoDB } = require("./components/db.js");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listen for a slash command invocation
app.command('/pr_review', async ({ ack, payload, context }) => {
  PRReview.initialModal(ack, payload, context, app);
});

app.command('/view_prs', async ({ack, payload, context}) => {
  ack();
  debugger
  PRReview.fetchPendingPRs(payload, app)
});

app.view('pr_review_modal_view', ({ ack, body, view }) => {
  ack(); 
  PRReview.postPRReviewRequest(body.user.id, view, app)
});

app.action('link-button-action', ({ ack }) => ack());

app.event('reaction_added', async ({ event, client }) => {
  if(event.reaction == "reviewed" || event.reaction == "approved") {
      const author = await MongoDB.find(event.item.channel, {"pr_post_id": event.item.ts})[0].author;
      if(author) {
        client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: author,
        text: `Your PR was ${event.reaction} by <@${event.user}>`
      })
    } 
  }
  console.log(event);
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
