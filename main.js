require(`dotenv`).config();
const Discord = require(`discord.js`);
const client = new Discord.Client();
const fileSystem = require(`fs`);
const commands = require(`./modules/commands`).commands;
let prefix = process.env.prefix || `.`;

client.login(process.env.token);
client.on(`ready`,  function () {
	console.log(`Bot online`);
});
client.on(`message`,function (message) {
	if (message.author.bot) return;
	if (message.channel.type === "dm"&&message.author.id!==process.env.ownerID) {
		let embed = new Discord.RichEmbed()
			.addField(`Invalid Channel`, `Hello user, I currently do not support DM commands.\nHowever my [server](${saveData.server.invite}) does.`)
			.setColor(0xce001f);
		message.channel.send({embed});
		return;
	}
	if(message.content.startsWith(prefix)){
		let args = message.content.toLowerCase().split(` `);
		let cmd = args.shift().substring(prefix.length);
		if(commands.has(cmd)) {
			let time = new Date();
			let command = commands.get(cmd);
			command.requirements.forEach(function (req) {
				switch(req.toLowerCase()){
					case `owner`:
						if(message.author.id!==process.env.ownerID){
							modules.INVALID_PERMS(message,`Only the owner of the bot can use this command.`);
							return;
						}
						break;
				}
			});
			console.log(`${message.author.tag} just used: ${cmd}`);
			command.run(message,args,time);
		}
	}
});