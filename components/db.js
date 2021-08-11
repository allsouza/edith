
const { MongoClient } = require('mongodb');

export class MongoDB {

  const password = process.env.ATLAS_PASSWORD;
  const uri = `mongodb+srv://edithAdmin:${password}@edith.vqfcf.mongodb.net/EDITH?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  async function getAll() {
    try {
      client.connect();
    } catch(error) {
      
    } finally {
      client.close();
    }
  });
  }
  
}

module.export { MongoDB };

