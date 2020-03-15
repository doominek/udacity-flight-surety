import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppDispatch, AppThunk } from './config';
import { flightSuretyService } from '../blockchain/service';

import { asyncActionFailed, asyncActionStarted, asyncActionSuccess } from './uiSlice';
import { Insurance } from "../types/insurance";

export interface PassengersState {
    insurances: Insurance[];
}

const initialState: PassengersState = {
    insurances: []
};

const passengersSlice = createSlice({
                                      name: 'passengers',
                                      initialState,
                                      reducers: {
                                          insurancesLoaded(state, action: PayloadAction<Insurance[]>) {
                                              state.insurances = action.payload;
                                          }
                                      }
                                  });

export const fetchInsurances = (): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Fetching Insurance list', showNotification: false }));
        const insurances = await flightSuretyService.getMyInsurances();

        dispatch(passengersSlice.actions.insurancesLoaded(insurances));
        dispatch(asyncActionSuccess());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const payoutAll = (): AppThunk => async (dispatch: AppDispatch) => {
  try {
    dispatch(asyncActionStarted({ name: 'Insurance Payout', showNotification: true }));
    await flightSuretyService.payout();

    dispatch(asyncActionSuccess());
  } catch (e) {
    console.error(e);
    dispatch(asyncActionFailed(e));
  }
};


export default passengersSlice.reducer;
