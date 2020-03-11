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
    new Flight(airlines.Lufthansa, 'SL-7364', moment(), FlightStatus.UNKNOWN),
    new Flight(airlines.Lufthansa, 'KN-4125', moment(), FlightStatus.UNKNOWN),
    new Flight(airlines.WhizzAir, 'WZ-0401', moment(), FlightStatus.UNKNOWN),
    new Flight(airlines.WhizzAir, 'WZ-9041', moment(), FlightStatus.UNKNOWN),
    new Flight(airlines.WhizzAir, 'WZ-8744', moment(), FlightStatus.UNKNOWN),
    new Flight(airlines.FlyEmirates, 'YZ-1515-TN', moment(), FlightStatus.UNKNOWN),
    new Flight(airlines.FlyEmirates, 'YZ-0392-LO', moment(), FlightStatus.UNKNOWN),
    new Flight(airlines.PLLLot, 'WAW-KRK-3104', moment(), FlightStatus.UNKNOWN),
    new Flight(airlines.PLLLot, 'KRK-WAW-3106', moment(), FlightStatus.UNKNOWN)
];

const flightsByKey = _.keyBy(flights, f => f.key);

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
