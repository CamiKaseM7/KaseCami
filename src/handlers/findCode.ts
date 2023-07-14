import { Message } from "discord.js";
import Ags from "../commands/Utility/Ags";

export async function findCode(message: Message<boolean>) {
    const words = message.content.split("\n").map(line => line.replaceAll(":", " ").replaceAll(">", " ").replaceAll("*", "").replaceAll("<", " ").split(" ")).flat();
    const regex = new RegExp(/[A-Z]+[a-z]+[A-Z]/);
    const filteredWords = words.filter(word => regex.test(word));

    const promises: Promise<string>[] = filteredWords.map(async (word) => {
        const validCode = await Ags.checkCode(word);
        if (!validCode) return "";
        let res = `Code **${word}**:\n`;
        res += await Ags.claimForAll(word);
        return res;
    });

    const results = await Promise.all(promises);
    const replyMessage = results.filter(res => res !== "").join("\n");
    if (replyMessage !== "") {
        message.reply(replyMessage);
    }
}
