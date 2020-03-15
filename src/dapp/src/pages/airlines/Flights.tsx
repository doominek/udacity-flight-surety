import React, { useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlights } from '../../store/airlinesSlice';
import { RootState } from '../../store/reducers';
import { Flight, FlightStatus } from '../../types/flights';
import _ from 'lodash';
import { Header, Icon, Table } from 'semantic-ui-react';
import moment from 'moment';
import { formatAccount } from '../../common/utils';

export const Flights = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchFlights());
    }, [ dispatch ]);


    const { flights } = useSelector((state: RootState) => ({
        action: state.ui.action,
        flights: state.airlines.flights
    }));

    return <div>
        <FlightsList flights={flights}/>
    </div>;
};

const FlightsList: React.FC<{ flights: Flight[] }> = ({ flights }) => {
    if (_.isEmpty(flights)) {
        return <Fragment>
            <h4>No flights found</h4>
        </Fragment>
    }

    return <Fragment>
        <h3>Flights List</h3>
            <Table celled compact>
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell>Airline</Table.HeaderCell>
                        <Table.HeaderCell>Flight</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {flights.map(flight => (
                        <Table.Row key={flight.key}>
                            <Table.Cell>
                                <Header as='h4' image>
                                    <Icon name='plane' size='large' />
                                    <Header.Content>
                                        {flight.airline.name}
                                        <Header.Subheader>{formatAccount(flight.airline.account)}</Header.Subheader>
                                    </Header.Content>
                                </Header>
                            </Table.Cell>
                            <Table.Cell>{flight.code}</Table.Cell>
                            <Table.Cell>{moment(flight.date).format('LLL')}</Table.Cell>
                            <Table.Cell>{FlightStatus[flight.status]}</Table.Cell>
                            <Table.Cell></Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
    </Fragment>
};
