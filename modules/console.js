const Discord = require(`discord.js`);
const fs = require(`fs`);
function getCallerFile() {
	try {
		let err = new Error();
		let callerfile;
		let currentfile;

		Error.prepareStackTrace = function (err, stack) {
			return stack;
		};

		currentfile = err.stack.shift().getFileName();

		while (err.stack.length) {
			callerfile = err.stack.shift().getFileName();
			if (currentfile !== callerfile) {
				let fileName = callerfile.split(`\\`);
				while (fileName[0] !== `meme-achive`) {
					fileName.shift();
				}
				fileName = fileName.join(`\\`);
				return fileName;
			}
		}
	} catch (err) {
	}
	return undefined;
}
let updateLogs = function (msg, type) {
	let date = new Date();
	let months = [`January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `November`, `December`];
	let file = `logs-${months[date.getMonth()]}-${date.getFullYear()}`;
	let path = `./logs/${file}.log`;
	if (fs.existsSync(path)){
		let data = fs.readFileSync(path, `utf8`);
		fs.writeFile(path, `${data}\n[${type.toUpperCase()}]: ${msg}`);
		if (msg.length + data.length >= 5000) {
			console.log(path);
			let newPath =  `./logs/logs-${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
			console.log(newPath);
			fs.writeFile(newPath, data);
			fs.writeFile(path, `copiedLogs over to ${newPath}\n-------------\n`);
		}
	}
	else {
		fs.writeFile(path, `[${type.toUpperCase()}]: ${msg}`, function (err) {
			if (err) {
				console.error(err);
				return;
			}
		})
	}
};module.exports = logs = {
	channel: null,
	log    : function (/**/) {
		let args = arguments;
		let string = ``;
		for (let i = 0; i < args.length; i++) {
			string += `${args[i]} `;
		}
		if (logs.channel) {
			let embed = new Discord.RichEmbed()
				.setTitle(`Log`)
				.setColor(0x00FF0F)
				.setDescription(`\`\`\`nx\n${string}\`\`\``)
				.setFooter(`Called from: ${getCallerFile()}`);
			logs.channel.send({embed});
		}
		console.log(string);
		updateLogs(string, `-LOGGED`)
	},
	warn   : function (/**/) {
		let args = arguments;
		let string = ``;
		for (let i = 0; i < args.length; i++) {
			string += `${args[i]} `;
		}
		if (logs.channel) {
			let embed = new Discord.RichEmbed()
				.setTitle(`Log`)
				.setColor(0xFF8700)
				.setDescription(`\`\`\`nx\n${string}\`\`\``)
				.setFooter(`Called from: ${getCallerFile()}`);
			logs.channel.send({embed});
		}
		console.warn(string);
		updateLogs(string, `-WARNED`)
	},
	error  : function (/**/) {
		let args = arguments;
		let string = ``;
		for (let i = 0; i < args.length; i++) {
			string += `${args[i]} `;
		}
		if (logs.channel) {
			let embed = new Discord.RichEmbed()
				.setTitle(`Error`)
				.setColor(0xFF0000)
				.setDescription(`\`\`\`nx\n${string}\`\`\``)
				.setFooter(`Called from: ${getCallerFile()}`);
			logs.channel.send({embed});
		}
		console.error(string);
		updateLogs(string, `ERRORED`)
	},
	private: {
		log  : function (/**/) {
			let args = arguments;
			let string = ``;
			for (let i = 0; i < args.length; i++) {
				string += `${args[i]} `;
			}
			console.log(string);
			updateLogs(string, `-LOGGED`)
		},
		warn : function (/**/) {
			let args = arguments;
			let string = ``;
			for (let i = 0; i < args.length; i++) {
				string += `${args[i]} `;
			}
			console.warn(string);
			updateLogs(string, `-WARNED`);
		},
		error: function (/**/) {
			let args = arguments;
			let string = ``;
			for (let i = 0; i < args.length; i++) {
				string += `${args[i]} `;
			}
			console.error(string);
			updateLogs(string, `ERRORED`)
		}
	}
};