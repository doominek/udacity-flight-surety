import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { Container, Icon, Menu, MenuItemProps } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { addTodo } from './store/actions';
import Home from './pages/Home';

function App() {
    const dispatch = useDispatch();
    dispatch(addTodo("Third item... This time from component"));

    return (
        <Router>
            <div>
                <Header/>

                <Container>
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
                </Container>
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
            onClick={handleItemClick}>
            <Icon name={'bars'}/>
        </Menu.Item>

        <Menu.Item
            name='about'
            active={activeItem === 'about'}
            onClick={handleItemClick}>
            About
        </Menu.Item>

        <Menu.Item
            name='users'
            active={activeItem === 'users'}
            onClick={handleItemClick}>
            Users
        </Menu.Item>
    </Menu>;
}


function About() {
    return <h2>About</h2>;
}

function Users() {
    return <h2>Users</h2>;
}

export default App;
