import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Icon, Menu, MenuItemProps } from 'semantic-ui-react';
import { AccountInfo } from './AccountInfo';


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
            path: '/airlines/list'
        },
        {
            name: 'Requests',
            path: '/airlines/requests'
        },
        {
            name: 'Flights',
            path: '/airlines/flights'
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
