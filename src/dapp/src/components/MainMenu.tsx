import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Icon, Menu, MenuItemProps } from 'semantic-ui-react';
import { AccountInfo } from './AccountInfo';
import { Airlines } from '../pages/airlines/Airlines';
import { Requests } from '../pages/airlines/Requests';
import { Flights } from '../pages/airlines/Flights';


export const MainMenu: React.FC = () => {
    const [ activeItem, setActiveItem ] = useState('home');
    const history = useHistory();

    const handleItemClick = (e: any, { name }: MenuItemProps) => {
        if (name) {
            setActiveItem(name);
            history.push(`${name}`)
        }
    };

    const airlineMainRoutes = [
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
            airlineMainRoutes.map((route, idx) => (
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
};
