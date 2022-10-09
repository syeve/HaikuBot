const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
const { clientId, guildId, token, generalDiscordId } = require('./config.json');

var pronouncing = require('pronouncing');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

    switch(commandName) {
        case 'ping':
            await interaction.reply('Pong');
            break;
        case 'haiku':
            haikuBuilder(generalDiscordId); // general
            break;
    }
});

client.login(token);

// 5, 7, 5
async function haikuBuilder(channelID) {

    const preparing = client.channels.cache.get(channelID);
    preparing.send('Building haiku...');

    const channel = client.channels.cache.get(channelID);
    var messages = [];
    var lineOne = [];
    var lineTwo = [];
    var lineThree = [];

    var result = '';

    // create message pointer
    let message = await channel.messages
        .fetch({ limit: 1 })
        .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

    while (message) {
        await channel.messages
        .fetch({ limit: 100, before: message.id })
        .then(messagePage => {
            messagePage.forEach(msg => messages.push(msg));

            // update our message pointer to be last message in page of messages
            message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        })
    }

    // go through each message
    for (var i = 0; i < messages.length; i++) {
        var curMsg = (messages[i]['content'].split('-')[0]).split(' ');
        var sum = 0

        // count the syllables of the current message
        for (var j = 0; j < curMsg.length; j++) {
            if (curMsg[j]) {
                var syllables = pronouncing.syllableCount(pronouncing.phonesForWord(curMsg[j])[0])
                sum += syllables
            }
        }

        // if the cur message has 5 syllabes, add it to lines one and three
        if (sum == 5) {
            var msg = curMsg.join(' ');
            lineOne.push(msg);
            lineThree.push(msg);
        } // if 7, add to line two
        else if (sum == 7) {
            var msg = curMsg.join(' ');
            lineTwo.push(msg);
        }
    }

    var line1 = lineOne[Math.floor(Math.random()*lineOne.length)];
    var line2 = lineTwo[Math.floor(Math.random()*lineTwo.length)];
    var line3 = lineOne[Math.floor(Math.random()*lineOne.length)];

    result += line1 + '\n' + line2 + '\n' + line3 + '\n';

    const sendToChannel = client.channels.cache.get(channelID);
    sendToChannel.send(result);
}


