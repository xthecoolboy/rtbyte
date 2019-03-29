const { Command } = require('klasa');
const Case = require('../../lib/structures/Case');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['b'],
			permissionLevel: 5,
			requiredPermissions: ['BAN_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_BAN_DESCRIPTION'),
			usage: '<member:user> [when:time] <reason:...string>',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_BAN_NOPARAM_MEMBER'))
			.customizeResponse('reason', message =>
				message.language.get('COMMAND_BAN_NOPARAM_REASON'));
	}

	async run(msg, [user, when = null, ...reason]) {
		const silent = reason[0].endsWith('-s');
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_CLIENT'));
		if (!msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_BAN_NO_PERMS', user));

		const modCase = new Case(msg.guild)
			.setUser(user)
			.setType('ban')
			.setReason(`${reason} (fc)`)
			.setModerator(msg.author)
			.setSilent(silent)
			.setDuration(when);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		await msg.guild.members.ban(user, { days: 1, reason: when ? `${msg.language.get('GUILD_LOG_GUILDBANADD_TIMED', when)} | ${reason}` : reason });

		if (when) {
			await this.client.schedule.create('timedBan', when, {
				data: {
					guildID: msg.guild.id,
					userID: user.id,
					userTag: user.tag
				}
			});
		}

		if (silent) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

};
