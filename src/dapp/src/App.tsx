import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { Container, Icon, Menu, MenuItemProps } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import Home from './pages/Home';
import { addTodo, toggleTodo } from './store/todoSlice';

function App() {
    const dispatch = useDispatch();
    dispatch(addTodo({ completed: false, id: '1', text: 'Fist Todo' }));
    dispatch(addTodo({ completed: false, id: '2', text: 'Second Todo' }));
    dispatch(toggleTodo('2'));

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
