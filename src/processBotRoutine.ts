import { App, GenericMessageEvent } from "@slack/bolt";
import Config from "./config.json";
import EmojiRouletteController from "./emojiRouletteController";
import SlackActionWrapper from "./slackActionWrapper";
import log4js from "log4js";
import { getUserMentionText as getUserMentionLiteral } from "./util";
import CommandNaming from "./commandRegister";

export async function processBotRoutine(){
    const app: App = new App({
        token: Config.botToken,
        appToken: Config.appToken,

        socketMode: true
    });

    const slackAction = new SlackActionWrapper(app, Config)
    await slackAction.postMessage("Initializing...")

    const roulette = new EmojiRouletteController(slackAction);

    app.event("message", async ({event, say}) =>{
        const messageEvent: GenericMessageEvent = event as GenericMessageEvent
        if (messageEvent.subtype!==undefined && messageEvent.subtype==="message_changed") return;
        roulette.onDrivenMessage(messageEvent.channel, messageEvent.ts);
        console.log("###")
        console.log(event);
    });

    const commandNaming = new CommandNaming(Config.botName);
    app.command(commandNaming.getName("invite"), async ({ command, ack, say }) => {
        log4js.getLogger().info(commandNaming.getName("invite"))
        slackAction.joinCahnnel(command.channel_id)
        await ack();
    });
    app.command(commandNaming.getName("kick"), async ({ command, ack, say }) => {
        log4js.getLogger().info(commandNaming.getName("kick"))
        slackAction.leaveCahnnel(command.channel_id)
        await ack();
    });

    await roulette.restartRoulette();

    await app.start();

    log4js.getLogger().info("Bolt app is running up.");
}


