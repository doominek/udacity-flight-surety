import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { Container, Icon, Menu, MenuItemProps } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import { initialize } from './store/blockchainSlice';
import { RootState } from './store/reducers';

const airlineRoutes = [
    {
        name: 'Airlines',
        path: '/airlines',
        component: About
    },
    {
        name: 'Requests',
        path: '/requests',
        component: About
    },
    {
        name: 'Flights',
        path: '/flights',
        component: About
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

const formatAccount = (account: string): string => {
    const first = account.substring(0, 6);
    const last = account.substring(account.length - 4);
    return `${first}...${last}`;
};

function AccountInfo() {
    const info = useSelector(
        (state: RootState) => ({ account: state.blockchain.account, role: state.blockchain.role }));

    if (!info.account) {
        return null;
    }

    const renderRoleIcon = (role?: string) => {
        if (role === 'airline') {
            return <Icon name='plane'/>
        } else if (role === 'passenger') {
            return <Icon name='user'/>
        }

        return role;
    };


    return <Menu.Menu position='right'>
        <Menu.Item>
            {renderRoleIcon(info.role)} {formatAccount(info.account)}
        </Menu.Item>
    </Menu.Menu>
}

function About() {
    return <h2>About</h2>;
}

function Users() {
    return <h2>Users</h2>;
}

export default App;
