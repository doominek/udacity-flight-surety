import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppDispatch, AppThunk } from './config';
import { connect, flightSuretyService } from '../blockchain/service';

export type AccountRole = 'airline' | 'passenger'

export interface BlockchainState {
    initialized: boolean;
    account?: string;
    role?: AccountRole;
    error?: string;
}

const initialState: BlockchainState = {
    initialized: false
};

const blockchainSlice = createSlice({
                                        name: 'blockchain',
                                        initialState,
                                        reducers: {
                                            initializeSuccess(state, action: PayloadAction<Partial<BlockchainState>>) {
                                                state.account = action.payload.account;
                                                state.role = action.payload.role;
                                                state.initialized = true;
                                            },
                                            initializeFailure(state, action: PayloadAction<string>) {
                                                state.error = action.payload;
                                                state.initialized = false;
                                            }
                                        }
                                    });

export const initialize = (): AppThunk => async (dispatch: AppDispatch) => {
    try {
        await connect();
        const isAirline = await flightSuretyService.isAirline();

        dispatch(blockchainSlice.actions.initializeSuccess({
                                                               account: flightSuretyService.defaultAccount,
                                                               role: isAirline ? 'airline' : 'passenger'
                                                           }));
    } catch (e) {
        console.error(e);
        dispatch(blockchainSlice.actions.initializeFailure(e.message));

    }
};

export const setupMetamaskEventsListener = (dispatch: AppDispatch) => {
    if (!window.ethereum) {
        return;
    }

    window.ethereum.on('accountsChanged', () => {
        dispatch(initialize());
    });
};

export default blockchainSlice.reducer;
