class Normalizer {
  /*
    Normalizes the body object to be used in prReview method
  */
  static normalizeBody(body) {
    body.actions[0].value = JSON.parse(body.actions[0].value);
    body = { ...body, channel: { id: body.actions[0].value.channel_id, name: body.actions[0].value.channel_name } };
    body.actions[0].value = body.actions[0].value.pr_post_id;
    return body;
  }
}

module.exports = { Normalizer }