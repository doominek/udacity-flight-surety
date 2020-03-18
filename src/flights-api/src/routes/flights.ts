import { Router } from 'express';
import moment from 'moment';
import { Airline, Flight, FlightStatus } from '../model/flight';
import _ from 'lodash';

const router = Router();

const airlines: { [key: string]: Airline } = {
    Lufthansa: new Airline('Lufthansa', '0x486aE5cb7a2C8Ab030180161BeB49645218F221c'),
    WhizzAir: new Airline('WhizzAir', '0xE00667B3e1F7E5ce2774bF3F056021b9b53003dE'),
    FlyEmirates: new Airline('Fly Emirates', '0x83E301C48166C12044BbdF5BC412eFaeD1fe2a60'),
    PLLLot: new Airline('PLL Lot', '0x96336825ce08239EF9Cf919f58e4Cdf24FA6B037')
};

const flights: Flight[] = [
    new Flight(airlines.Lufthansa, 'NY-2413', moment('2020-03-01T13:00:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.Lufthansa, 'SL-7364', moment('2020-03-02T12:00:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.Lufthansa, 'KN-4125', moment('2020-03-03T16:00:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.WhizzAir, 'WZ-0401', moment('2020-03-03T02:00:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.WhizzAir, 'WZ-9041', moment('2020-03-07T17:00:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.WhizzAir, 'WZ-8744', moment('2020-03-07T19:00:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.FlyEmirates, 'YZ-1515-TN', moment('2020-03-08T22:00:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.FlyEmirates, 'YZ-0392-LO', moment('2020-03-09T11:00:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.PLLLot, 'WAW-KRK-3104', moment('2020-03-10T12:30:00Z'), FlightStatus.UNKNOWN),
    new Flight(airlines.PLLLot, 'KRK-WAW-3106', moment('2020-03-11T07:00:00Z'), FlightStatus.UNKNOWN)
];

export const flightsByKey = _.keyBy(flights, f => f.key);

router.get('/flights', function (req, res, next) {
    res.send(flights);
});

router.post('/flights/:flightKey/update-status', (req, res, next) => {
    const flight = flightsByKey[req.params.flightKey];

    if (!flight) {
        return res.status(404).send({ message: `Could not find flight for key: ${req.params.flightKey}` });
    }

    try {
        flight.status = req.body.status;

        res.send(flight);
    } catch (e) {
        return res.status(501).send({ message: e.message });
    }
});

export default router;
