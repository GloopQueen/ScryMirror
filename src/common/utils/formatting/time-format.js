/**
 * Function to take a time in milliseconds and convert it to HH:MM:SS format.
 * @param {integer} ms time in milliseconds.
 * @returns {string} The time formatted to HH:MM:SS.
 */
const msToHHMMSS = (ms) => {
  let seconds = Math.trunc(ms/1000);
  const hours = Math.trunc(seconds/3600);
  seconds = (seconds%3600);
  const minutes = Math.trunc(seconds/60);
  seconds = (seconds%60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

module.exports.msToHHMMSS = msToHHMMSS;
