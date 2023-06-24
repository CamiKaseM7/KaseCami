import {
    chatInputApplicationCommandMention,
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import Command, { Category } from "../../structures/Command";

export default class Help extends Command {
    readonly onlySlash = false;

    public async slashExecutor(interaction: ChatInputCommandInteraction): Promise<void> {
        this.executor(interaction);
    }

    public async messageExecutor(message: Message, _args: string[]): Promise<void> {
        this.executor(message);
    }

    private executor(caller: Message | ChatInputCommandInteraction) {
        const commands = this.client.commands;
        const commandIds = this.client.commandIds;

        const options = commands.filter((command) => command.category != Category.Root).map((command) => {
            const usage = command.commandBuilder().options?.map((option, index, array) => {
                const optionJSON = option.toJSON();

                if (option instanceof SlashCommandSubcommandBuilder) {
                    let res = index == 0 ? `<${optionJSON.name}` : `| ${optionJSON.name}`;
                    if (array.length - 1 == index) res += ">";
                    return res;
                }
                return optionJSON.required ? `<${optionJSON.name}>` : `[${optionJSON.name}]`;
            });
            
            const commandName = command.commandBuilder().name!
            const commandId = commandIds.get(commandName)!;

            const commandMention = chatInputApplicationCommandMention(commandName, commandId);
            return `${commandMention} ${usage?.join(" ")}`;
        });

        caller.reply(options.join("\n"));
    }

    public commandBuilder(): Partial<SlashCommandBuilder> {
        return new SlashCommandBuilder().setDMPermission(true).setName("help").setDescription("get help");
    }
}
