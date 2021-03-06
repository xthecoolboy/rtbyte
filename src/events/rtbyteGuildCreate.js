const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildCreate' });
	}

	async run(guild) {
		if (!guild.available) return;

		await guild.rtbyteInit();

		if (this.client.settings.get('logs.guildCreate')) await this.globalLog(guild);

		return;
	}

	async globalLog(guild) {
		const embed = new MessageEmbed()
			.setAuthor(`${guild.name} (${guild.id})`, guild.iconURL())
			.setColor(this.client.settings.get('colors.green'))
			.setTimestamp()
			.setFooter(guild.language.get('GLOBAL_LOG_GUILDCREATE'));

		const globalLogChannel = await this.client.channels.cache.get(this.client.settings.get('channels.globalLog'));
		if (globalLogChannel) await globalLogChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
