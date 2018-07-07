//See README.md to find out whats in the .env file
require(`dotenv`).config();

const Discord = require(`discord.js`);
const client = new Discord.Client();
const commands = require(`./modules/commands`).commands;
const modules = require(`./modules/modules`);
let data = modules.data;

client.login(process.env.token);
process.env.token = `You cant touch this`;
client.on(`ready`, function () {
	client.guilds.array().forEach(function (guild) {
		if (guild.id !== data.server.id) guild.leave();
	});
	console.log(`Bot online`);
	data.rebootData.turnedOn = Date.now();
	let embed = new Discord.RichEmbed()
		.setTitle(`Restarted Bot`)
		.setDescription(`Restarted bot.\nCurrent Version: \`${data.version}\``)
		.setColor(0x17FF00)
		.setFooter(`restart took ${modules.getFormattedDate(Date.now() - data.rebootData.turnedOff, true)}`);
	if (data.rebootData.channelID) {
		let channel = client.guilds.get(data.server.id).channels.get(data.rebootData.channelID);
		if (data.rebootData.messageID && channel) {
			channel.fetchMessage(data.rebootData.messageID).then(function (m) {
				m.edit({embed});
				data.rebootData.messageID = false;
			}).catch(function () {
				channel.send({embed})
			});
		}
		else if (channel) {
			channel.send({embed});
		}
		else {
			client.fetchUser(process.env.ownerID).then(function (user) {
				user.send({embed});
			}).catch(console.error);
		}
	}
	setTimeout(modules.saveData, 5000);
});
client.on(`message`, function (message) {
	if (message.author.bot) return;
	if (message.channel.id === data.server.channels.verify) {
		message.delete();
		if (message.content.toLowerCase() === `i agree`) {
			message.author.send(modules.userAgreed(message));
		}
		else {
			message.channel.send(`<@${message.author.id}> Hey that's not the \`i agree\` expected in this channel!\nMuted for \`1\` minute.\n\nIf you don't plan on agreeing to the rules then you might as well leave.`).then(function (m) {
				message.member.addRole(message.guild.roles.find(`name`, `muted`));
				setTimeout(function () {
					m.delete();
					setTimeout(message.member.addRole, 55000, message.guild.roles.find(`name`, `muted`));
				}, 5000);
			});
		}
		return;
	}
	if (!modules.usersdata[message.author.id]) return;
	let prefix = modules.getPrefix(message);
	if (message.content.startsWith(prefix)) {
		let args = message.content.toLowerCase().split(` `);
		let cmd = args.shift().substring(prefix.length);
		if (commands.has(cmd)) {
			if (message.channel.type !== "text" && message.guild.id !== data.server.id && message.author.id !== process.env.ownerID) {
				let embed = new Discord.RichEmbed()
					.addField(`Invalid Channel`, `Hello user, I currently do not support commands outside my server.\nJoin my [server](${data.server.invite}) to get access to all my commands :D`)
					.setColor(0xce001f);
				message.author.send({embed});
				return;
			}
			let time = new Date();
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
					.setFooter(modules.getFooter(message, time), message.author.icon_url);
				message.channel.send({embed});
			}
		}
	}
});
client.on(`guildMemberAdd`, function (member) {
	if (member.guild.id !== data.server.id) return;
	member.addRole(member.guild.roles.find(`name`, `unverified`));
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
});