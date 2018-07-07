const Discord = require(`discord.js`);
const modules = require(`./modules`);
let data = modules.data;
let commands = new Map();
let commandsList = [];
//Eval
commands.set(`eval`, {
	id          : 0,
	type        : `bot`,
	requirements: [`owner`],
	aliases     : [`eval`],
	description : `Runs some code.`,
	args        : `[code]`,
	run         : function (message, args, time) {
		let code = message.content.split(` `);
		code.shift();
		code = code.join(` `);
		let embed = new Discord.RichEmbed()
			.setTitle(`Input`)
			.setDescription(`\`\`\`nx\n${code}\`\`\``);
		modules.setFooter(embed, message, time);

		function clean(text) {
			if (typeof(text) === `string`)
				return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
			else
				return text;
		}

		try {
			let evaled = eval(code);
			if (typeof evaled !== `string`)
				evaled = require(`util`).inspect(evaled);
			embed.setColor(modules.colors.blue)
				.addField(`Output`, `\`\`\`nx\n${clean(evaled)}\`\`\``);
		}
		catch (err) {
			embed.setColor(modules.colors.red)
				.addField(`Output`, `\`\`\`nx\n${clean(err)}\`\`\``);
		}

		message.channel.send({embed});
	}
});
commandsList.push(`eval`);
modules.allCommands.push(`eval`);

//Reboot
let reboot = {
	id          : 1,
	type        : `bot`,
	hidden      : true,
	requirements: [`owner`],
	description : `reboots bot, can update version if argument supplied`,
	args        : `(version)`,
	aliases     : [`reboot`, `restart`, `reset`, `endprocess`],
	run         : function (message, args, time) {
		if (args[0]) {
			data.version = args[0];
		}
		setTimeout(function () {
			console.error(`couldn't send embed in time`);
			data.rebootData.messageID = false;
			data.rebootData.turnedOff = Date.now();
			process.exit();
		}, 10000);
		let embed = new Discord.RichEmbed()
			.setColor(0xce001f)
			.setDescription(`🔄 Restarting bot.`)
			.setFooter(`bot was online for ${modules.getFormattedDate(Date.now() - data.rebootData.turnedOn, true)}`);
		message.channel.send({embed}).then(function (m) {
			message.delete();
			data.rebootData.messageID = m.id;
			data.rebootData.channelID = m.channel.id;
			data.rebootData.turnedOff = Date.now();
			modules.saveData();
			process.exit();
		})
	}
};
reboot.aliases.forEach(function (item) {
	commands.set(item.toLowerCase(), reboot);
	modules.allCommands.push(item);
});
commandsList.push(`reboot`);

//removeMyEndUsersData
let RMEUD = {
	id         : 2,
	type       : `user`,
	aliases    : [`RMEUD`,`removeMyEndUsersData`],
	description: `removes all your stored User's EndData from our bot.`,
	run        : function (message, args) {
		modules.removeUsersEndData(message.author);
		message.member.addRole(message.guild.roles.find(`name`, `unverified`));
		let embed = new Discord.RichEmbed()
			.setColor(modules.colors.red)
			.setTitle(`Goodbye :wave:`)
			.setDescription(`Sorry to see you go. You can comeback at any time (here)[${data.server.invite}`);
		message.author.send({embed});
	}
};
RMEUD.aliases.forEach(function (item) {
	commands.set(item.toLowerCase(), RMEUD);
	modules.allCommands.push(item);
});
commandsList.push(`rmeud`);

//Help
let help = {
	id         : 3,
	type       : `info`,
	aliases    : [`help`, `commands`, `cmds`],
	description: `Shows you a list of commands you can run, OR extra detail on a command if supplied.`,
	args       : `(command)`,
	run        : function (message, args, time) {
		let prefix = modules.getPrefix(message);
		if (args[0]) {
			if (commands.has(args[0].toLowerCase())) {
				let cmd = commands.get(args[0].toLowerCase());
				embed = new Discord.RichEmbed()
					.setTitle(`"${args[0].toUpperCase().substring(0, 1)}${args[0].toLowerCase().substring(1)}" command info.`)
					.addField(`Description`, cmd.description)
					.addField(`Aliases`, `\`\`\`fix\n - ${prefix}${cmd.aliases.join(`\n - ${prefix}`)}\`\`\``)
					.addField(`Usage`, `\`\`\`css\n${prefix}${cmd.aliases[Math.round() * (cmd.aliases.length - 1)]} ${cmd.args}\`\`\`\n\n\`(item)\` is an option argument.\n\`[item]\` is a required argument`);
				modules.setFooter(embed, message, time);
				switch (cmd.type) {
					case `bot`:
						embed.setColor(modules.colors.purple);
						break;
					case `user`:
						embed.setColor(modules.colors.yellow);
						break;
					case `info`:
						embed.setColor(modules.colors.blue);
						break;
					default:
						embed.setColor(`RANDOM`);
						break
				}
			}
			else {
				let embed;
				let spellChecked = modules.spellChecker(args[0], modules.allCommands);
				if (spellChecked.length) {
					let items = ``;
					spellChecked.forEach(function (item) {
						items += ` - ${prefix}${item[0]}\n`;
					});
					embed = new Discord.RichEmbed()
						.setColor(modules.colors.orange)
						.setTitle(`Did you mean?`)
						.setDescription(`We couldn't find that command, yet found \`${spellChecked.length}\` items you could've meant.\n\`\`\`${items}\`\`\``);
					modules.setFooter(embed, message, time);
				}
				else {
					embed = new Discord.RichEmbed()
						.setColor(modules.colors.red)
						.setDescription(`Couldn't find the requested command.\n\nYou can use \`${prefix}help\` to get a list of commands you can check.`)
					modules.setFooter(embed, message, time);
				}
				message.channel.send({embed});
			}
			return;
		}
		let list = ``;
		commandsList.forEach(function (item) {
			let cmd = commands.get(item);
			if (modules.canRunCommand(cmd, message)) {
				let start = `${prefix}${cmd.aliases[0]}`;
				list += `${start}${`            `.substring(start.length)}| ${cmd.type}\n`;
			}
		});
		let embed = new Discord.RichEmbed()
			.setColor(modules.colors.blue)
			.setTitle(`List of commands.`)
			.setDescription(`\`\`\`nx\n${list}\`\`\``);
		modules.setFooter(embed, message, time)
		message.channel.send({embed});
	}
};
help.aliases.forEach(function (item) {
	commands.set(item.toLowerCase(), help);
	modules.allCommands.push(item);
});
commandsList.push(`help`);

modules.commandsList = commandsList;
exports.commands = commands;