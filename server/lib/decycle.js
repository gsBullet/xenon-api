const decycle = (object) => {
  const visited = new WeakMap();

  const dfs = (value, path) => {
    if (typeof value !== 'object' || value === null
      || value instanceof Boolean || value instanceof Date
      || value instanceof Number || value instanceof RegExp
      || value instanceof String
    ) return value;

    const oldPath = visited.get(value);
    if (oldPath) {
      return { $ref: oldPath };
    }

    visited.set(value, path);

    let ret;
    if (Array.isArray(value)) {
      ret = [];
      ret = value.map((elem, i) => dfs(elem, `${path}[${i}]`));
    } else {
      ret = {};
      Object.keys(value).forEach((key) => {
        ret[key] = dfs(value[key], `${path}[${key}]`);
      });
    }
    return ret;
  };

  return dfs(object, '$');
};

module.exports = decycle;
