import { Collection } from "discord.js";
import VoicePlayer from "../commands/Voice/VoicePlayer";

export default class PlayerManager extends Collection<string, VoicePlayer> {
    private readonly cleanInterval = 1_000 * 60 * 5;
    private static instance: PlayerManager | null = null;

    private constructor() {
        super();

        setInterval(() => {
            this.clean();
        }, this.cleanInterval);
    }

    public static getInstance(): PlayerManager {
        if (this.instance) return this.instance;
        this.instance = new this();
        return this.instance;
    }

    public getOrCreate(guildId: string): VoicePlayer {
        const res = this.get(guildId);

        if (res == undefined || res.isStoped()) {
            res?.disconnect();
            return this.create(guildId);
        }

        return res;
    }

    public create(guildId: string): VoicePlayer {
        const player = new VoicePlayer(guildId);
        player.on("error", (error) => {
            console.error(error);
        });
        this.set(guildId, player);
        return player;
    }

    public clean(): void {
        this.sweep((v) => v.isStoped());
    }
}
