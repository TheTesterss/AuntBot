const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, UserSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");
const { errorEmbed } = require("../../util/embeds");

module.exports = {
    name: "liste",
    descripiton: "Sert à gérer les listes internes du client.",
    permissions: [],
    botPermissions: [],
    voiceOnly: false,
    ownerOnly: true,
    adminOnly: false,
    blacklistAllowed: false,
    whitelistAllowed: false,
    options: [{
        name: "blanche",
        type: "sub",
        description: "Affiche la liste blanche du client.",
        options: []
    }, {
        name: "noire",
        type: "sub",
        description: "Affiche la liste noire du client.",
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
        let types = {
            "noire": "black",
            "blanche": "white"
        }
        let sub = interaction.options.getSubcommand();
        let list = await db.getValue("client", bot.user.id, `${types[sub]}list`);
        let s = 0 // start
        let e = 9 // end for paginator index from 0 to 9, from s to e

        const getComponents = (bot, list, e, s, message) => {
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
                .setCustomId("user_add")
                .setDisabled(list.length == 25 || ((message && message.embeds[0].fields.length === 10) ?? false))
                .setEmoji(bot.emojisList.join)
                .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId("reset")
                .setDisabled(list.length < 1 || ((message && message.embeds[0].fields.length === 10) ?? false))
                .setEmoji(bot.emojisList.ben)
                .setStyle(ButtonStyle.Danger)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId("user_remove")
                .setDisabled(list.length < 1 || ((message && message.embeds[0].fields.length === 10) ?? false))
                .setEmoji(bot.emojisList.leave)
                .setStyle(ButtonStyle.Danger)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId("page_next")
                .setDisabled(list.length <= e)
                .setEmoji(bot.emojisList.rightarrow)
                .setStyle(ButtonStyle.Primary)
            )
        }

        const embed = new EmbedBuilder()
        .setColor(bot.colors.true)
        .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
        .setDescription(`${bot.emojisList.chat} - **Vous êtes en train de gérer la liste ${sub}.** - \`${list.length} entries.\``)

        
        if(list.length < 1) {
            embed.addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.user} - Pop ! La liste est vide.`, inline: false})
        } else {
            embed.addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: list.map((id) => `${bot.emojisList.user} - <@${id}> - \`${id}\``).slice(s, e).join("\n"), inline: false})
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

                message.embeds[0].fields[0] = {name: message.embeds[0].fields[0].name, value: list.map((id) => `${bot.emojisList.user} - <@${id}> - \`${id}\``).slice(s, e).join("\n"), inline: false}
                return void await message.edit({components: [getComponents(bot, list, e, s)], embeds: [message.embeds[0]]})
            }

            if(["user_add", "user_remove"].includes(button_i.customId)) {
                let embed_1 = new EmbedBuilder()
                .setColor(bot.colors.true)
                .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
                .setDescription(`${bot.emojisList.chat} - **Donnez moi un identifiant !**`)
                let menu_1
                if(button_i.customId === "user_add") {
                    menu_1 = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                        .setCustomId("menu_add")
                        .setMaxValues(1)
                        .setMinValues(1)
                        .setPlaceholder("Ajout d'un utilisateur !")
                        .setDisabled(false)
                    )
                } else {
                    menu_1 = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId("menu_remove")
                        .setMaxValues(1)
                        .setMinValues(1)
                        .setPlaceholder("Retrait d'un utilisateur !")
                        .setDisabled(false)
                        .setOptions(list.map(user => 
                            new StringSelectMenuOptionBuilder()
                            .setDefault(false)
                            .setValue(user)
                            .setLabel(`Retirer: ${bot.users.cache.get(user).username} ?`)
                        ))
                    )
                }

                let replied_message = await message.reply({embeds: [embed_1], components: [menu_1]})
                let collected_1 = replied_message.createMessageComponentCollector({time: 300_000})

                collected_1.on("end", async () => {
                    await replied_message.delete().catch((e) => {});
                })

                collected_1.on("collect", async (menu_i) => {
                    if(button_i.user.id !== interaction.user.id) {
                        return void errorEmbed(bot, menu_i, "Ceci n'est pas votre intéraction.", null, {}, true);
                    }
        
                    if(!button_i.deferred) await button_i.deferUpdate()
                    await replied_message.delete().catch((e) => {});

                    if(button_i.customId === "user_add" && (list.includes(menu_i.values[0]) || menu_i.values[0] === process.env.OWNER || bot.users.cache.get(menu_i.values[0]).bot)) {
                        return void errorEmbed(bot, menu_i, "Cet utilisateur ne peut malheureusement pas être ajouté à cette liste.", null, {}, true);
                    };

                    if(button_i.customId === "user_remove" && !list.includes(menu_i.values[0])) {
                        return void errorEmbed(bot, menu_i, "Cet utilisateur ne peut malheureusement pas être retiré de cette liste.", null, {}, true);
                    };

                    if(button_i.customId === "user_add") {
                        await db.addValue("client", bot.user.id, `${types[sub]}list`, menu_i.values[0])
                    } else {
                        await db.removeValue("client", bot.user.id, `${types[sub]}list`, menu_i.values[0])
                    }

                    list = await db.getValue("client", bot.user.id, `${types[sub]}list`)

                    bot.users.cache.get(menu_i.values[0]).send({embeds: [
                        new EmbedBuilder()
                        .setColor(bot.colors.true)
                        .setFooter({"text": "Alimenté par Aunt Développement.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
                        .setDescription(`${bot.emojisList.chat} - **Vous avez été ${button_i.customId === "user_add" ? `ajouté dans` : `retiré de`} la liste ${sub}.**`)
                    ]})

                    message.embeds[0].fields[0] = list.length < 1 ? {name: message.embeds[0].fields[0].name, value: `${bot.emojisList.user} - Pop ! La liste est vide.`, inline: false} : {name: message.embeds[0].fields[0].name, value: list.map((id) => `${bot.emojisList.user} - <@${id}> - \`${id}\``).slice(s, e).join("\n"), inline: false}
                    message.embeds[0].fields[1] = {name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.chat} - <@${button_i.user.id}> - <@${menu_i.values[0]}> a été ${button_i.customId === "user_add" ? `ajouté dans` : `retiré de`} la liste ${sub}.`, inline: false}
                    message.embeds[0].description = `${bot.emojisList.chat} - **Vous êtes en train de gérer la liste ${sub}.** - \`${list.length} entries.\``
                    return void await message.edit({components: [getComponents(bot, list, e, s, message)], embeds: [message.embeds[0]]})
                })
            }

            if(button_i.customId === "reset") {
                await db.setValue("client", bot.user.id, `${types[sub]}list`, []);
                list = []
                s = 0
                e = 9
                
                message.embeds[0].fields[0] = {name: message.embeds[0].fields[0].name, value: `${bot.emojisList.user} - Pop ! La liste est vide.`, inline: false}
                message.embeds[0].fields[1] = {name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.chat} - <@${button_i.user.id}> - Liste parfaitement réinitialisée.`, inline: false}
                message.embeds[0].description = `${bot.emojisList.chat} - **Vous êtes en train de gérer la liste ${sub}.** - \`0 entrie.\``
                return void await message.edit({components: [getComponents(bot, list, e, s, message)], embeds: [message.embeds[0]]})
            }
        })
    }
}