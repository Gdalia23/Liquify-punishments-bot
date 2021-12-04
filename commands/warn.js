const Discord = require('discord.js');
const { helperRole, moderatorRole, administratorRole, ownerRole, logChannel, serverName,
  noPermission, staffNoWarnPermission, warnYourself, warnBot, reasonReturn, embedYellow, embedGreen, hasBeenWarned,
   warnMemberReturn } = require('../config.json');

// MongoDB schema
const punishmentLogSchema = require('../schemas/punishment-log-schema')
const mongo = require('../mongo')
const warnSchema = require('../schemas/warn-schema')

module.exports = {
    name: "warn",
    async execute(client, message, args) {
      // Log Channel
      var LogChannel = message.guild.channels.cache.get(logChannel);
      
      // Check if sender has permission
      const role = message.member.roles.cache;

      if(role.has(moderatorRole) || role.has(administratorRole) || role.has(ownerRole)) {

      //Create a member args
      var member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
      if(!member) return message.reply(warnMemberReturn)
        
      // Check if target is a staff
      const targetRole = member.roles.cache;

      // if the target is the sender the command must return
      if(member.id === message.author.id)
      return message.reply(warnYourself);

      // if the target is the bot the command must return
      if(member.id === client.user.id)
      return message.reply(warnBot);
        
      // if the target have staff role the command must return
      if(targetRole.has(helperRole)) return message.reply(staffNoWarnPermission)
      if(targetRole.has(moderatorRole)) return message.reply(staffNoWarnPermission)
      if(targetRole.has(administratorRole)) return message.reply(staffNoWarnPermission)
      if(targetRole.has(ownerRole)) return message.reply(staffNoWarnPermission)

      let user = `${member.user.username}`;

      // if the args reason is empty the command must return
      let reason = args.slice(1).join(" ")
      if(!reason) return message.reply(reasonReturn)

      // warnLog Embed
      let warnLog = new Discord.MessageEmbed()
      .setColor(embedYellow)
      .setAuthor(`Warn | `+ user, member.user.displayAvatarURL())
      .addField("User", `<@${member.id}>`, true)
      .addField("Executer", `<@${message.author.id}>`, true)
      .addField("Reason", reason, true)
      .setFooter(serverName, message.guild.iconURL())
      .setTimestamp();
        
      // messageReply Embed
      let messageReply = new Discord.MessageEmbed()
      .setColor(embedGreen)
      .setTitle(hasBeenWarned.replace("%user%", user).replace("%reason%", reason))
      .setFooter(serverName, message.guild.iconURL())
      .setTimestamp();

      // MongoDB schema save
      const guildId = message.guild.id
      const userId = member.id
      const warned = {
      author: message.member.user.tag,
      timestamp: new Date().getTime(),
      reason,
    }
      await mongo().then(async (mongoose) => {
      try {
        await warnSchema.findOneAndUpdate(
          {
            guildId,
            userId,
          },
          {
            guildId,
            userId,
            $push: {
              warnings: warned,
            },
          },
          {
            upsert: true,
          }
        )

        await new punishmentLogSchema({
          guildId,
          userId,
          command: message.content,
        }).save()
      } finally {
        mongoose.connection.close()
      }
    })

    // Embed Event
    LogChannel.send(warnLog);
    message.channel.send(messageReply)

     // No Permission Event
    }else {
      return message.channel.send(noPermission)
        }
    }
}
