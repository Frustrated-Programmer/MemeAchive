const Discord = require(`discord.js`);
const modules = require(`./modules`);
let data = modules.data;
let commands = new Map();
commands.set(`eval`, {
	requirements: [`owner`],
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
let reboot = {
	requirements: [`owner`],
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
commands.set(`reboot`, reboot);
commands.set(`restart`, reboot);
commands.set(`reset`, reboot);
commands.set(`endprocess`, reboot);
exports.commands = commands;