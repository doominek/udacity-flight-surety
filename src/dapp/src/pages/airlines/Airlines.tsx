import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchAirlines } from '../../store/airlinesSlice';

export const Airlines: React.FC = () => {
    const dispatch = useDispatch();
    dispatch(fetchAirlines());

    return (<div>Airlines</div>);
};
