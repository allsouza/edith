
const { MongoClient } = require('mongodb');

const password = process.env.ATLAS_PASSWORD;
const uri = `mongodb+srv://edithAdmin:${password}@edith.vqfcf.mongodb.net/EDITH?retryWrites=true&w=majority`;

class MongoDB {
  static async getAll() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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
  
  static async savePR(name) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await client.connect();
      
    } finally {
      client.close();
    }
  }
  
}

module.exports = { MongoDB };

