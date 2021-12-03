const Discord = require('discord.js');
const ms = require('ms');
const { helperRole, moderatorRole, administratorRole, ownerRole, logChannel, serverName,
  noPermission, staffNoMutePermission, muteYourself, muteBot, timeReturn, reasonReturn,
   muteMemberReturn, targetHasMuted, muteRoleNotFind, memberRole, muteRole, embedGreen, embedRed, hasBeenMuted } = require('../config.json');

// MongoDB schema
const punishmentLogSchema = require('../schemas/punishment-log-schema')
const mongo = require('../mongo')
const warnSchema = require('../schemas/warn-schema')

module.exports = {
    name: "mute",
    async execute(client, message, args) {
      // Log Channel
      var LogChannel = message.guild.channels.cache.get(logChannel);
      
      // Check if sender has permission
      const role = message.member.roles.cache;
      const guildrole = message.guild.roles.cache;

      if(role.has(moderatorRole) || role.has(administratorRole) || role.has(ownerRole)) {

      //Create a member args
      var member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
      if(!member) return message.reply(muteMemberReturn)
        
      // Check if target is a staff
      const targetRole = member.roles.cache;

      // if the target is the sender the command must return
      if (member.id === message.author.id)
      return message.reply(muteYourself);

      // if the target is the bot the command must return
      if (member.id === client.user.id)
      return message.reply(muteBot);
        
      // if the target have staff role the command must return
      if(targetRole.has(helperRole)) return message.reply(staffNoMutePermission)
      if(targetRole.has(moderatorRole)) return message.reply(staffNoMutePermission)
      if(targetRole.has(administratorRole)) return message.reply(staffNoMutePermission)
      if(targetRole.has(ownerRole)) return message.reply(staffNoMutePermission)

      // Check if memberRole and the muteRole is created on the guild
      let MemberRole = guildrole.find(r => r.id === memberRole);
      let MuteRole = guildrole.find(r => r.id === muteRole);
      let user = `${member.user.username}`;
      
      /* 
      Check If muteRole is not created if not the command must return,
      Check if the target has mute if he has the command must return.
      */
      if (!MuteRole) return message.reply(muteRoleNotFind)
      if(targetRole.has(MuteRole)) return message.reply(targetHasMuted)
            
      // if the args time is empty the command must return
      let time = args[1];
      if (!time) {
        return message.reply(timeReturn);
        }

      // if the args reason is empty the command must return
      let reason = args.slice(2).join(" ")
      if(!reason) return message.reply(reasonReturn)
        
      // muteLog Embed
      let muteLog = new Discord.MessageEmbed()
      .setColor(embedRed)
      .setAuthor(`Mute | `+ user, member.user.displayAvatarURL())
      .addField("User", `<@${member.id}>`, true)
      .addField("Executer", `<@${message.author.id}>`, true)
      .addField("Length", time, true)
      .addField("Reason", reason, true)
      .setFooter(serverName, message.guild.iconURL())
      .setTimestamp();

      // unmuteLog Embed
      let unmuteLog = new Discord.MessageEmbed()
      .setColor(embedGreen)
      .setAuthor(`Unmute | `+ user, member.user.displayAvatarURL())
      .addField("User", `<@${member.id}>`, true)
      .addField("Executer", `<@${client.id}>`, true)
      .addField("Reason", "Auto", true)
      .setFooter(serverName, message.guild.iconURL())
      .setTimestamp();
      
      // messageReply Embed
      let messageReply = new Discord.MessageEmbed()
      .setColor(embedGreen)
      .setTitle(hasBeenMuted.replace("%user%", user).replace("%reason%", reason))
      .setFooter(serverName, message.guild.iconURL())
      .setTimestamp();

      // MongoDB schema save
      const guildId = message.guild.id
      const userId = member.id
      const muted = {
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
              warnings: muted,
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

    // Remove/Add roles Event
     member.roles.remove(MemberRole.id)
     member.roles.add(MuteRole.id);

    // Embed Event
     LogChannel.send(muteLog);
     message.channel.send(messageReply)
    
     // Unmute Event 
     setTimeout( function () {
        member.roles.add(MemberRole.id)
        member.roles.remove(MuteRole.id);
        LogChannel.send(unmuteLog)
        }, ms(time));
        
        // No Permission Event
        }else {
          return message.channel.send(noPermission)
        }
    }
}