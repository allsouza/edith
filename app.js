// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const { PRReview } = require("./components/pr-review.js");
const { MongoDB } = require("./components/db.js");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Opens the modal to create a PR Review request
app.command("/pr_review", async ({ ack, payload, context }) => {
  PRReview.initialModal(ack, payload, context, app);
});

// Logic that happens once the modal submit button is selected
app.view("pr_review_modal_view", ({ ack, body, view }) => {
  ack();
  PRReview.postPRReviewRequest(body.user.id, view, app);
});

// Displays all the open PR Reviews in the channel
app.command("/view_prs", async ({ ack, payload, context }) => {
  ack();
  PRReview.fetchPendingPRs(payload, app);
});

// Simply ack when pr link button is clicked
app.action("link-button-action", ({ ack }) => ack());

// Flow to set PR Review as REVIEWED from /view_prs command
app.action("review-pr-action", ({ ack, body, client }) => {
  ack();
  PRReview.takeAction(body, client);
});

app.action("approve-pr-action", ({ ack, body, client }) => {
  ack();
  PRReview.takeAction(body, client);
});

app.event("reaction_added", async ({ event, client }) => {
  PRReview.computeReaction(event, client);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
