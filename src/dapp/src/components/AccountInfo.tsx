import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';
import { Icon, Menu } from 'semantic-ui-react';
import React from 'react';
import { AccountAddress } from "./AccountAddress";

export const AccountInfo = () => {
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
            {renderRoleIcon(info.role)} <AccountAddress value={info.account}/>
        </Menu.Item>
    </Menu.Menu>
}
