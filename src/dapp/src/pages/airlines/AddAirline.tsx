import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form } from 'semantic-ui-react';
import { RootState } from '../../store/reducers';
import { registerAirline } from '../../store/airlinesSlice';

export const AddAirline: React.FC = () => {
    const dispatch = useDispatch();

    const { action, loading } = useSelector((state: RootState) => ({
        loading: state.ui.loading,
        action: state.ui.action
    }));

    const addAirline = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        dispatch(registerAirline('WhizzAir', '0xE00667B3e1F7E5ce2774bF3F056021b9b53003dE'));
    };

    return <Fragment>
        <h3>Add New Airline</h3>
        <Form>
            <Form.Field>
                <label>Name</label>
                <input placeholder='Name'/>
            </Form.Field>
            <Form.Field>
                <label>Account</label>
                <input placeholder='0x...'/>
            </Form.Field>
            <Button type='submit' primary loading={loading} onClick={addAirline}>Submit</Button>
        </Form>
    </Fragment>;
};
