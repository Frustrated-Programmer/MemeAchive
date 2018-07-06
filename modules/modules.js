const Discord = require(`discord.js`)
module.exports = modules = {
	colors:{
		blue:0x0000FF,
		red:0xFF0000,
		green:0x00FF00,
	},
	getFooter:function (message,time = new Date) {
		return `Requested by ${message.author.tag} at ${`${time.getHours()  > 12 ? time.getHours()-12 : time.getHours() }:${time.getMinutes()} ${time.getHours()>12 ? `PM` : `AM`}`}`;
	},
	INVALID_PERMS:function (message, reason = `None defined, (report this to the owner)`) {
		let embed = new Discord.RichEmbed()
			.setColor(modules.colors.red)
			.setTitle(`Invalid Permissions`)
			.setDescription(`You cannot use this command, Reason:\n\`\`\`fix\n${reason}\n\`\`\``)
			.setFooter(modules.getFooter(message));
	}
};