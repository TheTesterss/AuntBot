const { Client } = require("discord.js")

module.exports = {
    name: "ready",
    once: true,
    /**
     * 
     * @param {Client} bot 
     */
    execute: (bot) => {    
        require("../handlers/SlashsManager")(bot);
    }
}