import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../../structures/Command";
import { UserModel } from "../../database/models/UserModel";
import { User } from "../../database/interfaces/UserInterface";

// enum AgsResponses {
//     INVALID_CODE = "El código no es válido.",
//     MAX_USES = "Este código llegó a su límite de usos.",
//     ALREADY_CLAIMED = "Este reward se puede usar solo 1 vez por entrada.",
//     INVALID_TOKEN = "Tenes que estar logeado para poder canjear un código.",
// }

export default class Ags extends Command {
    readonly onlySlash = true;

    public async slashExecutor(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand == "claim") return this.claimCommand(interaction);
        else return this.linkCommand(interaction);
    }

    public async claimCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const code = interaction.options.getString("code", true);
        // const user = await UserModel.findOne({ userId: interaction.user.id });

        // if (!user || !user.agsToken) {
        //     interaction.reply({content: "Primero tenes que linkear tu cuenta!", ephemeral: true});
        //     return;
        // }

        const msg = await this.claimForAll(code);
        interaction.reply(msg);
    }

    private async claimForAll(code: string): Promise<string> {
        const users: User[] = await UserModel.find({ agsToken: { $ne: null } });

        const promises: Promise<string>[] = users.map(async (user) => {
            const res = await this.claim(user.agsToken!, code);
            let msg = `<@${user.userId}>: ${res}\n`

            // if (res == AgsResponses.ALREADY_CLAIMED)    msg += "**ya canjeó el codigo**\n";
            // else if (res == AgsResponses.INVALID_CODE)  msg += "**codigo invalido**\n";
            // else if (res == AgsResponses.MAX_USES)      msg += "**alcanzo el limite de usos**\n";
            // else if (res == AgsResponses.INVALID_TOKEN) msg += "**token invalido**\n";
            // else msg += "**canjeado con exito**\n";

            return msg;
        });

        const results = await Promise.all(promises);
        return results.join("");
    }

    private async claim(token: string, code: string): Promise<string> {
        const data = await fetch(`https://app.argentinagameshow.com/custom/ajax/reward2.php?action=code&code=${code}`, {
            headers: {
                'Cookie': `PHPSESSID=${token}`
            }
        })

        const json: {text: string} = await data.json();
        return json.text;
    }

    public async linkCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const token = interaction.options.getString("token", true);
        const userid = interaction.user.id;

        const validToken = await this.checktoken(token);
        if (!validToken) {
            interaction.reply({content: "Token invalido", ephemeral: true});
            return;
        }

        await UserModel.findOneAndUpdate({ userId: userid }, { agsToken: token }, { upsert: true, setDefaultsOnInsert: true });
        interaction.reply({content: "Tu cuenta de AGS ha sido linkeada con exito!", ephemeral: true});
    }

    private async checktoken(token: string): Promise<boolean> {
        const res = await this.claim(token, "asd");
        return res == "El código no es válido.";
    }

    public commandBuilder(): Partial<SlashCommandBuilder> {
        return new SlashCommandBuilder()
            .setDMPermission(true)
            .setName("ags")
            .setDescription("reclama codigos de la ags")
            .addSubcommand(subcommand =>
                subcommand
                    .setName('claim')
                    .setDescription('reclama codigos de la ags')
                    .addStringOption(option => 
                        option.setName('code')
                            .setRequired(true)
                            .setDescription('codigo a reclamar')))
            
            .addSubcommand(subcommand =>
                subcommand
                    .setName('link')
                    .setDescription('linkea tu cuenta de AGS')
                    .addStringOption(option => 
                        option.setName('token')
                            .setRequired(true)
                            .setDescription('tu token de la pagina de la AGS')))
    }
}
