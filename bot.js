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
  bot.user.setGame(config.game);
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
        message.react(config.delemoji);
        logger.info("got command !prefix");
      })
    }

    // sets the bot's game (activity)
    if(command === "game") {
      if(args[0]){
        config.game = args.join(" ");
        fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
        bot.user.setGame(config.game);
        message.channel.send("Set bot 'game' to " + config.game).then(function (message) {
          message.react(config.delemoji);
          logger.info("got command !game")
        })
      }
      else{
        message.channel.send("Give me a game to play!").then(function (message) {
          message.react(config.delemoji);
          logger.info("got command !game")
      })
    }
  }

    // change the emoji which deletes bot messages
    /*if(command === "delemoji") {
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
    }*/

    // repeats what the user said
    if(command === "say") {
      if(args[0]){
      // makes the bot say something and delete the message. As an example, it's open to anyone to use.
      // To get the "message" itself we join the `args` back into a string with spaces:
      const sayMessage = args.join(" ");
      // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
      message.delete().catch(O_o=>{});
      // And we get the bot to say the thing:
      message.channel.send(sayMessage);
      logger.info("got command !say");
    }else{
      message.channel.send("I've got nothing to say. 🤐").then(function (message) {
        message.react(config.delemoji);
        logger.info("got command !say");
      });
    }
}

    // change the time to wait before deleting bot message due to reaction
    if(command === "deltime"){
      if (!args[0]){
        message.channel.send("Enter time to wait before deleting bot message in ms. Example:\n!deltime 1000").then(function (message) {
          message.react(config.delemoji);
          logger.info("got command !deltime");
        });
      }else{
      let newdeltime = args[0];
      if (newdeltime < 0 || newdeltime > 10000){
        message.channel.send("Time to wait before deleting bot message should be > 0 and < 10000 (in ms)").then(function (message) {
          message.react(config.delemoji);
          logger.info("got command !deltime");
        });
      }else{
      config.deltime = newdeltime;
      fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
      message.channel.send("Time to wait before deleting bot message set to " + config.deltime + " ms.").then(function (message) {
        message.react(config.delemoji);
        logger.info("got command !deltime");
      });
    }
    }
}
    // checks if twitch user is streaming
    if(command === "online"){
      if(!args[0]){
        message.channel.send("Who?");
      }else{
      var answer;
      let channel = args[0];
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
          toSend = {
              "embed": {
                "title": channel + " is offline!",
                "description": "They're not streaming currently.",
                "url": "http://www.twitch.tv/" + channel,
                "color": 6570404,
                "footer": {
                  "icon_url": "https://cdn0.iconfinder.com/data/icons/social-network-7/50/16-128.png",
                  "text": "Twitch.tv"
                },
                "author": {
                  "name": "MarvinBot",
                  "url": "https://discordapp.com",
                  "icon_url": "https://raw.githubusercontent.com/hristiyanmarkov/MarvinBot/master/marvin/marvin.jpg"
                }
              }
            }
      }
      message.channel.send(toSend).then(function (message) {
        message.react(config.delemoji);
      })
      logger.info("got command !online");
  });
}
  };

  // gives a random object from the list provided
    if(message.content.startsWith(config.prefix + "random")) {
      if(!args[0]){
        message.channel.send("Nothing to randomize. 😬 ").then(function (message) {
          message.react(config.delemoji);
        });
      }else{
      var rand = args[Math.floor(Math.random() * args.length)];
      message.channel.send("Randomizing....\nResult is: " + rand).then(function (message) {
        message.react(config.delemoji);
      });
      logger.info("got command !random");
    }
}

  // sends a spam message to the user in private
    if(message.content.startsWith(config.prefix + "spam")) {
      message.author.send("Spam!").then(function (message) {
        message.react(config.delemoji);
      });
      logger.info("got command !spam");
    }

    // protected command
    // if(message.author.id !== config.ownerID) return;

    // answers with pong!
    if (message.content.startsWith(config.prefix + "ping")) {
      message.channel.send("Ping! :ping_pong: Pong!").then(function (message) {
        message.react(config.delemoji);
      });
      logger.info("got command !ping");
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
    message.react(config.delemoji);
    logger.info("got new guild member");
  });
});

//listen for new reaction
bot.on('messageReactionAdd', (reaction, user) => {
  // logger.info("got new reaction");
  // logger.info(reaction.emoji.identifier);
    if(reaction.emoji == config.delemoji && reaction.count > 1 && reaction.me){
  //    logger.info("got new castro");
  // wait a bit before deleting the message
      reaction.message.delete(config.deltime);
    }
});

bot.login(config.token);
