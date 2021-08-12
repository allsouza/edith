// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const { PRReview } = require("./components/pr-review.js");
const { MongoDB } = require("./components/db.js");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listen for a slash command invocation
app.command("/pr_review", async ({ ack, payload, context }) => {
  PRReview.initialModal(ack, payload, context, app);
});

app.command("/view_prs", async ({ ack, payload, context }) => {
  ack();
  PRReview.fetchPendingPRs(payload, app);
});

app.view("pr_review_modal_view", ({ ack, body, view }) => {
  ack();
  PRReview.postPRReviewRequest(body.user.id, view, app);
});

app.action("link-button-action", ({ ack }) => ack());

app.action("take-action-button", ({ ack, body, context }) => {
  
});

app.action("review-action", ({ ack, body, context}) => {
  ack();
  debugger
  console.log("Hi")
})

app.event("reaction_added", async ({ event, client }) => {
  PRReview.computeReaction(event, client);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
