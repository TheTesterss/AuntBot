const { Client, CommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, PermissionsBitField, UserFlags } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");
const { errorEmbed } = require("../../util/embeds");

module.exports = {
    name: "listes",
    descripiton: "Affiche une des listes qui vous est présenté.",
    permissions: [],
    botPermissions: [],
    voiceOnly: false,
    ownerOnly: false,
    adminOnly: false,
    blacklistAllowed: false,
    whitelistAllowed: true,
    options: [
        {name: "premiums", description: "Affiche la liste des utilisateurs ayant ajouté des boosts sur ce serveur.", options: [], type: "sub"},
        {name: "robots", description: "Affiche la liste des utilisateurs qui sont comptés comme 'robots'.", options: [], type: "sub"},
        {name: "membres", description: "Affiche la liste des utilisateurs ayant un rôle spécifique.", options: [{name: "rôle", type: "role", description: "Rôle à définir.", required: true}, {name: "inclure_robots", description: "Inclure les robots à la liste ?", required: false, type: "boolean"}], type: "sub"},
        {name: "bannissements", description: "Affiche la liste des utilisateurs qui ont été banni.", options: [], type: "sub"},
        {name: "administrateurs", description: "Affiche la liste des utilisateurs ayant la permission 'administrateur'.", options: [{name: "inclure_robots", description: "Inclure les robots à la liste ?", required: false, type: "boolean"}], type: "sub"},
        {name: "modérateurs", description: "Affiche la liste des utilisateurs ayant la permission 'bannissement'.", options: [{name: "inclure_robots", description: "Inclure les robots à la liste ?", required: false, type: "boolean"}], type: "sub"},
        {name: "hypesquad_bravoure", description: "Affiche la liste des utilisateurs ayant le badge hypesquad de la bravoure.", options: [], type: "sub"},
        {name: "hypesquad_brilliance", description: "Affiche la liste des utilisateurs ayant le badge hypesquad de la brilliance.", options: [], type: "sub"},
        {name: "hypesquad_balance", description: "Affiche la liste des utilisateurs ayant le badge hypesquad de la balance.", options: [], type: "sub"},
        {name: "développeur_actif", description: "Affiche la liste des utilisateurs ayant le badge de développeur actif.", options: [], type: "sub"},
    ],
    ephemeral: false,
    /**
     * 
     * @param {Client} bot 
     * @param {CommandInteraction} interaction 
     * @param {Database} db 
     */
    execute: async (bot, interaction, db) => {
        let list;
        let s = 0 // start
        let e = 9 // end for paginator index from 0 to 9, from s to e
        let choice = interaction.options.getSubcommand();
        let id = interaction.options.get("rôle")?.value ?? interaction.member.roles.highest.id
        let bots = interaction.options.get("inclure_robots")?.value ?? false
        let bans;

        if(choice === "bans") {
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
                return void errorEmbed(bot, interaction, "Vous manquez de permissions.", "userPerms", {permissions: ["ManageMembers"]}, false)

            bans = (await interaction.guild.bans.fetch()).map((ban) => ban.user);
        }

        switch(choice) {
            case "premiums":
                list = interaction.guild.members.cache.filter((m) => m.premiumSince);
                break;
            case "robots":
                list = interaction.guild.members.cache.filter((m) => m.user.bot);
                break;
            case "membres":
                list = interaction.guild.members.cache.filter((m) => m.roles.cache.has(id) && (bots || !m.user.bot));
                break;
            case "administrateurs":
                list = interaction.guild.members.cache.filter((m) => m.permissions.has(PermissionsBitField.Flags.Administrator) && (bots || !m.user.bot));
                break;
            case "modérateurs":
                list = interaction.guild.members.cache.filter((m) => m.permissions.has(PermissionsBitField.Flags.BanMembers) && (bots || !m.user.bot));
                break;
            case "bannissements":
                list = bans.filter((ban) => ban && (bots || !ban.bot));
                break;
            case "hypesquad_bravoure":
                list = interaction.guild.members.cache.filter((m) => m.user.flags.has(UserFlags.HypeSquadOnlineHouse1))
                break;
            case "hypesquad_brilliance":
                list = interaction.guild.members.cache.filter((m) => m.user.flags.has(UserFlags.HypeSquadOnlineHouse2))
                break;
            case "hypesquad_balance":
                list = interaction.guild.members.cache.filter((m) => m.user.flags.has(UserFlags.HypeSquadOnlineHouse3))
                break;
            case "développeur_actif":
                list = interaction.guild.members.cache.filter((m) => m.user.flags.has(UserFlags.ActiveDeveloper))
                break;
        }

        const getComponents = (bot, list, e, s) => {
            return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("page_back")
                .setDisabled(s == 0)
                .setEmoji(bot.emojisList.leftarrow)
                .setStyle(ButtonStyle.Primary)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId("page_next")
                .setDisabled(list?.size <= e || list?.length <= e)
                .setEmoji(bot.emojisList.rightarrow)
                .setStyle(ButtonStyle.Primary)
            )
        }

        const embed = new EmbedBuilder()
        .setColor(bot.colors.true)
        .setFooter({"text": "Powered by Aunt Development.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
        .setDescription(`${bot.emojisList.chat} - List of ${choice.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")} on ${interaction.guild.name}${choice === "role_members" ? ` with <@&${id}>'s role` : ""}`)
        
        if(list.size < 1) {
            embed.addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.user} - There's no user on the list.`, inline: false})
        } else {
            embed.addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: list.map((user) => `${bot.emojisList.user} - ${user} - \`${user.id}\``).slice(s, e).join("\n"), inline: false})
        }

        let message = await interaction.editReply({embeds: [embed], components: [getComponents(bot, list, e, s)]});
        let collected = message.createMessageComponentCollector({componentType: ComponentType.Button, time: 300_000});

        collected.on("end", async () => {
            let components = message.components[0].components.forEach((button) => button.disabled = true);
            return void await message.edit({embeds: message.embeds, components});
        })

        collected.on("collect", async (button_i) => {
            if(button_i.user.id !== interaction.user.id) {
                return void errorEmbed(bot, button_i, "That's not your interaction.", null, {}, true);
            }

            if(!button_i.deferred) await button_i.deferUpdate()

            if(["page_back", "page_next"].includes(button_i.customId)) {
                button_i.customId === "page_back" ? s -= 9 : s += 9
                button_i.customId === "page_back" ? e -= 9 : e += 9
    
                message.embeds[0].fields[0] = {name: message.embeds[0].fields[0].name, value: list.map((user) => `${bot.emojisList.user} - ${user} - \`${user.id}\``).slice(s, e).join("\n"), inline: false}
                return void await message.edit({components: [getComponents(bot, list, e, s)], embeds: [message.embeds[0]]})
            }
        })
    }
}