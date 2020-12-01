const config = require('../config.json');
const db = require('../_helpers/db');
const LogSms = db.LogSms;
const smsType = require('../enums/sms.type.enums');
const accountSid = 'ACfce6ba1c5898beaa8551d4bbf3193b91';
const authToken = 'ae1babe2258f1945f9b050adbacc6879';
const client = require('twilio')(accountSid, authToken);

let smsService = {
    /**
     * Enviar mensaje a un numero especifico
     * 
     * @param {object} userID usuario registrado
     * @param {object} phoneNumber numero de telefono a enviar el mensaje
     * @param {object} body cuerpo del mensaje
     */
    sendMessage: async (userID, phoneNumber, body) => {
        let result = new Promise((resolve, reject) => {
            client.messages
            .create({
                body: body,
                from: '+14352923816',
                to: phoneNumber
            })
            .then((message) => {
                console.log(message);
                RegisterLogSms(userID, phoneNumber, '+14352923816', message.body, 'successes', smsType.type.TEST);
                resolve({
                    status: true,
                    message: 'SMS enviado correctamente'
                })
            })
            .catch((error) => {
                console.log(error);
                reject({
                    message: 'ERROR al envia el SMS'  
                })
            });
        })

        return result;
    },
}

/**
 * Registrar sms enviados en BD
 * 
 * @param {ObjectId} userID id de usuario
 * @param {String} phoneNumberTo 
 * @param {String} phoneNumberFrom 
 * @param {String} bodySms 
 * @param {String} result
 * @param {Number} type Tipo de SMS
 */
function RegisterLogSms(userID, phoneNumberTo, phoneNumberFrom, bodySms, result, type) {

    var logSms = new LogSms({
        user: userID,
        numberPhoneTo: phoneNumberTo,
        numberPhoneFrom: phoneNumberFrom,
        bodySms: bodySms,
        result: result,
        type: type,
    });

    logSms.save();
}



module.exports = smsService;