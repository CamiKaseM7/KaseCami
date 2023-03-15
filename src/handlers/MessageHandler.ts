import { ClientEvents, Events } from "discord.js";
import EventHandler from "../structures/EventHandler";

export default class MessageHandler extends EventHandler<Events.MessageCreate> {
    public handle(args: ClientEvents[Events.MessageCreate]): void {
        const [message] = args;
        if (message.author.bot) return;

        const prefix = this.client.prefix;
        if (!message.content.startsWith(prefix)) return;
        const msgArgs = message.content.split(" ");
        const commandName = msgArgs.shift()!.slice(prefix.length);

        const command = this.client.commands.get(commandName);
        if (command == undefined) return;

        try {
            if (!command.messageExecutor) return;
            const result = command.messageExecutor(message, msgArgs);
            if (!result) return;

            result.catch((err) => {
                console.log(err);
                message.reply("Ocurrio un error el ejecutar ese comando.");
            });
        } catch (err) {
            console.log(err);
            message.reply("Ocurrio un error el ejecutar ese comando.");
        }
    }
}
