import { App, GenericMessageEvent } from "@slack/bolt";
import Config from "./config.json";
import EmojiRouletteController from "./emojiRouletteController";
import SlackActionWrapper from "./slackActionWrapper";
import log4js from "log4js";
import { getUserMentionLiteral as getUserMentionLiteral } from "./util";
import CommandNaming from "./commandRegister";
import { RunningConfig } from "./runningConfig";

export async function processBotRoutine(){
    const app: App = new App({
        token: Config.botToken,
        appToken: Config.appToken,

        socketMode: true
    });

    const slackAction = new SlackActionWrapper(app, Config)
    await slackAction.postMessage("Initializing...")

    const runningConfig = new RunningConfig();
    const roulette = new EmojiRouletteController(slackAction, runningConfig);

    app.event("message", async ({event, say}) =>{
        console.log(event)
        const messageEvent: GenericMessageEvent = event as GenericMessageEvent
        if (messageEvent.subtype!==undefined && messageEvent.subtype==="message_changed") return;
        roulette.onDrivenMessage(messageEvent.channel, messageEvent.ts);
        console.log(event);
    });

    const commandNaming = new CommandNaming(Config.botName);
    app.command(commandNaming.getName("invite"), async ({ command, ack, say }) => {
        log4js.getLogger().info(commandNaming.getName("invite"))
        await ack();
        slackAction.joinChannel(command.channel_id)
    });
    app.command(commandNaming.getName("kick"), async ({ command, ack, say }) => {
        log4js.getLogger().info(commandNaming.getName("kick"))
        await ack();
        slackAction.leaveChannel(command.channel_id)
    });
    app.command(commandNaming.getName("config"), async ({ command, ack, say }) => {
        log4js.getLogger().info(commandNaming.getName("config"))
        await ack();
        runningConfig.onCommandConfig(command, say)
    });

    await roulette.restartRoulette();

    await app.start();

    log4js.getLogger().info("Bolt app is running up.");
}


