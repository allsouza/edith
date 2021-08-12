const CryptoJS = require("crypto-js");
const password = process.env.ENCRYPTION_PASSWORD;

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, password).toString();
}

function decrypt(text) {
  return CryptoJS.AES.decrypt(text, password).toString(CryptoJS.enc.Utf8);
}

class EncryptionEngine {
  static encryptPRPayload(payload) {
    const encrypted = {
      summary: encrypt(payload.summary),
      notes: encrypt(payload.notes),
      service: encrypt(payload.service),
      link: encrypt(payload.link),
      status: payload.status,
      author: encrypt(payload.author),
      created_at: payload.created_at,
      pr_post_id: encrypt(payload.pr_post_id)
    };

    return encrypted;
  }

  static decryptPRPayload(payload) {
    const decrypted = {
      summary: decrypt(payload.summary),
      notes: decrypt(payload.notes),
      service: decrypt(payload.service),
      link: decrypt(payload.link),
      status: payload.status,
      author: decrypt(payload.author),
      created_at: payload.created_at,
      pr_post_id: decrypt(payload.pr_post_id)
    };

    return decrypted;
  }
}

module.exports = { EncryptionEngine };
