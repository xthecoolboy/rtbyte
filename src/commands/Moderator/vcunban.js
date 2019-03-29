const { Command } = require('klasa');
const Case = require('../../lib/structures/Case');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vub', 'vcub'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_VCUNBAN_DESCRIPTION'),
			usage: '<member:user>',
			usageDelim: ' '
		});
		this.customizeResponse('member', message =>
			message.language.get('COMMAND_VCUNBAN_NOPARAM'));
	}

	async run(msg, [user]) {
		if (!msg.guild.settings.roles.voiceBanned || !msg.guild.roles.has(msg.guild.settings.roles.voiceBanned)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_VCUNBAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_VCUNBAN_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_PERMS', user));

		const modCase = new Case(msg.guild)
			.setUser(user)
			.setType('vcunban')
			.setModerator(msg.author);
		await modCase.submit();

		const member = await msg.guild.members.fetch(user);

		if (!member.roles.has(msg.guild.settings.roles.voiceBanned)) return msg.affirm();
		const voiceBannedRole = await msg.guild.roles.get(msg.guild.settings.roles.voiceBanned);
		await member.roles.remove(voiceBannedRole);

		const embed = await modCase.embed();
		await embed.send();

		return msg.affirm();
	}

	async createRole(guild) {
		const vcban = await this.client.commands.get('vcban');
		return vcban.createRole(guild);
	}

};
