import { useToasts } from 'react-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';
import React, { Fragment, useEffect } from 'react';

import { RootState } from '../store/reducers';
import { dismissAction } from '../store/uiSlice';

export const AsyncActionNotifier: React.FC = () => {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const { action } = useSelector((state: RootState) => ({
        action: state.ui.action
    }));

    useEffect(() => {
        if (!action) {
            return;
        }

        switch (action.state) {
            case 'error':
                addToast(`${action.name} failed. Details: ${action.error}`, { appearance: 'error' });
                dispatch(dismissAction());
                break;
            case 'success':
                if (action.showNotification) {
                    addToast(`${action.name} completed successfully.`, { appearance: 'success' });
                    dispatch(dismissAction());
                }
                break;
        }

    }, [ action, dispatch, addToast ]);

    return <Fragment></Fragment>;
};
