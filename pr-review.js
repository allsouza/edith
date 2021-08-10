const prReview = require ("./modals/submit-pr.js");
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
      view: prReview
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
  }
}

module.exports = PRReview;