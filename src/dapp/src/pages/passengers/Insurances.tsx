import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { fetchInsurances, payoutAll } from "../../store/passengersSlice";
import { Insurance, InsuranceStatus } from "../../types/insurance";
import { Ether } from "../../types/ether";
import BN from "bn.js";
import { Button, Icon, Label } from "semantic-ui-react";

export const Insurances: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInsurances());
  }, [dispatch]);

  const state = useSelector((state: RootState) => ({
    action: state.ui.action,
    insurances: state.passengers.insurances,
    account: state.blockchain.account,
    payout: {
      available: state.passengers.insurances.some(i => i.status === InsuranceStatus.FOR_PAYOUT),
      amount: state.passengers.insurances
                   .filter(ins => ins.status === InsuranceStatus.FOR_PAYOUT)
                   .reduce((sum: Ether, ins: Insurance) => sum.add(Ether.from(new BN(ins.creditAmount))), Ether.ZERO)
    }
  }));

  if (!state) {
    return <div>Loading...</div>;
  }

  return <div>
    <Payout available={state.payout.available}
            amount={state.payout.amount}
            pending={state.action?.state === "pending"}
            onPayout={() => dispatch(payoutAll())}/>

  </div>;
};

const Payout: React.FC<{ available: boolean, amount: Ether, pending: boolean, onPayout: () => void }> =
  ({ available, amount, pending, onPayout }) => {
    if (!available) {
      return <Fragment></Fragment>;
    }

    return <Button as='div' labelPosition='right' onClick={onPayout}>
      <Button color='green'>
        <Icon name='ethereum'/>
        Payout
      </Button>
      <Label as='a' basic color='green' pointing='left'>
        {amount.asEther()} ETH
      </Label>
    </Button>;
  };
