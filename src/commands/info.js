const { SlashCommandBuilder } = require('@discordjs/builders');

const api = require('../handlers/api.js');
const embeds = require('../handlers/embeds.js');

module.exports.run = async(interaction, Client) => {

    var uuid = interaction.options.getString('uuid');

    const file = await api.getFile(uuid);
    if(!file) {
        await interaction.reply({ content: 'Sorry, seems there was an error somewhere, check the console for more details.', ephemeral: true });
        return;
    }

    await embeds.infoEmbed(file, interaction);
};

module.exports.info = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information about a file.')
    .addStringOption(option => option.setName('uuid').setDescription('The UUID of the file to get information about.').setRequired(true))
    .setDMPermission(true);
