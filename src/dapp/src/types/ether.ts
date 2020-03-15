import BN from "bn.js";
import utils from "web3-utils";

export class Ether {
  static get ZERO(): Ether {
    return Ether.from(new BN(0));
  }

  static from(amount: BN): Ether {
    return new Ether(amount);
  }

  constructor(private amount: BN) {
  }

  add(other: Ether): Ether {
    return Ether.from(this.amount.clone().add(other.amount));
  }

  sub(other: Ether): Ether {
    return Ether.from(this.amount.clone().sub(other.amount));
  }

  asEther(): string {
    return utils.fromWei(this.amount, 'ether');
  }
}
