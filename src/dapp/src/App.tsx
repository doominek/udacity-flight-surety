import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Dimmer, Loader } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import { initialize } from './store/blockchainSlice';
import { Airlines } from './pages/airlines/Airlines';
import { AddAirline } from './pages/airlines/AddAirline';
import { MainMenu } from './components/MainMenu';
import { RootState } from './store/reducers';


function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initialize());
    }, [ dispatch ]);

    const { initialized, error  } = useSelector((state: RootState) => ({
        initialized: state.blockchain.initialized,
        error: state.blockchain.error
    }));

    if (!initialized) {
        return <Dimmer active inverted>
            <Loader inverted content='Connecting to network'/>
        </Dimmer>;
    }

    return <Router>
        <MainMenu/>

        <Container>
            <Switch>
                <Route exact path='/airlines'>
                    <Airlines/>
                </Route>
                <Route exact path='/airlines/add'>
                    <AddAirline/>
                </Route>
                <Route path="/">
                    <Home/>
                </Route>
            </Switch>
        </Container>
    </Router>;
}


export default App;
