const trace = e => {
  console.log('trace: ');
  console.log(e);
  return e;
};

// Wraps Express route to call `next(err)` on uncaught exception
const wrapRoute = fn => (...args) => fn(...args).catch(args[2]);
module.exports = {
  trace,
  wrapRoute,
};
