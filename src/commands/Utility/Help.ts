import {
    chatInputApplicationCommandMention,
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
} from "discord.js";
import Command from "../../structures/Command";

export default class Help extends Command {
    public async slashExecutor(interaction: ChatInputCommandInteraction): Promise<void> {
        this.executor(interaction);
    }

    public async messageExecutor(message: Message, _args: string[]): Promise<void> {
        this.executor(message);
    }

    private executor(_caller: Message | ChatInputCommandInteraction) {
        const commands = this.client.commands;

        const options = commands.map((command) => {
            const usage = command.commandBuilder().options?.map((option) => {
                const optionJSON = option.toJSON();
                return optionJSON.required ? `<${optionJSON.name}>` : `[${optionJSON.name}]`;
            });

            chatInputApplicationCommandMention(command.commandBuilder().name!, "");

            return `${command.commandBuilder().name} ${usage?.join(" ")}`;
        });

        console.log(options);
    }

    public commandBuilder(): Partial<SlashCommandBuilder> {
        return new SlashCommandBuilder().setDMPermission(true).setName("help").setDescription("get help");
    }
}
