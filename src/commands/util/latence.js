const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");

module.exports = {
    name: "latence",
    descripiton: "Affiche les latences du client.",
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
        .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})

        let message = await interaction.editReply({embeds: [embed.setDescription(`${bot.emojisList.chat} - **Recherche des latences...**`)]})
        await message.edit({embeds: [
            embed
            .setDescription(`${bot.emojisList.chat} - **Latences trouvées !**`)
            .addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.stats} - **Passerelle discord** - \`${bot.ws.ping}ms\`\n${bot.emojisList.support} - **Réponse** - \`${Math.round(Date.now() - message.createdTimestamp)}ms\`\n${bot.emojisList.automod} - **Connecté** - <t:${Math.round(bot.readyTimestamp / 1000)}:R>`, inline: false})
        ]})
    }
}