function parse(wkt, options) {
  const debug = typeof options === "object" && options.debug === true;

  if (debug) console.log("[wktcrs] parse starting with\n", wkt);

  // move all keywords into first array item slot
  // from PARAM[12345, 67890] to ["PARAM", 12345, 67890]
  wkt = wkt.replace(/[A-Z_]+\[/gi, function (match) {
    return '["' + match.substr(0, match.length - 1) + '",';
  });

  // wrap variables in strings
  // from [...,NORTH] to [...,"NORTH"]
  wkt = wkt.replace(/, ?([A-Z_]+)/gi, function (match, p1) {
    return "," + '"' + p1 + '"';
  });

  if (typeof options === "object" && options.raw === true) {
    // replace all numbers with strings
    wkt = wkt.replace(/, ?([\.\d]+)/g, function (match, p1) {
      return "," + '"' + p1 + '"';
    });
  }

  // str should now be valid JSON
  if (debug) console.log("[wktcrs] json'd wkt: '" + wkt + "'");
  const data = JSON.parse(wkt);
  if (debug) console.log("[wktcrs] json parsed: '" + wkt + "'");

  function process(data, parent) {
    // const kw = data.shift();
    const kw = data[0];

    // after removing the first element with .shift()
    // data is now just an array of attributes

    data.forEach(function (it) {
      if (Array.isArray(it)) {
        process(it, data);
      }
    });

    const kwarr = "MULTIPLE_" + kw;

    if (kwarr in parent) {
      parent[kwarr].push(data);
    } else if (kw in parent) {
      parent[kwarr] = [parent[kw], data];
      delete parent[kw];
    } else {
      parent[kw] = data;
    }
    return parent;
  }

  const result = process(data, [data]);
  if (debug) console.log("[wktcrs] parse returning", result);

  return result;
}

const _module = { parse };
if (typeof define === "function")
  define(function () {
    return _module;
  });
if (typeof module === "object") module.exports = _module;
if (typeof window === "object") window.wktcrs = _module;
if (typeof self === "object") self.wktcrs = _module;
