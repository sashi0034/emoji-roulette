
import SlackActionWrapper from "./slackActionWrapper"
import { makeZeroPadding, sleep } from "./util";
import log4js from 'log4js'
import DefaultEmojiList from "./defaultEmojiList";
import IntCounter from "./intCounter";
import { RunningConfig } from "./runningConfig";

type BlockTextList = ({
    type: string; text: {
        type: string;
        text: string;
        emoji?: boolean;
    };
} | { type: string; })[]

class PostedMessageInfo{
    public constructor(
        public readonly timeStamp: string | undefined
    ){}
    public isValid(){
        return this.timeStamp != undefined;
    }
}

export default
class EmojiRouletteController{
    private emojiList: string[] = []
    private readonly defaultEmojiList: DefaultEmojiList = new DefaultEmojiList();
    private get maxRemainingCount(){
        return this.runningConfig.data.maxRemaining
    }
    private remainingCount: IntCounter;

    private postingProgressMessage: PostedMessageInfo = new PostedMessageInfo(undefined);

    constructor(
        private readonly slackAction: SlackActionWrapper,
        private readonly runningConfig: RunningConfig
    ){
        this.remainingCount = new IntCounter(this.maxRemainingCount);
    }

    public async restartRoulette(){
        await this.initEmojiMap()

        this.remainingCount.resetBy(this.maxRemainingCount);
        const postedResult = await this.postProgressCountBlock(this.maxRemainingCount);
        this.postingProgressMessage = new PostedMessageInfo(postedResult.ts);

        log4js.getLogger().info("Restarted roulette.");
    }

    private postProgressCountBlock(count: number) {
        return this.slackAction.postBlockText(this.getTextInProgressCountBlock(), this.getProgressCountBlock(count));
    }

    private getTextInProgressCountBlock(){
        return "remaining count";
    }

    private getProgressCountBlock(count: number){
        return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Remaining:    " + this.getProgressEmojiSequanceText(count),
                }
            },
            {
                "type": "divider"
            }
        ]
    }

    private getProgressEmojiSequanceText(count: number): string{
        if (count==0) return ":ghost:";
        let result = ":bomb: ";
        for (let i=0; i<count-1; ++i){
            result += ":black_cat: "
        }
        return result;
    }

    private async initEmojiMap(){
        const list = await this.slackAction.fetchEmojiList()

        this.emojiList = this.defaultEmojiList.concatArray(list);
    }

    private static getDividerBlockText(){
        const divider = {
            "type": "divider"
        };
        return divider;
    }
    
    // メッセージ受信時のイベント
    public async onDrivenMessage(channelId: string, timeStamp: string){
        if (this.remainingCount.count<=0) return;
        if (channelId===undefined || timeStamp===undefined) return;

        this.remainingCount.subtractCount();

        await this.updateProgressMessage();

        if (this.remainingCount.count>0) return;

        const list = this.popRandomEmojiList();

        for (const emoji of list){
            
            // 禁止絵文字を除外
            if (this.runningConfig.data.invalidList.includes(emoji)) continue;

            this.slackAction.addEmoji(emoji, channelId, timeStamp);
        }

        this.restartRoulette();
    }

    private async updateProgressMessage(){
        if (this.postingProgressMessage.isValid()===false) return;

        const updatingContent = this.getProgressCountBlock(this.remainingCount.count)
        await this.slackAction.updateBlockText(this.postingProgressMessage.timeStamp as string, this.getTextInProgressCountBlock(), updatingContent)
    }

    public popRandomEmojiList(){
        const numList = 20;
        const indexList: number[] = []
        for (let i=0; i<numList; ++i){
            let randomIndex = 0;
            while (true){
                randomIndex = Math.floor(Math.random() * (this.emojiList.length - 1))

                if (indexList.includes(randomIndex)===true) continue;

                const isInRange = 0<=randomIndex && randomIndex<this.emojiList.length - 1;
                if (isInRange===false) continue;

                break;
            }
            indexList.push(randomIndex);
        }
        return indexList.map(index => this.emojiList[index]);
    }

}

