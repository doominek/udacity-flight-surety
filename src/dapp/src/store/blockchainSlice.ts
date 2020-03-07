import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppDispatch, AppThunk } from './config';
import { connect, flightSuretyService } from '../blockchain/service';

export type AccountRole = 'airline' | 'passenger'

export interface BlockchainState {
    initialized: boolean;
    account?: string;
    role?: AccountRole;
}

const initialState: BlockchainState = {
    initialized: false
};

const blockchainSlice = createSlice({
                                        name: 'blockchain',
                                        initialState,
                                        reducers: {
                                            initialize(state, action: PayloadAction<Partial<BlockchainState>>) {
                                                state.account = action.payload.account;
                                                state.role = action.payload.role;
                                                state.initialized = true;
                                            }
                                        }
                                    });

export const initialize = (): AppThunk => async (dispatch: AppDispatch) => {
    await connect();
    const isAirline = await flightSuretyService.isAirline();

    dispatch(blockchainSlice.actions.initialize({
                                                    account: flightSuretyService.defaultAccount,
                                                    role: isAirline ? 'airline' : 'passenger'
                                                }));
};

export default blockchainSlice.reducer;
