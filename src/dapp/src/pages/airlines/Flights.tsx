import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlights, updateFlightStatus } from '../../store/airlinesSlice';
import { RootState } from '../../store/reducers';
import { Flight, FlightStatus } from '../../types/flights';
import _ from 'lodash';
import { Button, Dropdown, Header, Icon, Modal, Table } from 'semantic-ui-react';
import moment from 'moment';
import { formatAccount } from '../../common/utils';
import { AsyncAction } from '../../store/uiSlice';

const statusOptions = Object.keys(FlightStatus)
    // @ts-ignore
                            .map(key => FlightStatus[key])
                            .filter(v => typeof v === 'string')
                            .map(status => ({
                                key: status,
                                text: status.replace('_', ' '),
                                value: status
                            }));

export const Flights = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchFlights());
    }, [ dispatch ]);

    const { action, flights } = useSelector((state: RootState) => ({
        action: state.ui.action,
        flights: state.airlines.flights
    }));

    return <div>
        <FlightsList flights={flights}
                     action={action}
                     onFlightStatusUpdate={(flight, status) => dispatch(updateFlightStatus(flight, status))}/>
    </div>;
};

const FlightsList: React.FC<{ flights: Flight[], onFlightStatusUpdate: (flightKey: string, status: FlightStatus) => void, action?: AsyncAction }> =
    ({ flights, onFlightStatusUpdate, action }) => {
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
                        <Table.HeaderCell>Flight</Table.HeaderCell>
                        <Table.HeaderCell>Airline</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {flights.map(flight => (
                        <Table.Row key={flight.key}>
                            <Table.Cell>{flight.code}</Table.Cell>
                            <Table.Cell>
                                <Header as='h4' image>
                                    <Header.Content>
                                        {flight.airline.name}
                                        <Header.Subheader>{formatAccount(flight.airline.account)}</Header.Subheader>
                                    </Header.Content>
                                </Header>
                            </Table.Cell>
                            <Table.Cell>{moment(flight.date).format('LLL')}</Table.Cell>
                            <Table.Cell>{FlightStatus[flight.status]}</Table.Cell>
                            <Table.Cell>
                                <ChangeFlightStatusModal flight={flight}
                                                         onConfirm={(status) => onFlightStatusUpdate(flight.key, status)}
                                                         updating={action?.state === 'pending' && action?.context?.flightKey === flight.key}/>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Fragment>
    };

const ChangeFlightStatusModal: React.FC<{ onConfirm: (status: FlightStatus) => void, flight: Flight, updating: boolean }> =
    ({ onConfirm, flight, updating }) => {
        const [ open, setOpen ] = useState(false);
        const [ status, setStatus ] = useState(flight.status);

        return <Modal trigger={<Button size='tiny'
                                       loading={updating}
                                       primary
                                       onClick={() => setOpen(true)}
                                       disabled={updating}>Update Status</Button>}
                      onClose={() => setOpen(false)}
                      open={open}>
            <Header icon='plane' content={`${flight.code} - Status Update`}/>
            <Modal.Content>
                <div>
                    New status:&nbsp;
                    <Dropdown
                        placeholder='Select Status'
                        selection
                        defaultValue={FlightStatus[status]}
                        options={statusOptions}
                        // @ts-ignore
                        onChange={(e, { value }) => setStatus(FlightStatus[value])}
                    />
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button color='red' onClick={() => setOpen(false)}>
                    <Icon name='x'/> Cancel
                </Button>
                <Button color='green' onClick={() => {
                    onConfirm(status);
                    setOpen(false);
                }}>
                    <Icon name='checkmark'/> Confirm
                </Button>
            </Modal.Actions>
        </Modal>
    };
