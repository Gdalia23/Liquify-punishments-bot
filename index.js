const Discord = require('discord.js');
const { status, token, prefix } = require('./config.json');
const fs = require('fs');
const client = new Discord.Client();

// when its ready log it
client.on('ready', () =>{
    console.log('This bot is online!');

    client.user.setPresence({
      activity: {
        name: status,
        type: "LISTENING"
      }
    })
  })

client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

// Discord Dynamic API Events Collection
const events = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith('.js'));
for (const file of events) {
    const event = require(`${__dirname}/events/${file}`);
    const name = file.split('.')[0];
    client.on(name, event.bind(null, client));
}
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith('.js'));


for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
client.on('message', message =>{
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if(!client.commands.has(command)) return;
    try{
        client.commands.get(command).execute(client, message, args);
    }catch(error){
        console.error(error);
        message.reply('There was an issue executing that command!');
    }
})

client.login(token);