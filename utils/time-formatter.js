class TimeFormatter {
  static getDifference(start, end) {
    start = new Date(start);
    end = new Date(end);
    
    let elapsedTime = (end - start) / 1000;
    let result;
    
    if(elapsedTime < 60) {
      result = `${Math.floor(elapsedTime)} seconds ago`;
    } else if(elapsedTime < 7200) {
      result = `${Math.floor(elapsedTime/60)} minutes ago`
    } else {
      result = `${Math.floor(elapsedTime/3600)} hours ago`
    }
    
    return result;
  }
  
  static createdAt(start, end) {
    const elapsedTime = this.getDifference(start, end);
    debugger
    return `${new Date(start).toDateString()} _(${elapsedTime})_`;
  }
  
  static avgClosingTime(dbData, prData) {
    let count = 0;
    let avg = 0;
    if(dbData){
      count = dbData.count;
      avg = dbData.avg_close_in_secs;
    }
    const timeElapsed = (new Date() - new Date(prData.created_at)) / 1000;
    return Math.floor(((count * avg) + timeElapsed)/(count+1));
  }
}

module.exports = { TimeFormatter }