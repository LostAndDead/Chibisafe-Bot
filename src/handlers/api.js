const { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { set } = require('express/lib/application');

var disabled = false;
var checkState = false
var knownFiles = []

var client

async function checkAuth() {
    try{
        const response = await fetch(`${process.env.API_URL}/api/user/me`, {
            method: "GET",
            headers: {
                "x-api-key": process.env.API_KEY
            }
        })

        const json = await response.json();

        if(json.error) {
            console.log("Login Error: "+ json.error);
            return false;
        }
        else {
            console.log(`Logged in as ${json.user.username} (${json.user.uuid})`)
            return true;
        }
    } catch (error) {
        console.log("Login Error: "+ error);
        setLoopState(false);
        return false;
    }
}

module.exports.checkAuth = checkAuth;

async function checkLoop(){
    if(disabled) {
        setTimeout(checkLoop, 5000);
        return;
    }
    if(!checkState) {
        apiStatus = await checkAuth();
        setLoopState(apiStatus);
        setTimeout(checkLoop, 15000);
        return;
    }
    try{
        fetch(`${process.env.API_URL}/api/files?limit=1`, {
            method: "GET",
        headers: {
            "x-api-key": process.env.API_KEY
        }
        })
        .then((response) => response.json())
        .then(async (json) => {
            if(json.error) {
                console.log("Get Files Error: "+ json.error);
                setLoopState(false);
                setTimeout(checkLoop, 5000);
            }
            else {
                setLoopState(true);
                if(!json.files) return;
                if(!json.files[0]) return;
                file = json.files[0];
                if(!knownFiles.includes(file.uuid)){
                    if(knownFiles.length > 0 && checkURL(file.url)){
                        const user = await client.users.fetch(process.env.USER_ID);
                        if(!user) return;
                        const embed = new EmbedBuilder()
                            .setImage(`${process.env.FRIENDLY_URL}/${file.name}`)
                            .setFooter({text: `${file.uuid}`})
                            .setTimestamp();

                        const albums = await getAlbums()

                        const albumSelect = new StringSelectMenuBuilder()
                            .setCustomId(`api.albumSelect.${file.uuid}`)
                            .setPlaceholder('Which albums would you like to add this to?')
                            .setMinValues(0)
                            .setMaxValues(Math.min(25, albums.length));

                        albums.forEach(album => {
                            const albumOption = new StringSelectMenuOptionBuilder()
                                .setLabel(album.name)
                                .setValue(album.uuid);

                            if (album.nsfw){
                                albumOption.setDescription(`${album.count} | NSFW | ${album.uuid}`)
                            }else{
                                albumOption.setDescription(`${album.count} | ${album.uuid}`)
                            }

                            albumSelect.addOptions(albumOption)
                        });

                        const infoButton = new ButtonBuilder()
                            .setCustomId(`api.infoButton.${file.uuid}`)
                            .setLabel('Info')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('ℹ');

                        const deleteButton = new ButtonBuilder()
                            .setCustomId(`api.deleteButton.${file.uuid}`)
                            .setLabel('Delete')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🗑');

                        const openButton = new ButtonBuilder()
                            .setLabel('Open')
                            .setStyle(ButtonStyle.Link)
                            .setURL(`${process.env.FRIENDLY_URL}/${file.name}`)
                            .setEmoji('🔗');

                        const row = new ActionRowBuilder()
                        row.addComponents(albumSelect)

                        const row2 = new ActionRowBuilder()
                        row2.addComponents(infoButton, deleteButton, openButton)

                        user.send({embeds: [embed], components: [row, row2]});
                    }
                    knownFiles.push(file.uuid);
                }
            }
        });

        setTimeout(checkLoop, 5000);
    } catch (error) {
        console.log("Get Files Error: "+ error);
        setLoopState(false);
        setTimeout(checkLoop, 5000);
    }
}

async function getAlbums() {
    try{
        const response = await fetch (`${process.env.API_URL}/api/albums`, {
            method: "GET",
            headers: {
                "x-api-key": process.env.API_KEY
            }
        })

        const json = await response.json();

        if(json.error) {
            console.log("Get Albums Error: "+ json.error);
            setLoopState(false);
            return false;
        }
        else {
            if(!json.albums) return;
            setLoopState(true);
            return json.albums.slice(0, 25);
        }
    } catch (error) {
        console.log("Get Albums Error: "+ error);
        setLoopState(false);
        return false;
    }
}

module.exports.getAlbums = getAlbums;

async function getFile(uuid) {
    try{
        const response = await fetch (`${process.env.API_URL}/api/file/${uuid}`, {
            method: "GET",
            headers: {
                "x-api-key": process.env.API_KEY,
            }
        })

        const json = await response.json();

        if(json.error) {
            console.log("Get File Error: "+ json.error);
            setLoopState(false);
            return false;
        }
        else {
            setLoopState(true);
            return json.file;
        }
    } catch (error) {
        console.log("Get File Error: "+ error);
        setLoopState(false);
        return false;
    }
}

module.exports.getFile = getFile;

module.exports.deleteFile = async (uuid) => {
    try{
        const response = await fetch (`${process.env.API_URL}/api/file/${uuid}`, {
            method: "DELETE",
            headers: {
                "x-api-key": process.env.API_KEY,
            }
        })

        const json = await response.json();

        if(json.error) {
            console.log("Delete File Error: "+ json.error);
            setLoopState(false);
            return false;
        }
        else {
            console.log(`Deleted ${uuid}`)
            knownFiles.pop(uuid);
            setLoopState(true);
            return true;
        }
    } catch (error) {
        console.log("Delete File Error: "+ error);
        setLoopState(false);
        return false;
    }
}

module.exports.getFiles = async (limit, page) => {
    try{
        const response = await fetch (`${process.env.API_URL}/api/files?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "x-api-key": process.env.API_KEY,
            }
        })

        const json = await response.json();

        if(json.error) {
            console.log("Get Files Error: "+ json.error);
            setLoopState(false);
            return false;
        }
        else {
            if(!json.files) return;
            setLoopState(true);
            return json;
        }
    } catch (error) {
        console.log("Get Files Error: "+ error);
        setLoopState(false);
        return false;
    }
}

module.exports.addToAlbum = async (uuid, album) => {
    try{
        const response = await fetch (`${process.env.API_URL}/api/file/${uuid}/album/${album}`, {
            method: "POST",
            headers: {
                "x-api-key": process.env.API_KEY,
            }
        })

        const json = await response.json();

        if(json.error) {
            console.log("Add to Album Error: "+ json.error);
            setLoopState(false);
            return false;
        }
        else {
            console.log(`Added ${uuid} to ${album}`)
            setLoopState(true);
            return true;
        }
    } catch (error) {
        console.log("Add to Album Error: "+ error);
        setLoopState(false);
        return false;
    }

}

module.exports.removeFromAlbum = async (uuid, album) => {
    try {
        const response = await fetch (`${process.env.API_URL}/api/file/${uuid}/album/${album}`, {
            method: "DELETE",
            headers: {
                "x-api-key": process.env.API_KEY,
            }
        })

        const json = await response.json();

        if(json.error) {
            console.log("Remove from Album Error: "+ json.error);
            setLoopState(false);
            return false;
        }
        else {
            console.log(`Removed ${uuid} from ${album}`)
            setLoopState(true);
            return true;
        }
    } catch (error) {
        console.log("Remove from Album Error: "+ error);
        setLoopState(false);
        return false;
    }

}

function setLoopState (state) {
    checkState = state;
    if(!checkState) knownFiles = [];
}

module.exports.setLoopState = setLoopState;

module.exports.getLoopState = () => {
    return checkState;
}

module.exports.startLoop = (Client) => {
    client = Client;
    checkLoop();
}

function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

module.exports.setDisabled = (state) => {
    disabled = state;
}

module.exports.getDisabled = () => {
    return disabled;
}

