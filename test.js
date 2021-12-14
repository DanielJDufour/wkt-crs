const test = require("flug");
const wktcrs = require("./wkt-crs.js");

test(`NAD27 / UTM zone 16N`, ({ eq }) => {
  const wkt = `PROJCS["NAD27 / UTM zone 16N",GEOGCS["NAD27",DATUM["North_American_Datum_1927",SPHEROID["Clarke 1866",6378206.4,294.9786982139006,AUTHORITY["EPSG","7008"]],AUTHORITY["EPSG","6267"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4267"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-87],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","26716"]]`;
  const { data } = wktcrs.parse(wkt, { debug: false });
  // console.log(JSON.stringify(data, undefined, 2));
  eq(data.length, 1);
  eq(Object.keys(data), ["0", "PROJCS"]);
  eq(data.PROJCS.AUTHORITY, ["AUTHORITY", "EPSG", "26716"]);
  eq(data.PROJCS === data[0], true);
  eq(data.PROJCS[1] === "NAD27 / UTM zone 16N", true);
  eq(data.PROJCS.GEOGCS === data[0][2], true);
});

test("wikipedia example", ({ eq }) => {
  const wkt = `GEODCRS["WGS 84",
  DATUM["World Geodetic System 1984",
    ELLIPSOID["WGS 84", 6378137, 298.257223563, LENGTHUNIT["metre", 1]]],
  CS[ellipsoidal, 2],
    AXIS["Latitude (lat)", north, ORDER[1]],
    AXIS["Longitude (lon)", east, ORDER[2]],
    ANGLEUNIT["degree", 0.0174532925199433]]`;
  const { data } = wktcrs.parse(wkt, { debug: false });
  eq(data.GEODCRS[1], "WGS 84");
  eq(data.GEODCRS.DATUM.ELLIPSOID[3], 298.257223563);
  eq(data.GEODCRS.CS[1], "ellipsoidal");
  eq(data.GEODCRS.ANGLEUNIT[2], 0.0174532925199433);
});

test("wikipedia raw", ({ eq }) => {
  const wkt = `GEODCRS["WGS 84",
  DATUM["World Geodetic System 1984",
    ELLIPSOID["WGS 84", 6378137, 298.257223563, LENGTHUNIT["metre", 1]]],
  CS[ellipsoidal, 2],
    AXIS["Latitude (lat)", north, ORDER[1]],
    AXIS["Longitude (lon)", east, ORDER[2]],
    ANGLEUNIT["degree", 0.0174532925199433]]`;
  const { data } = wktcrs.parse(wkt, { debug: false, raw: true });
  eq(data.GEODCRS[1], "WGS 84");
  eq(data.GEODCRS.DATUM.ELLIPSOID[3], "298.257223563");
  eq(data.GEODCRS.CS[1], "ellipsoidal");
  eq(data.GEODCRS.ANGLEUNIT[2], "0.0174532925199433");
});

test("wikipedia concat", ({ eq }) => {
  const wkt = `
    CONCAT_MT[
      PARAM_MT["Mercator_2SP",
        PARAMETER["semi_major",6370997.0],
        PARAMETER["semi_minor",6370997.0],
        PARAMETER["central_meridian",180.0],
        PARAMETER["false_easting",-500000.0],
        PARAMETER["false_northing",-1000000.0],
        PARAMETER["standard parallel 1",60.0]],
      PARAM_MT["Affine",
        PARAMETER["num_row",3],
        PARAMETER["num_col",3],
        PARAMETER["elt_0_1",1],
        PARAMETER["elt_0_2",2],
        PARAMETER["elt 1 2",3]]]
  `;
  const { data } = wktcrs.parse(wkt, { debug: false, raw: true });
  eq(data.CONCAT_MT.PARAM_MT, undefined);
  eq(data.CONCAT_MT.MULTIPLE_PARAM_MT.length, 2);
});

test("wikipedia datum shift", ({ eq }) => {
  const wkt = `
  COORDINATEOPERATION["AGD84 to GDA94 Auslig 5m",
  SOURCECRS["…full CRS definition required here but omitted for brevity…"],
  TARGETCRS["…full CRS definition required here but omitted for brevity…"],
  METHOD["Geocentric translations", ID["EPSG", 1031]],
  PARAMETER["X-axis translation", -128.5, LENGTHUNIT["metre", 1]],
  PARAMETER["Y-axis translation",  -53.0, LENGTHUNIT["metre", 1]],
  PARAMETER["Z-axis translation",  153.4, LENGTHUNIT["metre", 1]],
  OPERATIONACCURACY[5],
  AREA["Australia onshore"],
  BBOX[-43.7, 112.85, -9.87, 153.68]]
  `;
  const { data } = wktcrs.parse(wkt, { debug: false, raw: true });
  // stringifying array ignores keys added on
  const str = JSON.stringify(data);
  eq(
    str,
    `[["COORDINATEOPERATION","AGD84 to GDA94 Auslig 5m",["SOURCECRS","…full CRS definition required here but omitted for brevity…"],["TARGETCRS","…full CRS definition required here but omitted for brevity…"],["METHOD","Geocentric translations",["ID","EPSG","1031"]],["PARAMETER","X-axis translation",-128.5,["LENGTHUNIT","metre","1"]],["PARAMETER","Y-axis translation",-53,["LENGTHUNIT","metre","1"]],["PARAMETER","Z-axis translation",153.4,["LENGTHUNIT","metre","1"]],["OPERATIONACCURACY","5"],["AREA","Australia onshore"],["BBOX",-43.7,"112.85",-9.87,"153.68"]]]`
  );
});

test("proj4js example", ({ eq }) => {
  const wkt =
    'PROJCS["NAD83 / Massachusetts Mainland",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",42.68333333333333],PARAMETER["standard_parallel_2",41.71666666666667],PARAMETER["latitude_of_origin",41],PARAMETER["central_meridian",-71.5],PARAMETER["false_easting",200000],PARAMETER["false_northing",750000],AUTHORITY["EPSG","26986"],AXIS["X",EAST],AXIS["Y",NORTH]]';
  const { data } = wktcrs.parse(wkt);
  eq(data.PROJCS[1], "NAD83 / Massachusetts Mainland");
});

// test("7.5.6.3 Axis unit for ordinal coordinate systems", ({ eq }) => {
//   const wkt =  `NULL[CS[ordinal,2],
//   AXIS["inline (I)",southeast,ORDER[1]],
//   AXIS["crossline (J)",northeast,ORDER[2]]]`;
//   const data = wktcrs.parse(wkt, { debug: true });
//   eq(data.CS[0], "ordinal");
// });
