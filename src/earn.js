const {
  CHAINS,
  NETWORKS,
  AnchorEarn,
  DENOMS,
} = require("@anchor-protocol/anchor-earn");

async function getUSTBalance(address) {
  const anchorEarn = new AnchorEarn({
    chain: CHAINS.TERRA,
    network: NETWORKS.COLUMBUS_4,
    address,
  });
  const { balances } = await anchorEarn.balance({ currencies: [DENOMS.UST] });
  const ust = balances.find((item) => item.currency === "UST");
  if (ust) return parseFloat(ust.account_balance);
  return 0;
}

module.exports = { getUSTBalance };
