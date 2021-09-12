const { LCDClient } = require("@terra-money/terra.js");
const {
  // Anchor,
  columbus4,
  AddressProviderFromJson,
  MARKET_DENOMS,
  COLLATERAL_DENOMS,
  queryCustodyBorrower,
  queryMarketBorrowerInfo,
} = require("@anchor-protocol/anchor.js");

var log = console.log;
console.log = function () {
  log.apply(console, [Date.now()].concat(arguments));
};

const { CronJob } = require("cron");
const lcd = new LCDClient({
  URL: "https://lcd.terra.dev",
  chainID: "columbus-4",
});

const addressProvider = new AddressProviderFromJson(columbus4);

async function main() {
  // Usage: node index.js <borrower_address>
  const address = process.env.address;
  if (!address) return console.log("No address provided!");

  console.log("Querying LTV for", address);
  const bluna = await queryCustodyBorrower({
    lcd,
    market: MARKET_DENOMS.UUSD,
    custody: COLLATERAL_DENOMS.UBLUNA,
    address,
  })(addressProvider).then((response) => {
    return response.balance / 1000000;
  });

  const rate = await lcd.oracle.exchangeRates().then((res) => {
    return res.get("uusd").amount;
  });

  const collateral_value = bluna * rate;

  const loan_amount = await queryMarketBorrowerInfo({
    lcd,
    market: MARKET_DENOMS.UUSD,
    borrower: address,
    // block_height is optional
    // block_height: +block.header.height,
  })(addressProvider).then((response) => {
    return response.loan_amount / 1000000;
  });

  const ltv = (loan_amount / collateral_value) * 100;
  console.log({ rate, bluna, collateral_value, ltv, loan_amount });
}

var job = new CronJob(
  "1 * * * * *",
  function () {
    main().catch(console.error);
  },
  null,
  true,
  "Asia/Bangkok"
);
job.start();
