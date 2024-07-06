const { Client, IntentsBitField, Partials, Collection } = require("discord.js");
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
require("dotenv").config();
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