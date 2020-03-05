import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { Menu, MenuItemProps } from 'semantic-ui-react';

function App() {
    return (
        <Router>
            <div>
                <Header/>

                {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                <Switch>
                    <Route path="/about">
                        <About/>
                    </Route>
                    <Route path="/users">
                        <Users/>
                    </Route>
                    <Route path="/">
                        <Home/>
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

function Header() {
    const [ activeItem, setActiveItem ] = useState('home');
    const history = useHistory();
    const handleItemClick = (e: any, { name }: MenuItemProps) => {
        if (name) {
            setActiveItem(name);
            history.push(`/${name}`)
        }
    };

    return <Menu>
        <Menu.Item
            name='home'
            active={activeItem === 'home'}
            onClick={handleItemClick}
        >
            Home
        </Menu.Item>

        <Menu.Item
            name='about'
            active={activeItem === 'about'}
            onClick={handleItemClick}
        >
            About
        </Menu.Item>

        <Menu.Item
            name='users'
            active={activeItem === 'users'}
            onClick={handleItemClick}
        >
            Users
        </Menu.Item>
    </Menu>;
}

function Home() {
    return <h2>Home</h2>;
}

function About() {
    return <h2>About</h2>;
}

function Users() {
    return <h2>Users</h2>;
}

export default App;
