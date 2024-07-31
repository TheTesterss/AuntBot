const { Client } = require("discord.js");
const Database = require("../handlers/DatabaseManager");

module.exports = {
    name: "ready",
    once: true,
    /**
     * 
     * @param {Client} bot 
     * @param {Database} db
     */
    execute: async (bot, db) => {    
        require("../handlers/SlashsManager")(bot);

        db.initializateGuilds();
        db.initializateBot();

        //bot.application.commands.cache.forEach(command => command.delete())
    }
}