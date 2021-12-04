const Discord = require('discord.js');
const ms = require('ms');
const { helperRole, moderatorRole, administratorRole, ownerRole, logChannel, serverName, embedRed, embedGreen,
   noPermission, staffNoBanPermission, banYourself, banBot, timeReturn, reasonReturn, banMemberReturn, hasBeenBanned } = require('../config.json');

// MongoDB schema
const punishmentLogSchema = require('../schemas/punishment-log-schema')
const mongo = require('../mongo')
const warnSchema = require('../schemas/warn-schema')

module.exports = {
  name: "ban",
  async execute(client, message, args) {
      // Log Channel
      var LogChannel = message.guild.channels.cache.get(logChannel);

      // Check if sender has permission
      const role = message.member.roles.cache;

      if(role.has(moderatorRole) || role.has(administratorRole) || role.has(ownerRole)) {
    
      //Create a member args
      var member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
      if(!member) return message.reply(banMemberReturn)

      // Check if target is a staff
      const targetRole = member.roles.cache;

      // if the target is the sender the command must return
      if(member.id === message.author.id)
      return message.reply(banYourself);

      // if the target is the bot the command must return
      if(member.id === client.user.id)
      return message.reply(banBot);

      // if the target have staff role the command must return
      if(targetRole.has(helperRole)) return message.reply(staffNoBanPermission)
      if(targetRole.has(moderatorRole)) return message.reply(staffNoBanPermission)
      if(targetRole.has(administratorRole)) return message.reply(staffNoBanPermission)
      if(targetRole.has(ownerRole)) return message.reply(staffNoBanPermission)

      let user = `${member.user.username}`;

      // if the args time is empty the command must return
      let time = args[1];
      if(!time) {
        return message.reply(timeReturn);
        }

      // if the args reason is empty the command must return
      let reason = args.slice(2).join(" ")
      if(!reason) return message.reply(reasonReturn)

      // banLog Embed
      let banLog = new Discord.MessageEmbed()
      .setColor(embedRed)
      .setAuthor(`Ban | `+ user, member.user.displayAvatarURL())
      .addField("User", `<@${member.id}>`, true)
      .addField("Executer", `<@${message.author.id}>`, true)
      .addField("Length", time, true)
      .addField("Reason", reason, true)
      .setFooter(serverName, message.guild.iconURL())
      .setTimestamp();

      // unbanLog Embed
      let unbanLog = new Discord.MessageEmbed()
      .setColor(embedGreen)
      .setAuthor(`Unban | `+ user, member.user.displayAvatarURL())
      .addField("User", `<@${member.id}>`, true)
      .addField("Executer", `<@${client.id}>`, true)
      .addField("Reason", "Auto", true)
      .setFooter(serverName, message.guild.iconURL())
      .setTimestamp();

      // messageReply Embed
      let messageReply = new Discord.MessageEmbed()
      .setColor(embedGreen)
      .setTitle(hasBeenBanned.replace("%user%", user).replace("%reason%", reason))
      .setFooter(serverName, message.guild.iconURL())
      .setTimestamp();
      
      // MongoDB schema save
      const guildId = message.guild.id
      const userId = member.id
      const banned = {
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
              warnings: banned,
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
    //Ban Event
    member
    .ban({
    reason: reason,
    })
    // Embed Event
    LogChannel.send(banLog);
    message.channel.send(messageReply)
    // Unbanned Event   
    setTimeout( function () {
    message.guild.members.unban(member.id)
    LogChannel.send(unbanLog)
     }, ms(time));

     // No Permission Event
     }else {
        return message.channel.send(noPermission)
        }
    }
}
