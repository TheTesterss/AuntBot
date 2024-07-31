const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id: {
        unique: true,
        required: true,
        type: String
    },
    prevnames: []
})

const UserDB = mongoose.model("User", UserSchema)
module.exports = UserDB