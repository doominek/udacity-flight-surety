import Home from "./Home";
import { Container, Message } from "semantic-ui-react";
import React from "react";

interface ConnectionErrorProps {
  error: string
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({error}) => {
  return <Container>
    <Home/>
    <Message negative>
      <Message.Header>There was a problem with connecting to network.</Message.Header>
      <p>Details: {error}.</p>
      <p>Please ensure you're using browser with MetaMask installed and you're connected to the right network.</p>
    </Message>
  </Container>
}
