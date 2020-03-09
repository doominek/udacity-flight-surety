import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as H from 'history';

import { AppDispatch, AppThunk } from './config';
import { flightSuretyService } from '../blockchain/service';
import { Airline } from '../types/airlines';

import { asyncProcessFailed, asyncProcessStarted, asyncProcessSuccess } from './uiSlice';

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
        dispatch(asyncProcessStarted('Fetching Airlines list'));
        const airlines = await flightSuretyService.getAirlines();

        dispatch(airlinesSlice.actions.airlinesLoaded(airlines));
        dispatch(asyncProcessSuccess());

    } catch (e) {
        console.error(e);
        dispatch(asyncProcessFailed(e));
    }
};

export const payFundingFee = (): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncProcessStarted('Paying funding fee'));
        await flightSuretyService.payFundingFee();

        dispatch(asyncProcessSuccess());
    } catch (e) {
        console.error(e);
        dispatch(asyncProcessFailed(e));
    }
};

export const registerAirline = (name: string, account: string, history: H.History): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncProcessStarted('Register new airline'));
        await flightSuretyService.registerAirline(name, account);

        dispatch(asyncProcessSuccess());
        setTimeout(() => {
            history.push('/airlines');
        }, 2000);
    } catch (e) {
        console.error(e);
        dispatch(asyncProcessFailed(e));
    }
};


export default airlinesSlice.reducer;
