import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlights } from '../../store/airlinesSlice';
import { RootState } from '../../store/reducers';

export const Flights = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchFlights());
    }, [ dispatch ]);


    const state = useSelector((state: RootState) => ({
        action: state.ui.action,
        flights: state.airlines.flights
    }));

    return (<div>Flights</div>);
};
