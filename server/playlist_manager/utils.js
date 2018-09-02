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
    throw new Error('Function timed out!');
  }, timeLimit);
  return Promise.race([resultPromise, timeoutPromise]);
}

// Max time limit for execution
const MAX_TIME_LIMIT = 5 * 60 * 1000;
async function handleRetryAfter(promiseFactory) {
  async function doRetries() {
    while (True) {
      try {
        await promiseFactory();
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
        logger.error('%o', err.stack);
        return;
      }
    }
  }
  return await timeout(doRetries, MAX_TIME_LIMIT);
}

module.exports = {
  handleRetryAfter,
};
