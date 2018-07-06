const Discord = require(`discord.js`);
const modules = require(`./modules`);
let commands = new Map();
commands.set(`eval`,{
	requirements:[`owner`],
	run:function (message,args,time) {
		let code = message.content.split(` `);
		code.shift();
		code=code.join(` `);
		let embed = new Discord.RichEmbed()
			.setTitle(`Input`)
			.setDescription(`\`\`\`nx\n${code}\`\`\``)
			.setFooter(modules.getFooter(message,time),message.author.icon_url);
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
				.addField(`Output`,`\`\`\`nx\n${clean(evaled)}\`\`\``);
		}
		catch (err) {
			embed.setColor(modules.colors.red)
				.addField(`Output`,`\`\`\`nx\n${clean(err)}\`\`\``);
		}

		message.channel.send({embed});
	}
});

exports.commands = commands;