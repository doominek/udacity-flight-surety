import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Dimmer, Header, Loader } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import { initialize } from './store/blockchainSlice';
import { Airlines } from './pages/airlines/Airlines';
import { AddAirline } from './pages/airlines/AddAirline';
import { MainMenu } from './components/MainMenu';
import { RootState } from './store/reducers';
import { ConnectionError } from './pages/ConnectionError';
import { AsyncActionNotifier } from './components/AsyncActionNotifier';
import { Requests } from './pages/airlines/Requests';
import { Flights } from './pages/airlines/Flights';
import { Insurances } from './pages/passengers/Insurances';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initialize());
    }, [ dispatch ]);

    const { initialized, error } = useSelector((state: RootState) => ({
        initialized: state.blockchain.initialized,
        error: state.blockchain.error
    }));

    const renderConnectionInProgress = () => {
        return <Container textAlign='center'>
            <Header as={'h2'}>Flight Surety</Header>
            Connecting to network
        </Container>
    };

    if (error) {
        return <ConnectionError error={error}/>;
    }

    if (!initialized) {
        return <Dimmer active inverted>
            <Loader inverted content={renderConnectionInProgress()}/>
        </Dimmer>;
    }

    return <Router>
        <MainMenu/>

        <Container>
            <Switch>
                <ProtectedRoute exact path='/passengers/insurances' allowedRole='passenger'>
                    <Insurances/>
                </ProtectedRoute>
                <ProtectedRoute exact path='/airlines/list' allowedRole='airline'>
                    <Airlines/>
                </ProtectedRoute>
                <ProtectedRoute exact path='/airlines/add' allowedRole='airline'>
                    <AddAirline/>
                </ProtectedRoute>
                <ProtectedRoute exact path='/airlines/requests' allowedRole='airline'>
                    <Requests/>
                </ProtectedRoute>
                <ProtectedRoute exact path='/airlines/flights' allowedRole='airline'>
                    <Flights/>
                </ProtectedRoute>
                <Route path="/">
                    <Home/>
                </Route>
            </Switch>
        </Container>

        <AsyncActionNotifier/>
    </Router>;
}

export default App;
