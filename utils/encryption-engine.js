const {CrytoJS} = require('crypto-js');
const password = process.env.ENCRYPTION_PASSWORD;

class EncryptionEngine {
  static encryptPayload(payload) {
    const encrypted = {
      summary: payload
    }
  }
  
  encrypt(text){
    return CryptoJS.AES.encrypt(text, password).toString();
  }
}

module.exports = { EncryptionEngine };