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

class Borrow {
  #addressProvider = new AddressProviderFromJson(columbus4);
  #lcd = new LCDClient({
    URL: "https://lcd.terra.dev",
    chainID: "columbus-4",
  });
  #address = "";

  constructor(adress = "") {
    this.#address = adress;
  }

  async getBLUNA() {
    const bluna = await queryCustodyBorrower({
      lcd: this.#lcd,
      market: MARKET_DENOMS.UUSD,
      custody: COLLATERAL_DENOMS.UBLUNA,
      address: this.#address,
    })(this.#addressProvider);
    return bluna.balance / 1000000;
  }

  async getLUNAPrice() {
    const rate = await this.#lcd.oracle.exchangeRates();
    return rate.get("uusd").amount;
  }

  async getLoan() {
    const { loan_amount } = await queryMarketBorrowerInfo({
      lcd: this.#lcd,
      market: MARKET_DENOMS.UUSD,
      borrower: this.#address,
    })(this.#addressProvider);
    return loan_amount / 1000000;
  }

  async report() {
    const bluna = await this.getBLUNA();
    const rate = await this.getLUNAPrice();
    const loan_amount = await this.getLoan();

    const collateral_value = bluna * rate;
    const ltv = (loan_amount / collateral_value) * 100;
    const borrow_limit = collateral_value * 0.6; // 60% LTV
    const liquidation_price = (loan_amount / borrow_limit) * rate * 1.002; // add estimate fee

    const json = {
      rate,
      bluna,
      collateral_value,
      ltv,
      loan_amount,
      borrow_limit,
      liquidation_price,
    };
    return json;
  }
}

module.exports = { Borrow };
