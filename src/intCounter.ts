
export default
class IntCounter{
    private totalCount = 0;
    public get count(){
        return this.totalCount;
    }

    public constructor(startCount: number){
        this.totalCount = startCount;
    }

    public addCount(){
        this.totalCount++;
    }

    public subtractCount(){
        this.totalCount--;
    }
    
    public reset(){
        this.totalCount = 0;
    }

    public resetBy(count: number){
        this.totalCount = count;
    }
}