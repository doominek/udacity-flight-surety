import { combineReducers } from '@reduxjs/toolkit';
import blockchain from './blockchainSlice';
import ui from './uiSlice';
import airlines from './airlinesSlice';

const rootReducer = combineReducers({
    blockchain,
    ui,
    airlines
});

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer;
