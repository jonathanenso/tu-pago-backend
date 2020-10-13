const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user: { type: 'ObjectId', ref: 'User', required: true},
    token: { type: String, required: true },
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

//tiempo de expiración 1 dia 86400 segundos
schema.index({createdDate: 1},{expireAfterSeconds: 86400});

module.exports = mongoose.model('Token', schema);