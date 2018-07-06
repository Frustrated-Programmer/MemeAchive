const Discord = require(`discord.js`);
const fs = require(`fs`)
module.exports = modules = {
	colors          : {
		blue : 0x0000FF,
		red  : 0xFF0000,
		green: 0x00FF00
	},
	data            : require(`./../data.json`),
	getFormattedDate: function (time, bool, milli, actualYear) {
		bool = bool || false;
		milli = milli || false;
		actualYear = actualYear || false;
		let mil = 1;
		let s = mil * 1000;
		let mi = s * 60;
		let h = mi * 60;
		let d = h * 24;
		let m = d * 30.4375;
		let y = m * 12;
		let times = [y, m, d, h, mi, s];
		let names = ["year", "month", "day", "hour", "minute", "second"];
		if (milli) {
			names.push(`millisecond`);
			times.push(mil)
		}
		let newTime = "";
		for (let i = 0; i < times.length; i++) {
			let amo = 0;
			if (actualYear && i === 0) {
				amo = 1970;
			}
			while (time >= times[i]) {
				time -= times[i];
				amo++;
			}
			if (amo > 0) {
				if (bool) {
					newTime += `${newTime.length ? `${i + 1 < times.length ? `,` : ` and`}` : ``} ${amo} ${names[i]}${amo > 1 ? `s` : ``}`;

				}
				else {
					newTime += `${i === 3 ? ` ` : ``}${amo}${i < 2 ? `/` : i !== 2 ? `${i + 1 < times.length ? `:` : ``}` : ``}`;
				}
			}
		}
		return newTime;
	},
	getFooter       : function (message, time = new Date) {
		return `Requested by ${message.author.tag} at ${`${time.getHours() > 12 ? time.getHours() - 12 : time.getHours() }:${time.getMinutes()} ${time.getHours() > 12 ? `PM` : `AM`}`}`;
	},
	INVALID_PERMS   : function (message, reason = `None defined, (report this to the owner)`) {
		let embed = new Discord.RichEmbed()
			.setColor(modules.colors.red)
			.setTitle(`Invalid Permissions`)
			.setDescription(`You cannot use this command, Reason:\n\`\`\`fix\n${reason}\n\`\`\``)
			.setFooter(modules.getFooter(message));
	},
	saveData        : function () {
		fs.writeFile(`./data.json`, JSON.stringify(modules.data, null, 4));
	}
};