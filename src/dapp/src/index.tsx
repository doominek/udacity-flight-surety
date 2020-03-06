import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css'
import './index.css';
import App from './App';
// @ts-ignore
import { DrizzleContext } from '@drizzle/react-plugin';

import * as serviceWorker from './serviceWorker';

import todoApp from './store/reducers'
import { Drizzle, generateStore, IDrizzleOptions } from '@drizzle/store';
import FlightSuretyApp from './contracts/FlightSuretyApp.json';
import { addTodo } from './store/actions';

const drizzleOptions: IDrizzleOptions = {
    contracts: [
        // @ts-ignore
        FlightSuretyApp
    ]
};

const appReducers = { todoApp };

const drizzleStore = generateStore({
                  drizzleOptions,
                  appReducers,
                  disableReduxDevTools: false  // enable ReduxDevTools!
              });
const drizzle = new Drizzle(drizzleOptions, drizzleStore);
drizzleStore.dispatch(addTodo('Second item'));

ReactDOM.render(
    <DrizzleContext.Provider drizzle={drizzle}>
        <App/>
    </DrizzleContext.Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
