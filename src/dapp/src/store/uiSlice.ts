import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
    action?: string;
    loading: boolean;
    lastError?: string;
}

const initialState: UiState = {
    loading: false
};

const uiSlice = createSlice({
                                name: 'ui',
                                initialState,
                                reducers: {
                                    asyncProcessStarted(state, action: PayloadAction<string>) {
                                        state.loading = true;
                                        state.action = action.payload;
                                    },
                                    asyncProcessSuccess(state) {
                                        state.action = undefined;
                                        state.loading = false;
                                    },
                                    asyncProcessFailed(state, action: PayloadAction<Error>) {
                                        state.lastError = action.payload.message;
                                        state.loading = false;
                                    }
                                }
                            });

export const { asyncProcessStarted, asyncProcessSuccess, asyncProcessFailed } = uiSlice.actions;

export default uiSlice.reducer;
