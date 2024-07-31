const { Client, CommandInteraction, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, OAuth2Scopes, ChannelType } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");
const { recompileSchema } = require("../../data/User");

module.exports = {
    name: "info",
    descripiton: "Affiche des informations d'un thème selon ce que vous souhaitez.",
    acceptDirectMessages: null,
    permissions: [],
    botPermissions: [],
    voiceOnly: false,
    ownerOnly: false,
    adminOnly: false,
    blacklistAllowed: false,
    whitelistAllowed: true,
    options: [
        {name: "salon", description: "Retourne les informations d'un salon.", type: "sub", options: [{name: "mention", description: "Mention du salon souhaité.", required: false, type: "channel"}]},
        {name: "serveur", description: "Retourne les informations du serveur.", type: "sub", options: []},
        {name: "client", description: "Retourne les informations du client.", type: "sub", options: []},
        {name: "rôle", description: "Retourne les informations d'un rôle.", type: "sub", options: [{name: "mention", description: "Mention du rôle souhaité.", required: false, type: "role"}]},
        {name: "utilisateur", description: "Retourne les informations d'un utilisateur.", type: "sub", options: [{name: "mention", description: "Mention de l'utilisateur souhaité.", required: false, type: "user"}]}
    ],
    ephemeral: false,
    /**
     * 
     * @param {Client} bot 
     * @param {CommandInteraction} interaction 
     * @param {Database} db 
     */
    execute: async (bot, interaction, db) => {
        const sub = interaction.options.getSubcommand();
        if(sub === "rôle") {
            let permissionsList = {
                "Administrator": "Administrateur",
                "ViewAuditLog": "Voir le journal d'audit",
                "ManageGuild": "Gérer le serveur",
                "ManageRoles": "Gérer les rôles",
                "ManageChannels": "Gérer les salons",
                "KickMembers": "Expulser des membres",
                "BanMembers": "Bannir des membres",
                "CreateInstantInvite": "Créer une invitation",
                "ChangeNickname": "Changer de pseudo",
                "ManageNicknames": "Gérer les pseudos",
                "ManageEmojisAndStickers": "Gérer les emojis et stickers",
                "ManageWebhooks": "Gérer les webhooks",
                "ViewChannel": "Voir les salons",
                "SendMessages": "Envoyer des messages",
                "SendTTSMessages": "Envoyer des messages TTS",
                "ManageMessages": "Gérer les messages",
                "EmbedLinks": "Intégrer des liens",
                "AttachFiles": "Joindre des fichiers",
                "ReadMessageHistory": "Lire l'historique des messages",
                "MentionEveryone": "Mentionner tout le monde",
                "UseExternalEmojis": "Utiliser des emojis externes",
                "ViewGuildInsights": "Voir les analyses du serveur",
                "Connect": "Se connecter",
                "Speak": "Parler",
                "MuteMembers": "Mettre en sourdine des membres",
                "DeafenMembers": "Rendre sourd des membres",
                "MoveMembers": "Déplacer des membres",
                "UseVAD": "Utiliser la détection de voix",
                "PrioritySpeaker": "Orateur prioritaire",
                "Stream": "Diffuser",
                "UseApplicationCommands": "Utiliser des commandes d'application",
                "RequestToSpeak": "Demander à parler",
                "ManageThreads": "Gérer les fils",
                "UsePublicThreads": "Utiliser des fils publics",
                "UsePrivateThreads": "Utiliser des fils privés",
                "UseExternalStickers": "Utiliser des stickers externes",
                "SendMessagesInThreads": "Envoyer des messages dans les fils",
                "StartEmbeddedActivities": "Démarrer des activités intégrées",
                "ModerateMembers": "Modérer des membres"
            };

            let role = interaction.guild.roles.cache.get(interaction.options.get("mention")?.value ?? interaction.member.roles.highest.id)
            let roles = role.guild.roles.cache.sort((a, b) => a.position - b.position);
            let roleIndex;
            for(let i = 0;i < roles.size;i++) {
                if(roles.at(i)?.id === role.id){
                    roleIndex = i;
                    break;
                }
            }
            let nextRole = roles.at(roleIndex - 1) ?? null;
            let previousRole = roles.at(roleIndex + 1) ?? null   

            let embed = new EmbedBuilder()
            .setColor(role.hexColor ?? bot.colors.true)
            .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
            .setThumbnail(role.iconURL() ?? `https://singlecolorimage.com/get/${role.hexColor.replace("#", "")}/1080x1080`)
            .setDescription(`${bot.emojisList.chat} - Crée le <t:${Math.round(role.createdTimestamp / 1000)}>`)
            .setAuthor({name: `Rôle ${role.name}`, iconURL: role.iconURL()})
            .addFields(
                {name: "Couleur", value: `${role.hexColor}`, inline: true},
                {name: "Identifiant", value: `${role.id}`, inline: true},
                {name: "Mentionnable", value: `${role.mentionable ? "Oui": "Non"}`, inline: false},
                {name: "Affichage séparé", value: `${role.hoist ? "Oui" : "Non"}`, inline: false},
                {name: `Membres [${role.members.size}/${role.guild.members.cache.size}]`, value: `${role.members.size === 0 ? "Aucun utilisateur ne possède cet incroyable rôle :/" : role.members.map((member) => `<@${member.id}>`).slice(0, 9).join(", ")} ${role.members.size > 10 ? `**et d'autres...**` : ""}`, inline: false},
                {name: `Permissions [${role.permissions.toArray().length}/39]`, value: `${role.permissions.toArray().length === 0 ? "Aucune permission n'a été attribuée à ce rôle :/" : role.permissions.toArray().map((permission) => permissionsList[permission]).slice(0, 9).join(", ")} ${role.permissions.toArray().length > 10 ? "**et d'autres...**" : ""}`, inline: false},
                {name: `Position [${role.guild.roles.cache.size - role.position}/${role.guild.roles.cache.size}]`, value: `${previousRole ? `<@&${previousRole.id}> > ` : ""}<@&${role.id}>${nextRole ? ` > <@&${nextRole.id}>` : ""}`, inline: false},
            )
            .setImage(`https://singlecolorimage.com/get/${role.hexColor.replace("#", "")}/1440x26`)

            let button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setURL(role.icon ? role.iconURL() : "https://discord.com/")
                .setDisabled(role.icon ? false : true)
                .setStyle(ButtonStyle.Link)
                .setLabel("Télécharger l'icône")
            )

            return interaction.editReply({embeds: [embed], components: [button]})

        } else if(sub === "client") {
            const getGuildInvites = async () => {
                const guildInvites = await Promise.all(bot.guilds.cache.map(async (guild) => {
                    if(!guild.members.me.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)){
                        return `${guild.name}`
                    } else {
                        let invite = await guild.channels.cache
                        .filter(channel => channel.type === ChannelType.GuildText)
                        .random()
                        .createInvite();
                        return `[${guild.name}](${invite.url})`;
                    }
                }));
                return guildInvites.slice(0, 9).join(", ");
            };

            let embed = new EmbedBuilder()
            .setTitle(`**${bot.user.username} (${bot.user.id})**`)
            .setColor(bot.colors.true)
            .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
            .setThumbnail(bot.user.displayAvatarURL())
            .setDescription(`${bot.emojisList.chat} - Informations et statistiques de Aunt Bot.\n**Shard #1 • ${bot.users.cache.size} membres • ${bot.guilds.cache.size} serveurs • ${(await bot.application.commands.fetch()).size} commandes**`)
            .addFields(
                {name: "Latence", value: `${bot.ws.ping} millisecondes \`(${Math.round(Date.now() - interaction.createdTimestamp)} millisecondes d'exécution)\`.`, inline: false},
                {name: "Propriétaire", value: `<@${process.env.OWNER}>`, inline: true},
                {name: "Identifiant", value: `${bot.user.id}`, inline: false},
                {name: "Serveurs", value: `${await getGuildInvites()} ${bot.guilds.cache.size > 10 ? "**et d'autres...**" : ""}`, inline: false},
                {name: "Création du client", value: `<t:${Math.round(bot.user.createdTimestamp / 1000)}>`, inline: true},
                {name: "Connecté depuis", value: `<t:${Math.round(bot.readyTimestamp / 1000)}>`, inline: true},
            )

            let button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setURL(bot.generateInvite({scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot], permissions: [PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.CreateInstantInvite, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageNicknames, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.UseApplicationCommands, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.UseExternalEmojis, PermissionsBitField.Flags.UseExternalStickers, PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.ViewChannel]}))
                .setDisabled(false)
                .setStyle(ButtonStyle.Link)
                .setLabel("Inviter le client")
            )

            return interaction.editReply({embeds: [embed], components: [button]})

        } else if(sub === "salon") {
            const channel = interaction.guild.roles.cache.get(interaction.options.get("mention")?.value ?? interaction.channel.id);
         

            let embed = new EmbedBuilder()
            .setTitle(`**${bot.user.username} (${bot.user.id})**`)
            .setColor(bot.colors.true)
            .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
            .setThumbnail(bot.user.displayAvatarURL())
            .setDescription(`${bot.emojisList.chat} - Informations et statistiques de Aunt Bot.\n**Shard #1 • ${bot.users.cache.size} membres • ${bot.guilds.cache.size} serveurs • ${(await bot.application.commands.fetch()).size} commandes**`)
            .addFields(
                {name: "Latence", value: `${bot.ws.ping} millisecondes \`(${Math.round(Date.now() - interaction.createdTimestamp)} millisecondes d'exécution)\`.`, inline: false},
                {name: "Propriétaire", value: `<@${process.env.OWNER}>`, inline: true},
                {name: "Identifiant", value: `${bot.user.id}`, inline: false},
                {name: "Serveurs", value: `${await getGuildInvites()} ${bot.guilds.cache.size > 10 ? "**et d'autres...**" : ""}`, inline: false},
                {name: "Création du client", value: `<t:${Math.round(bot.user.createdTimestamp / 1000)}>`, inline: true},
                {name: "Connecté depuis", value: `<t:${Math.round(bot.readyTimestamp / 1000)}>`, inline: true},
            )
        }

    }
}