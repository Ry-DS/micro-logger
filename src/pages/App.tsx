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
                <VideoItem fileName='welcome' startTime={1602823990542}>Welcome to Micro:Logger!</VideoItem>
                <VideoItem fileName='sensors' startTime={1602918840792}>Exploring the sensors</VideoItem>
                <VideoItem fileName='errors' startTime={1602920032281}>How does the ACK and Timeout features
                    work?</VideoItem>
                <VideoItem fileName='errors_real' startTime={1602920032281}>Error prevention in a real
                    scenario</VideoItem>
                <VideoItem fileName='micro_code' startTime={1602920032281}>A look into the Micro:bit's code</VideoItem>
                <VideoItem fileName='web_code' startTime={1602920032281}>A look into the Website's code</VideoItem>
                <VideoItem fileName='test' startTime={1602754611038}>Test</VideoItem>
            </ListGroup>
            <h3 className='mt-5 text-center'>Control the Micro:Bit connected to this PC</h3>
            <Row>
                <Col><Button variant='danger'>Restart</Button></Col>
                <Col><Button variant='warning'>Reset</Button></Col>
            </Row>

        </Container>
    );
}

function VideoItem({fileName, children, startTime, videoUrl}: PropsWithChildren<{ startTime: number, fileName: string, videoUrl?: string }>) {

    return <Link to={`/file/${fileName}/${startTime}${videoUrl ? `?videoUrl=${videoUrl}` : ''}`}><ListGroupItem
        action>{children}</ListGroupItem></Link>
}

export default App;
