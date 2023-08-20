const { SlashCommandBuilder } = require('@discordjs/builders');

const api = require('../handlers/api.js');

module.exports.run = async(interaction, Client) => {

    var value = interaction.options.getBoolean('value');

    if(value == null){
        api.setLoopState(!api.getLoopState());
        await interaction.reply({ content: `Upload checking is now ${api.getLoopState() ? "enabled" : "disabled"}`, ephemeral: true });
    }
    else{
        api.setLoopState(value);
        await interaction.reply({ content: `Upload checking is now ${api.getLoopState() ? "enabled" : "disabled"}`, ephemeral: true });
    }
};

module.exports.info = new SlashCommandBuilder()
    .setName('toggle_upload_check')
    .setDescription('Toggle the checking for new uploads.')
    .addBooleanOption(option => option.setName('value').setDescription('If set will set the state rather than toggling it').setRequired(false))
    .setDMPermission(true);
