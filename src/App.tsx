import React from 'react';
import 'bootstrap/scss/bootstrap.scss'

import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "react-bootstrap";

function App() {
    return (
        <Container className='vh-100 d-flex justify-content-center align-items-center flex-column'>
            <h1>Micro:Logger</h1>
            <p className='text-center'>
                Why?<br/>
                Because if I don't I fail this assignment
            </p>
            <b>Click an item to get started</b>
            <ListGroup>
                <ListGroupItem action>Welcome to Micro:Logger!</ListGroupItem>
                <ListGroupItem action>Exploring the Visual Logger</ListGroupItem>
                <ListGroupItem action>How does it work?</ListGroupItem>
                <ListGroupItem action>ACK and Timeout Error handling</ListGroupItem>
            </ListGroup>
            <h3 className='mt-5 text-center'>Control the Micro:Bit connected to this PC</h3>
            <Row>
                <Col><Button variant='danger'>Restart</Button></Col>
                <Col><Button variant='warning'>Reset</Button></Col>
            </Row>

        </Container>
    );
}

export default App;
