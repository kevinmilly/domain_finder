const GoDaddy = require("godaddy-api");
const { words } = require("./words");
require("dotenv").config();
const createCSVWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parser");
const fs = require("fs");

godaddy = GoDaddy(process.env.API_KEY, process.env.API_SECRET);

const domainWriter = createCSVWriter({
  path: "availability-results/domainAvailability.csv",
  header: [
    { id: "domainName", title: "Domain Name" },
    { id: "availability", title: "Availability" },
  ],
});

const sleep = (ms) => {
  console.log(`Sleeping for ${ms/1000} seconds`);
  return  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const resultsToExport = [];
const wordsToTry = [];
let wordsTried = 0;
const searchDomain = () => {
  fs.createReadStream("source_data/words_to_search.csv")
    .pipe(csv())
    .on("data", async ({ name }) => {
      const formattedName = `${name && name.trim()}.com`;
      !!formattedName && wordsToTry.push(formattedName);
    })
    .on("end", async () => {
      console.log("CSV file successfully processed");
      wordsToTry.forEach(async (word) => {
        ++wordsTried % 60 === 0 && await sleep(61000);
        try {
          const response = await godaddy.domains.available({
            domain: `${word}`,
          });
          await sleep(2000);
          const { available, domain } = response.body;
           console.log(`Trying Godaddy api for #${wordsTried}: ${domain}`);
          domain && resultsToExport.push({ domainName: domain, availability: available });
          available
            ? console.log(`${domain} is available!`)
            : console.log(`No for ${domain}`);
          console.log(`Results size is now ${resultsToExport.length}`)
        } catch (error) {
          console.log({ error });
          await domainWriter.writeRecords(resultsToExport);
        }
      });
    });
};

searchDomain();
