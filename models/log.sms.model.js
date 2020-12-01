const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user: { type: 'ObjectId', ref: 'User'},
    numberPhoneTo: { type: String, required: true },
    numberPhoneFrom: { type: String, required: true },
    bodySms: { type: String, required: true },
    result: { type: String, required: true },
    type: { type: Number, required: true },
    createdDate: { type: Date, default: Date.now  },
});

//Agregar virutal id, y quitar _id
// schema.set('toJSON', {
//     virtuals: true,
//     versionKey: false,
//     transform: function (doc, ret) {
//         delete ret._id;
//     }
// });

module.exports = mongoose.model('LogSms', schema);