import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as H from 'history';

import { AppDispatch, AppThunk } from './config';
import { flightSuretyService } from '../blockchain/service';
import { Airline } from '../types/airlines';

import { asyncActionFailed, asyncActionStarted, asyncActionSuccess } from './uiSlice';

export interface AirlinesState {
    airlines: Airline[];
}

const initialState: AirlinesState = {
    airlines: []
};

const airlinesSlice = createSlice({
                                      name: 'airlines',
                                      initialState,
                                      reducers: {
                                          airlinesLoaded(state, action: PayloadAction<Airline[]>) {
                                              state.airlines = action.payload;
                                          }
                                      }
                                  });

export const fetchAirlines = (): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Fetching Airlines list', showNotification: false }));
        const airlines = await flightSuretyService.getAirlines();

        dispatch(airlinesSlice.actions.airlinesLoaded(airlines));
        dispatch(asyncActionSuccess());

    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const submitFundingFee = (): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Paying funding fee', showNotification: true }));
        await flightSuretyService.submitFundingFee();

        dispatch(asyncActionSuccess());
        dispatch(fetchAirlines());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const registerAirline = (name: string, account: string, history: H.History): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Register new airline', showNotification: true }));
        await flightSuretyService.registerAirline(name, account);

        dispatch(asyncActionSuccess());
        setTimeout(() => {
            history.push('/airlines');
        }, 2000);
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};


export default airlinesSlice.reducer;
