import { all, takeLatest } from 'redux-saga/effects'

function* initializeAppAsync() {
    console.log('initialize app');
}

function* initializeSaga() {
    yield takeLatest('INITIALIZE', initializeAppAsync);
}

function* fetchFlightsAsync() {
    console.log('fetching flights');
}

function* fetchFlightsSaga() {
    yield takeLatest('FETCH_FLIGHTS', fetchFlightsAsync);
}

export default function* rootSaga() {
    yield all([
        initializeSaga(),
        fetchFlightsSaga()
    ])
}
