import {
    ChatInputCommandInteraction,
    CacheType,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
} from "discord.js";
import Command, { Category } from "../../structures/Command";

export default class Eval extends Command {
    readonly category = Category.Root;

    public async slashExecutor(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const code = interaction.options.getString("code", true);

        let result: any;
        try {
            await eval(`result = (async () => {${code}})()`);
        } catch (err) {
            result = `Error: ${err}`;
        }
        result = await result;

        const embed = new EmbedBuilder()
            .setTitle("Eval command")
            .setDescription(`**code:** \`\`\`js\n${code}\`\`\`\n**with result:** \`\`\`js\n${result}\`\`\``);

        await interaction.reply({ embeds: [embed] });
    }
    public commandBuilder(): Partial<SlashCommandBuilder> {
        return new SlashCommandBuilder()
            .setName("eval")
            .setDescription("Evals command")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDMPermission(false)
            .addStringOption((option) =>
                option.setName("code").setDescription("code to run").setRequired(true)
            );
    }
}
