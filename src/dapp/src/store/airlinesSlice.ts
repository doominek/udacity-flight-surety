import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
        dispatch(asyncProcessStarted('Loading Airlines list'));
        const airlines = await flightSuretyService.getAirlines();

        dispatch(airlinesSlice.actions.airlinesLoaded(airlines));
        dispatch(asyncProcessSuccess());

    } catch (e) {
        console.error(e);
        dispatch(asyncProcessFailed(e));
    }
};

export default airlinesSlice.reducer;
