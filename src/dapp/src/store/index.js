import createSagaMiddleware from "redux-saga";
import rootReducer from "./reducers";
import { composeWithDevTools } from "redux-devtools-extension";
import { createStore, applyMiddleware } from "redux";
import rootSaga from "./sagas";

const setupStore = () => {
    const sagaMiddleware = createSagaMiddleware();

    const store = createStore(
        rootReducer,
        composeWithDevTools(applyMiddleware(sagaMiddleware))
    );

    sagaMiddleware.run(rootSaga);

    return store;
};

export default setupStore;
