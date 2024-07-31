const { Client, User } = require("discord.js");
const Database = require("../../handlers/DatabaseManager");

module.exports = {
    name: "userUpdate",
    once: false,
    /**
     * 
     * @param {Client} bot 
     * @param {Database} db
     * @param {User} user1
     * @param {User} user2
     */
    execute: async (bot, db, user1, user2) => {    
        if(user1.username !== user2.username) {
            let user = await db.UserDB.findOne({id: user1.id})
            console.log(user)
            if(!user){
                await db.UserDB.create({id: user1.id}, {
                    id: user1.id,
                    prevnames: []
                })
            }
            console.log(user)
            return void await db.addValue("user", user1.id, "prevnames", {name: user1.username, date: Math.round(Date.now() / 1000)})
        }
    }
}