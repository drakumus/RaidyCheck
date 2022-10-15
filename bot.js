const fs = require('node:fs');
const path = require('node:path');
console.log(process.env)
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Collection } = require('discord.js');
const token = process.env.BOT_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

console.log(token)
// Login to Discord with your client's token
client.login(token);

client.on('interactionCreate', async interaction => {
	if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if(!command) { return; }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
        }
    } else if (interaction.isModalSubmit()) {
        const command = interaction.client.commands.get(interaction.customId);
        if(!command) { return; }
        try {
            await command.modalRespond(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
        }
    } else if (interaction.isSelectMenu()) {
        const command = interaction.client.commands.get(interaction.customId);
        if(!command) { return; }
        try {
            await command.selectRole(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
        }
    } else {
        return;
    }
});