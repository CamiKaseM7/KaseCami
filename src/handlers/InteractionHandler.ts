import { AutocompleteInteraction, ChatInputCommandInteraction, ClientEvents, Events } from "discord.js";
import EventHandler from "../structures/EventHandler";

export default class InteractionHandler extends EventHandler<Events.InteractionCreate> {
    public handle(args: ClientEvents[Events.InteractionCreate]): void {
        const [interaction] = args;

        if (interaction.isCommand()) return this.handleCommand(interaction as ChatInputCommandInteraction);
        if (interaction.isAutocomplete())
            return this.handleAutocomplete(interaction as AutocompleteInteraction);
    }

    private handleAutocomplete(interaction: AutocompleteInteraction) {
        const commandName = interaction.commandName;

        const command = this.client.commands.get(commandName);
        if (command == undefined) return;

        try {
            const result = command.autocomplete!(interaction);
            if (!result) return;

            result.catch((err) => {
                console.log(err);
                interaction.respond([]);
            });
        } catch (err) {
            console.log(err);
            interaction.respond([]);
        }
    }

    private handleCommand(interaction: ChatInputCommandInteraction) {
        const commandName = interaction.commandName;

        const command = this.client.commands.get(commandName);
        if (command == undefined) return;

        try {
            const result = command.slashExecutor(interaction);
            if (!result) return;

            result.catch((err) => {
                console.log(err);
                interaction.reply("Ocurrio un error al ejecutar ese comando.");
            });
        } catch (err) {
            console.log(err);
            interaction.reply("Ocurrio un error el ejecutar ese comando.");
        }
    }
}
