const {Client, Collection, GateawayIntentBits, IntentsBitField} = require('discord.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

//Get package.json
const pjson = require('../package.json');
const api = require('./handlers/api.js');
const newItemButtons = require('./handlers/buttons.js');

//Load the ENV variables from the .env file if not found in the process.env
if(!process.env.TOKEN) {
    console.log('ENV\'s not found. Loading dotenv...');
    require('dotenv').config();
    console.log('dotenv file loaded.');
}

const intents = new IntentsBitField();

//Create a new client and disable everyone pings
const client = new Client({ disableEveryone: true, intents: intents });

//Create a collection of commands and commandData
const commands = new Collection();
//Command data is a list of JSON objects that need to be sent to register the slash commands
const commandsData = [];

//We load all the command files and save the command and the commandData
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    //Load the file
	const command = require(`./commands/${file}`);
    //Add to command collection
	commands.set(command.info.name, command);

    //Load the commandData
    const commandData = require(`./commands/${file}`);
    var json = commandData.info.toJSON()
    commandsData.push(json);
}

//Load the rest API for registering slash commands, auto deals with rate limits
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

//Send all the slash commandData to the discord API to register the commands for the guild only
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commandsData },
		);
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

// D.JS Client listeners
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on('reconnecting', () => console.log('Reconnecting WS...'));
client.on('disconnect', () => {
    console.log('Disconnected, trying to restart...');
    process.exit();
});

client.on("ready", async() => {
    console.log("Ready and online.")
    console.log("Chibisafe Bot v"+ pjson.version);
    apiStatus = await api.checkAuth();
    console.log("API Status: " + apiStatus);
    api.startLoop(client);
    api.setLoopState(true);
});

//Listen for commands coming from chat and context menus
client.on('interactionCreate', async interaction => {
	if (!(interaction.isChatInputCommand())) return;

    if(interaction.inGuild()){
        await interaction.reply({ content: 'Sorry, I only respond to direct messages.', ephemeral: true })
        return;
    }

    //Find the commands we want to run
	const command = commands.get(interaction.commandName);

	if (!command) return;

	try {
        //Run the command
		await command.run(interaction, client);
	} catch (error) {
		console.error(error);
		try{
			await interaction.reply({ content: `Oops, seem I encountered an error. Get my devs to have a look!\n\n\`\`\`${error}\`\`\``, ephemeral: true });
		}
		catch(e){
			await interaction.editReply({ content: `Oops, seem I encountered an error. Get my devs to have a look!\n\n\`\`\`${error}\`\`\``, ephemeral: true });
		}
	}
});

//Listen for commands coming from autocomplete
client.on('interactionCreate', async interaction => {
	if (!(interaction.isAutocomplete())) return;

    if(interaction.inGuild()){
        await interaction.reply({ content: 'Sorry, I only respond to direct messages.', ephemeral: true })
        return;
    }

    //Find the commands we want to run
	const command = commands.get(interaction.commandName);

	if (!command) return;

	try {
        //Run the command
		await command.autoComplete(interaction, client);
	} catch (error) {
		console.error(error);
		try{
			await interaction.reply({ content: `Oops, seem I encountered an error. Get my devs to have a look!\n\n\`\`\`${error}\`\`\``, ephemeral: true });
		}
		catch(e){
			await interaction.editReply({ content: `Oops, seem I encountered an error. Get my devs to have a look!\n\n\`\`\`${error}\`\`\``, ephemeral: true });
		}
	}
});

//Listen for commands coming from buttons or modals
client.on('interactionCreate', async interaction => {
	if (!(interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu())) return;

    if(interaction.inGuild()){
        await interaction.reply({ content: 'Sorry, I only respond to direct messages.', ephemeral: true })
        return;
    }

    if(interaction.customId.split('.')[0] == "api"){
        await newItemButtons.handle(interaction, client);
    }

    //Find the commands we want to run
	const command = commands.get(interaction.customId.split('.')[0]);

	if (!command) return;

	try {
        //Run the command
		await command.callButton(interaction, client);
	} catch (error) {
		console.error(error);
		try{
			await interaction.reply({ content: `Oops, seem I encountered an error. Get my devs to have a look!\n\n\`\`\`${error}\`\`\``, ephemeral: true });
		}
		catch(e){
			await interaction.editReply({ content: `Oops, seem I encountered an error. Get my devs to have a look!\n\n\`\`\`${error}\`\`\``, ephemeral: true });
		}
	}
});

client.login(process.env.TOKEN);