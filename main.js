//See README.md to find out whats in the .env file
require(`dotenv`).config();

//Set up
const Discord = require(`discord.js`);
const client = new Discord.Client();
const commands = require(`./modules/commands`).commands;
const modules = require(`./modules/modules`);
let data = modules.data;
const console = modules.console;

client.login(process.env.token);
//Ta stop people from accessing my token
process.env.token = `You cant touch this`;


client.on(`ready`, function () {
	//Set the log channel
	let logChannel = client.channels.get(data.channels.logs);
	if(logChannel) modules.console.channel = logChannel;
	let time = new Date();
	console.log(`Bot online at ${`${time.getHours() > 12 ? time.getHours() - 12 : time.getHours() }:${time.getMinutes()} ${time.getHours() > 12 ? `PM` : `AM`}`}`);

	//Sets a new activity every 5 minutes
	modules.setMyActivity(client);

	//Leaves every guild that somehow got Meme-Bot in. (besides Meme-Archive)
	client.guilds.array().forEach(function (guild) {
		if (guild.id !== data.server.id) guild.leave();
	});

	/**Reboot process**/
	//sets time it rebooted to now.
	data.rebootData.turnedOn = Date.now();
	//creates an embed it will either send or edit into a message.
	let embed = new Discord.RichEmbed()
		.setTitle(`Restarted Bot`)
		.setDescription(`Restarted bot.\nCurrent Version: \`${data.version}\``)
		.setColor(0x17FF00)
		.setFooter(`restart took ${modules.getFormattedDate(Date.now() - data.rebootData.turnedOff, true)}`);
	//If there is a channel to send to.
	if (data.rebootData.channelID) {
		let channel = client.guilds.get(data.server.id).channels.get(data.rebootData.channelID);
		//If theres a message to edit into
		if (data.rebootData.messageID && channel) {
			channel.fetchMessage(data.rebootData.messageID).then(function (m) {
				m.edit({embed});
				data.rebootData.messageID = false;
			}).catch(function () {
				channel.send({embed})
			});
		}
		//Otherwise just send it to the channel.
		else if (channel) {
			channel.send({embed});
		}
		else {
			data.rebootData.channelID = false;
			process.env.owners.forEach(function (item) {
				client.fetchUser(item).then(function (user) {
					user.send({embed});
				}).catch(console.error);
			})
		}
	}
	//Otherwise send it to the owner of the bot.
	else {
		process.env.owners.forEach(function (item) {
			client.fetchUser(item).then(function (user) {
				user.send({embed});
			}).catch(console.error);
		})
	}

	//Save all data in 10 seconds. (to ensure that any delay in sending the message is saved)
	setTimeout(modules.saveData, 10000);
});
client.on(`message`, function (message) {
	//If its a bot, exit. (bots have no business w/ my bot)
	if (message.author.bot) return;
	let prefix = modules.getPrefix(message);

	//If i need a force reboot ASAP
	if (message.content.toLowerCase() === `${prefix}force reboot` && process.env.owners.includes(message.author.id)) {
		process.exit();
	}

	//If the message is in the verification channel
	if (message.channel.id === data.channels.verify) {
		message.delete();
		if (message.content.toLowerCase() === `i agree`) {
			//remove the unverified role from the user and send them a thank you
			modules.userAgreed(message);
			modules.saveData();
		}
		//Mute them.
		else {
			message.channel.send(`<@${message.author.id}> Hey that's not the \`i agree\` expected in this channel!\nMuted for \`1\` minute.\n\nIf you don't plan on agreeing to the rules then you might as well leave.`).then(function (m) {
				let role = message.guild.roles.find(`name`, `muted`);
				message.member.addRole(role);
				setTimeout(function () {
					m.delete();
					setTimeout(function () {
						message.member.removeRole(role);
					}, 30000);
				}, 30000);
			});
		}
		return;
	}

	//If user hasn't been verified.
	if (!modules.usersdata[message.author.id]) return;

	/**Commands**/
	let time = new Date();
	//if it starts with the prefix
	if (message.content.startsWith(prefix)) {
		message.channel.startTyping();
		let args = message.content.toLowerCase().split(` `);
		let cmd = args.shift().substring(prefix.length);
		if (commands.has(cmd)) {
			if (message.channel.type !== "text" && message.guild.id !== data.server.id && !process.env.owners.includes(message.author.id)) {
				let embed = new Discord.RichEmbed()
					.addField(`Invalid Channel`, `Hello user, I currently do not support commands outside my server.\nJoin my [server](${data.server.invite}) to get access to all my commands :D`)
					.setColor(0xce001f);
				message.author.send({embed});
				return;
			}

			let command = commands.get(cmd);
			if (!modules.canRunCommand(command, message, false)) return;
			console.log(`${message.author.tag} just used: ${cmd}`);
			command.run(message, args, time);
		}
		else {
			let spellChecked = modules.spellChecker(cmd, modules.allCommands);
			if (spellChecked.length) {
				let items = ``;
				spellChecked.forEach(function (item) {
					items += ` - ${prefix}${item[0]}\n`;
				});
				let embed = new Discord.RichEmbed()
					.setColor(modules.colors.orange)
					.setTitle(`Did you mean?`)
					.setDescription(`We couldn't find that command, yet found \`${spellChecked.length}\` items you could've meant.\n\`\`\`${items}\`\`\``)
				modules.setFooter(embed, message, time);
				message.channel.send({embed});
			}
		}
		message.channel.stopTyping();
	}
	else if (message.content === `<@${client.user.id}>`) {
		let embed = new Discord.RichEmbed()
			.setColor(modules.colors.purple)
			.setTitle(`Some basic info`)
			.setDescription(`The prefix you can use here is \`${prefix}\`.\nRun \`${prefix}help\` for some commands`);
		modules.setFooter(embed, message, time);
		message.channel.send({embed});
	}
});
client.on(`guildMemberAdd`, function (member) {
	//if it's not my guild.
	if (member.guild.id !== data.server.id) {
		member.guild.leave();
		return;
	}

	//add the unverified role
	member.addRole(member.guild.roles.find(`name`, `unverified`));

	//welcome message.
	let embed = new Discord.RichEmbed()
		.setColor(0x00FF00)
		.setTitle(`Welcome to Meme-Archive`)
		.setDescription(`Hello <@${member.id}>! Im ${client.author.username}.\nIm a custom made bot designed to help with the server management of Meme-Archive!\n\nBefore we get started at looking at memes :wink:\nI need permission to store *your* [User's EndData](https://discordapp.com/developers/docs/resources/user)!`)
		.addField(`Wait wut?`, `What is your [User's EndData](https://discordapp.com/developers/docs/resources/user)? Well glad you asked! If you didn't bother clicking the "[User's EndData](https://discordapp.com/developers/docs/resources/user)" you probably don't know what im asking to store.\n\n**Your User's EndData** is your information about your discord account.\nFor example:\n\`\`\`\nUsername (${member.user.username}\nTag (${member.user.tag})\nID (${member.user.id}\nIcon (Your icon)\`\`\`\nNow almost every bot does this, it's very simple to attain.\nBut according to discord's ToS I need permission first :D\n\nSo in the `)
	message.author.send({embed})
});
client.on(`guildMemberRemove`, function (member) {
	modules.removeUsersEndData(member.user);
});

process.on(`exit`, function () {
	modules.data.rebootData.restartMsg.messageID = false;
	modules.data.rebootData.turnedOff = Date.now();
	modules.saveData();
});