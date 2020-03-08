import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { Container, Icon, Menu, MenuItemProps } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import Home from './pages/Home';
import { initialize } from './store/blockchainSlice';
import { Airlines } from './pages/airlines/Airlines';
import { Requests } from './pages/airlines/Requests';
import { Flights } from './pages/airlines/Flights';
import { AccountInfo } from './components/AccountInfo';

const airlineRoutes = [
    {
        name: 'Airlines',
        path: '/airlines',
        component: Airlines
    },
    {
        name: 'Requests',
        path: '/requests',
        component: Requests
    },
    {
        name: 'Flights',
        path: '/flights',
        component: Flights
    }
];

function App() {
    const dispatch = useDispatch();
    dispatch(initialize());

    return <Router>
        <Header/>

        <Container>
            <Switch>
                {
                    airlineRoutes.map((route, idx) =>
                                          <Route key={idx} path={route.path}>{route.component}</Route>)
                }
                <Route path="/">
                    <Home/>
                </Route>
            </Switch>
        </Container>
    </Router>;
}

function Header() {
    const [ activeItem, setActiveItem ] = useState('home');
    const history = useHistory();
    const handleItemClick = (e: any, { name }: MenuItemProps) => {
        if (name) {
            setActiveItem(name);
            history.push(`${name}`)
        }
    };

    return <Menu>
        <Menu.Item
            name='/home'
            active={activeItem === '/home'}
            onClick={handleItemClick}>
            <Icon name={'bars'}/>
        </Menu.Item>

        <Menu.Item>
            <h3>Flight Surety</h3>
        </Menu.Item>

        {
            airlineRoutes.map((route, idx) => (
                <Menu.Item
                    key={idx}
                    name={route.path}
                    active={activeItem === route.path}
                    onClick={handleItemClick}>
                    {route.name}
                </Menu.Item>
            ))
        }

        <AccountInfo/>
    </Menu>;
}

export default App;
