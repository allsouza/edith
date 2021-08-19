class TimeFormatter {
  static getDifference(start, end) {
    start = new Date(start);
    end = new Date(end);

    let elapsedTime = (end - start) / 1000;
    let result;

    if (elapsedTime < 60) {
      result = `${Math.floor(elapsedTime)} seconds`;
    } else if (elapsedTime < 7200) {
      result = `${Math.floor(elapsedTime / 60)} minutes`;
    } else {
      result = `${Math.floor(elapsedTime / 3600)} hours`;
    }

    return result;
  }

  static createdAt(start, end) {
    const elapsedTime = this.getDifference(start, end);
    return `${new Date(start).toDateString()} _(${elapsedTime})_ ago`;
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
}

module.exports = { TimeFormatter };
