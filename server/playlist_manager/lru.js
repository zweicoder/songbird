const LRU = limit => {
  const data = {};
  const q = [];
  const _lru = {
    promote: function(key) {
      const idx = q.indexOf(key);
      const _key = q.splice(idx, 1)[0];
      q.push(_key);
    },
    get: function(key) {
      if (data[key]) {
        this.promote(key);
      }
      return data[key];
    },
    set: function(key, value) {
      if (data[key]) {
        this.promote(key);
        data[key] = value;
      }
      if (q.length >= limit) {
        const key = q.splice(0, 1)[0];
        delete data[key];
      }
      q.push(key);
      data[key] = value;
      return;
    },
    _inspect() {
      console.log('Data: ', data);
      console.log('Queue: ', q);
    }
  };
  return _lru;
};

module.exports = LRU;
