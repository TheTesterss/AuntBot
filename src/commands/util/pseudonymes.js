const { Client, CommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, PermissionsBitField, UserFlags } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");
const { errorEmbed } = require("../../util/embeds");

module.exports = {
    name: "pseudonymes",
    descripiton: "Affiche les anciens noms d'utilisateur connus par le client.",
    acceptDirectMessages: null,
    permissions: [],
    botPermissions: [],
    voiceOnly: false,
    ownerOnly: false,
    adminOnly: false,
    blacklistAllowed: false,
    whitelistAllowed: true,
    options: [{
        options: [{
            required: false,
            type: "user",
            name: "utilisateur",
            description: "Préciser l'utilisateur ciblé par cette commande."
        }],
        type: "sub",
        name: "liste",
        description: "Affiche la liste des anciens pseudonymes."
    },
    {
        name: "réinitialiser",
        description: "Réinitialiser vos anciens pseudonymes de nos données.",
        type: "sub",
        options: []
    }],
    ephemeral: false,
    /**
     * 
     * @param {Client} bot 
     * @param {CommandInteraction} interaction 
     * @param {Database} db 
     */
    execute: async (bot, interaction, db) => {
        let sub = interaction.options.getSubcommand()
        if(sub === "liste") {
            let list = await db.getValue("user", interaction.options.get("utilisateur")?.value || interaction.user.id, "prevnames");
            let s = 0 // start
            let e = 9 // end for paginator index from 0 to 9, from s to e

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
            .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
            .setDescription(`${bot.emojisList.chat} - Liste des anciens pseudonymes de <@${interaction.options.get("user")?.value || interaction.user.id}>.`)
        
            if(list?.length < 1) {
                embed.addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.user} - Pop ! La liste est vide.`, inline: false})
            } else {
                embed.addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: list.map((d) => `${bot.emojisList.user} - ${d.name} - <t:${d.date}:R>`).slice(s, e).join("\n"), inline: false})
            }

            let message = await interaction.editReply({embeds: [embed], components: [getComponents(bot, list, e, s)]});
            let collected = message.createMessageComponentCollector({componentType: ComponentType.Button, time: 300_000});

            collected.on("end", async () => {
                let components = message.components[0].components.forEach((button) => button.disabled = true);
                return void await message.edit({embeds: message.embeds, components});
            })

            collected.on("collect", async (button_i) => {
                if(button_i.user.id !== interaction.user.id) {
                    return void errorEmbed(bot, button_i, "Ceci n'est pas votre intéraction.", null, {}, true);
                }

                if(!button_i.deferred) await button_i.deferUpdate()

                if(["page_back", "page_next"].includes(button_i.customId)) {
                    button_i.customId === "page_back" ? s -= 9 : s += 9
                    button_i.customId === "page_back" ? e -= 9 : e += 9
    
                    message.embeds[0].fields[0] = {name: message.embeds[0].fields[0].name, value: list.map((d) => `${bot.emojisList.user} - ${d.name} - <t:${d.date}:R>`).slice(s, e).join("\n"), inline: false}
                    return void await message.edit({components: [getComponents(bot, list, e, s)], embeds: [message.embeds[0]]})
                }
            })
        } else if(sub === "réinitialiser") {
            await db.setValue("user", interaction.user.id, "prevnames", [])

            const embed = new EmbedBuilder()
            .setColor(bot.colors.true)
            .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
            .setDescription(`${bot.emojisList.chat} - Tous vos pseudonymes stockés ont été supprimés.`)

            await interaction.editReply({embeds: [embed]})
        }
    }
}