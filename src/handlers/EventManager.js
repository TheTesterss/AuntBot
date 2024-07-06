const fs = require("fs");
const { eventNames } = require("../util/datas");
const { Client } = require("discord.js");

/**
 * 
 * @param {Client} bot 
 * @param {string} event1 
 * @param {string} event2 
 */
const runEvent = (bot, event1, event2) => {
    let datas = require(`../events/${event2 ? `${event1}/${event2}` : event1}`);
    /*  EVENT DATAS EXAMPLE:
    module.exports = {
        name: string,
        once: boolean,
        execute: (bot, ...args) => {}
    }
    */
    
    if(!datas || !datas.name || ![true, false].includes(datas.once)) 
        throw new Error(
            "Few datas are missing"
        )
    if(typeof datas.name !== "string")
        throw new TypeError(
            "Invalid event name found", event2 ? `${event1}/${event2}` : event1
        )
    if(!eventNames.includes(datas.name))
        throw new TypeError(
            "This event doesn't correspond to a correct discord event.", event2 ? `${event1}/${event2}` : event1
        )

    bot[datas.once ? "once" : "on"](datas.name, async (...args) => datas.execute(bot, ...args))
    console.log(`Connection established with file event: /${event2 ? `${event1}/${event2}` : event1}`.bgGreen)
}

/**
 * 
 * @param {Client} bot 
 */
module.exports = (bot) => {
    let eventFolder = fs
    .readdirSync("./src/events/");

    for(const event of eventFolder) {
        if (event && event.endsWith(".js")) {
            runEvent(bot, event, null)
        } else if (event) {
            let eventSubFolders = fs
            .readdirSync(`./src/events/${event}`);

            for(const file of eventSubFolders) {
                runEvent(bot, event, file)
            }
        }
    }
}