import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import Home from './pages/Home';
import { initialize } from './store/blockchainSlice';
import { Airlines } from './pages/airlines/Airlines';
import { AddAirline } from './pages/airlines/AddAirline';
import { MainMenu } from './components/MainMenu';


function App() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(initialize());
    }, [ dispatch ]);

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
