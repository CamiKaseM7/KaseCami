import { Events, IntentsBitField, Partials } from "discord.js";
import dotenv from "dotenv";

import DiscordClient from "./structures/Client";

import Help from "./commands/Utility/Help";
import Ping from "./commands/Utility/Ping";
import Tts from "./commands/Voice/TTS/Tts";
import TtsStop from "./commands/Voice/TTS/TtsStop";
import Call from "./commands/Voice/Call";

import InteractionHandler from "./handlers/InteractionHandler";
import MessageHandler from "./handlers/MessageHandler";
import { connectToDatabase } from "./database/connectToDatabase";
import Block from "./commands/Root/Block";

// import { generateDependencyReport } from "@discordjs/voice";

dotenv.config();

const intents = [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildVoiceStates,
];

const partials = [Partials.Message, Partials.Channel, Partials.Reaction];

const client = new DiscordClient(process.env.PREFIX ?? "¿", intents, partials);

connectToDatabase();

client.addCommand(new Ping(client));
client.addCommand(new Help(client));

client.addCommand(new Tts(client));
client.addCommand(new TtsStop(client));
client.addCommand(new Call(client));

client.addCommand(new Block(client));

client.registerEventHandler(Events.InteractionCreate, new InteractionHandler(client));
client.registerEventHandler(Events.MessageCreate, new MessageHandler(client));

client.login(process.env.CLIENT_TOKEN ?? "");

client.once(Events.ClientReady, (client) => {
    // console.log(generateDependencyReport());
    console.log(`Bot ${client.user.username} is ready.`);
    (client as DiscordClient).deployCommands(process.env.TEST_SERVERS?.split("/") ?? []);
});
