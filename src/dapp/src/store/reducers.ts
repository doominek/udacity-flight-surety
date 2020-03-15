import { combineReducers } from '@reduxjs/toolkit';
import blockchain from './blockchainSlice';
import ui from './uiSlice';
import airlines from './airlinesSlice';
import passengers from './passengersSlice';

const rootReducer = combineReducers({
    blockchain,
    ui,
    airlines,
    passengers
});

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer;
