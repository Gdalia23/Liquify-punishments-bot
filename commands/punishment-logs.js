const Discord = require('discord.js');
const { helperRole, moderatorRole, administratorRole, ownerRole, serverName, noPermission, punishmentsTarget, embedYellow } = require('../config.json');

// MongoDB schema
const punishmentLogSchema = require('../schemas/punishment-log-schema')
const mongo = require('../mongo')

module.exports = {
    name: "punishmentlogs",
    async execute(client, message, args) {
      // Check if sender has permission
      const role = message.member.roles.cache;

      if(role.has(helperRole) || role.has(moderatorRole) || role.has(administratorRole) || role.has(ownerRole)) {

      //Create a member args
      const target = message.mentions.users.first()
      const member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
      if (!target) {
        message.reply(punishmentsTarget)
        return
      }

      const { guild } = message
      const { id } = target

      // Connect to MongoDB
      await mongo().then(async (mongoose) => {
        try {
          const results = await punishmentLogSchema.find({
            guildId: guild.id,
            userId: id,
          })
    
          let reply = ''

      for (const result of results) {
        reply += `${result.command} was ran at ${new Date(
          result.createdAt
        ).toLocaleTimeString()}\n\n`
      }

      // punishmentsLogs Embed
      let punishmentsLogs = new Discord.MessageEmbed()
      .setColor(embedYellow)
      .setAuthor(`${member.user.username}`+ ` Previous punishments:`)
      .setDescription(reply)
      .setFooter(serverName + " - punishmentlogs", message.guild.iconURL())
      .setTimestamp();
    
      message.channel.send(punishmentsLogs)
      } finally {
      mongoose.connection.close()
        }
      })

      // No Permission Event
      }else {
        return message.channel.send(noPermission)
    }
      },
    }