import { parseCsv, mapRowsToFlights, mapDimensionRows, cityCode, airlineCode } from "./importPowerBi.js";

/* Real data exported from the PFE Power BI report. */
const winter = [
  'ID;Date;NumVol;Compagnie;Type;Destination;Heure;Statut;RetardMin;Start of Month;Start of Week;Year;TrancheRetard;Tranche_Horaire',
  '149;2025-02-01;TO183;Tunisair;Départ;Paris;21:40;À l\'heure;0;2025-02-01T00:00:00;2025-01-27T00:00:00;2025;À l\'heure;Soir (18h-00h)',
  '160;2025-02-03;TU537;Tunisair;Arrivée;Alger;03:10;Retard;40;2025-02-01T00:00:00;2025-01-27T00:00:00;2025;Retard;Nuit (00h-06h)',
  '177;2025-02-08;HV3352;Transavia;Arrivée;Lyon;08:00;Annulé;0;2025-02-01T00:00:00;2025-01-27T00:00:00;2025;Annulé;Matin (06h-12h)',
].join("\r\n");

const comp = "ID;Nom\r\n1;Tunisair\r\n2;Nouvelair\r\n3;Transavia\r\n4;Air France\r\n5;Lufthansa\r\n6;ITA Airways".replace(/;/g, ";");
const dest = "ID;Nom\r\n1;Paris\r\n2;Lyon\r\n3;Marseille\r\n4;Milan\r\n5;Rome\r\n6;Istanbul\r\n7;Tunis\r\n8;Alger";

const docs = mapRowsToFlights(parseCsv(winter));
const comps = mapDimensionRows(parseCsv(comp));
const dests = mapDimensionRows(parseCsv(dest));

let pass = true;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) pass = false;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
}

console.log("=== flight rows:", JSON.stringify(docs, null, 1));

check("row count", docs.length, 3);
check("f1 airline", docs[0].airlineName, "Tunisair");
check("f1 airlineCode", docs[0].airlineCode, "TU");
check("f1 type", docs[0].type, "DEPARTURE");
check("f1 dest", docs[0].destination, "Paris");
check("f1 destCode", docs[0].destinationCode, "CDG");
check("f1 status", docs[0].status, "ON_TIME");
check("f1 delay", docs[0].delayMinutes, 0);
check("f2 status", docs[1].status, "DELAYED");
check("f2 delay", docs[1].delayMinutes, 40);
check("f2 type", docs[1].type, "ARRIVAL");
check("f2 origin", docs[1].origin, "Alger");
check("f2 originCode", docs[1].originCode, "ALG");
check("f3 status", docs[2].status, "CANCELLED");
check("f3 airlineCode", docs[2].airlineCode, "HV");

check("comps count", comps.length, 6);
check("comp 5", comps[4].name, "Lufthansa");
check("airlineCode Lufthansa", airlineCode("Lufthansa"), "LH");
check("airlineCode Air France", airlineCode("Air France"), "AF");
check("dests count", dests.length, 8);
check("cityCode Milan", cityCode("Milan"), "MXP");
check("cityCode Istanbul", cityCode("Istanbul"), "IST");

console.log(pass ? "\nALL TESTS PASSED" : "\nSOME TESTS FAILED");
process.exit(pass ? 0 : 1);