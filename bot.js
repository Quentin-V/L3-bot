const Discord = require('discord.js');
const { Client, Attachment , MessageEmbed} = require('discord.js');
const bot = new Discord.Client();

const fs = require("fs");
const reload = require('require-reload')(require);

var credentials = require('./credentials.js');
var commands = require('./commands.js');

var admins = ['184331142286147584', '411946899147325442', '268753117082943488'];

bot.on('ready', () => {
	console.log('Connecté');
})

bot.on('message', message => {
	if(message.author.bot) return; // Ignore bots

	let cmd, fullCmd;
	let args = null;
	if(message.content.indexOf(' ') !== -1) {
		fullCmd = message.content.toLowerCase();
		cmd = message.content.substr(0, message.content.indexOf(' ')).toLowerCase();
		args = message.content.substr(message.content.indexOf(' ')+1);
	}else {
		cmd = message.content.toLowerCase();
	}
	let channel = message.channel;
	let author  = message.author;

	if(channel.type === 'dm' && !admins.includes(author.id)) {
		bot.guilds.fetch('752859692413354054').then(guild => {
			guild.channels.resolve('752993332174520411').send('**' + author.username + '**' + '(' + author.id + ')' + ' : *' + message.content + '*');
		});
	}
	if(commands.hasOwnProperty(cmd)) {
		commands[cmd](message, channel, author, bot, admins, args);
	}
	if(commands.hasOwnProperty(fullCmd)) {
		commands[fullCmd](message, channel, author, bot, admins, args);
	}
	if(message.channel.type === 'dm' && admins.includes(author.id) && cmd === 'reload') {
		commands = reload('./commands.js');
		message.reply('Commands reloaded!');
	}
});

bot.login(credentials.token);
