const { Client, Interaction, InteractionType, PermissionsBitField, GuildMember } = require("discord.js");
const fs = require("fs");
const { errorEmbed } = require("../../util/embeds");
const Database = require("../../handlers/DatabaseManager");

/**
 * 
 * @param {[]} perms 
 * @param {GuildMember} member 
 */
const MissPerms = (perms, member) => {
    let notIncluded = []
    for(const perm of perms) {
        if(!member.permissions.has(PermissionsBitField.Flags[perm]))
            notIncluded.push(perm)
    }

    return notIncluded.length > 0;
}

/**
 * 
 * @param {{name: string, description: string, acceptDirectMessages: true | null, voiceOnly: boolean, ownerOnly: boolean, adminOnly: boolean, blacklistAllowed: boolean, whitelistAllowed: boolean, permissions: [], botPermissions: [], options: ApplicationCommandOptionBase, ephemeral: boolean, execute: (bot, command, db) => {}}} 
 * @returns 
 */
const repairCommand = (command) => {
    if(!command.name) return;
    command.name = command.name
    command.description ??= "No description for this command."
    command.acceptDirectMessages ??= null
    command.voiceOnly ??= false
    command.ownerOnly ??= false
    command.adminOnly ??= false
    command.blacklistAllowed ??= false
    command.whitelistAllowed ??= false
    command.options ??= []
    command.ephemeral ??= false
    command.permissions ??= []
    command.botPermissions ??= []
    if(command.botPermissions.length == 0) 
        command.botPermissions = []
}

module.exports = {
    name: "interactionCreate", 
    once: false,
    /**
     * 
     * @param {Client} bot 
     * @param {Database} db
     * @param {Interaction} interaction 
     */
    execute: async (bot, db, interaction) => {
        if(interaction.type !== InteractionType.ApplicationCommand) return;
        let subFolders = fs
        .readdirSync("./src/commands/")

        for(const subFolder of subFolders) {
            let files = fs
            .readdirSync(`./src/commands/${subFolder}`)

            for(const file of files) {
                console.log(interaction.commandName === file.replace(".js", ""), file)
                if(file.replace(".js", "") !== interaction.commandName) return;
                const command = require(`../../commands/${subFolder}/${file}`);
                repairCommand(command);

                if(command.voiceOnly && !interaction.member.voice.channel)
                    return void errorEmbed(bot, interaction, "You must be in a discord voice/stage channel!", null, command);

                if((command.ownerOnly && process.env.OWNER !== interaction.user.id) && (command.whitelistAllowed && !(await db.getValue("client", bot.user.id, "whitelist")).includes(interaction.user.id)))
                    return void errorEmbed(bot, interaction, "You're not the bot owner.", null, command);

                if((command.adminOnly && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) && (command.whitelistAllowed && !(await db.getValue("client", bot.user.id, "whitelist")).includes(interaction.user.id)))
                    return void errorEmbed(bot, interaction, "You must be an administrator of the guild.", null, command);

                if(MissPerms(command.permissions, interaction.member) && (command.whitelistAllowed && !(await db.getValue("client", bot.user.id, "whitelist")).includes(interaction.user.id)))
                    return void errorEmbed(bot, interaction, "You're missing few perms.", "userPerms", command)

                if(MissPerms(command.botPermissions, interaction.guild.members.me))
                    return void errorEmbed(bot, interaction, "I'm missing few permissions.", "botPerms", command)

                if(!command.blacklistAllowed && (await db.getValue("client", bot.user.id, "blacklist")).includes(interaction.user.id))
                    return void errorEmbed(bot, interaction, "You're currently blacklisted from the client.", null, command)

                if(!interaction.deferred) await interaction.deferReply({ephemeral: command.ephemeral});

                command.execute(bot, interaction, db)
            }
        }
    }
}