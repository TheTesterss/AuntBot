const { Client, Guild } = require("discord.js");
const { default: mongoose } = require("mongoose");

module.exports = class Database {
    
    /**
     * 
     * @param {{serverSelectionTimeoutMS: number, poolSize: number, family: 4 | 6}} config
     * @param {Client} bot
     */
    constructor(config = {}, bot) {
        this.serverSelectionTimeoutMS = config.serverSelectionTimeoutMS ?? 5_000;
        this.family = config.family ?? 4;
        this.poolSize = config.poolSize ?? 10;

        this.GuildDB = require("../data/Guild");
        this.UserDB = require("../data/User");
        this.MemberDB = require("../data/Member");
        this.ClientDB = require("../data/Bot");
        this.bot = bot;

        this.names = {
            "client": "ClientDB",
            "user": "UserDB",
            "member": "MemberDB",
            "guild": "GuildDB"
        }
    }

    /**
     * 
     * @param {["client", "guild", "user", "member"]} type
     * @param {string} id
     * @param {string} name 
     * @param {any} value 
     */
    async setValue(type, id, name, value) {
        await this[this.names[type]].findOneAndUpdate({ id }, {[name]: value})
    }

    /**
     * 
     * @param {["client", "guild", "user", "member"]} type
     * @param {string} id
     * @param {string} name 
     * @returns any
     */
    async getValue(type, id, name) {
        const doc = await this[this.names[type]].findOne({ id });
        return doc ? doc[name] : null
    }

    /**
     * 
     * @param {["client", "guild", "user", "member"]} type
     * @param {string} id
     * @param {string} name 
     * @param {any} value 
     */
    async addValue(type, id, name, value) {
        let list = await this[this.names[type]].findOne({ id });

        if(!list)
            return void console.log(`Unable to load this list called: ${name}`);

        list[name].push(value);
        list.save();
    }

    /**
     * 
     * @param {["client", "guild", "user", "member"]} type
     * @param {string} id
     * @param {string} name 
     * @param {any} value 
     */
        async removeValue(type, id, name, value) {
            let list = await this[this.names[type]].findOne({ id });
    
            if(!list)
                return void console.log(`Unable to load this list called: ${name}`);
    
            list[name] = list[name].filter((id) => id != value);
            list.save();
        }

    async initializateGuilds() {
        for(const guild of this.bot.guilds.cache) {
            let returns = await this.GuildDB.findOne({id: guild[1].id});

            if(!returns)
                await this.initializateGuild(guild[1])
        }
    }

    /**
     * 
     * @param {Guild} guild 
     */
    async initializateGuild(guild) {
        await this.GuildDB.create({
            id: guild.id,
            name: guild.name
        });

        console.log(`${guild.name} has been added to the database.`.bgBlue)
    }

    async initializateBot() {
        let returns = await this.ClientDB.findOne({id: this.bot.user.id});
        
        if(!returns) {
            await this.ClientDB.create({
                id: this.bot.user.id,
                whitelist: ["792721462783377438", "855828456470478918"],
                blacklist: []
            })

            console.log("Client datas has been introduced.".bgBlue)
        }
    }

    /**
     * 
     * @param {string} url 
     */
    async connect(url) {
        if(!url)
            throw new Error(
                "MongoDB key is missing."
            )

        if(typeof url !== "string")
            throw new TypeError(
                "Mongo key need a valid string key."
            )

            try {
                await mongoose.connect(url, {
                    serverSelectionTimeoutMS: this.serverSelectionTimeoutMS,
                    maxPoolSize: this.poolSize,
                    family: this.family,
                });
                console.log("MongoDB is online.".bgGreen);
            } catch (error) {
                console.log("Connection denied.".bgRed, error);
            }
    }

    async clearDatas() {
        const collections = mongoose.connection.collections;
        await Promise.all(Object.values(collections).map((collection) =>
            collection.deleteMany({})
        ));
    }

}