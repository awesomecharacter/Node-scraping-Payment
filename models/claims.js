const mongoose = require('mongoose');

const ClaimSchema = mongoose.Schema({
    user_id: {
        type: String,
        default: '',
    },
    no: {
        type: String,
        default: '',
    },
    loss_date: {
        type: String,
        default: '',
    },
    loss_amount: {
        type: String,
        default: '',
    },
    loss_cause: {
        type: String,
        default: '',
    },
    claim_no: {
        type: String,
        default: '',
    },
    claim_status: {
        type: String,
        default: '',
    },
    source: {
        type: String,
        default: '',
    },
    register_date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Claim', ClaimSchema);