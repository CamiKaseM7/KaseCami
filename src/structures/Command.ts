import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
} from "discord.js";
import DiscordClient from "./Client";

export enum Category {
    Voice = "Voice",
    Moderation = "Moderation",
    Utils = "Utils",
    Fun = "Fun",
    Config = "Config",
    Games = "Games",
}

export default abstract class Command {
    readonly category: Category | undefined;
    readonly client: DiscordClient;

    constructor(client: DiscordClient) {
        this.client = client;
    }

    public getCategory() {
        return this.category;
    }

    public abstract slashExecutor(interaction: ChatInputCommandInteraction): Promise<void> | void;
    public messageExecutor?(message: Message, args: string[]): Promise<void> | void;
    public abstract commandBuilder(): Partial<SlashCommandBuilder>;
    public autocomplete(interaction: AutocompleteInteraction): Promise<void> | void {
        throw new Error(`Autocomplete not implemented for ${interaction.commandName}`);
    }
}
