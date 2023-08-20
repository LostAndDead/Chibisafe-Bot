const { SlashCommandBuilder } = require('@discordjs/builders');

const api = require('../handlers/api.js');
const embeds = require('../handlers/embeds.js');

module.exports.run = async(interaction, Client) => {

    var uuid = interaction.options.getString('uuid');

    const res = await api.getFiles(4, 1);
    const files = res.files;
    const count = res.count;

    const nextRes = await api.getFiles(4, 2);
    const nextFiles = nextRes.files;
    var next = true

    if (nextFiles.length <= 0) {
        next = false;
    }

    await embeds.filesEmbed(files, 1, count, next, interaction, false);
};

module.exports.info = new SlashCommandBuilder()
    .setName('files')
    .setDescription('Get the most recent files.')
    .setDMPermission(true);
