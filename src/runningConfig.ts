import { SayFn, SlashCommand } from "@slack/bolt";
import initialRunningConfig from "./data/initialRunningConfig.json"
import log4js from "log4js";
import { getUserMentionLiteral } from "./util";


interface RunningConfigData{
	maxRemaining: number,
	invalidList: string[]
}

export class RunningConfig{
	private configData: RunningConfigData;
	public get data(){
		return this.configData;
	}

	public constructor(){
		this.configData = initialRunningConfig
	}

	public toJson(): string{
		return JSON.stringify(this.configData, null, 4);
	}

	public tryReset(dataJson: string): boolean{
		try {
			const convertedData: RunningConfigData = JSON.parse(dataJson);
			this.configData = convertedData;
		}catch (e: unknown){
			log4js.getLogger().error(e);
			return false;
		}
		return true;
	}

	public onCommandConfig(command: SlashCommand, say: SayFn){
		const resultOfReset = this.tryReset(command.text);
		const userLiteral = getUserMentionLiteral(command.user_id);

		//const currentConfig = "```" + this.toJson() + "```";
		const currentConfig = this.toJson();
		
		if (resultOfReset===true){
			say(userLiteral + " changed config: \n" + currentConfig);
		}else{
			say(userLiteral + " failed to change config.\ncurrent config: \n" + currentConfig);
		}
	}
}

