const { MongoClient, ObjectId } = require("mongodb");
const { EncryptionEngine } = require("../utils/encryption-engine.js");
const { TimeFormatter } = require("../utils/time-formatter.js");

const password = process.env.ATLAS_PASSWORD;
const uri = `mongodb+srv://edithAdmin:${password}@edith.vqfcf.mongodb.net/EDITH?retryWrites=true&w=majority`;
const createClient = () =>
  new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

class MongoDB {
  /*
    Persists encrypted PR Review request data to database
  */
  static async savePR(collectionName, data) {
    const client = createClient();
    try {
      await client.connect();
      const result = await client
        .db()
        .collection(collectionName)
        .insertOne(EncryptionEngine.encryptPRPayload(data));
      console.log(`PR saved to MongoDB with id: ${result.insertedId}`);
      return result.insertedId.toString();
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }

  /*
    Fetches PR review requests for a given channel
  */
  static async listChannelPRs(collectionName) {
    const client = createClient();
    try {
      await client.connect();
      let result = await client
        .db()
        .collection(collectionName)
        .find({status: { $in: ["open", "reviewed", "approved"]}})
        .toArray();
      result = result.map((entry) => EncryptionEngine.decryptPRPayload(entry));
      return result;
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }

  /*
    Fetches a PR review request using the post_id
  */
  static async findPR(collectionName, id) {
    const client = createClient();
    try {
      await client.connect();
      const entry = await client
        .db()
        .collection(collectionName)
        .findOne({ _id: ObjectId(id) });
      debugger
      return EncryptionEngine.decryptPRPayload(entry);
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }
  
  /*
    Fetches a PR review request from any collection using the link url
  */
  static async findByPRLink(link) {
    const encryptedURL = EncryptionEngine.encryptObject({link})
    debugger
  }

  /*
    Updates PR review status in DB
  */
  static async updateStatus(collectionName, id, status) {
    const client = createClient();
    try {
      await client.connect();
      return await client
        .db()
        .collection(collectionName)
        .updateOne({ _id: ObjectId(id) }, { $set: { status: status } });
    } catch (error) {
      console.log(error);
    } finally {
      client.close();
    }
  }

  /*
    Finalizes the PR review
  */
  static async finalizePR(collectionName, id) {
    const client = createClient();
    try {
      await client.connect();
      debugger;
      const data = await client
        .db()
        .collection(collectionName)
        .findOneAndUpdate({ _id: ObjectId(id) }, { $set: { status: "merged" } });
      debugger
      // const dbStatsData = await client
      //   .db()
      //   .collection(`stats`)
      //   .findOne({ channel_id: collectionName });
      // if (dbStatsData) {
      //   await client
      //     .db()
      //     .collection(`stats`)
      //     .updateOne(
      //       { _id: dbStatsData._id },
      //       {
      //         $set: {
      //           avg_close_in_secs: TimeFormatter.avgClosingTime(
      //             dbStatsData,
      //             data
      //           )
      //         }
      //       }
      //     );
      // } else {
      //   await client
      //     .db()
      //     .collection(`stats`)
      //     .insertOne(createStatsData(data, collectionName, "close"));
      // }
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }

  /*
    Cancels the PR review
  */
  static async cancelPR(collectionName, id) {
    const client = createClient();
    try {
      await client.connect();
      debugger;
      const data = await client
        .db()
        .collection(collectionName)
        .findOneAndUpdate({ _id: ObjectId(id) }, { $set: { status: "canceled" } });
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }

  static async setFirstInteractionAvg(collectionName, event) {
    const client = createClient();
    try {
      await client.connect();
      debugger;
      const data = await client
        .db()
        .collection(collectionName)
        .findOne({ pr_post_id: event.item.ts });
      const dbStatsData = await client
        .db()
        .collection(`stats`)
        .findOne({ channel_id: collectionName });
      if (dbStatsData) {
        await client
          .db()
          .collection(`stats`)
          .updateOne(
            { _id: dbStatsData._id },
            {
              $set: {
                avg_first_interaction_in_secs:
                  TimeFormatter.avgFirstInteractionTime(dbStatsData, data),
              },
            }
          );
      } else {
        await client
          .db()
          .collection(`stats`)
          .insertOne(createStatsData(data, collectionName, "interaction"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }

  static async getChannelStats(channel_id) {
    const client = createClient();
    try {
      await client.connect();
      const result = await client
        .db()
        .collection("stats")
        .findOne({ channel_id });
      return result;
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }

  static async getAllStats() {
    const client = createClient();
    try {
      await client.connect();
      const stats = await client.db().collection("stats").find().toArray();
      const result = {};
      stats.forEach((stat) => (result[stat.channel_id] = stat));
      return result;
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }
}

function createStatsData(prData, collectionName, type) {
  if (type == "interaction") {
    const count = 1;
    const avgFirstInteractionInSecs = TimeFormatter.avgFirstInteractionTime(
      null,
      prData
    );
    return {
      channel_id: collectionName,
      count: count,
      avg_first_interaction_in_secs: avgFirstInteractionInSecs,
      avg_close_in_secs: 0,
    };
  } else {
    const count = 1;
    const avgCloseInSecs = TimeFormatter.avgClosingTime(null, prData);
    return {
      channel_id: collectionName,
      count: count,
      avg_first_interaction_in_secs: avgCloseInSecs,
      avg_close_in_secs: avgCloseInSecs,
    };
  }
}

module.exports = { MongoDB };
