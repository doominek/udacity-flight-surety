import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import { fetchInsurances, payoutAll, purchaseInsurance } from '../../store/passengersSlice';
import { Insurance, InsuranceStatus } from '../../types/insurance';
import { Ether } from '../../types/ether';
import BN from 'bn.js';
import { Button, Dropdown, Form, Header, Icon, Label, Modal, Table } from 'semantic-ui-react';
import { fetchFlights } from '../../store/airlinesSlice';
import _ from 'lodash';
import { Flight, FlightStatus } from '../../types/flights';
import moment from 'moment';

export const Insurances: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchInsurances());
        dispatch(fetchFlights());
    }, [ dispatch ]);

    const { action, flights, payout, insurances } = useSelector((state: RootState) => ({
        action: state.ui.action,
        insurances: state.passengers.insurances,
        account: state.blockchain.account,
        flights: _.keyBy(state.airlines.flights, 'key'),
        payout: {
            available: state.passengers.insurances.some(i => i.status === InsuranceStatus.FOR_PAYOUT),
            amount: state.passengers.insurances
                         .filter(ins => ins.status === InsuranceStatus.FOR_PAYOUT)
                         .reduce((sum: Ether, ins: Insurance) => sum.add(Ether.from(new BN(ins.creditAmount))), Ether.ZERO)
        }
    }));

    if (!insurances && !flights) {
        return <div>Loading...</div>;
    }

    return <Fragment>
        <h3>My Insurances</h3>
        <Table celled compact definition>
            <Table.Header fullWidth>
                <Table.Row>
                    <Table.HeaderCell>Flight</Table.HeaderCell>
                    <Table.HeaderCell>Airline</Table.HeaderCell>
                    <Table.HeaderCell>Paid</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {insurances.map((insurance, idx) => {
                    const flight = flights[insurance.flight];

                    return (
                        <Table.Row key={idx}>
                            <Table.Cell>
                                <Header as='h4' image>
                                    <Header.Content>
                                        {flight.code}
                                        <Header.Subheader>{moment(flight.date).format('LLL')}</Header.Subheader>
                                        <Header.Subheader>{FlightStatus[flight.status]}</Header.Subheader>
                                    </Header.Content>
                                </Header>
                            </Table.Cell>
                            <Table.Cell>{flight.airline.name}</Table.Cell>
                            <Table.Cell textAlign='right'>{Ether.from(insurance.paidAmount).asEther()} ETH</Table.Cell>
                            <Table.Cell>
                                {InsuranceStatus[insurance.status]}
                            </Table.Cell>
                        </Table.Row>
                    );
                })}
            </Table.Body>

            <Table.Footer fullWidth>
                <Table.Row>
                    <Table.HeaderCell colSpan='4'>
                        <PurchaseInsuranceModal flights={Object.values(flights)}
                                                purchasing={action?.name === 'Purchase Insurance' && action?.state === 'pending'}
                                                onConfirm={((flightKey, value) => dispatch(purchaseInsurance(flightKey, value)))}/>
                        <Payout available={payout.available}
                                amount={payout.amount}
                                pending={action?.name === 'Insurance Payout' && action?.state === 'pending'}
                                onPayout={() => dispatch(payoutAll())}/>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    </Fragment>;
};

const Payout: React.FC<{ available: boolean, amount: Ether, pending: boolean, onPayout: () => void }> =
    ({ available, amount, pending, onPayout }) => {
        if (!available) {
            return <Fragment></Fragment>;
        }

        return <Button as='div' labelPosition='right' floated='right' onClick={onPayout}>
            <Button color='green'>
                <Icon name='ethereum'/>
                Payout
            </Button>
            <Label as='a' basic color='green' pointing='left'>
                {amount.asEther()} ETH
            </Label>
        </Button>;
    };

const PurchaseInsuranceModal: React.FC<{ flights: Flight[], onConfirm: (flightKey: string, value: string) => void, purchasing: boolean }> =
    ({ flights, onConfirm, purchasing }) => {
        const [ open, setOpen ] = useState(false);
        const [ flight, setFlight ] = useState(_.first(flights)?.key);
        const [ value, setValue ] = useState('500000000000000000');

        const flightsOptions = flights.map(f => ({
            key: f.key,
            value: f.key,
            text: `${f.code} - ${f.airline.name}, ${moment(f.date).format('LLL')}`
        }));

        return <Modal trigger={<Button loading={purchasing}
                                       primary
                                       onClick={() => setOpen(true)}
                                       disabled={purchasing}><Icon name='shopping cart'/>Purchase</Button>}
                      onClose={() => setOpen(false)}
                      open={open}>
            <Header icon='shopping cart' content={'Purchase New Insurance'}/>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label>Flight</label>
                        <Dropdown
                            placeholder='Select Flight'
                            selection
                            defaultValue={flight}
                            options={flightsOptions}
                            // @ts-ignore
                            onChange={(e, { value }) => setFlight(value)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Value</label>
                        <input type='number' value={value} onChange={(e) => setValue(e.target.value)}/>
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color='red' onClick={() => setOpen(false)}>
                    <Icon name='x'/> Cancel
                </Button>
                <Button color='green' disabled={!flight} onClick={() => {
                    onConfirm(flight!, value);
                    setOpen(false);
                }}>
                    <Icon name='checkmark'/> Confirm
                </Button>
            </Modal.Actions>
        </Modal>
    };
