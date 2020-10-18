import React, {PropsWithChildren} from 'react';


import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "react-bootstrap";
import {Link} from "react-router-dom";

function App() {

    return (
        <Container className='vh-100 d-flex justify-content-center align-items-center flex-column'>
            <h1>Micro:Logger</h1>
            <p className='text-center'>
                A powerful, interactive logger for your Micro:Bit.
            </p>
            <b>Click an item to get started</b>
            <ListGroup>
                <VideoItem fileName='welcome' startTime={1603002903403} videoUrl={'https://youtu.be/tFzeVXQATA0'}>Welcome
                    to Micro:Logger!</VideoItem>
                <VideoItem fileName='sensors' startTime={1602918840792} videoUrl='https://youtu.be/hwPAFkCkD8w'>Exploring
                    the sensors</VideoItem>
                <VideoItem fileName='errors' startTime={1602920032281} videoUrl='https://youtu.be/HIJRud5PTjo'>How does
                    the ACK and Timeout features
                    work?</VideoItem>
                <VideoItem fileName='errors_real' startTime={1602920032281} videoUrl='https://youtu.be/EKtGYOADuSo'>Error
                    prevention in a real
                    scenario</VideoItem>
                <VideoItem fileName='micro_code' startTime={1602920032281} videoUrl='https://youtu.be/dEbN2fJS_bU'>A
                    look into the Micro:bit's code</VideoItem>
                <VideoItem fileName='pc_code' startTime={1602997561068} videoUrl='https://youtu.be/eIw1nj0tlAM'>A look
                    into the PC's code</VideoItem>
                <VideoItem fileName='web_code' startTime={1602920032281} videoUrl='https://youtu.be/bp_MS6-q8Vs'>A look
                    into the Website's code</VideoItem>

            </ListGroup>
            <h3 className='mt-5 text-center'>Control the Micro:Bit connected to this PC</h3>
            <Row>
                <Col><a href='/restart'><Button variant='dark'>Restart</Button></a></Col>
                <Col><a href='/reset'><Button variant='warning'>Reset</Button></a></Col>
                <Col><a href='/stop'><Button variant='danger'>Stop</Button></a></Col>
            </Row>

        </Container>
    );
}

function VideoItem({fileName, children, startTime, videoUrl}: PropsWithChildren<{ startTime: number, fileName: string, videoUrl?: string }>) {

    return <Link to={`/file/${fileName}/${startTime}${videoUrl ? `?videoUrl=${videoUrl}` : ''}`}><ListGroupItem
        action>{children}</ListGroupItem></Link>
}

export default App;
