const Discord = require('discord.js');
const config = require('./config.json')
const fs = require("fs")
var logger = require('winston');
var request = require('request');

const bot = new Discord.Client({
  token: config.token,
  autorun: true,
  name: "MarvinBot"
});

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'silly';

// Initialize Discord Bot
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

// set bot's game
bot.on('ready', () => {
  bot.user.setGame('Half Life 3');
});

// listens for messages
bot.on('message', (message) => {
    // if message doesn't start with the prefix or is sent from the bot itself
    // the bot will not do anything
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    // separates the command and arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // !prefix
    // change the prefix
    if(command === "prefix") {
      let newPrefix = args[0];
      // change the configuration in memory
      config.prefix = newPrefix;
      // Now we have to save the file.
      fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
      message.reply("Prefix changed to **" + config.prefix + "**").then(function (message) {
        message.react(config.delemojiid);
      })
    }

    // change the emoji which deletes bot messages
    if(command === "delemoji") {
      // newdelemoji is the EMOJI, found through its NAME
      const newdelemoji = bot.emojis.find("name", args[0]);
      // config.delemojistuff is the NAME and ID of the EMOJI
      config.delemojistuff = newdelemoji.toString();
      config.delemojiid = newdelemoji.id
      // Now we have to save the file.
      fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
      message.reply("New delemoji reaction changed to **" + config.delemojistuff + "**").then(function (message) {
        message.react(config.delemojiid);
      })
      message.reply("New delemoji reaction changed to **" + config.delemojiid + "**").then(function (message) {
        message.react(config.delemojiid);
      })
    }

    // repeats what the user said
    if(command === "say") {
      // makes the bot say something and delete the message. As an example, it's open to anyone to use.
      // To get the "message" itself we join the `args` back into a string with spaces:
      const sayMessage = args.join(" ");
      // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
      message.delete().catch(O_o=>{});
      // And we get the bot to say the thing:
      message.channel.send(sayMessage);
    }

    // checks if twitch user is streaming
    if(command === "online"){
      var answer;
      let channel = args[0]
      request({
          headers: {
            'Client-ID': config.twitch_token
          },
          uri: 'https://api.twitch.tv/kraken/streams/' + channel,
          method: 'GET'
        }, function (err, res, body) {
      answer = JSON.parse(body);
      var isStreaming = answer.stream != null;
      var toSend;
      if(isStreaming){
        toSend = {
            "embed": {
              "title": answer.stream.channel.display_name + " is streaming " + answer.stream.game.toUpperCase() + "!",
              "description": answer.stream.channel.status,
              "url": answer.stream.channel.url,
              "color": 6570404,
              "footer": {
                "icon_url": "https://cdn0.iconfinder.com/data/icons/social-network-7/50/16-128.png",
                "text": "Twitch.tv | " + Date(answer.stream.created_at)
              },
              "thumbnail": {
                "url": answer.stream.channel.logo
              },
              "image": {
                "url": answer.stream.preview.large
              },
              "video":{
                "url": answer.stream.channel.url
              },
              "author": {
                "name": "MarvinBot",
                "url": "https://discordapp.com",
                "icon_url": "https://raw.githubusercontent.com/hristiyanmarkov/MarvinBot/master/marvin/marvin.jpg"
              },
              "fields": [
                    {
                      "name": "Game",
                      "value": answer.stream.game,
                      "inline": true
                    },
                    {
                      "name": "Link",
                      "value": "[**Watch here**](" + answer.stream.channel.url + ")",
                      "inline": true
                    },
                    {
                      "name": "Viewers",
                      "value": answer.stream.viewers,
                      "inline": true
                    },
                    {
                      "name": "Followers",
                      "value": answer.stream.channel.followers,
                      "inline": true
                    }
                  ]
            }
          }
      }
      else{
          toSend = 'сори, ' + channel + ' е офлайн';
      }
      message.channel.send(toSend).then(function (message) {
        message.react(config.delemojiid);
      })
      logger.info("got command !online");
  });
  };

  // sends a spam message to the user in private
    if(message.content.startsWith(config.prefix + "spam")) {
      message.author.send("Spam!");
      logger.info("got command !spam");
    }

    // protected command
    // if(message.author.id !== config.ownerID) return;

    // answers with pong!
    if (message.content.startsWith(config.prefix + "ping")) {
      message.channel.send("pong!").then(function (message) {
        message.react(config.delemojiid);
      });
      logger.info("got command !ping");
    }

    //asnwers with bar!
    if (message.content.startsWith(config.prefix + "foo")) {
      message.channel.send("bar!").then(function (message) {
        message.react(config.delemojiid);
      });
      logger.info("got command !foo");
    }
});

// listens for new members
bot.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'general');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send('Welcome to the server, ' + member).then(function (message) {
    message.react(config.delemojiid);
  });
});

//listen for new reaction
bot.on('messageReactionAdd', (reaction, user) => {
  // logger.info("got new reaction");
  // logger.info(reaction.emoji.identifier);
    if(reaction.emoji.id === config.delemojiid && reaction.count > 1 && reaction.me){
  //    logger.info("got new castro");
  // wait for 1 second before deleting the message
      reaction.message.delete(1000);
    }

});

bot.login(config.token);
