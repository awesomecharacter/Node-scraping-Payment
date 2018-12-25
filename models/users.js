const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    first: {
        type: String,
        default: '',
    },
    last: {
        type: String,
        default: '',
    },
    birth: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    zip: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    home_age: {
        type: String,
        default: '',
    },
    alarm_system: {
        type: String,
        default: '',
    },
    roofless: {
        type: String,
        default: '',
    },
    rooftype: {
        type: String,
        default: '',
    },
    havepool: {
        type: String,
        default: '',
    },
    dog: {
        type: String,
        default: '',
    },
    basement: {
        type: String,
        default: '',
    },
    bundlehome: {
        type: String,
        default: '',
    },
    flood: {
        type: String,
        default: '',
    },
    settlementdate: {
        type: String,
        default: '',
    },
    register_date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('User', UserSchema);