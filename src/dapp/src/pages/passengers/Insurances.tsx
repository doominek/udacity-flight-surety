import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { fetchInsurances } from "../../store/passengersSlice";
import { Insurance, InsuranceStatus } from "../../types/insurance";
import { Ether } from "../../types/ether";
import BN from "bn.js";

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
                   .asEther()
    }
  }));

  return <div>Insurances</div>;
};
