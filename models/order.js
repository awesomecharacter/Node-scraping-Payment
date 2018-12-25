const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    id: {
        type: String,
        default: '',
    },
    user_id: {
        type: String,
        default: '',
    },
    to_seller: {
        type: String,
        default: 'pending',
    },
    approve: {
        type: String,
        default: 'pending',
    },
    sent_user: {
        type: String,
        default: 'pending',
    },
    order_date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Order', OrderSchema);