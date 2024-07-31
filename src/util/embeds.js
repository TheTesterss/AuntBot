const { EmbedBuilder, Client, CommandInteraction, PermissionsBitField, Message } = require("discord.js");

/**
 * 
 * @param {Client} bot 
 * @param {CommandInteraction} interaction 
 * @param {string} description
 * @param {string} reason
 * @param {{name: string, description: string, acceptDirectMessages: true | null, voiceOnly: boolean, ownerOnly: boolean, adminOnly: boolean, blacklistAllowed: boolean, whitelistAllowed: boolean, permissions: [], botPermissions: [], options: ApplicationCommandOptionBase[], ephemeral: boolean, execute: (bot, command, db) => {}}} command
 * @param {boolean} ephemeral
 */
const errorEmbed = async (bot, interaction, description, reason, command, ephemeral) => {
    let permissions = {
        "Administrator": `${bot.emojisList.admin} - Administrateur`,
        "ManageMembers": `${bot.emojisList.mod} - Bannissement et/ou exclusion`,
        "ManageChannels": `${bot.emojisList.channel} - Gérer les salons`,
        "ManageRoles": `${bot.emojisList.id} - Gérer les rôles`,
        "ManageEmojisAndStickers": `${bot.emojisList.automod} - Gérer les émojis et autocollants`,
        "ManageGuild": `${bot.emojisList.community} - Gérer le serveur`
    }

    let embed = new EmbedBuilder()
    .setDescription(`**${description}**`)
    .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
    .setColor(bot.colors.false)
    
    switch (reason) {
        case "userPerms":
            embed.addFields({
                name: `<t:${Math.round(Date.now() / 1000)}:R>`,
                value: `${bot.emojisList.chat} - Permissions manquantes: \`n>>> ${command.permissions.filter((permission) => !interaction.member.permissions.has(PermissionsBitField.Flags[permission.replace("ManageMembers", "BanMembers")])).map((permission) => permissions[permission]).join("\n")}`,
                inline: false
            })
            break;
        case "botPerms":
            embed.addFields({
                name: `<t:${Math.round(Date.now() / 1000)}:R>`,
                value: `${bot.emojisList.chat} - Permissions manquantes: \n>>> ${command.botPermissions.filter((permission) => !interaction.guild.members.me.permissions.has(PermissionsBitField.Flags[permission.replace("ManageMembers", "BanMembers")])).map((permission) => permissions[permission]).join("\n")}`,
                inline: false
            })
            break;
    }

    if(!interaction.replied)
        return void await interaction.reply({embeds: [embed], ephemeral: true})
}

module.exports = {
    errorEmbed,
}