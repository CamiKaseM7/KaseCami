type queueElement = {
    guildId: string;
    channelId: string;
    userId: string;
};

type callInfo = {
    annonQueue: queueElement[];
    annonCurrent?: queueElement;
    channelId: string;
    guildId: string;
    callId: string;
};

export default class AnnonCallManager {
    public readonly guildInfos: Map<string, callInfo> = new Map<string, callInfo>();
    public readonly callInfos: Map<string, string> = new Map<string, string>();
    private static instance: AnnonCallManager | null = null;

    public static getInstance(): AnnonCallManager {
        if (this.instance) return this.instance;
        this.instance = new this();
        return this.instance;
    }

    public getByGuildId(guildId: string): callInfo | undefined {
        return this.guildInfos.get(guildId);
    }

    public getByCallId(callId: string): callInfo | undefined {
        const guildId = this.callInfos.get(callId);
        if (!guildId) return undefined;
        return this.guildInfos.get(guildId);
    }

    public create(guildId: string, channelId: string): callInfo {
        const callId = this.generateId(5);
        const call = {
            annonQueue: [],
            channelId,
            guildId,
            callId,
        };

        this.guildInfos.set(guildId, call);
        this.callInfos.set(callId, guildId);

        return call;
    }

    public delete(guildId: string): callInfo | undefined {
        const existing = this.guildInfos.get(guildId);
        if (!existing) return undefined;

        this.guildInfos.delete(guildId);
        this.callInfos.delete(existing.callId);

        return existing;
    }

    private generateId(length: number): string {
        let res = "";
        for (let _ = 0; _ < length; _++) {
            const chars = "0123456789abcdef";
            const char = chars[Math.floor(Math.random() * chars.length)];
            res += char;
        }
        return res;
    }
}
