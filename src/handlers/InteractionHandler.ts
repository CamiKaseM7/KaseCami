import { AutocompleteInteraction, ChatInputCommandInteraction, ClientEvents, Events } from "discord.js";
import { UserModel } from "../database/models/UserModel";
import EventHandler from "./EventHandler";
import { Category } from "../commands/Command";

export default class InteractionHandler extends EventHandler<Events.InteractionCreate> {
    public async handle(args: ClientEvents[Events.InteractionCreate]): Promise<void> {
        const [interaction] = args;

        const blockedUser = await UserModel.findOne({ userId: interaction.user.id, blacklisted: true });
        if (blockedUser) return;

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
        if (command.category == Category.Root && !this.client.isOwner(interaction.user.id)) return;
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
