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

const { CronJob } = require("cron");

const lcd = new LCDClient({
  URL: "https://lcd.terra.dev",
  chainID: "columbus-4",
});

const addressProvider = new AddressProviderFromJson(columbus4);

async function getBLUNA(address) {
  const bluna = await queryCustodyBorrower({
    lcd,
    market: MARKET_DENOMS.UUSD,
    custody: COLLATERAL_DENOMS.UBLUNA,
    address,
  })(addressProvider);
  return bluna.balance / 1000000;
}

async function getLUNAPrice() {
  const rate = await lcd.oracle.exchangeRates();
  return rate.get("uusd").amount;
}
async function getLoan(address) {
  const loan_amount = await queryMarketBorrowerInfo({
    lcd,
    market: MARKET_DENOMS.UUSD,
    borrower: address,
    // block_height is optional
    // block_height: +block.header.height,
  })(addressProvider);
  return loan_amount.loan_amount / 1000000;
}

async function report(address) {
  if (!address) return console.error("No address provided!");

  const bluna = await getBLUNA(address);
  const rate = await getLUNAPrice();
  const collateral_value = bluna * rate;
  const loan_amount = await getLoan(address);
  const ltv = (loan_amount / collateral_value) * 100;
  const borrow_limit = collateral_value * 0.6; // 60% LTV
  const liquidation_price = (loan_amount / borrow_limit) * rate * 1.002; // add estimate fee

  json = JSON.stringify({
    rate,
    bluna,
    collateral_value,
    ltv,
    loan_amount,
    borrow_limit,
    liquidation_price,
  });
  console.log(json);
}

if (!process.env.address) {
  console.error("No address provided!");
  process.exit(1);
}

var job = new CronJob(
  "1 * * * * *",
  function () {
    const { address } = process.env;
    report(address);
  },
  null,
  true,
  "Asia/Bangkok",
  null,
  true
);
job.start();

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
