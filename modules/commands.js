const Discord = require(`discord.js`);
const modules = require(`./modules`);
let data = modules.data;
let commands = new Map();
let commandsList = [];
//Eval
commands.set(`eval`, {
	id:0,
	requirements: [`owner`],
	description:`Runs some code.`,
	args:`[code]`,
	run         : function (message, args, time) {
		let code = message.content.split(` `);
		code.shift();
		code = code.join(` `);
		let embed = new Discord.RichEmbed()
			.setTitle(`Input`)
			.setDescription(`\`\`\`nx\n${code}\`\`\``)
			.setFooter(modules.getFooter(message, time), message.author.icon_url);

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
	id:1,
	hidden:true,
	requirements: [`owner`],
	description:`reboots bot, can update version if argument supplied`,
	args:`(version)`,
	aliases:[`reboot`,`restart`,`reset`,`endprocess`],
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
	id:2,
	aliases:[`removeMyEndUsersData`,`RMEUD`],
	description:`removes all your stored User's EndData from our bot.`,
	run:function (message,args) {
		modules.removeUsersEndData(message.author);
		message.member.addRole(message.guild.roles.find(`name`,`unverified`));
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


modules.commandsList = commandsList;
exports.commands = commands;