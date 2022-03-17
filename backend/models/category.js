const mongoose = require('mongoose')

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        icon: {
            type: String,
        },
        color: {
            type: String,
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

exports.Category = mongoose.model('Category', categorySchema)
