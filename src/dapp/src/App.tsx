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
                <Route exact path='/passengers/insurances'>
                   <Insurances />
                </Route>
                <Route exact path='/airlines/list'>
                    <Airlines/>
                </Route>
                <Route exact path='/airlines/add'>
                    <AddAirline/>
                </Route>
                <Route exact path='/airlines/requests'>
                    <Requests/>
                </Route>
                <Route exact path='/airlines/flights'>
                    <Flights/>
                </Route>
                <Route path="/">
                    <Home/>
                </Route>
            </Switch>
        </Container>

        <AsyncActionNotifier/>
    </Router>;
}

export default App;
