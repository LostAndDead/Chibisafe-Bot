const { SlashCommandBuilder } = require('@discordjs/builders');

const api = require('../handlers/api.js');

module.exports.run = async(interaction, Client) => {

    var value = interaction.options.getBoolean('value');

    if(value == null){
        api.setDisabled(!api.getDisabled());
        await interaction.reply({ content: `Upload checking is now ${api.getDisabled() ? "enabled" : "disabled"}`, ephemeral: true });
    }
    else{
        api.setDisabled(value);
        await interaction.reply({ content: `Upload checking is now ${api.getDisabled() ? "enabled" : "disabled"}`, ephemeral: true });
    }
};

module.exports.info = new SlashCommandBuilder()
    .setName('toggle_upload_check')
    .setDescription('Toggle the checking for new uploads.')
    .addBooleanOption(option => option.setName('value').setDescription('If set will set the state rather than toggling it').setRequired(false))
    .setDMPermission(true);
