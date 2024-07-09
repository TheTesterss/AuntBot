const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");

module.exports = {
    name: "whitelist",
    descripiton: "Manage users whitelist.",
    acceptDirectMessages: null,
    permissions: [],
    botPermissions: [],
    voiceOnly: false,
    ownerOnly: false,
    adminOnly: false,
    blacklistAllowed: false,
    whitelistAllowed: true,
    options: [],
    ephemeral: false,
    /**
     * 
     * @param {Client} bot 
     * @param {CommandInteraction} interaction 
     * @param {Database} db 
     */
    execute: async (bot, interaction, db) => {
        let list = await db.getValue("client", bot.user.id, "whitelist");

        const embed = new EmbedBuilder()
        .setColor(bot.colors.true)
        .setFooter({
            "text": "Powered by Aunt Development.",
            "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})
        })
        .setDescription(`${bot.emojisList.chat} - **You're managing the white list.**`)
        
        if(list.length < 1) {
            embed
            .addFields({
                name: `<t:${Math.round(Date.now() / 1000)}:R>`,
                value: `${bot.emojisList.user} - There's no user on the list.`,
                inline: false
            })
        } else {
            embed
            .addFields({
                name: `<t:${Math.round(Date.now() / 1000)}:R>`,
                value: list.map((id) => `${bot.emojisList.user} - <@${id}> - \`${id}\``).join("\n"),
                inline: false
            })
        }

        await interaction.editReply({embeds: [embed]})
    }
}