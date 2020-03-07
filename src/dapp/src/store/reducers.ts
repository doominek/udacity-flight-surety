import { combineReducers } from '@reduxjs/toolkit';
import todos from './todoSlice';
import blockchain from './blockchainSlice';

const rootReducer = combineReducers({
    todos,
    blockchain
});

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer;
