// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const { PRReview } = require("./components/pr-review.js");
const { MongoDB } = require("./components/db.js");
const { AppHome } = require('./components/app-home.js');

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

// Flow to set PR Review as APPROVED from /view_prs command
app.action("approve-pr-action", ({ ack, body, client }) => {
  ack();
  PRReview.takeAction(body, client);
});

// Deletes the PR Review from DB and calculates stats
app.action("merged-button-action", ({ ack, body, client }) => {
  ack();
  debugger;
  PRReview.mergedPR({...body, channel: {id: body.actions[0].channel_id}}, client);
})

// Views all PRs from App Home
app.action("view-all-prs-action", ({ ack, body, client }) => {
  ack();
  AppHome.viewAllPRs(body, client, body)
})

// Create PR Review request from App Home
app.action("create-pr-action", ({ ack, body, context}) => {
  PRReview.initialModal(ack, body, context, app);
})

// Listens for when reactins are added and acts if :approved: or :reviewed:
app.event("reaction_added", async ({ event, client }) => {
  PRReview.computeReaction(event, client);
});

// Trigger event when app home is opened
app.event("app_home_opened", async ({ event, client , context}) => {
  AppHome.open(event, client, context);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
