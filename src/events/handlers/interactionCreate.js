const { Client, Interaction, InteractionType, PermissionsBitField, GuildMember } = require("discord.js");
const fs = require("fs");
const { errorEmbed } = require("../../util/embeds");

/**
 * 
 * @param {[]} perms 
 * @param {GuildMember} member 
 */
const hasAllPerms = (perms, member) => {
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
    command.botPermissions ??= ["EmbedLinks"]
    if(command.botPermissions.length == 0) 
        command.botPermissions = ["EmbedLinks"]
}

module.exports = {
    name: "interactionCreate", 
    once: false,
    /**
     * 
     * @param {Client} bot 
     * @param {Interaction} interaction 
     */
    execute: async (bot, interaction) => {
        if(interaction.type == InteractionType.ApplicationCommand) {
            let subFolders = fs
            .readdirSync("./src/commands/")

            for(const subFolder of subFolders) {
                let files = fs
                .readdirSync(`./src/commands/${subFolder}`)

                for(const file of files) {
                    if(file.replace(".js", "") !== interaction.commandName) return;
                    const command = require(`../../commands/${subFolder}/${file}`);
                    repairCommand(command);

                    if(command.voiceOnly && !interaction.member.voice.channel)
                        return void errorEmbed(bot, interaction, "You must be in a discord voice/stage channel!", null, command);

                    if(command.ownerOnly && process.env.OWNER !== interaction.user.id)
                        return void errorEmbed(bot, interaction, "You're not the bot owner.", null, command);

                    if(command.adminOnly && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
                        return void errorEmbed(bot, interaction, "You must be an administrator of the guild.", null, command);

                    if(hasAllPerms(command.permissions, interaction.member))
                        return void errorEmbed(bot, interaction, "You're missing few perms.", "userPerms", command)

                    if(hasAllPerms(command.botPermissions, interaction.guild.members.me))
                        return void errorEmbed(bot, interaction, "I'm missing few permissions.", "botPerms", command)

                    if(!interaction.deferred) await interaction.deferReply({ephemeral: command.ephemeral});
                    command.execute(bot, interaction, db = null)
                }
            }
        }
    }
}