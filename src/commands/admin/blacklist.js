const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, UserSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");
const { errorEmbed } = require("../../util/embeds");

module.exports = {
    name: "blacklist",
    descripiton: "Manage users blacklist.",
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
        let list = await db.getValue("client", bot.user.id, "blacklist");
        let s = 0 // start
        let e = 9 // end for paginator index from 0 to 9, from s to e

        const getComponents = (bot, list, e, s, message) => {
            return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("blacklist_page_back")
                .setDisabled(s == 0)
                .setEmoji(bot.emojisList.leftarrow)
                .setStyle(ButtonStyle.Primary)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId("blacklist_user_add")
                .setDisabled(list.length == 25 || ((message && message.embeds[0].fields.length === 10) ?? false))
                .setEmoji(bot.emojisList.join)
                .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId("blacklist_reset")
                .setDisabled(list.length < 1 || ((message && message.embeds[0].fields.length === 10) ?? false))
                .setEmoji(bot.emojisList.ben)
                .setStyle(ButtonStyle.Danger)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId("blacklist_user_remove")
                .setDisabled(list.length < 1 || ((message && message.embeds[0].fields.length === 10) ?? false))
                .setEmoji(bot.emojisList.leave)
                .setStyle(ButtonStyle.Danger)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId("blacklist_page_next")
                .setDisabled(list.length <= e)
                .setEmoji(bot.emojisList.rightarrow)
                .setStyle(ButtonStyle.Primary)
            )
        }

        const embed = new EmbedBuilder()
        .setColor(bot.colors.true)
        .setFooter({"text": "Powered by Aunt Development.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
        .setDescription(`${bot.emojisList.chat} - **You're managing the black list.** - \`${list.length} entries.\``)

        
        if(list.length < 1) {
            embed.addFields({name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.user} - There's no user on the list.`, inline: false})
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
                errorEmbed(bot, message, "That's not your interaction.", null, {}, true);
            }

            if(!button_i.deferred) await button_i.deferUpdate()

            if(["blacklist_page_back", "blacklist_page_next"].includes(button_i.customId)) {
                button_i.customId === "blacklist_page_back" ? s -= 9 : s += 9
                button_i.customId === "blacklist_page_back" ? e -= 9 : e += 9

                message.embeds[0].fields[0] = {name: message.embeds[0].fields[0].name, value: list.map((id) => `${bot.emojisList.user} - <@${id}> - \`${id}\``).slice(s, e).join("\n"), inline: false}
                return void await message.edit({components: [getComponents(bot, list, e, s)], embeds: [message.embeds[0]]})
            }

            if(["blacklist_user_add", "blacklist_user_remove"].includes(button_i.customId)) {
                let embed_1 = new EmbedBuilder()
                .setColor(bot.colors.true)
                .setFooter({"text": "Powered by Aunt Development.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
                .setDescription(`${bot.emojisList.chat} - **Give us any id.**`)
                let menu_1
                if(button_i.customId === "blacklist_user_add") {
                    menu_1 = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                        .setCustomId("menu_add")
                        .setMaxValues(1)
                        .setMinValues(1)
                        .setPlaceholder("Add a new user to the blacklist!")
                        .setDisabled(false)
                    )
                } else {
                    menu_1 = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId("menu_remove")
                        .setMaxValues(1)
                        .setMinValues(1)
                        .setPlaceholder("Add a new user to the blacklist!")
                        .setDisabled(false)
                        .setOptions(list.map(user => 
                            new StringSelectMenuOptionBuilder()
                            .setDefault(false)
                            .setValue(user)
                            .setLabel(`Remove: ${bot.users.cache.get(user).username}`)
                        ))
                    )
                }

                let replied_message = await message.reply({embeds: [embed_1], components: [menu_1]})
                let collected_1 = replied_message.createMessageComponentCollector({time: 300_000})

                collected_1.on("end", async () => {
                    await replied_message.delete();
                })

                collected_1.on("collect", async (menu_i) => {
                    if(button_i.user.id !== interaction.user.id) {
                        errorEmbed(bot, message, "That's not your interaction.", null, {}, true);
                    }
        
                    if(!button_i.deferred) await button_i.deferUpdate()
                    await replied_message.delete();

                    if(button_i.customId === "blacklist_user_add") {
                        if(list.includes(menu_i.values[0])) return;
                        await db.addValue("client", bot.user.id, "blacklist", menu_i.values[0])
                    } else {
                        await db.removeValue("client", bot.user.id, "blacklist", menu_i.values[0])
                    }
                    list = await db.getValue("client", bot.user.id, "blacklist")

                    bot.users.cache.get(menu_i.values[0]).send({embeds: [
                        new EmbedBuilder()
                        .setColor(bot.colors.true)
                        .setFooter({"text": "Powered by Aunt Development.", "iconURL": bot.user.displayAvatarURL({extension: "png", forceStatic: false, size: 2048})})
                        .setDescription(`${bot.emojisList.chat} - **You've been ${button_i.customId === "blacklist_user_add" ? `added in` : `removed from`} the black list.**`)
                    ]})

                    message.embeds[0].fields[0] = list.length < 1 ? {name: message.embeds[0].fields[0].name, value: `${bot.emojisList.user} - There's no user on the list.`, inline: false} : {name: message.embeds[0].fields[0].name, value: list.map((id) => `${bot.emojisList.user} - <@${id}> - \`${id}\``).slice(s, e).join("\n"), inline: false}
                    message.embeds[0].fields[message.embeds[0].fields.length] = {name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.chat} - <@${button_i.user.id}> - <@${menu_i.values[0]}> has been ${button_i.customId === "blacklist_user_add" ? `added in` : `removed from`} the black list.`, inline: false}
                    message.embeds[0].description = `${bot.emojisList.chat} - **You're managing the black list.** - \`${list.length} entries.\``
                    return void await message.edit({components: [getComponents(bot, list, e, s, message)], embeds: [message.embeds[0]]})
                })
            }

            if(button_i.customId === "blacklist_reset") {
                await db.setValue("client", bot.user.id, "blacklist", []);
                list = []
                s = 0
                e = 9
                
                message.embeds[0].fields[0] = {name: message.embeds[0].fields[0].name, value: `${bot.emojisList.user} - There's no user on the list.`, inline: false}
                message.embeds[0].fields[message.embeds[0].fields.length] = {name: `<t:${Math.round(Date.now() / 1000)}:R>`, value: `${bot.emojisList.chat} - <@${button_i.user.id}> - The list has been reset.`, inline: false}
                message.embeds[0].description = `${bot.emojisList.chat} - **You're managing the black list.** - \`${list.length} entries.\``
                return void await message.edit({components: [getComponents(bot, list, e, s, message)], embeds: [message.embeds[0]]})
            }
        })
    }
}