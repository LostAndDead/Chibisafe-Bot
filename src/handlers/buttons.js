const api = require('./api.js');
const embds = require('./embeds.js');

async function handleAlbumSelect (interaction, Client) {
    const msg = interaction.message;
    const uuid = interaction.customId.split('.')[2];

    const file = await api.getFile(uuid);
    const albums = await api.getAlbums();

    var albumsIn = [];

    for (const albums of file.albums) {
        albumsIn.push(albums.uuid);
    }

    var error = false
    var added = false
    var removed = false
    for (const album of albums) {
        albumUUID = album.uuid;
        if(interaction.values.includes(albumUUID) && !albumsIn.includes(albumUUID)){
            added = true;
            if(!await api.addToAlbum(uuid, albumUUID)){
                error = true;
            }
        }
        else if (!interaction.values.includes(albumUUID) && albumsIn.includes(albumUUID)){
            removed = true;
            if(!await api.removeFromAlbum(uuid, albumUUID)){
                error = true;
            }
        }

    }

    if(error){
        await interaction.reply({ content: 'Sorry, seems there was an error somewhere, check the console for more details.', ephemeral: true });
    }
    else{
        if (added && removed) {
            await interaction.reply({ content: 'File added to and removed from albums successfully!', ephemeral: true });
        }
        else if (added) {
            await interaction.reply({ content: 'File added to albums successfully!', ephemeral: true });
        }
        else if (removed) {
            await interaction.reply({ content: 'File removed from albums successfully!', ephemeral: true });
        }
    }
}

async function handleInfoButton (interaction, Client) {
    const msg = interaction.message;
    const uuid = interaction.customId.split('.')[2];

    const file = await api.getFile(uuid);

    await embds.infoEmbed(file, interaction);
}

async function handleDeleteButton(interaction, Client) {
    const msg = interaction.message;
    const uuid = interaction.customId.split('.')[2];

    const res = await api.deleteFile(uuid);

    if(res){
        await interaction.reply({ content: 'File deleted successfully!', ephemeral: true });
        try{
            await interaction.message.delete();
        } catch(e){ }
    }
    else{
        await interaction.reply({ content: 'Sorry, seems there was an error somewhere, check the console for more details.', ephemeral: true });
    }
}

async function handleFilesButton (interaction, Client) {
    const pageStr = interaction.customId.split('.')[2];
    const page = parseInt(pageStr);

    const res = await api.getFiles(4, page);
    if (!res) {
        await interaction.reply({ content: 'Sorry, seems there was an error somewhere, check the console for more details.', ephemeral: true });
        return;
    }
    const files = res.files;
    const count = res.count;

    const nextRes = await api.getFiles(4, page+1);
    if (!nextRes) {
        await interaction.reply({ content: 'Sorry, seems there was an error somewhere, check the console for more details.', ephemeral: true });
        return;
    }
    const nextFiles = nextRes.files;
    var next = true

    if (nextFiles.length <= 0) {
        next = false;
    }

    await embds.filesEmbed(files, page, count, next, interaction, true);
}

module.exports.handleAlbumSelect = handleAlbumSelect;
module.exports.handleInfoButton = handleInfoButton;
module.exports.handleDeleteButton = handleDeleteButton;
module.exports.handleFilesButton = handleFilesButton;

module.exports.handle = async (interaction, Client) => {
    module = interaction.customId.split('.')[1];

    switch(module){
        case "albumSelect":
            await handleAlbumSelect(interaction, Client);
            break;
        case "infoButton":
            await handleInfoButton(interaction, Client);
            break;
        case "deleteButton":
            await handleDeleteButton(interaction, Client);
            break;
        case "filesButton":
            await handleFilesButton(interaction, Client);
            break;
        default:
            await interaction.reply({ content: 'Sorry, seems there was an error somewhere, check the console for more details.', ephemeral: true });
            break;
    }
}