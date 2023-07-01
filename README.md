# wkt-crs
Read and Write WKT-CRS ([Well-known text representation of coordinate reference systems](https://en.wikipedia.org/wiki/Well-known_text_representation_of_coordinate_reference_systems))

# features
- zero dependencies
- simple JSON format
- numerical precision preservation
- familiar array item lookups like `data[1]`
- ergonomic object key lookups like `data.PROJCS.GEOGCS.DATUM`
- sort keywords like PARAMETER and AXIS

# install
- in the terminal, run  `npm install wkt-crs`
- in html, add `<script src="https://unpkg.com/wkt-crs"></script>`

# basic usage
```js
// you can skip this line if you loaded via <script>
import wktcrs from "wkt-crs";

// a string of Well-Known Text
const wkt = `PROJCS["NAD27 / UTM zone 16N",GEOGCS["NAD27",DATUM["North_American_Datum_1927",SPHEROID["Clarke 1866",6378206.4,294.9786982139006,AUTHORITY["EPSG","7008"]],AUTHORITY["EPSG","6267"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4267"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-87],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","26716"]]`;

// convert wkt to nested arrays
const { data } = wktcrs.parse(wkt);
```
data is
```js
[
  [
    "PROJCS",
    "NAD27 / UTM zone 16N",
    [
      "GEOGCS",
      "NAD27",
      [
        "DATUM",
        "North_American_Datum_1927",
        [
          "SPHEROID",
          "Clarke 1866",
          6378206.4,
          294.9786982139006,
          ["AUTHORITY", "EPSG", "7008"]
        ],
        ["AUTHORITY", "EPSG", "6267"]
      ],
      ["PRIMEM", "Greenwich", 0, ["AUTHORITY", "EPSG", "8901"]],
      ["UNIT", "degree", 0.0174532925199433, ["AUTHORITY", "EPSG", "9122"] ],
      ["AUTHORITY", "EPSG", "4267"]
    ],
    ["PROJECTION", "Transverse_Mercator"],
    ["PARAMETER", "latitude_of_origin", 0],
    ["PARAMETER", "central_meridian", -87],
    ["PARAMETER", "scale_factor", 0.9996],
    ["PARAMETER", "false_easting", 500000],
    ["PARAMETER", "false_northing", 0],
    ["UNIT", "metre", 1, ["AUTHORITY", "EPSG", "9001"]],
    ["AXIS", "Easting", "EAST"],
    ["AXIS", "Northing", "NORTH"],
    ["AUTHORITY", "EPSG", "26716"]
  ]
]
```
## advanced usage
### special properties
We've also added special properties to the arrays, to ease lookup.  For each subarray,
we add its keyword as a property to its parent.  For example, you can look up the datum ,
using `data.PROJCS.GEOGCS.DATUM` instead of `data[0][2][2]`.
### repeated keywords
Sometimes WKT will repeat some keywords for the same array.  For example, you might have multiple
"PARAMETER[...]" as in the above example.  In this case, you will find an array of the multiple at
"MULTIPLE_{KEYWORD}", as in "MULTIPLE_PARAMETER".
### raw mode
By default, wkt-crs automatically converts any number to its JavaScript Float64 representation 
and converts variable keywords to strings.  If you need to preserve raw literal values as they appears in the WKT,
call parse with an options object where `raw` is `true`.  You might prefer raw mode if you want to recreate the original WKT later, don't trust the floating point precision of JavaScript numbers, or need to distinguish between a string with the same value as a variable name.
```js
wktcrs.parse(`UNIT["degree",0.0174532925199433,AUTHORITY["EPSG", "9122"]]`, { raw: true });
{
  data: [
    // the first item in an array is always the keyword name of the array,
    // so there's no need for "raw:UNIT"
    "UNIT",
    
    // "degree" appears as a string in the source wkt
    // with quotes around it, so there's no need to change it
    "degree",
    
    // number is exactly the same as it appears in the wkt
    "raw:0.0174532925199433",
    
    ["AUTHORITY", "EPSG", "9122"]
  ]
}

wktcrs.parse(`AXIS["Easting",EAST]`, { raw: true });
{
  data: [
    "AXIS",
    "Easting",
    "raw:EAST" // attribute is equal to the variable EAST and not the string "EAST"
  ]
}
```
### sorting
You can sort the keywords in the parsed object.  Warning: this will mutate the object.
```js
import { sort } from "wkt-crs";

const data = [
  'EXAMPLE',
  [ 'AXIS', 'Northing', 'raw:NORTH' ],
  [ 'AXIS', 'Easting', 'raw:EAST' ],
];
sort(data);
[
  'EXAMPLE',
  [ 'AXIS', 'Easting', 'raw:EAST' ],
  [ 'AXIS', 'Northing', 'raw:NORTH' ]
];

// only sort specific keywords
sort(data, { keywords: ["PARAMETER"] })
```

### writing
If you need to write WKT, or in other words, convert JSON back to WKT, use the **unparse** function.  You basically call
**unparse** on JSON data that is in the same layout as returned by **parse**.  Numbers will be stringified by your JavaScript
engine before being written and anything after `raw:` will be written directly into the output without quotes.
```js
import { unparse } from "wkt-crs";

unparse([
  [
    "PROJCS",
    "NAD27 / UTM zone 16N",
    [
      "GEOGCS",
      "NAD27",
      [
        "DATUM",
        "North_American_Datum_1927",
        [
          "SPHEROID",
          "Clarke 1866",
          6378206.4,
          "raw:294.9786982139006",
          ["AUTHORITY", "EPSG", "7008"]
        ],
        ["AUTHORITY", "EPSG", "6267"]
      ],
      ["PRIMEM", "Greenwich", 0, ["AUTHORITY", "EPSG", "8901"]],
      ["UNIT", "degree", "raw:0.0174532925199433", ["AUTHORITY", "EPSG", "9122"] ],
      ["AUTHORITY", "EPSG", "4267"]
    ],
    ["PROJECTION", "Transverse_Mercator"],
    ["PARAMETER", "latitude_of_origin", 0],
    ["PARAMETER", "central_meridian", -87],
    ["PARAMETER", "scale_factor", 0.9996],
    ["PARAMETER", "false_easting", 500000],
    ["PARAMETER", "false_northing", 0],
    ["UNIT", "metre", 1, ["AUTHORITY", "EPSG", "9001"]],
    ["AXIS", "Easting", "raw:EAST"],
    ["AXIS", "Northing", "raw:NORTH"],
    ["AUTHORITY", "EPSG", "26716"]
  ]
]);
// returns
{ data: `PROJCS["NAD27 / UTM zone 16N",GEOGCS["NAD27",DATUM["North_American_Datum_1927",SPHEROID["Clarke 1866",6378206.4,294.9786982139006,AUTHORITY["EPSG","7008"]],AUTHORITY["EPSG","6267"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4267"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-87],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","26716"]]` }
```

# alternatives
- wkt-parser: https://github.com/proj4js/wkt-parser

# references
- OGC Standard: https://www.ogc.org/standards/wkt-crs
- Wikipedia Page: https://en.wikipedia.org/wiki/Well-known_text_representation_of_coordinate_reference_systems
