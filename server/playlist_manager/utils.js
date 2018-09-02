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
  const timeoutPromise = delayExecution(() => {
    logger.info('TIMED OUT!');
    throw new Error('Function timed out!');
  }, timeLimit);
  return await Promise.race([resultPromise, timeoutPromise]);
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
        logger.error('%o', err.response.headers);
        throw err;
      }
    }
  }
  return await timeout(doRetries, MAX_TIME_LIMIT);
}

module.exports = {
  handleRetryAfter,
};
