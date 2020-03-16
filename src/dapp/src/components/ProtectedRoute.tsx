import { Redirect, Route, RouteProps } from 'react-router-dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

interface ProtectedRouteProps extends RouteProps {
    allowedRole: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
    const { children, allowedRole, ...rest } = props;
    const { role } = useSelector(
        (state: RootState) => ({ role: state.blockchain.role }));

    return <Route
        {...rest}
        render={({ location }) =>
            role === allowedRole ? (children) :
                (
                    <Redirect
                        to={{
                            pathname: '/home',
                            state: { from: location }
                        }}
                    />
                )
        }
    />;
};
