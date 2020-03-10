import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css'
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';

import App from './App';
import './index.css';
import store from './store/config';

ReactDOM.render(
    <Provider store={store}>
        <ToastProvider placement={"top-right"} autoDismiss autoDismissTimeout={3000}>
            <App/>
        </ToastProvider>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
