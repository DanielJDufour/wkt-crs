# wkt-crs
Parse WKT-CRS ([Well-known text representation of coordinate reference systems](https://en.wikipedia.org/wiki/Well-known_text_representation_of_coordinate_reference_systems))

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
const { data } = wktcrs(wkt);
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
### numerical precision
By default, wkt-crs automatically converts any number to its JavaScript Float64 representation.
If you require higher precision, calling wkt-crs with an options object where "raw: true" will
keep numbers as strings, preserving as they appear in the input WKT string.  For example,
to get the raw string of the datum's unit.
```js
wktcrs.parse(wkt, { raw: true }).data.PROJCS.GEOGCS.UNIT[2]
// "0.0174532925199433"
```

# alternatives
- wkt-parser: https://github.com/proj4js/wkt-parser

# references
- OGC Standard: https://www.ogc.org/standards/wkt-crs
- Wikipedia Page: https://en.wikipedia.org/wiki/Well-known_text_representation_of_coordinate_reference_systems
