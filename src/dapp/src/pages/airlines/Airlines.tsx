import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAirlines, payFundingFee } from '../../store/airlinesSlice';
import { Button, Checkbox, Table } from 'semantic-ui-react';
import { RootState } from '../../store/reducers';
import { formatAccount } from '../../common/utils';
import moment from 'moment';

export const Airlines: React.FC = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchAirlines());
    }, [dispatch]);

    const { loading, airlines } = useSelector((state: RootState) => ({
        loading: state.ui.loading,
        airlines: state.airlines.airlines
    }));

    if (loading) {
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
                    <Table.Cell><Button loading={loading} primary onClick={() => dispatch(payFundingFee())}>Pay</Button></Table.Cell>
                </Table.Row>
            ))}
        </Table.Body>
    </Table>;
};
