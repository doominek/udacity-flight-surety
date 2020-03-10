import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, Icon, Table } from 'semantic-ui-react';
import { Link, useHistory } from 'react-router-dom';

import { fetchAirlines, fetchRequests, submitFundingFee } from '../../store/airlinesSlice';
import { RootState } from '../../store/reducers';
import { formatAccount } from '../../common/utils';
import moment from 'moment';
import { Airline, RequestStatus } from '../../types/airlines';

export const Airlines: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        dispatch(fetchAirlines());
        dispatch(fetchRequests());
    }, [ dispatch ]);


    const { action, airlines, account, pendingRequests } = useSelector((state: RootState) => ({
        action: state.ui.action,
        airlines: state.airlines.airlines,
        account: state.blockchain.account,
        pendingRequests: state.airlines.requests.filter(r => r.status === RequestStatus.PENDING).length
    }));

    const navigateToAddAirline = () => {
        history.push(`/airlines/add`);
    };

    const renderPayFeeButton = (airline: Airline) => {
        if (airline.account !== account || airline.paid) {
            return null;
        }

        return <Button loading={action?.name === 'Paying funding fee' && action?.state === 'pending'}
                       primary
                       onClick={() => dispatch(submitFundingFee())}>Pay</Button>;
    };

    if (action?.name === 'Fetching Airlines list' && action?.state === 'pending') {
        return <div>Loading data...</div>;
    }

    return <Fragment>
        <Table celled compact definition>
            <Table.Header fullWidth>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Account</Table.HeaderCell>
                    <Table.HeaderCell>Joined</Table.HeaderCell>
                    <Table.HeaderCell>Fee Submitted</Table.HeaderCell>
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

            <Table.Footer fullWidth>
                <Table.Row>
                    <Table.HeaderCell colSpan='3'>
                        { pendingRequests && <p>Pending requests: {pendingRequests} <Link to='/airlines/requests'>>></Link></p> }
                    </Table.HeaderCell>
                    <Table.HeaderCell colSpan='2'>
                        <Button
                            floated='right'
                            icon
                            labelPosition='left'
                            primary
                            onClick={navigateToAddAirline}
                            size='small'>
                            <Icon name='plane'/>Add Airline
                        </Button>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    </Fragment>;
};
