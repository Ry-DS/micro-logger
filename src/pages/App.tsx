import React, {PropsWithChildren} from 'react';


import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "react-bootstrap";
import {Link} from "react-router-dom";

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
                <VideoItem fileName='welcome' startTime={1602754611038}>Welcome to Micro:Logger!</VideoItem>
                <VideoItem fileName='sss' startTime={1602754611038}>Exploring the Visual Logger</VideoItem>
                <VideoItem fileName='sss' startTime={1602754611038}>How does it work?</VideoItem>
                <VideoItem fileName='sss' startTime={1602754611038}>ACK and Timeout Error handling</VideoItem>
            </ListGroup>
            <h3 className='mt-5 text-center'>Control the Micro:Bit connected to this PC</h3>
            <Row>
                <Col><Button variant='danger'>Restart</Button></Col>
                <Col><Button variant='warning'>Reset</Button></Col>
            </Row>

        </Container>
    );
}

function VideoItem({fileName, children, startTime}: PropsWithChildren<{ startTime: number, fileName: string }>) {

    return <Link to={`/file/${fileName}/${startTime}`}><ListGroupItem action>{children}</ListGroupItem></Link>
}

export default App;
