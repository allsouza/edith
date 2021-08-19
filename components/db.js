const { MongoClient } = require("mongodb");
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
        .find()
        .toArray();
      result = result.map(entry => EncryptionEngine.decryptPRPayload(entry));
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
  static async findPR(collectionName, post_id) {
    const client = createClient();
    try {
      await client.connect();
      const entry = await client
        .db()
        .collection(collectionName)
        .findOne({ pr_post_id: post_id });
      return EncryptionEngine.decryptPRPayload(entry);
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }

  /*
    Updates PR review status in DB
  */
  static async updateStatus(collectionName, id, status) {
    const client = createClient();
    try {
      await client.connect();
      await client
        .db()
        .collection(collectionName)
        .updateOne({ _id: id }, { $set: { status: status } });
    } catch (error) {
      console.log(error);
    } finally {
      client.close();
    }
  }

  /*
    Finalizes the PR review
    Deletes the entry from the DB and saves stats data to possibly be used in the future
  */
  static async finalizePR(collectionName, id) {
    const client = createClient();
    try {
      await client.connect();
      const data = await client
        .db()
        .collection(collectionName)
        .findOneAndDelete({ pr_post_id: id });
      const dbStatsData = await client
          .db()
          .collection(`stats`)
          .findOne();
      if (dbStatsData) {
        await client
          .db()
          .collection(`stats`)
          .replaceOne({ _id: dbStatsData._id }, createStatsData(dbStatsData, data, collectionName));
      } else {
        await client
          .db()
          .collection(`stats`)
          .insertOne(createStatsData(null, data, collectionName));
      }
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }
}

function createStatsData(dbData, prData, collectionName) {
  const count = dbData ? dbData.count + 1 : 1;
  const avgCloseInSecs = TimeFormatter.avgClosingTime(dbData, prData);
  debugger
  return {
    channel_id: collectionName,
    count: count,
    avg_close_in_secs: avgCloseInSecs
  };
}

module.exports = { MongoDB };
