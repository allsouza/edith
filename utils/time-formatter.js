class TimeFormatter {
  static getDifference(start, end) {
    start = new Date(start);
    end = new Date(end);

    let elapsedTime = (end - start) / 1000;
    return this.toString(elapsedTime);
  }

  static createdAt(start, end) {
    const elapsedTime = this.getDifference(start, end);
    return `${new Date(start).toDateString()} _(${elapsedTime} ago)_`;
  }

  static avgClosingTime(dbData, prData) {
    let count = 0;
    let avg = 0;
    if (dbData) {
      count = dbData.count;
      avg = isNaN(dbData.avg_close_in_secs) ? 0 : dbData.avg_close_in_secs;
    }
    const timeElapsed = (new Date() - new Date(prData.value.created_at)) / 1000;
    return Math.floor((count * avg + timeElapsed) / (count + 1.0));
  }
  
  static avgFirstInteractionTime(dbData, prData) {
    debugger
    let count = 0;
    let avg = 0;
    if (dbData) {
      count = dbData.count;
      avg = isNaN(dbData.avg_first_interaction_in_secs) ? 0 : dbData.avg_first_interaction_in_secs;
    }
    const timeElapsed = (new Date() - new Date(prData.created_at)) / 1000;
    return Math.floor((count * avg + timeElapsed) / (count + 1.0));
  }
  
  static toString(time) {
    let result;
        if (time < 120) {
      result = `${Math.floor(time)} seconds`;
    } else if (time < 7200) {
      result = `${Math.floor(time / 60)} minutes`;
    } else {
      result = `${Math.floor(time / 3600)} hours`;
    }
    return result;
  }
}

module.exports = { TimeFormatter };
