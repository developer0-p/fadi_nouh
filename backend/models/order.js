const mongoose = require('mongoose')

const orderSchema = mongoose.Schema(
    {
        orderItems: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'OrderItem',
                required: true,
            },
        ],
        shippingAddress1: {
            type: String,
            required: true,
        },
        shippingAddress2: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
        zip: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        phone: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: 'Pending',
        },
        totalPrice: {
            type: Number,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dateOrdered: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id
                delete ret._id
            },
        },
    }
)

exports.Order = mongoose.model('Order', orderSchema)
