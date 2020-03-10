import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, submitFundingFee } from '../../store/airlinesSlice';
import { RootState } from '../../store/reducers';
import { RequestStatus } from '../../types/airlines';
import { Button, Table } from 'semantic-ui-react';
import { formatAccount } from '../../common/utils';

export const Requests = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchRequests());
    }, [ dispatch ]);


    const { action, pendingRequests } = useSelector((state: RootState) => ({
        action: state.ui.action,
        pendingRequests: state.airlines.requests.filter(r => r.status === RequestStatus.PENDING)
    }));

    const renderVotingButtons = () => {
        return (
            <Fragment>
                <Button loading={action?.name === 'Voting' && action?.state === 'pending'}
                        size='mini'
                        color='green'
                        onClick={() => dispatch(submitFundingFee())}>Accept</Button>
                <Button loading={action?.name === 'Voting' && action?.state === 'pending'}
                        size='mini'
                        color='red'
                        onClick={() => dispatch(submitFundingFee())}>Reject</Button>
            </Fragment>
        );
    };

    if (action?.name === 'Fetching Requests list' && action?.state === 'pending') {
        return <div>Loading data...</div>;
    }

    return <Fragment>
        <h3>Pending Requests</h3>

        <Table celled compact definition>
            <Table.Header fullWidth>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Account</Table.HeaderCell>
                    <Table.HeaderCell>Votes</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {pendingRequests.map((request, idx) => (
                    <Table.Row key={idx}>
                        <Table.Cell>{request.name}</Table.Cell>
                        <Table.Cell>{formatAccount(request.account)}</Table.Cell>
                        <Table.Cell>{request.votesAccepted} / {request.votesRejected}</Table.Cell>
                        <Table.Cell>{renderVotingButtons()}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    </Fragment>;

};
