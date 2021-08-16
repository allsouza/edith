class AppHome {
  static async open(event, client, context) {
    const channels = await client.users.conversations({token: "xoxb-2324594394165-2369581715764-ZWxc6YA9YPzkgrkQ6bDOrKjK", user: "U029MQ7BJ5R", types: "public_channel, private_channel"}).channels;
    debugger;
    console.log(event)
  }
}

module.exports = { AppHome };