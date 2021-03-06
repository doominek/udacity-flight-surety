import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Icon, Menu, MenuItemProps } from 'semantic-ui-react';
import { AccountInfo } from './AccountInfo';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';


export const MainMenu: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const { role } = useSelector(
        (state: RootState) => ({ role: state.blockchain.role }));

    const handleItemClick = (e: any, { name }: MenuItemProps) => {
        if (name) {
            history.push(`${name}`)
        }
    };

    const passengersMainRoutes = [
        {
            name: 'Insurances',
            path: '/passengers/insurances'
        }
    ];

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
            active={location.pathname === '/home'}
            onClick={handleItemClick}>
            <Icon name={'bars'}/>
        </Menu.Item>

        <Menu.Item>
            <h3>Flight Surety</h3>
        </Menu.Item>

        {
            role === 'passenger' && passengersMainRoutes.map((route, idx) => (
                <Menu.Item
                    key={idx}
                    name={route.path}
                    active={location.pathname === route.path}
                    onClick={handleItemClick}>
                    {route.name}
                </Menu.Item>
            ))
        }

        {
            role === 'airline' && airlineMainRoutes.map((route, idx) => (
                <Menu.Item
                    key={idx}
                    name={route.path}
                    active={location.pathname === route.path}
                    onClick={handleItemClick}>
                    {route.name}
                </Menu.Item>
            ))
        }

        <AccountInfo/>
    </Menu>;
};
