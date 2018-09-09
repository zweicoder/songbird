const logger = require('./logger.js');

// Max time limit for all retries combined
const MAX_TIME_LIMIT = 5 * 60 * 1000;

function delayExecution(fn, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(fn());
    }, delay);
  });
}

async function timeout(fn, timeLimit) {
  const resultPromise = fn();
  let t;
  const timeoutPromise = new Promise((resolve, reject) => {
    t = setTimeout(() => {
      // This still continues to execute after its timeout, so don't log here or it's misleading
      // not sure if this _might_ cause problems in the future /shrugs
      reject('Execution timed out!');
    }, timeLimit);
  });
  return await Promise.race([resultPromise, timeoutPromise]).then(res => {
    // Clear timeout to prevent weird stuff happening / waiting after finishing everything
    clearTimeout(t);
    return res;
  });
}

async function handleRetryAfter(promiseFactory) {
  async function doRetries() {
    while (true) {
      try {
        return await promiseFactory();
      } catch (err) {
        if (
          err.response &&
          err.response.headers &&
          err.response.headers['retry-after']
        ) {
          const delay = parseInt(err.response.headers['retry-after']) * 1000;
          await delayExecution(() => {}, delay);
          logger.info('Retrying...');
          continue;
        }

        logger.error('No Retry-After header found!');
        logger.error('%o', err.response);
        throw err;
      }
    }
  }
  return await timeout(doRetries, MAX_TIME_LIMIT);
}

module.exports = {
  handleRetryAfter,
  delayExecution,
  timeout,
};
