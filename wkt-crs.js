function sort(data, { keywords } = {}) {
  const keys = Object.keys(data).filter(k => !/\d+/.test(k));

  if (!keywords) {
    keywords = [];
    // try to find multiples
    const counts = {};
    if (Array.isArray(data)) {
      data.forEach(it => {
        if (Array.isArray(it) && it.length >= 2 && typeof it[1] === "string") {
          const k = it[0];
          if (!counts[k]) counts[k] = 0;
          counts[k]++;
        }
      });
      for (let k in counts) {
        if (counts[k] > 0) keywords.push(k);
      }
    }
  }

  keys.forEach(key => {
    data[key] = sort(data[key]);
  });

  keywords.forEach(key => {
    const indices = [];
    const params = [];
    data.forEach((item, i) => {
      if (Array.isArray(item) && item[0] === key) {
        indices.push(i);
        params.push(item);
      }
    });

    params.sort((a, b) => {
      a = a[1].toString();
      b = b[1].toString();
      return a < b ? -1 : a > b ? 1 : 0;
    });

    // replace in order
    params.forEach((param, i) => {
      data[indices[i]] = param;
    });
  });

  return data;
}

function parse(wkt, options) {
  const raw = typeof options === "object" && options.raw === true;
  const debug = typeof options === "object" && options.debug === true;

  if (debug) console.log("[wktcrs] parse starting with\n", wkt);

  // move all keywords into first array item slot
  // from PARAM[12345, 67890] to ["PARAM", 12345, 67890]
  wkt = wkt.replace(/[A-Z][A-Z\d_]+\[/gi, function (match) {
    return '["' + match.substr(0, match.length - 1) + '",';
  });

  // wrap variables in strings
  // from [...,NORTH] to [...,"NORTH"]
  wkt = wkt.replace(/, ?([A-Z][A-Z\d_]+[,\]])/gi, function (match, p1) {
    const varname = p1.substr(0, p1.length - 1);
    return "," + '"' + (raw ? "raw:" : "") + varname + '"' + p1[p1.length - 1];
  });

  if (typeof options === "object" && options.raw === true) {
    // replace all numbers with strings
    wkt = wkt.replace(/, {0,2}(-?[\.\d]+)(?=,|\])/g, function (match, p1) {
      return "," + '"' + (raw ? "raw:" : "") + p1 + '"';
    });
  }

  // str should now be valid JSON
  if (debug) console.log("[wktcrs] json'd wkt: '" + wkt + "'");
  let data;
  try {
    data = JSON.parse(wkt);
  } catch (error) {
    console.error(`[wktcrs] failed to parse '${wkt}'`);
    throw error;
  }

  if (debug) console.log("[wktcrs] json parsed: '" + wkt + "'");

  function process(data, parent) {
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

  return { data: result };
}

// convert JSON representation of Well-Known Text
// back to standard Well-Known Text
function unparse(wkt, options) {
  if (Array.isArray(wkt) && wkt.length == 1 && Array.isArray(wkt[0])) {
    wkt = wkt[0]; // ignore first extra wrapper array
  }

  const [kw, ...attrs] = wkt;
  const str =
    kw +
    "[" +
    attrs
      .map(attr => {
        if (Array.isArray(attr)) {
          return unparse(attr, options).data;
        } else if (typeof attr === "number") {
          return attr.toString();
        } else if (typeof attr === "string") {
          // can't automatically convert all caps to varibale
          // because EPSG is string in AUTHORITY["EPSG", ...]
          if (attr.startsWith("raw:")) {
            // convert "raw:NORTH" to NORTH
            return attr.replace("raw:", "");
          } else {
            return '"' + attr + '"';
          }
        } else {
          throw new Error('[wktcrs] unexpected attribute "' + attr + '"');
        }
      })
      .join(",") +
    "]";
  return { data: str };
}

const _module = { parse, unparse, sort };
if (typeof define === "function")
  define(function () {
    return _module;
  });
if (typeof module === "object") module.exports = _module;
if (typeof window === "object") window.wktcrs = _module;
if (typeof self === "object") self.wktcrs = _module;
