import {
  CHAINS,
  NETWORKS,
  AnchorEarn,
  DENOMS,
} from "@anchor-protocol/anchor-earn";

export async function getUSTBalance(address) {
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
