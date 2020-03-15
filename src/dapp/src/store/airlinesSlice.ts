import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as H from 'history';

import { AppDispatch, AppThunk } from './config';
import { flightSuretyService } from '../blockchain/service';
import { Airline, Request } from '../types/airlines';

import { asyncActionFailed, asyncActionStarted, asyncActionSuccess } from './uiSlice';
import { Flight, FlightStatus } from '../types/flights';

export interface AirlinesState {
    airlines: Airline[];
    requests: Request[];
    flights: Flight[];
}

const initialState: AirlinesState = {
    airlines: [],
    requests: [],
    flights: []
};

const airlinesSlice = createSlice({
                                      name: 'airlines',
                                      initialState,
                                      reducers: {
                                          airlinesLoaded(state, action: PayloadAction<Airline[]>) {
                                              state.airlines = action.payload;
                                          },
                                          requestsLoaded(state, action: PayloadAction<Request[]>) {
                                              state.requests = action.payload;
                                          },
                                          flightsLoaded(state, action: PayloadAction<Flight[]>) {
                                              state.flights = action.payload;
                                          },
                                          flightStatusUpdated(state, action: PayloadAction<{ flightKey: string, status: FlightStatus }>) {
                                              const flight = state.flights.find(f => f.key === action.payload.flightKey);
                                              if (flight) {
                                                  flight.status = action.payload.status;
                                              }
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
            history.push('/airlines/list');
        }, 2000);
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const fetchRequests = (): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Fetching Requests list', showNotification: false }));
        const requests = await flightSuretyService.getRequests();

        dispatch(airlinesSlice.actions.requestsLoaded(requests));
        dispatch(asyncActionSuccess());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const fetchFlights = (): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Fetching Flights list', showNotification: false }));
        const flights = await flightSuretyService.getFlights();

        dispatch(airlinesSlice.actions.flightsLoaded(flights));
        dispatch(asyncActionSuccess());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const voteToAccept = (request: Request): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Accepting Request', showNotification: true, context: { requester: request.account } }));
        await flightSuretyService.voteToAcceptRequest(request.account);

        dispatch(asyncActionSuccess());
        dispatch(fetchRequests());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const voteToReject = (request: Request): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Rejecting Request', showNotification: true, context: { requester: request.account } }));
        await flightSuretyService.voteToRejectRequest(request.account);

        dispatch(asyncActionSuccess());
        dispatch(fetchRequests());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};

export const updateFlightStatus = (flightKey: string, status: FlightStatus): AppThunk => async (dispatch: AppDispatch) => {
    try {
        dispatch(asyncActionStarted({ name: 'Updating flight status', showNotification: true, context: { flightKey } }));
        await flightSuretyService.updateFlightStatus(flightKey, status);

        dispatch(airlinesSlice.actions.flightStatusUpdated({ flightKey, status }));
        dispatch(asyncActionSuccess());
    } catch (e) {
        console.error(e);
        dispatch(asyncActionFailed(e));
    }
};


export default airlinesSlice.reducer;
