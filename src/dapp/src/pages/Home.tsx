import { Container, Header, Icon } from 'semantic-ui-react';
import React from 'react';

export default () =>
    <Container textAlign='center'>
        <Header as={'h2'}>Flight Surety</Header>
        <Icon.Group size='huge'>
            <Icon size='big' name='circle outline'/>
            <Icon name='plane'/>
        </Icon.Group>
        <Header as='h2'>
            <Header.Subheader>
                Have a safe flight.
            </Header.Subheader>
        </Header>
    </Container>
