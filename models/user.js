const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        firstName: {
            type: String,
            default: ''
        },
        lastName: {
            type: String,
            default: ''
        },
        username: {
            type: String,
            default: ''
        },
        birthday: {
            type: Date,
            default: new Date('1970-01-01')
        },
    },
    { timestamps: true, usePushEach: true }
)
module.exports = mongoose.model('user', userSchema)
