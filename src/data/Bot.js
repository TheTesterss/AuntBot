const mongoose = require("mongoose");

const BotSchema = new mongoose.Schema({
    id: {
        unique: true,
        required: true,
        type: String
    },
    blacklist: [],
    whitelist: []
})

const BotDB = mongoose.model("Bot", BotSchema)
module.exports = BotDB