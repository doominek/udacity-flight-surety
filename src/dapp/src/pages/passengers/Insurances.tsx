import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { fetchInsurances } from "../../store/passengersSlice";

export const Insurances: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInsurances());
  }, [dispatch]);


  const { action, insurances, account } = useSelector((state: RootState) => ({
    action: state.ui.action,
    insurances: state.passengers.insurances,
    account: state.blockchain.account
  }));

  return <div>Insurances</div>;
};
