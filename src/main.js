require("dotenv").config();
const Database = require("./handlers/DatabaseManager");
const { Client, IntentsBitField, Partials } = require("discord.js");
const bot = new Client({
    intents: [
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildInvites,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User
    ]
});

require("colors");
require("./handlers/EventManager")(bot);
bot.emojisList = require("./util/emojis.json");
bot.colors = require("./util/colors.json");

const noerr = [10062, 40060, 50001, 50013, 10008]
process.on('unhandledRejection', (reason, p) => {
    if(noerr.includes(reason.code)) return
    console.log(' [antiCrash] :: Unhandled Rejection/Catch');
    console.log(reason, p);
});
process.on('uncaughtException', (err, origin) => {
    if(noerr.includes(err.code)) return
    console.log(' [antiCrash] :: Uncaught Exception/Catch');
    console.log(err, origin);
}) 
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
    console.log(err, origin);
});

bot.login(process.env.TOKEN)
    .then(() => {
        console.log("Bot is now ready".bgGreen);
    })
    .catch((err) => {
        console.error("Current bot token is not valid.".bgRed, err);
    })

const db = new Database({serverSelectionTimeoutMS: 5_000, poolSize: 10, family: 4}, bot);
db.connect(process.env.MONGOURI);
//db.clearDatas() // Enable this when you wanna reset your database, You can't get any deleted data, be carefull.
bot.db = db;