const Discord = require(`discord.js`);
const fs = require(`fs`);
let console = require(`./console`);
module.exports = modules = {
	//Data
	activityInterval:null,
	colors   : {
		blue  : 0x0000FF,
		purple: 0x4300C4,
		red   : 0xFF0000,
		yellow: 0xF0FF00,
		orange: 0xC88600,
		green : 0x00FF00
	},
	data     : require(`./../data.json`),
	usersdata: require(`./../usersdata.json`),


	//UsersData
	userAgreed       : function (message) {
		//send user a welcome message
		modules.usersdata[message.author.id] = true;
		let embed = new Discord.RichEmbed()
			.setColor(modules.colors.green)
			.setTitle(`Thank you!`)
			.setDescription(`Thank you for accepting our rules.\nYou now have the verified role and can now view other channels!\n\nIf you wish us to remove all your [User's EndData](https://discordapp.com/developers/docs/resources/user)\ntype in the command \`${modules.getPrefix(message)}removeMyEndUsersData\` or \`${modules.getPrefix(message)}RMEUD\` for short`);
		message.member.removeRole(message.guild.roles.find(`name`, `unverified`));
		message.author.send({embed});
	},
	removeUsersEndData: function (user) {
		delete modules.usersdata[user.id];
	},

	//Formatting
	getPrefix       : function (message) {
		return process.env.prefix || `.`;
	},
	getFormattedDate: function (time, bool, milli, actualYear) {
		bool = bool || false;
		milli = milli || false;
		actualYear = actualYear || false;
		/**time items**/
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

		/**formatting**/
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
	setFooter       : function (embed, message, time = new Date) {
		embed.setFooter(`Requested by ${message.author.tag} at ${`${time.getHours() > 12 ? time.getHours() - 12 : time.getHours() }:${time.getMinutes()} ${time.getHours() > 12 ? `PM` : `AM`}`}`,message.author.icon_url);
	},
	spellChecker    : function (check, couldBe) {
		let mistakes;
		//Words that fit the spellchecker
		let words = [];
		//Max amount of mistakes
		let max = Math.round(check.length / 2 + 0.5);
		check = check.toLowerCase();

		//go through the list of words that might be similar to the word.
		couldBe.forEach(function (word) {
			word = word.toLowerCase();
			mistakes = max;
			let len = word.length > check.length ? word.length : check.length;
			for (let i = 0; i < len; i++) {
				if (word[i] !== check[i]) {
					//if there's a swap in two letters, (letetrs = letters)
					if (word[i + 1] === check[i] && check[i + 1] === word[i] && typeof word[i + 1] === "string") {
						check = check.split(``);
						let move = word[i + 1];
						check.splice(i, 1);
						check.splice(i + 1, 0, move);
						check = check.join(``)
					}
					//if 2 letters swapped and a letter is in between them. (letrets = letters)
					else if (word[i + 2] === check[i] && word[i] === check[i + 2] && word[i + 1] === check[i + 1]) {
						let first = check[i + 2];
						let second = check[i + 1];
						let third = check[i];
						check = check.split(``);
						check.splice(i, 3);
						check.splice(i, 0, third);
						check.splice(i, 0, second);
						check.splice(i, 0, first);
						check = check.join(``);


					}
					//if there's a letter missing. (leters = letters)
					else if (word[i + 1] === check[i] && typeof word[i + 1] === "string") {
						check = check.split(``);
						check.splice(i, 0, word[i]);
						check = check.join(``);
					}
					//if there's 2 letters missing (letrs = letters) also checks if the letter after the 2 letters still matches (let"r" = lette"r"s)
					else if (word[i + 2] === check[i] && word[i + 3] === check[i + 1] && typeof word[i + 2] === "string") {
						check = check.split(``);
						check.splice(i, 0, word[i]);
						check.splice(i + 1, 0, word[i + 1]);
						mistakes--;
						check = check.join(``);
					}
					mistakes--;
				}

			}
			if (mistakes >= 0) {
				words.push([check, max - mistakes]);
			}
		});
		return words;
	},
	tabbed          : function (word, couldBe) {
		let matches = [];
		couldBe.forEach(function (item) {
			let starting = 0;
			if (word.length <= item.length) {
				for (let i = 0; i < word.length; i++) {
					if (word[i].toLowerCase() === item[i].toLowerCase()) starting++;
					else {
						starting = 0;
						break;
					}
				}
				if (starting > 0) {
					matches.push(item);
				}
			}
		});
		return matches;
	},

	//Commands
	canRunCommand: function (command, message, skipSend) {
		let reasons = [];
		//check all the requirements
		if(command.requirements) {
			command.requirements.forEach(function (req) {
				switch (req.toLowerCase()) {
					case `owner`:
						if (!process.env.owners.includes(message.author.id)) reasons.push(`Only the owner of the bot can use this command.`)
						break;
				}
			});
		}

		//if there any reasons to not allow the user.
		if (reasons.length) {
			let embed = new Discord.RichEmbed()
				.setColor(modules.colors.red)
				.setTitle(`Invalid Permissions`)
				.setDescription(`You cannot use this command, Reason(s):\n\`\`\`fix\n${reasons.join(`\n`)}\`\`\`\n\n___This message will self delete in \`1\` minute__`);
				modules.setFooter(embed,message);
			if (!skipSend) {
				message.channel.send({embed}).then(function (m) {
					setTimeout(m.delete, 60000);
				});
			}
			return false;
		}
		return true;
	},
	allCommands  : [],//defined in ./commands.js
	commandsList : [],//defined in ./commands.js

	//Other
	saveData: function () {
		fs.writeFile(`./data.json`, JSON.stringify(modules.data, null, 4));
		fs.writeFile(`./usersdata.json`, JSON.stringify(modules.usersdata, null, 4));
	},
	setMyActivity:function (client) {
		clearInterval(modules.activityInterval);
		client.user.setActivity(`Sorry, I recently rebooted!`);
		let activities = [[`playing`,`ping me 4 help`],[`playing`,`${modules.getPrefix(false)}help`],[`playing`,`with some users`],[`watching`,`over ${client.guilds.array().length} guilds`],[`listening`,`to complaints`],[`playing`,`tic tac toe`]];
		let previous = 100;
		modules.activityInterval = setInterval(function () {
			let num;
			while(num!==previous){
				num = Math.round(Math.random()*(activities.length-1));
			}
			previous = num;
			client.user.setActivity(activities[num]);
		},60000*5);
	},
	random:function (max = 1, min = 0) {
		let random = Math.random()*max;
		let round = Math.round(random);
		round += min;
		return round;
	},
	console:require(`./console`)
}
;