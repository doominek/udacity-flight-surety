import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppDispatch, AppThunk } from './config';
import { flightSuretyService } from '../blockchain/service';

import { asyncActionFailed, asyncActionStarted, asyncActionSuccess } from './uiSlice';
import { Insurance, InsuranceStatus } from '../types/insurance';
import { Flight, FlightStatus } from '../types/flights';
import { ContractEventEmitter } from '../../../../generated/web3/contracts/types';

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

export const fetchFlightStatus = (flight: Flight): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({
                                        name: 'Sending request to fetch flight status',
                                        context: {
                                            flight: flight.key
                                        },
                                        showNotification: true
                                    }));
        await flightSuretyService.fetchFlightStatus(flight);

        dispatch(asyncActionSuccess());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

let flightStatusEventEmitter: ContractEventEmitter<any>;

export const subscribeToFlightStatusInfoEvent = (callback: (flight: string,
                                                            status: FlightStatus) => void): AppThunk =>
    async (dispatch: AppDispatch) => {
        try {
            flightStatusEventEmitter = flightSuretyService.flightStatusInfoEvents();
            flightStatusEventEmitter.on('data', event => {
                const status = parseInt(event.returnValues.status, 10);
                callback(event.returnValues.flight, status);

                if (status === FlightStatus.LATE_AIRLINE) {
                    dispatch(fetchInsurances());
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

export const unsubscribeFromFlightStatusInfoEvent = (): AppThunk => async (dispatch: AppDispatch) => {
    try {
        flightStatusEventEmitter.removeAllListeners();
    } catch (e) {
        console.error(e);
    }
};


export default passengersSlice.reducer;
