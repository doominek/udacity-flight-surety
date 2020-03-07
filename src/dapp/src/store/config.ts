// import createSagaMiddleware from "redux-saga";
// import rootReducer from "./reducers";
// import { composeWithDevTools } from "redux-devtools-extension";
// import { createStore, applyMiddleware } from "redux";
// import rootSaga from "./sagas";
//
// const configureStore = () => {
//     const sagaMiddleware = createSagaMiddleware();
//
//     const store = createStore(
//         rootReducer,
//         composeWithDevTools(applyMiddleware(sagaMiddleware))
//     );
//
//     sagaMiddleware.run(rootSaga);
//
//     return store;
// };

import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import rootReducer, { RootState } from './reducers';

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

export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>

export default store
