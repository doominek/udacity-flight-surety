import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, voteToAccept, voteToReject } from '../../store/airlinesSlice';
import { RootState } from '../../store/reducers';
import { Request, RequestStatus } from '../../types/airlines';
import { Button, Icon, Label, Table } from 'semantic-ui-react';
import { formatAccount } from '../../common/utils';
import { AsyncAction } from '../../store/uiSlice';

export const Requests = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchRequests());
    }, [ dispatch ]);


    const { action, pendingRequests } = useSelector((state: RootState) => ({
        action: state.ui.action,
        pendingRequests: state.airlines.requests.filter(r => r.status === RequestStatus.PENDING)
    }));

    const isAcceptingInProgress = (action: AsyncAction, request: Request) =>
        action.name === 'Accepting Request'
        && action.context.requester === request.account
        && action.state === 'pending';

    const isRejectingInProgress = (action: AsyncAction, request: Request) =>
        action.name === 'Rejecting Request'
        && action.context.requester === request.account
        && action.state === 'pending';


    const renderVotingButtons = (request: Request) => {
        return (
            <Fragment>
                <Button loading={action && isAcceptingInProgress(action, request)}
                        size='mini'
                        color='green'
                        onClick={() => dispatch(voteToAccept(request))}>Accept</Button>
                <Button loading={action && isRejectingInProgress(action, request)}
                        size='mini'
                        color='red'
                        onClick={() => dispatch(voteToReject(request))}>Reject</Button>
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
                        <Table.Cell>
                            <Label>
                                <Icon name='thumbs up' color='green' />
                                {request.votesAccepted}
                            </Label>/
                            <Label>
                                <Icon name='thumbs down' color='red' />
                                {request.votesRejected}
                            </Label>
                            </Table.Cell>
                        <Table.Cell>{renderVotingButtons(request)}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    </Fragment>;

};
