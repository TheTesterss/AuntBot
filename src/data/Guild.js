const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
    id: {
        unique: true,
        required: true,
        type: String
    },
})

const GuildDB = mongoose.model("Guild", GuildSchema)
module.exports = GuildDB