const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");

module.exports = {
    name: "ping",
    descripiton: "Show the differents latencies of the client.",
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
        const embed = new EmbedBuilder()
        .setColor(bot.colors.true)
        .setFooter({"text": "Powered by Aunt Development.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})

        let message = await interaction.editReply({embeds: [embed.setDescription(`${bot.emojisList.chat} - **Fetching latencies...**`)]})
        await message.edit({embeds: [
            embed
            .setDescription(`${bot.emojisList.chat} - **Latencies fetched!**`)
            .addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.stats} - **Passerelle discord** - \`${bot.ws.ping}ms\`\n${bot.emojisList.support} - **Réponses** - \`${Math.round(Date.now() - message.createdTimestamp)}ms\``, inline: false})
        ]})
    }
}