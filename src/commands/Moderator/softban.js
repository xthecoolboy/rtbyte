const { Command, util } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['sb'],
			permissionLevel: 5,
			requiredPermissions: ['BAN_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_SOFTBAN_DESCRIPTION'),
			usage: '<member:user> <reason:...string>',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_SOFTBAN_NO_SOFTBAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_SOFTBAN_NO_SOFTBAN_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_SOFTBAN_NO_PERMS', user));

		const member = await msg.guild.members.fetch(user);

		if (msg.guild.settings.logs.events.guildSoftbanAdd) await this.softbanLog(member, reason);
		await msg.guild.members.ban(user, { days: 1, reason: reason });
		await msg.guild.members.unban(user, msg.language.get('COMMAND_SOFTBAN_SOFTBAN_RELEASED'));

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async softbanLog(member, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDSOFTBANADD'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		// eslint-disable-next-line max-len
		if (member.guild.settings.moderation.notifyUser && !reason.includes('-s', reason.length - 2)) await member.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}

};
