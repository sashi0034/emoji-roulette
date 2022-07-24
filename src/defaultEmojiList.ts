import Emojis from "./data/emoji/slack_emoticons_to_html_unicode.json"
import log4js from 'log4js'

export default
class DefaultEmojiList{
    private readonly emojiList: string[];
    public get emojis(){
        return this.emojiList
    }
    public constructor(){
        this.emojiList = Object.keys(Emojis)
        log4js.getLogger().info("Loade default emoji.")
        console.log(this.emojiList)
    }
    public concatArray(baseArray: string[]){
        return baseArray.concat(this.emojiList, baseArray);
    }
}
