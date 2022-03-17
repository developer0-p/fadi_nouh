const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: false,
        },
        street: {
            type: String,
            default: '',
        },
        apartment: {
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
        country: {
            type: String,
            default: '',
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

exports.User = mongoose.model('User', userSchema)
