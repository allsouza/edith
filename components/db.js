
const { MongoClient } = require('mongodb');

const password = process.env.ATLAS_PASSWORD;
const uri = `mongodb+srv://edithAdmin:${password}@edith.vqfcf.mongodb.net/EDITH?retryWrites=true&w=majority`;
const createClient = () => new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

class MongoDB {
  static async getAll() {
    const client = createClient();
    try {
      await client.connect();
      const dbList = await client.db().admin().listDatabases();
      debugger
      console.log(dbList)
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
      const result = await client.db().collection(collectionName).insertOne(data);
      console.log(`PR saved to MongoDB with id: ${result.insertedId}`);
    } catch (error) {
      console.error(error);
    } finally {
      client.close();
    }
  }
  
  static async listChannelPRs(channel_id) {
    const client = createClient();
    const result = await client.db().collection(channel_id).list();
  }
  
}

module.exports = { MongoDB };

