//See README.md to find out whats in the .env file
require(`dotenv`).config();

const Discord = require(`discord.js`);
const client = new Discord.Client();
const commands = require(`./modules/commands`).commands;
const modules = require(`./modules/modules`);
let data = modules.data;
let prefix = process.env.prefix || `.`;

client.login(process.env.token);
client.on(`ready`, function () {
	console.log(`Bot online`);
	data.rebootData.turnedOn = Date.now();
	let embed = new Discord.RichEmbed()
		.setTitle(`Restarted Bot`)
		.setDescription(`Restarted bot.\nCurrent Version: \`${data.version}\``)
		.setColor(0x17FF00)
		.setFooter(`restart took ${modules.getFormattedDate(Date.now() - data.rebootData.turnedOff, true)}`);
	if(data.rebootData.channelID) {
		let channel = client.guilds.get(data.server.id).channels.get(data.rebootData.channelID);
		if (data.rebootData.messageID && channel) {
				channel.fetchMessage(data.rebootData.messageID).then(function (m) {
					m.edit({embed});
					data.rebootData.messageID = false;
			}).catch(function () {
				channel.send({embed})
			});
		}
		else if(channel){
			channel.send({embed});
		}
		else{
			client.fetchUser(process.env.ownerID).then(function (user) {
				user.send({embed});
			}).catch(console.error);
		}
	}
	setTimeout(modules.saveData,5000);
});
client.on(`message`, function (message) {
	if (message.author.bot) return;
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
			command.requirements.forEach(function (req) {
				switch (req.toLowerCase()) {
					case `owner`:
						if (message.author.id !== process.env.ownerID) {
							modules.INVALID_PERMS(message, `Only the owner of the bot can use this command.`);
							return;
						}
						break;
				}
			});
			console.log(`${message.author.tag} just used: ${cmd}`);
			command.run(message, args, time);
		}
	}
});
process.on(`exit`, function () {
	modules.data.rebootData.restartMsg.messageID = false;
	modules.data.rebootData.turnedOff = Date.now();
});