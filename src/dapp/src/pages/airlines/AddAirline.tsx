import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form } from 'semantic-ui-react';
import { RootState } from '../../store/reducers';
import { useForm } from 'react-hook-form';
import Web3Utils from 'web3-utils';
import { registerAirline } from '../../store/airlinesSlice';

type FormData = {
    name: string;
    account: string;
};


export const AddAirline: React.FC = () => {
    const dispatch = useDispatch();

    const { action, loading } = useSelector((state: RootState) => ({
        loading: state.ui.loading,
        action: state.ui.action
    }));

    const { register, handleSubmit, errors } = useForm<FormData>();

    const addAirline = handleSubmit((data: FormData) => {
        dispatch(registerAirline(data.name, data.account));
    });

    return <Fragment>
        <h3>Add New Airline</h3>
        <Form>
            <Form.Field required error={!!errors.name}>
                <label>Name</label>
                <input name="name"
                       ref={register({
                                         required: 'Name is required'
                                     })}
                       placeholder='Name'/>
                {errors.name && <div className="ui pointing above prompt label" role="alert">{errors.name.message}</div>}
            </Form.Field>
            <Form.Field required error={!!errors.account}>
                <label>Account</label>
                <input name="account"
                       ref={register({
                                         required: 'Account is required',
                                         validate: value => Web3Utils.isAddress(value) || 'Must be a valid address'
                                     })}
                       placeholder='0x...'/>
                {errors.account && <div className="ui pointing above prompt label" role="alert">{errors.account.message}</div>}
            </Form.Field>
            <Button type='submit' primary loading={action === 'Register new airline' && loading} onClick={addAirline}>Submit</Button>
        </Form>
    </Fragment>;
};
