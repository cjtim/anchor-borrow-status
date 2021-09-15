const { CronJob } = require("cron");
const { Borrow } = require("./src/borrow");
const { getUSTBalance } = require("./src/earn");

async function main() {
  const { address } = process.env;
  if (!address) return console.error("No address provided!");

  const borrow = new Borrow(address);
  const report = await borrow.report();
  const ust = await getUSTBalance(address);

  json = JSON.stringify({
    ...report,
    total_value: report.collateral_value - report.loan_amount + ust,
  });
  return console.info(json);
}

if (!process.env.address) {
  console.error("No address provided!");
  process.exit(1);
}

var job = new CronJob(
  "1 * * * * *",
  function () {
    main().catch((e) => console.error(JSON.stringify({ error: e.message })));
  },
  null,
  true,
  "Asia/Bangkok",
  null,
  true
);
job.start();

process.on("SIGTERM", () => job.stop());
process.on("SIGINT", () => job.stop());
