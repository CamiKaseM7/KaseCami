import { ChatInputCommandInteraction, CacheType, SlashCommandBuilder } from "discord.js";
import { BlockedUserModel } from "../../database/models/BlockedUserModel";
import Command, { Category } from "../../structures/Command";

export default class Block extends Command {
    readonly category = Category.Root;

    public async slashExecutor(interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {
        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason", false);

        const blockedUser = await BlockedUserModel.findOne({ userId: user.id });
        if (blockedUser) return interaction.reply("User already blocked.");
        await BlockedUserModel.create({ userId: user.id, reason });
        interaction.reply(`**${user.username}** blocked with reason: \n>>> ${reason}`);
    }
    public commandBuilder(): Partial<SlashCommandBuilder> {
        return new SlashCommandBuilder()
            .setDMPermission(false)
            .setName("block")
            .setDescription("Block user from using the bot")
            .addUserOption((option) =>
                option.setName("user").setDescription("user to block").setRequired(true)
            )
            .addStringOption((option) =>
                option.setName("reason").setDescription("reason of the block").setRequired(false)
            );
    }
}
