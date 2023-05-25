// WEB SERVER SETUP
// Web server is setup to keep the bot online 24/7.
const http = require('http');
const express = require('express');
const app = express();
var server = http.createServer(app);

app.get('/', (req, res) => {
  res.sendStatus(200);
});

const listener = server.listen(process.env.PORT, function() {
  console.log(`Listening on port ${listener.address().port}.`);
});

// INITIALIZATION
const {GatewayIntentBits, Client, ActivityType} = require("discord.js");
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]});

var guild;
let memberCount = 0;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  guild = client.guilds.cache.get(process.env.guild_id);

  setCustomPresence();
});

// HANDLING DURUM CHANNEL
client.on('messageCreate', message => {
  if(message.channelId == process.env.channel_id) {
    if(message.content != 'https://media.discordapp.net/attachments/867849563686830140/989606258380275722/image0-15.gif') {
      console.log('deleted message with content: ' + message.content)
      message.delete();
    }
  }
});

client.on('messageUpdate', (oldmsg, newmsg) => {
  if(newmsg.channel.id == process.env.channel_id) {
    newmsg.delete();
  }
});

// MANAGING GUILD LEAVES & JOINS
client.on('guildMemberAdd', member => {
  if(member.user.bot) return;
  memberCount += 1;
  setCustomPresence();
});

client.on('guildMemberRemove', member => {
  if(member.user.bot) return;
  memberCount -= 1;
  setCustomPresence();
});

// LOGGING IN AND FUNCTIONS
client.login(process.env.token);

function setCustomPresence() {
  const targetGuildId = process.env.guild_id;
  const targetGuild = client.guilds.cache.get(targetGuildId);

  if (targetGuild) {
    targetGuild.members.fetch().then((members) => {
      memberCount = members.filter((member) => !member.user.bot).size;
      client.user.setPresence({
        status: 'dnd',
        activities: [{
          name: `${memberCount} people.`,
          type: ActivityType.Watching
        }]
      });
    }).catch(console.error);
  } else {
    console.error(`Guild with ID ${targetGuildId} not found.`);
  }
}