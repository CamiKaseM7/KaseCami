import {
    channelMention,
    ChannelType,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    VoiceBasedChannel,
} from "discord.js";
import PlayerManager from "../../managers/PlayerManager";
import AnnonCallManager from "../../managers/AnnonCallManager";
import Command, { Category } from "../../structures/Command";
import { createAudioResource, EndBehaviorType, getVoiceConnection, StreamType } from "@discordjs/voice";
import { BlockedUserModel } from "../../database/models/BlockedUserModel";

export default class Call extends Command {
    public readonly category = Category.Voice;
    private readonly playerManager = PlayerManager.getInstance();
    private readonly annonCallManager = AnnonCallManager.getInstance();

    public async slashExecutor(interaction: ChatInputCommandInteraction): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "create":
                return this.callCreate(interaction);
            case "join":
                return this.callJoin(interaction);
            case "next":
                return this.callNext(interaction);
            case "delete":
                return this.callDelete(interaction);
            default:
                throw new Error("Unknown subcommand");
        }
    }

    private async callCreate(interaction: ChatInputCommandInteraction): Promise<any> {
        const memberId = interaction.user.id;
        const member = await interaction.guild!.members.fetch(memberId);

        const channel = member.voice.channel ?? interaction.options.getChannel("channel");
        if (!channel) return interaction.reply("Tienes que estar en un canal de voz o seleccionar uno!");

        const existingCall = this.annonCallManager.getByGuildId(interaction.guildId!);
        if (existingCall)
            return interaction.reply(
                `Ya existe una llamada para este servidor\nid: ${
                    existingCall.callId
                }\nchannel: ${channelMention(existingCall.channelId)}`
            );
        const player = this.playerManager.getOrCreate(interaction.guildId!);
        player.connect(channel);

        const call = this.annonCallManager.create(interaction.guildId!, channel.id);
        interaction.reply(`Call **${call.callId}** created.`);
    }

    private async callJoin(interaction: ChatInputCommandInteraction): Promise<any> {
        const userId = interaction.user.id;
        const member = await interaction.guild!.members.fetch(userId);
        const callId = interaction.options.getString("call-id", true);

        const channel = member.voice.channel ?? interaction.options.getChannel("channel");
        if (!channel) return interaction.reply("Tienes que estar en un canal de voz o seleccionar uno!");

        const call = this.annonCallManager.getByCallId(callId);
        if (!call) return interaction.reply("llamada no encontrada!");

        if (call.guildId == interaction.guildId!)
            return interaction.reply("No puedes unirte a esta llamada, es de este mismo servidor");

        const index = call.annonQueue.findIndex((element) => {
            return element.userId == userId;
        });

        if (index >= 0)
            return interaction.reply(
                `Ya estas en la cola\nposicion **${index + 1}**\ncanal ${channelMention(
                    call.annonQueue[index].channelId
                )}`
            );

        call.annonQueue.push({ guildId: member.guild!.id, channelId: channel.id, userId });
        interaction.reply(`Tu posicion en la cola: ${call.annonQueue.length}`);
    }

    private async callNext(interaction: ChatInputCommandInteraction): Promise<any> {
        const call = this.annonCallManager.getByGuildId(interaction.guildId!);
        if (!call) return interaction.reply("No existen llamadas para este servidor");

        try {
            if (call.annonCurrent) getVoiceConnection(call.annonCurrent.guildId)?.destroy();
        } catch (err) {
            console.log(err);
        }

        const next = call.annonQueue.shift();
        if (!next) return interaction.reply("No quedan mas personas en la cola");

        const blockedUser = await BlockedUserModel.findOne({ userId: next.userId });
        if (blockedUser) return interaction.reply("El usuario actual está bloqueado");

        console.log(next);
        // annon
        const annonGuild = await this.client.guilds.fetch(next.guildId);
        const annonChannel = await annonGuild.channels.fetch(next.channelId);

        const annonPlayer = this.playerManager.getOrCreate(next.guildId);
        const annonConnection = annonPlayer.connect(annonChannel as VoiceBasedChannel);

        call.annonCurrent = next;
        this.annonCallManager.guildInfos.set(call.guildId, call);

        // host
        const hostGuild = await this.client.guilds.fetch(call.guildId);
        const hostChannel = await hostGuild.channels.fetch(call.channelId);

        const hostPlayer = this.playerManager.getOrCreate(call.guildId);
        const hostConnection = hostPlayer.connect(hostChannel as VoiceBasedChannel);

        // call
        const annonReceiver = annonConnection.receiver;
        const mainReceiver = hostConnection.receiver;

        annonReceiver.speaking.on("start", (userId) => {
            const subscription = annonReceiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterInactivity,
                    duration: 100,
                },
            });

            const audioResource = createAudioResource(subscription, {
                inputType: StreamType.Opus,
            });

            hostPlayer.play(audioResource);
        });

        mainReceiver.speaking.on("start", (userId) => {
            const subscription = mainReceiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterInactivity,
                    duration: 100,
                },
            });

            const audioResource = createAudioResource(subscription, {
                inputType: StreamType.Opus,
            });

            annonPlayer.play(audioResource);
        });

        interaction.reply(`Siguiente...\nQuedan ${call.annonQueue.length} persona/s en la cola`);
    }

    private callDelete(interaction: ChatInputCommandInteraction): any {
        const existing = this.annonCallManager.delete(interaction.guildId!);
        if (!existing) return interaction.reply("No hay ninguna llamada creada para este servidor");
        interaction.reply(`LLamada de id **${existing.callId}** borrada`);
    }

    public commandBuilder(): Partial<SlashCommandBuilder> {
        return new SlashCommandBuilder()
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
            .setDMPermission(false)
            .setName("call")
            .setDescription("manage/join annonymous calls")
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("create")
                    .setDescription("create a call")
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription("host channel for call")
                            .setRequired(false)
                            .addChannelTypes(ChannelType.GuildVoice)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("join")
                    .setDescription("join a call")
                    .addStringOption((option) =>
                        option
                            .setName("call-id")
                            .setDescription("the ID of the call to join")
                            .setRequired(true)
                    )
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription("channel for call")
                            .setRequired(false)
                            .addChannelTypes(ChannelType.GuildVoice)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand.setName("next").setDescription("makes the next user join the call")
            )
            .addSubcommand((subcommand) =>
                subcommand.setName("delete").setDescription("deletes call on this server")
            );
    }
}
