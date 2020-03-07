import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import rootReducer, { RootState } from './reducers';
import { setupMetamaskEventsListener } from './blockchainSlice';

const store = configureStore({
    reducer: rootReducer
});

// @ts-ignore
if (process.env.NODE_ENV === 'development' && module.hot) {
    // @ts-ignore
    module.hot.accept('./reducers', () => {
        const newRootReducer = require('./reducers').default
        store.replaceReducer(newRootReducer)
    })
}

setupMetamaskEventsListener(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

export default store;
