class TimeFormatter {
  static getDifference(start, end) {
    start = new Date(start);
    end = new Date(end);
    
    let elapsedTime = (end - start) / 1000;
    let result = "Created ";
    
    if(elapsedTime < 60) {
      result += `${Math.floor(elapsedTime)} seconds ago`;
    } else if(elapsedTime < 7200) {
      result += `${Math.floor(elapsedTime/60)} minutes ago`
    } else {
      result += `${Math.floor(elapsedTime/3600)} hours ago`
    }
    
    return result;
  }
  
  static createdAtString(start, end) {
    const elapsedTime = this.getDifference(start, end);
    
  }
}

module.exports = { TimeFormatter }