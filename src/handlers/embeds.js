const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const api = require('./api.js');

module.exports.infoEmbed = async (file, interaction) => {
    var date = new Date(file.createdAt);
    var seconds = Math.round(date.getTime() / 1000)

    var bytes = file.size;
    var kilobytes = bytes / 1024;
    var megabytes = kilobytes / 1024;

    var size = ""

    if (megabytes > 1) {
        size = `${Math.round(megabytes * 10) / 10} MB`;
    }
    else if (kilobytes > 1) {
        size = `${Math.round(kilobytes * 10) / 10} KB`;
    }
    else {
        size = `${Math.round(bytes * 10) / 10} B`;
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Information about ${file.name}`);
    embed.setDescription(`
- Name: \`${file.name}\`
- Original Name: \`${file.original}\`
- UUID:\` ${file.uuid}\`
- Size: \`${size}\`
- Created At: <t:${seconds}> 
- Uploaded IP: \`${file.ip}\`
- Hash: \`${file.hash}\`
- Type: \`${file.type}\`
- URL: ${file.url}
- Thumbnail: ${file.thumb || "None"}
- Thumbnail Square: ${file.thumbSquare || "None"}
- Preview: ${file.preview || "None"}
- Albums: \n  - ${file.albums.map(album => `[${album.name}](${process.env.FRIENDLY_URL}/dashboard/albums/${album.uuid})`).join('\n  - ')}
    `);

    const row = new ActionRowBuilder()

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

    row.addComponents(deleteButton, openButton);

    await interaction.reply({embeds: [embed], components: [row], ephemeral: true});
}

module.exports.filesEmbed= async (files, page, count, next, interaction, update) => {
    embeds = []
    const embed = new EmbedBuilder()
        .setTitle(`Files (Page ${page}/${Math.ceil(count/4)})`)
        .setURL(`${process.env.FRIENDLY_URL}/dashboard/uploads`);
    
    embeds.push(embed);

    const row = new ActionRowBuilder()
    var count = 1;
    var description = "";

    for (const file of files) {
        const image = new EmbedBuilder()
        .setURL(`${process.env.FRIENDLY_URL}/dashboard/uploads`)
        .setImage(file.url)

        embeds.push(image);

        const infoButton = new ButtonBuilder()
            .setCustomId(`api.infoButton.${file.uuid}`)
            .setLabel('‎')
            .setStyle(ButtonStyle.Primary);
        
        switch (count) {
            case 1:
                infoButton.setEmoji('1️⃣');
                description += `- 1️⃣ [${file.name}](${file.url})\n`;
                break;
            case 2:
                infoButton.setEmoji('2️⃣');
                description += `- 2️⃣ [${file.name}](${file.url})\n`;
                break;
            case 3:
                infoButton.setEmoji('3️⃣');
                description += `- 3️⃣ [${file.name}](${file.url})\n`;
                break;
            case 4:
                infoButton.setEmoji('4️⃣');
                description += `- 4️⃣ [${file.name}](${file.url})\n`;
                break;
            default:
                infoButton.setEmoji('ℹ');
                description += `- ℹ [${file.name}](${file.url})\n`;
        }

        row.addComponents(infoButton);
        count++;
    }

    embed.setDescription(description);

    const row2 = new ActionRowBuilder()

    const previousButton = new ButtonBuilder()
        .setCustomId(`api.filesButton.${page-1}`)
        .setLabel('Previous')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⬅');

    const nextButton = new ButtonBuilder()
        .setCustomId(`api.filesButton.${page+1}`)
        .setLabel('Next')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➡');

    if (page == 1) {
        previousButton.setDisabled(true);
    }

    if (!next) {
        nextButton.setDisabled(true);
    }

    row2.addComponents(previousButton, nextButton);

    if (update) {
        await interaction.update({embeds: embeds, components: [row, row2]});
    }
    else {
        await interaction.reply({embeds: embeds, components: [row, row2], ephemeral: true});
    }
}