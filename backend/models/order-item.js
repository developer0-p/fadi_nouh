const mongoose = require('mongoose')

const orderItemSchema = mongoose.Schema(
    {
        quantity: {
            type: Number,

            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
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

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema)
