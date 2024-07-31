const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
    id: {
        unique: true,
        required: true,
        type: String
    },
})

const MemberDB = mongoose.model("Member", MemberSchema)
module.exports = MemberDB