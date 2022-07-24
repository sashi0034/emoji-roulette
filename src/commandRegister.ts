import { App } from "@slack/bolt";

export default
class CommandNaming{
    public constructor(
        private readonly botName: string
    ){}

    public getName(actionName: string){
        return "/" + this.botName + "-" + actionName;
    }
}