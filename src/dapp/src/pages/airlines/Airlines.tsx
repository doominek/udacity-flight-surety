import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAirlines, payFundingFee } from '../../store/airlinesSlice';
import { Button, Checkbox, Table } from 'semantic-ui-react';
import { RootState } from '../../store/reducers';
import { formatAccount } from '../../common/utils';
import moment from 'moment';
import { Airline } from '../../types/airlines';

export const Airlines: React.FC = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchAirlines());
    }, [ dispatch ]);

    const { action, loading, airlines, account } = useSelector((state: RootState) => ({
        loading: state.ui.loading,
        action: state.ui.action,
        airlines: state.airlines.airlines,
        account: state.blockchain.account
    }));

    const renderPayFeeButton = (airline: Airline) => {
        if (airline.account !== account || airline.paid) {
            return null;
        }

        return <Button loading={action === 'Paying funding fee' && loading}
                       primary
                       onClick={() => dispatch(payFundingFee())}>Pay</Button>;
    };

    if (action === 'Fetching Airlines list' && loading) {
        return <div>Loading data...</div>;
    }

    return <Table celled compact definition>
        <Table.Header fullWidth>
            <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Account</Table.HeaderCell>
                <Table.HeaderCell>Joined</Table.HeaderCell>
                <Table.HeaderCell>Fee Paid</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
        </Table.Header>

        <Table.Body>
            {airlines.map((airline, idx) => (
                <Table.Row key={idx}>
                    <Table.Cell>{airline.name}</Table.Cell>
                    <Table.Cell>{formatAccount(airline.account)}</Table.Cell>
                    <Table.Cell>{moment.unix(airline.date).format('LLL')}</Table.Cell>
                    <Table.Cell><Checkbox checked={airline.paid}/></Table.Cell>
                    <Table.Cell>
                        {renderPayFeeButton(airline)}
                    </Table.Cell>
                </Table.Row>
            ))}
        </Table.Body>
    </Table>;
};
