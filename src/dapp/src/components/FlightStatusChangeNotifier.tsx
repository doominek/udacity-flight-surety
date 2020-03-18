import { useToasts } from 'react-toast-notifications';
import { useDispatch } from 'react-redux';
import React, { Fragment, useEffect } from 'react';
import { subscribeToFlightStatusInfoEvent, unsubscribeFromFlightStatusInfoEvent } from '../store/passengersSlice';
import { FlightStatus } from '../types/flights';

export const FlightStatusChangeNotifier: React.FC = () => {
    const dispatch = useDispatch();
    const { addToast } = useToasts();

    useEffect(() => {
        dispatch(subscribeToFlightStatusInfoEvent(
            (flight, status) => {
                addToast(`Status of flight ${flight}: ${FlightStatus[status]}`, { appearance: 'info' });
            }));
        return () => {
            dispatch(unsubscribeFromFlightStatusInfoEvent());
        }
    }, [ dispatch, addToast ]);

    return <Fragment></Fragment>;
};
