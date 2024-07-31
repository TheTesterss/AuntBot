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
    for(const perm of perms && perms) {
        if(!member.permissions.has(PermissionsBitField.Flags[perm.replace("ManageMembers", "BanMembers")]))
            notIncluded.push(perm)
    }

    return notIncluded.length > 0;
}

/**
 * 
 * @param {{name: string, description: string, voiceOnly: boolean, ownerOnly: boolean, adminOnly: boolean, blacklistAllowed: boolean, whitelistAllowed: boolean, permissions: [], botPermissions: [], options: ApplicationCommandOptionBase[], ephemeral: boolean, execute: (bot, command, db) => {}}} 
 * @returns 
 */
const repairCommand = (command) => {
    if(!command.name) return;
    command.name = command.name
    command.description ??= "No description for this command."
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
        if(!interaction.isChatInputCommand()) return;
        let subFolders = fs
        .readdirSync("./src/commands/")

        for(const subFolder of subFolders) {
            let files = fs
            .readdirSync(`./src/commands/${subFolder}`)


            for(const file of files) {
                if(file.replace(".js", "") === interaction.commandName) {
                    const command = require(`../../commands/${subFolder}/${file}`);
                    if(!interaction.deferred) await interaction.deferReply({ephemeral: command.ephemeral ?? false});
                    repairCommand(command);

                    if(command.voiceOnly && !interaction.member.voice.channel)
                        return void await errorEmbed(bot, interaction, "Vous devez vous trouvez dans un canal vocal ou une conférence !", null, command);

                    if((command.ownerOnly && process.env.OWNER !== interaction.user.id) && (command.whitelistAllowed && !(await db.getValue("client", bot.user.id, "whitelist")).includes(interaction.user.id)))
                        return void await errorEmbed(bot, interaction, "Seul mon propriétaire a accès à celà.", null, command);

                    if((command.adminOnly && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) && (command.whitelistAllowed && !(await db.getValue("client", bot.user.id, "whitelist")).includes(interaction.user.id)))
                        return void await errorEmbed(bot, interaction, "Seul un administrateur peut exécuter ça.", null, command);

                    if(MissPerms(command.permissions, interaction.member) && (command.whitelistAllowed && !(await db.getValue("client", bot.user.id, "whitelist")).includes(interaction.user.id)))
                        return void await errorEmbed(bot, interaction, "Vous manquez de permissions.", "userPerms", command)

                    if(MissPerms(command.botPermissions, interaction.guild.members.me))
                        return void await errorEmbed(bot, interaction, "Je manque de permissions.", "botPerms", command)

                    if(!command.blacklistAllowed && (await db.getValue("client", bot.user.id, "blacklist")).includes(interaction.user.id))
                        return void await errorEmbed(bot, interaction, "Vous êtes actuellement inclut dans ma liste noire.", null, command)

                    command.execute(bot, interaction, db)
}
            }
        }
    }
}