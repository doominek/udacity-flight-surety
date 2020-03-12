import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, voteToAccept, voteToReject } from '../../store/airlinesSlice';
import { RootState } from '../../store/reducers';
import { Request, RequestStatus } from '../../types/airlines';
import { Button, Icon, Label, List, Table } from 'semantic-ui-react';
import { AsyncAction } from '../../store/uiSlice';
import { SemanticSIZES } from 'semantic-ui-react/dist/commonjs/generic';
import * as _ from 'lodash';
import { AccountAddress } from "../../components/AccountAddress";

export const Requests = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchRequests());
    }, [ dispatch ]);


    const { action, pendingRequests, finalizedRequests } = useSelector((state: RootState) => ({
        action: state.ui.action,
        pendingRequests: state.airlines.requests.filter(r => r.status === RequestStatus.PENDING),
        finalizedRequests: state.airlines.requests.filter(r => r.status !== RequestStatus.PENDING)
    }));

    const isAcceptingInProgress = (action: AsyncAction, request: Request) =>
        action.name === 'Accepting Request'
        && action.context.requester === request.account
        && action.state === 'pending';

    const isRejectingInProgress = (action: AsyncAction, request: Request) =>
        action.name === 'Rejecting Request'
        && action.context.requester === request.account
        && action.state === 'pending';


    if (action?.name === 'Fetching Requests list' && action?.state === 'pending') {
        return <div>Loading data...</div>;
    }

    return <Fragment>
        <PendingRequests requests={pendingRequests}
                         acceptingInProgress={request => !!action && isAcceptingInProgress(action, request)}
                         rejectingInProgress={request => !!action && isRejectingInProgress(action, request)}
                         onVoteToAccept={request => dispatch(voteToAccept(request))}
                         onVoteToReject={request => dispatch(voteToReject(request))}/>
        <FinalizedRequests requests={finalizedRequests}/>
    </Fragment>;

};


const FinalizedRequests: React.FC<{
    requests: Request[]
}> = ({ requests }) => {
    const renderItem = (request: Request) => {
        const icon = request.status === RequestStatus.ACCEPTED ? 'check' : 'x';
        const color = request.status === RequestStatus.ACCEPTED ? 'green' : 'red';

        return <List.Item key={request.account}>
            <List.Icon color={color} name={icon} size='large' verticalAlign='middle'/>
            <List.Content>
                <List.Header as='h4'><Label color='blue'>{request.name}</Label></List.Header>
                <List.Description as='a'>
                    <p><AccountAddress value={request.account}/></p>
                    <VotesSummary size='mini' accepted={request.votesAccepted} rejected={request.votesRejected}/>
                </List.Description>
            </List.Content>
        </List.Item>;
    };

    return <Fragment>
        <h3>Finalized Requests</h3>
        <List relaxed divided>
            {requests.map(request => renderItem(request))}
        </List>
    </Fragment>
};

const VotesSummary: React.FC<{ accepted: number, rejected: number, size?: SemanticSIZES }> = ({
                                                                                                  accepted,
                                                                                                  rejected,
                                                                                                  size = 'small'
                                                                                              }) => {
    return <Fragment>
        <Label size={size}>
            <Icon name='thumbs up' color='green'/>
            {accepted}
        </Label>/
        <Label size={size}>
            <Icon name='thumbs down' color='red'/>
            {rejected}
        </Label>
    </Fragment>
};

const PendingRequests: React.FC<{
    requests: Request[],
    acceptingInProgress: (request: Request) => boolean,
    rejectingInProgress: (request: Request) => boolean,
    onVoteToAccept: (request: Request) => void,
    onVoteToReject: (request: Request) => void
}> = ({ requests, acceptingInProgress, rejectingInProgress, onVoteToAccept, onVoteToReject }) => {
    if (_.isEmpty(requests)) {
        return <Fragment>
            <h4>No pending requests found</h4>
        </Fragment>
    }

    const renderVotingButtons = (request: Request) => {
        return (
            <Fragment>
                <Button loading={acceptingInProgress(request)}
                        size='mini'
                        color='green'
                        onClick={() => onVoteToAccept(request)}>Accept</Button>
                <Button loading={rejectingInProgress(request)}
                        size='mini'
                        color='red'
                        onClick={() => onVoteToReject(request)}>Reject</Button>
            </Fragment>
        );
    };

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
                {requests.map((request, idx) => (
                    <Table.Row key={idx}>
                        <Table.Cell>{request.name}</Table.Cell>
                        <Table.Cell><AccountAddress value={request.account}/></Table.Cell>
                        <Table.Cell>
                            <VotesSummary accepted={request.votesAccepted} rejected={request.votesRejected}/>
                        </Table.Cell>
                        <Table.Cell>{renderVotingButtons(request)}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table></Fragment>;
};
