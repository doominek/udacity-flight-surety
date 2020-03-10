import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
    action?: AsyncAction;
}

const initialState: UiState = {};

export type AsyncActionState = 'pending' | 'error' | 'success';

export interface AsyncAction {
    state: AsyncActionState;
    name: string;
    context: any;
    error?: string;
    showNotification: boolean;
}

const uiSlice = createSlice({
                                name: 'ui',
                                initialState,
                                reducers: {
                                    asyncActionStarted(state, action: PayloadAction<{ name: string, showNotification?: boolean, context?: any }>) {
                                        const { name, showNotification, context } = action.payload;
                                        state.action = {
                                            state: 'pending',
                                            name,
                                            showNotification: showNotification || false,
                                            context
                                        }
                                    },
                                    asyncActionSuccess(state) {
                                        state.action!.state = 'success';
                                    },
                                    asyncActionFailed(state, action: PayloadAction<Error>) {
                                        state.action!.error = action.payload.message;
                                        state.action!.state = 'error';
                                    },
                                    dismissAction(state) {
                                        state.action = undefined;
                                    }
                                }
                            });

export const { asyncActionStarted, asyncActionSuccess, asyncActionFailed, dismissAction } = uiSlice.actions;

export default uiSlice.reducer;
