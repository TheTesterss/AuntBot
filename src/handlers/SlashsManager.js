const { PermissionsBitField, SlashCommandBuilder, ApplicationCommandOptionBase, Client } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const fs = require("fs");

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

/**
 * 
 * @param {CommandData} command 
 * @returns 
 */
const createSlash = (command) => {
    let slash = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .setNSFW(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags[command.permissions[0]])
    .setDMPermission(command.acceptDirectMessages)

    if(command.options?.length < 1) slash.options = []
    for(const option of command.options) {
        slash[`add${option.type.charAt(0).toUpperCase() + string.slice(1)}Option`]((option) => {
            option
            .setName(option.name)
            .setDescription(option.description)
            .setRequired(option.required)

            if(option.type === "string")
                option.setAutocomplete(option.autocomplete)
        })

        if(option.choices) {
            for(const choice of option.choices.map((choice) => ({name: choice.name, value: choice.value}))) {
                option.addChoices(choice);
            }
        }
    }

    return slash
}

/**
 * 
 * @param {Client} bot 
 */
module.exports = async (bot) => {
    let commands = []
    let subFolders = fs
    .readdirSync("./src/commands")

    for(const subFolder of subFolders) {
        let files = fs
        .readdirSync(`./src/commands/${subFolder}`)

        for(const file of files) {
            let command = require(`../commands/${subFolder}/${file}`);
            /*  EVENT DATAS EXAMPLE:
            module.exports = {
                name: string,
                desription: string,
                acceptDirectMessages: true | null,
                voiceOnly: boolean,
                ownerOnly: boolean,
                adminOnly: boolean,
                blacklistAllowed: boolean,
                whitelistAllowed: boolean,
                permissions: string[],
                botPermissions: string[],
                options: ApplicationCommandOptions,
                ephemeral: boolean,
                execute: (bot, command, db) => {}
            }
            */
            
            repairCommand(command)
            if(!command || !command.name)
                throw new Error(
                    "Missing few informations"
                )
            if(typeof command.name !== "string")
                throw new TypeError(
                    "Invalid command name found", file
                )
            let chars = command.name.split("");
            if(chars.length < 2 && chars.length > 32)
                throw new RangeError(
                    "The command name must be between 2 and 32 chars", `${chars.length} chars actually`, command.name
                )

            commands.push(createSlash(command).toJSON())
        }
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(bot.user.id), { body: commands });
    console.log(`Slash commands loaded with success! Amount of slashs: ${commands.length}.`.bgBlue);
}