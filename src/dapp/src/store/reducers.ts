import { combineReducers } from '@reduxjs/toolkit';
import blockchain from './blockchainSlice';

const rootReducer = combineReducers({
    blockchain
});

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer;
