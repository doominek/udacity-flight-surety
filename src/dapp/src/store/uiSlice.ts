import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
    action?: AsyncAction;
}

const initialState: UiState = {
};

export type AsyncActionState =  'pending' | 'error' | 'success';

export interface AsyncAction {
  state: AsyncActionState;
  name: string;
  error?: string;
  showNotification: boolean;
}

const uiSlice = createSlice({
                                name: 'ui',
                                initialState,
                                reducers: {
                                    asyncActionStarted(state, action: PayloadAction<{ name: string, showNotification: boolean }>) {
                                        state.action = {
                                          state: 'pending',
                                          name: action.payload.name,
                                          showNotification: action.payload.showNotification
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
