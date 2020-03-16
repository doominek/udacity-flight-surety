import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppDispatch, AppThunk } from './config';
import { flightSuretyService } from '../blockchain/service';

import { asyncActionFailed, asyncActionStarted, asyncActionSuccess } from './uiSlice';
import { Insurance, InsuranceStatus } from '../types/insurance';

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
                                            },
                                            insurancePurchased(state, action: PayloadAction<Insurance>) {
                                                state.insurances.push(action.payload);
                                            },
                                            insurancePaidOut(state) {
                                                state.insurances
                                                     .filter(i => i.status === InsuranceStatus.FOR_PAYOUT)
                                                     .forEach(i => i.status = InsuranceStatus.REPAID);
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

        dispatch(passengersSlice.actions.insurancePaidOut());
        dispatch(asyncActionSuccess());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const purchaseInsurance = (flightKey: string, value: string): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Purchase Insurance', showNotification: true }));
        await flightSuretyService.purchaseInsurance(flightKey, value);

        dispatch(passengersSlice.actions.insurancePurchased({
                                                                paidAmount: value,
                                                                flight: flightKey,
                                                                status: InsuranceStatus.PAID,
                                                                creditAmount: ''
                                                            }));
        dispatch(asyncActionSuccess());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};


export default passengersSlice.reducer;
