const crypto = require('crypto');
const config = require('../config.json');

// Algoritmo 
const algorithm = 'aes-256-cbc'; 
// Definición iv 
const iv = crypto.randomBytes(16);
// 32 Carácteres
const ENCRYPTION_KEY = config.secretCrypto; 

module.exports = {

    //Encriptar texto
    encrypt: function(text) {

        let cipher = crypto.createCipheriv(algorithm, new Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
    
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    },

    //Desencriptar texto
    decrypt: function(text) {
 
        let textParts = text.split(':');
        let iv = new Buffer.from(textParts.shift(), 'hex');
        let encryptedText = new Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(algorithm, new Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
    
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();

    },

    //Genera datos pseudoaleatorios criptográficamente fuertes. 
    //El argumento length es un número que indica el número de bytes a generar.
    randomBytes: function(length) {
        
        return crypto.randomBytes(length).toString('hex');

    },
    
};