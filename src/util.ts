

export function makeZeroPadding(num: number, length: number){
	return ( Array(length).join('0') + num ).slice( -length );
}

export function getUserMentionLiteral(userId: string){
	return "<@" + userId + ">";
}

export function getFileLog(fileName: string, maxLength = 4000){
	const input = require("fs").readFileSync("./fileName", "utf8");
	const result = input.slice( Math.max(0, input.length - maxLength), input.length - 1 );
	return result
}

export function sleep(time: number): Promise<void>{
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, time)
	})
}
  
