const GoDaddy = require('godaddy-api');
const {words} = require('./words');

const API_KEY='9EE9DGxPFuw_A8BVJNT25YhHhE1M1i4uZh'
const SECRET='Ren6vwWitBXfSs2aguknZZ'

godaddy = GoDaddy(API_KEY,SECRET);

const request = `https://api.ote-godaddy.com/v1/domains/available?domain=`


const isApplicable = (available, price) => price < 20 && available;

const searchDomain = () => {
    words.forEach(async (word, index) => {
        index % 60 ===0 && await sleep(61000);
        try {
              const response = await godaddy.domains.available({domain:`${word}.com`});
              const {available, domain} = response.body;
              console.log(`Trying ${domain}`);
              available && console.log(`${domain} is available!`);
        } catch (error) {
            console.log({error})   ;
        }
    });
    
}


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

searchDomain();



