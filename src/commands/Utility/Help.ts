import {
    chatInputApplicationCommandMention,
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import Command from "../../structures/Command";

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

        const options = commands.map((command) => {
            const usage = command.commandBuilder().options?.map((option, index, array) => {
                const optionJSON = option.toJSON();

                if (option instanceof SlashCommandSubcommandBuilder) {
                    let res = index == 0 ? `<${optionJSON.name}` : `| ${optionJSON.name}`;
                    if (array.length - 1 == index) res += ">";
                    return res;
                }
                return optionJSON.required ? `<${optionJSON.name}>` : `[${optionJSON.name}]`;
            });

            chatInputApplicationCommandMention(command.commandBuilder().name!, "");

            return `/**${command.commandBuilder().name}** ${usage?.join(" ")}`;
        });

        caller.reply(options.join("\n"));
        console.log(options);
    }

    public commandBuilder(): Partial<SlashCommandBuilder> {
        return new SlashCommandBuilder().setDMPermission(true).setName("help").setDescription("get help");
    }
}
