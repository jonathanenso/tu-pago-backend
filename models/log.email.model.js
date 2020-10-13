const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user: { type: 'ObjectId', ref: 'User'},
    code: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    emailTo: { type: String, required: true },
    emailFrom: { type: String, required: true },
    emailSubject: { type: String, required: true },
    result: { type: String, required: true },
    emailType: { type: Number, required: true },
    createdDate: { type: Date, default: Date.now  },
});

//Agregar virutal id, y quitar _id
schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('LogEMail', schema);