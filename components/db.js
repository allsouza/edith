
const { MongoClient } = require('mongodb');
const { EncryptionEngine } = require('../utils/encryption-engine.js');
const { TimeFormatter } = require('../utils/time-formatter.js');

const password = process.env.ATLAS_PASSWORD;
const uri = `mongodb+srv://edithAdmin:${password}@edith.vqfcf.mongodb.net/EDITH?retryWrites=true&w=majority`;
const createClient = () => new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

class MongoDB {
  static async getAll() {
    const client = createClient();
    try {
      await client.connect();
      const dbList = await client.db().admin().listDatabases();
    } catch(error) {
      console.error(error);
    } finally {
      client.close();
    }
  }
  
  static async savePR(collectionName, data) {
    const client = createClient();
    try {
      await client.connect();
      const result = await client.db().collection(collectionName).insertOne(EncryptionEngine.encryptPRPayload(data));
      console.log(`PR saved to MongoDB with id: ${result.insertedId}`);
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }
  
  static async listChannelPRs(channel_id) {
    const client = createClient();
    try {
      await client.connect();
      let result = await client.db().collection(channel_id).find().toArray();
      result = result.map(entry => EncryptionEngine.decryptPRPayload(entry))
      return result;
    } catch (error) {
      console.error(error)
    } finally {
      client.close();
    }
  }
  
  static async findPR(channel_id, post_id) {
    const client = createClient();
    try{
      await client.connect();
      return await client.db().collection(channel_id).findOne({pr_post_id: post_id});
    } catch (error) {
      console.error(error)
    } finally {
      client.close();
    }
    
  }
  
  static async updateStatus(channel_id, id, status) {
    const client = createClient();
    try {
      await client.connect();
      await client.db().collection(channel_id).updateOne({"_id": id},{$set: {"status": status}});
    } catch (error) {
      console.log(error)
    } finally {
      client.close();
    }
  }
  
  static async finalizePR(channel_id, id) {
    const client = createClient();
    try {
      await client.connect();
      const data = await client.db().collection(channel_id).findOneAndDelete({"_id": id});
      const statsExist = await client.db().collection(`${channel_id}_stats`).count() > 0;
      let statsData;
      if(statsExist) {
        let dbData = await client.db().collection(`${channel_id}_stats`).findOne();
        statsData = createStatsData(dbData, data);
        await client.db().collection(`${channel_id}_stats`).replaceOne({"_id"}statsData);
      } else {
        statsData = createStatsData(null, data);
        debugger
        await client.db().collection(`${channel_id}_stats`).insertOne(statsData);
      }
      
    } catch (error) {
      console.error(error)
    } finally {
      client.close();
    }
  }
  
}

function createStatsData(dbData, prData) {
  const count = dbData ? dbData.count + 1 : 1;
  const avgCloseInSecs = TimeFormatter.avgClosingTime(dbData, prData);
  return {
    count: count,
    avg_close_in_secs: avgCloseInSecs
  }
}

module.exports = { MongoDB };

