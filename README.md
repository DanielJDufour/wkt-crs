# wkt-crs
Parse WKT-CRS (Well-known text representation of coordinate reference systems)

# install
- in the terminal, run  ```npm install wkt-crs```
- or, in html, ```<script src="https://unpkg.com/wkt-crs">```

# basic usage
```js
import wktcrs from "wkt-crs";

const wkt = `PROJCS["NAD27 / UTM zone 16N",GEOGCS["NAD27",DATUM["North_American_Datum_1927",SPHEROID["Clarke 1866",6378206.4,294.9786982139006,AUTHORITY["EPSG","7008"]],AUTHORITY["EPSG","6267"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4267"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-87],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","26716"]]`;

const data = wktcrs(wkt);
```
data is made up of nested arrays where the first element in the array
is the special keyword found in the Well-Known Text.  For example:
```PROJCS["NAD27 / UTM zone 16N", GEOGCS[...]]`` becomes
```["PROJCS", "NAD27 / UTM zone 16N", GEOGCS[...]]]```

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
      [
        "PRIMEM",
        "Greenwich",
        0,
        ["AUTHORITY", "EPSG", "8901"]
      ],
      [
        "UNIT",
        "degree",
        0.0174532925199433,
        ["AUTHORITY", "EPSG", "9122"]
      ],
      ["AUTHORITY", "EPSG", "4267"]
    ],
    ["PROJECTION", "Transverse_Mercator"],
    ["PARAMETER", "latitude_of_origin", 0],
    ["PARAMETER", "central_meridian", -87],
    ["PARAMETER", "scale_factor", 0.9996],
    ["PARAMETER", "false_easting", 500000],
    ["PARAMETER", "false_northing", 0],
    [
      "UNIT",
      "metre",
      1,
      ["AUTHORITY", "EPSG", "9001"]
    ],
    ["AXIS", "Easting", "EAST"],
    ["AXIS", "Northing", "NORTH"],
    ["AUTHORITY", "EPSG", "26716"]
  ]
]
```
However, there's more.  These aren't just normal arrays, we've also added special properties for
dictionary like lookups.  For example, `data.PROJCS.GEOGCS.DATUM` will give you the same datum
found by `data[0][1][1]`;


# references
- OGC Standard: https://www.ogc.org/standards/wkt-crs
- Wikipedia Page: https://en.wikipedia.org/wiki/Well-known_text_representation_of_coordinate_reference_systems
