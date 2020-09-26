const fs = require("fs");
const puppeteer = require("puppeteer");
const Discord = require('discord.js');
const { Attachment , MessageEmbed } = require('discord.js');
const request = require ('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {RedditSimple} = require('reddit-simple');

const commands = {

	roleG1 : null,
	roleG2 : null,
	roleGA : null,
	roleGB : null,
	roleGC : null,

	planning: (message, channel, author) => {
		if(channel.id !== '752861944599412758') return;

		(async () => {
			let browser = await puppeteer.launch();
			let page = await browser.newPage();

			await page.goto("https://hplanning.univ-lehavre.fr/invite");
			await page.waitForNavigation();
			for (let i = 0; i < 10; i++) {
				await page.keyboard.press("Tab");
			}
			await page.keyboard.press("Enter");
			await page.type(".CelluleBoutonNomEditJQ", "ST-L3 Informatique");
			await page.keyboard.press("Enter");
			await page.waitFor(1000);
			var today = new Date();
			var now = today.getFullYear() + "" + ("0" + (today.getMonth() + 1)).slice(-2) + "" + ("0" + today.getDate()).slice(-2);
			await page.screenshot({path: 'donnees/planning/planning-'+now+'.png'});
			await browser.close();
			message.channel.send("Emploi du temps cette semaine", {files: ['donnees/planning/planning-'+now+'.png']});
		})();
	},

	classement: (message, channel, author) => {
		if(channel.id !== '753162903451992105') return; // Only allow command in quizz channel

		scoreFile = fs.readFileSync('donnees/quiz/scoresQuiz.json');
		score = JSON.parse(scoreFile);
		score.sort((a, b) => {
			return b.score - a.score;
		}); // Sort from best to worst

		let embedDesc = "Voici le classement : \r\n"; // Prepare embed description
		for (var i = 0; i < score.length; i++){
			embedDesc += "" + (i+1) + " place : " + score[i].pseudo.split("#")[0] + " avec " + score[i].score + " point" + ((score[i].score < 2)?"":"s") + "\r\n";
		}

		let embed = new Discord.MessageEmbed(); // Prepare and send embed
		embed.setTitle("Classement");
		embed.setDescription(embedDesc);
		message.channel.send(embed);
	},
	resetclassement: (message, channel, author, bot, admins) => {
		if(admins.includes(author.id)) {
			let newScore = '[]';
			fs.writeFileSync('donnees/quiz/scoresQuiz.json', newScore);
		}
	},
	questionInProgress: false,
	question: (message, channel, author) => {
		if(channel.id !== '753162903451992105' || commands.questionInProgress) return;

		let jsonFile       = fs.readFileSync('donnees/quiz/'+(Math.floor(Math.random() * 27) + 1)+'-openquizzdb.json');
		let levels         = Object.values((JSON.parse(jsonFile)).quizz.fr);
		let level          = levels[(Math.floor(Math.random() * 3))]
		let questionNumber = Math.floor(Math.random() * 10);

		let embed = new Discord.MessageEmbed();
		let embedDesc = "Voici les propositions : \r\n\r\n" +
			level[questionNumber].propositions[0] + "\r\n" +
			level[questionNumber].propositions[1] + "\r\n" +
			level[questionNumber].propositions[2] + "\r\n" +
			level[questionNumber].propositions[3] + "\r\n\r\n" +
			"Vous avez 25 secondes pour répondre !";
		embed.setTitle("Question : " + level[questionNumber].question);
		embed.setDescription(embedDesc);

		let answer = level[questionNumber].réponse.toLowerCase();
		commands[answer] = answerfunction.bind({ ans: answer });

		channel.send(embed).then(() => { // Sends teh question then...
			commands.questionInProgress = true;
			message.delete();
			setTimeout(() => {
				if(commands.hasOwnProperty(answer) && typeof commands[answer] === 'function') {
					commands.answerFound = true; // Sets the answerFound var to true to stop the question
					delete commands[answer];
					let embed = new Discord.MessageEmbed();
					embed.setTitle("Réponse")
					embed.setDescription("Personne n'a trouvé la réponse, c'était : " + answer); // Prepare an ambed to display the answer
					message.channel.send(embed); // Sends the answer
					commands.questionInProgress = false;
				}
			}, 25000);
		});

	},

	menu: (message, channel, author) => {
		if(channel.id !== '752862179618717716') return; // Allow only in the food channel

		request({uri: 'https://www.crous-normandie.fr/restaurant/restaurant-porte-oceane/'}, function(err, response, body){
			if(err && response.statusCode !== 200) {
				console.log('Request error. (Menu)');
				channel.send("Erreur lors de la requête");
			}

			const dom = new JSDOM(body);

			let strEntrees = 'Les entrées';
			let strPlats   = 'Les plats';
			let strAccs    = 'Les accompagnements';
			let strDess    = 'Les desserts';

			let todayDate = dom.window.document.getElementById('menu-repas').childNodes[1].childNodes[1].childNodes[1].textContent + " : \r\n"; // Text "Menu du XX YMONTH ZYEAR"
			let todayMenu = dom.window.document.getElementById('menu-repas').childNodes[1].childNodes[1].childNodes[3].childNodes[3].childNodes[1].innerHTML + "\r\n\r\n";

			let nextDate = dom.window.document.getElementById('menu-repas').childNodes[1].childNodes[3].childNodes[1].textContent + " : \r\n";
			let nextMenu= dom.window.document.getElementById('menu-repas').childNodes[1].childNodes[3].childNodes[3].childNodes[3].childNodes[1].innerHTML;

			let indEntrees = todayMenu.indexOf(strEntrees);
			let indPlats   = todayMenu.indexOf(strPlats);
			let indAccs    = todayMenu.indexOf(strAccs);
			let indDess    = todayMenu.indexOf(strDess);
			let nIndEntrees = nextMenu.indexOf(strEntrees);
			let nIndPlats   = nextMenu.indexOf(strPlats);
			let nIndAccs    = nextMenu.indexOf(strAccs);
			let nIndDess    = nextMenu.indexOf(strDess);

			let todEntrees = todayMenu.substr(indEntrees + strEntrees.length, indPlats - (indEntrees + strEntrees.length));
			let todPlats = todayMenu.substr(indPlats + strPlats.length, indAccs - (indPlats + strPlats.length));
			let todAccs = todayMenu.substr(indAccs + strAccs.length, indDess - (indAccs + strAccs.length));
			let todDess = todayMenu.substr(indDess + strDess.length);

			let nextEntrees = nextMenu.substr(nIndEntrees + strEntrees.length, nIndPlats - (nIndEntrees + strEntrees.length));
			let nextPlats = nextMenu.substr(nIndPlats + strPlats.length, nIndAccs - (nIndPlats + strPlats.length));
			let nextAccs = nextMenu.substr(nIndAccs + strAccs.length, nIndDess - (nIndAccs + strAccs.length));
			let nextDess = nextMenu.substr(nIndDess + strDess.length);

			var embed = new Discord.MessageEmbed();
			embed.setTitle("Menus d'aujourd'hui et demain");

			embed.addField('Date', removeHtml(todayDate));
			embed.addField('Entrees', removeHtml(todEntrees));
			embed.addField('Plats', removeHtml(todPlats));
			embed.addField('Accompagnements', removeHtml(todAccs));
			embed.addField('Desserts', removeHtml(todDess));
			embed.addField('____________________________________________', '_');
			embed.addField('Date', removeHtml(nextDate));
			embed.addField('Entrees (demain)', removeHtml(nextEntrees));
			embed.addField('Plats (demain)', removeHtml(nextPlats));
			embed.addField('Accompagnements (demain)', removeHtml(nextAccs));
			embed.addField('Desserts (demain)', removeHtml(nextDess));
			//emebd.setDescription(str);
			message.channel.send(embed);
		});
	},

	quinta: (message, channel, author) => {
		message.reply('Salut Quentin');
	},

	setavatar: (message, channel, author, bot, admins) => {
		if(channel.type === 'dm' && admins.includes(author.id)) {
			let url = message.content.substr('setavatar '.length);
			bot.user.setAvatar(url).then(() => {
				message.reply('Avatar changed');
			});
		}
	},
	setstatus: (message, channel, author, bot, admins) => {
		if(channel.type === 'dm' && admins.includes(author.id)) {
			let status = message.content.substr('setstatus '.length);
			bot.user.setStatus(status).then(() => {
				message.reply('Status changed');
			});
		}
	},
	setactivity: (message, channel, author, bot, admins) => {
		if(channel.type === 'dm' && admins.includes(author.id)) {
			let activity = message.content.substr('setactivity '.length);
			bot.user.setActivity(activity, { type: 'WATCHING' }).then(presence => {
				message.reply('Activity changed!\nNew activity : ' + presence.activities[0].name);
			});
		}
	},
	purge: (message, channel, author, bot, admins, args) => {
		if(channel.type === 'text' && admins.includes(author.id)) {
			let messageNumber = parseInt(args);
			if(isNaN(messageNumber)) return;
			if(messageNumber > 99) {channel.bulkDelete(99); author.send('99 messages supprimés, pour en supprimer plus, effectuer plusieurs fois la commande avec 99 en argument')}
			else {channel.bulkDelete(messageNumber);}
		}
	},

	startmotd: (message, channel, author, bot, admins, args) => {
		if(channel.type === 'text' && admins.includes(author.id)) {
			sendmeme(bot);
			setInterval(() => {
				sendmeme(bot);
			}, 86400000); // 24 Hour interval.
		}
	},

	rolesmessage: (message, channel, author, bot, admins) => {
		if(!admins.includes(author.id)) return;
		bot.guilds.fetch('752859692413354054').then(guild => {
			commands.roleG1 = guild.roles.resolve('753876196701241344');
			commands.roleG2 = guild.roles.resolve('753876262367264850');
			commands.roleGA = guild.roles.resolve('752868566109519882');
			commands.roleGB = guild.roles.resolve('752868644459118602');
			commands.roleGC = guild.roles.resolve('752868679611318343');

			let chan = guild.channels.resolve('753876978548998234');
			chan.bulkDelete(10);
			chan.send('Interagissez avec ce message pour obtenir des roles :\n\t:red_circle: Groupe 1\n\t:blue_circle: Groupe 2\n\t:green_circle: Groupe A\n\t:purple_circle: Groupe B\n\t:orange_circle: Groupe C').then(message => {
				message.react('🔴').then(() => {
					message.react('🔵').then(() => {
						message.react('🟢').then(() => {
							message.react('🟣').then(() => {
								message.react('🟠').then(() => {
									var filter = (reaction) => reaction.emoji.name === '🔴' || reaction.emoji.name === '🔵' || reaction.emoji.name === '🟢' || reaction.emoji.name === '🟣' || reaction.emoji.name === '🟠';
									var collector = message.createReactionCollector(filter);
									collector.on('collect', (r, u) => handleRolesReaction(r, u, bot));
								});
							});
						});
					});
				});
			});
		});
	}

};

function handleRolesReaction(r, u, bot) {
	if(u.bot) return;
	bot.guilds.fetch('752859692413354054').then(guild => {
		let member = guild.members.resolve(u.id);
		switch (r.emoji.identifier) {
			case '%F0%9F%94%B4': // Groupe 1 :red_circle:
				member.roles.remove([commands.roleG1, commands.roleG2]).then(() => {
					member.roles.add(commands.roleG1);
				});
				break;
			case '%F0%9F%94%B5': // Groupe 2
				member.roles.remove([commands.roleG1, commands.roleG2]).then(() => {
					member.roles.add(commands.roleG2);
				});
				break;
			case '%F0%9F%9F%A2': // Groupe A
				member.roles.remove([commands.roleGA, commands.roleGB, commands.roleGC]).then(() => {
					member.roles.add(commands.roleGA);
				});
				break;
	 		case '%F0%9F%9F%A3': // Groupe B
				member.roles.remove([commands.roleGA, commands.roleGB, commands.roleGC]).then(() => {
					member.roles.add(commands.roleGB);
				});
				break;
			case '%F0%9F%9F%A0': // Groupe C
				member.roles.remove([commands.roleGA, commands.roleGB, commands.roleGC]).then(() => {
					member.roles.add(commands.roleGC);
				});
				break;
			default:
				return;
		}
		r.remove()
		r.message.react(r.emoji);
	});
}

function sendmeme(bot) {
	bot.guilds.fetch('752859692413354054').then(guild => {
		RedditSimple.TopPost('memes').then(meme => {
			let embed = new Discord.MessageEmbed();
			embed.setTitle("Meme of the day");
			embed.setImage(meme[0].data.url);
			embed.setColor("RED");
			guild.channels.resolve('752874897792958555').send(embed);
		});
	});
}

const answerfunction = function(message, channel, author, bot) {
	delete commands[this.ans];
	let embed = new Discord.MessageEmbed();
	embed.setTitle("Réponse");
	embed.setDescription("Bravo " + author.username + ", tu as trouvé la réponse, c'était : " + this.ans);
	message.channel.send(embed);

	commands.questionInProgress = false;

	scoreFile = fs.readFileSync('donnees/quiz/scoresQuiz.json');
	score = JSON.parse(scoreFile);

	let foundUser = false;
	for (let i = 0; i < score.length; i++){
		if (score[i].id == message.author.id){
			foundUser = true;
			score[i] = JSON.parse('{"id" : "'+message.author.id+'", "pseudo" : "'+message.author.username + '#' + message.author.discriminator+'", "score" : '+ (score[i].score+2) + '}');
		}
	}
	if(!foundUser) {
		score.push(JSON.parse('{"id" : "'+message.author.id+'", "pseudo" : "'+message.author.username + '#' + message.author.discriminator+'", "score" : 2}'));
	}
	let donnees = JSON.stringify(score);
	fs.writeFileSync('donnees/quiz/scoresQuiz.json', donnees);
}

function removeHtml(str) {
	str = str.split("<div>").join("");
	str = str.split("</div>").join("");
	str = str.split("<span class=\"name\">").join("\t");
	str = str.split("</span>").join("");
	str = str.split("<ul class=\"liste-plats\">").join("");
	str = str.split("</ul>").join("");
	str = str.split("</li><li>").join("\r\n\t\t");
	str = str.split("<li>").join("\r\n\t\t");
	str = str.split("</li>").join("\r\n");
	return str;
}

module.exports = commands;
