const { PermissionsBitField, SlashCommandBuilder, ApplicationCommandOptionBase, Client } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const fs = require("fs");

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
    command.slash ??= null
    command.ephemeral ??= false
    command.permissions ??= []
    command.botPermissions ??= []
    if(command.botPermissions.length == 0) 
        command.botPermissions = []
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
    .setDMPermission(false)

    if(command.options?.length < 1) slash.options = []
    for(const option of command.options) {
        switch(option.type) {
            case "sub":
                slash.addSubcommand((opt) => {
                    opt.setName(option.name)
                    opt.setDescription(option.description)
                    for(const option1 of option.options) {
                        opt[`add${option1.type.charAt(0).toUpperCase() + option1.type.slice(1)}Option`]((opt1) => {
                            opt1
                            .setName(option1.name)
                            .setDescription(option1.description)
                            .setRequired(option1.required)
                        
                            if(option1.type === "string" && !option1.choices)
                                opt1.setAutocomplete(option.autocomplete)
                        
                            if(option1.type === "string" && option1.choices) {
                                opt1.addChoices(option.choices)
                            }
        
                            return opt1;
                        })
                    }

                    return opt
                })
                break;
            default:
                slash[`add${option.type.charAt(0).toUpperCase() + option.type.slice(1)}Option`]((opt) => {
                    opt
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                
                    if(option.type === "string" && !option.choices)
                        opt.setAutocomplete(option.autocomplete)
                
                    if(option.type === "string" && option.choices) {
                        opt.addChoices(option.choices)
                    }

                    return opt;
                })
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
                voiceOnly: boolean,
                ownerOnly: boolean,
                adminOnly: boolean,
                blacklistAllowed: boolean,
                whitelistAllowed: boolean,
                permissions: string[],
                botPermissions: string[],
                options: ApplicationCommandOptionBase[]
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

            let slash = createSlash(command).toJSON()
            commands.push(slash)
        }
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(bot.user.id), { body: commands });
    console.log(`Slash commands loaded with success! Amount of slashs: ${commands.length}.`.bgBlue);
}