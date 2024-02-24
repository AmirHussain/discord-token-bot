const Discord = require('discord.js');
const { ethers } = require('ethers');
const config = require('./config.json')
const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent,
    ]
})
const prefix = '!'; // Customize your bot's prefix here
const tokenContractAddress = config.NGT; // Replace with your ERC20 token contract address
const tokenAbi = require('./abi-token.json');

// Define a map to store user addresses
const userAddressMap = new Map();

client.once('ready', (c) => {
});
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    // Command for users to add their address

    if (command === 'ngt') {
        const user = message.author;
        const address = args[0];

        // Check if the user has already added their address
        if (userAddressMap.has(user.id)) {
            message.reply(`${address} has already recieved your tokens.`);
            return;
        }

        // Validate Ethereum address format
        if (!ethers.isAddress(address)) {
            message.reply('Invalid Ethereum address.');
            return;
        }




        // Transfer ERC20 tokens to the user's address
        try {
            console.log(config.RPC,config.SECRET)
            const provider = new ethers.JsonRpcProvider(config.RPC); // Replace with your JSON RPC provider URL
            const signer = new ethers.Wallet(config.SECRET, provider); // Replace with your private key
            const contract = new ethers.Contract(tokenContractAddress, tokenAbi, signer);

            // Perform the transfer
            const amount = ethers.parseEther('1'); // Adjust the amount as needed
            const tx = await contract.transfer(address, amount);

            // Wait for the transaction to be mined
            await tx.wait();

            message.reply(`10 ERC20 tokens have been sent to your address: ${address}`);
            userAddressMap.set(user.id, address);
            console.log('scuccess',address)
        } catch (error) {
            console.error('Error sending tokens:', error);
            message.reply('An error occurred while sending tokens. Please try again later.');
            console.log('failed',address)

        }
       
    }
})

client.on('message', async message => {
    // message.reply(message.content)

});

client.login(config.DTOKEN);