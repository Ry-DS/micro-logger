import React from 'react';
import {RouteChildrenProps} from "react-router-dom";
import Sketch from "react-p5";
import p5Types from 'p5';
import model from './mb_simplified.stl'
import {Col, Container, Row} from "react-bootstrap";

import Thermometer from 'react-thermometer-component'
import Compass from './ReactCompass';


function InteractiveVideo({match, history}: RouteChildrenProps<{ filePrefix: string }>) {
    const file = match?.params?.filePrefix;
    if (!file)
        history.push('/404')
    let microModel: p5Types.Geometry;
    let angle: number = 0;

    const setup = (p5: p5Types, elem: Element) => {
        p5.createCanvas(500, 500, "webgl").parent(elem)
        microModel = p5.loadModel(model);
        p5.angleMode('degrees');
    }
    const draw = (p5: p5Types) => {
        p5.background('#f8b595');
        p5.scale(100)
        p5.orbitControl()
        p5.rotateX(angle)
        p5.model(microModel)
        angle += 1
    }

    return (
        <Container>
            <Row>
                <Col md={6}>
                    <Sketch setup={setup} draw={draw}/>
                </Col>
                <Col md={6}>
                    <h3>Video</h3>
                </Col>
            </Row>
            <Row>
                <Col md={6} className='d-flex align-items-center justify-content-center'>
                    <Thermometer theme="light"
                                 value="18"
                                 max="100"
                                 steps="3"
                                 format="°C"
                                 height="300"/>


                </Col>
                <Col md={6}><Compass direction={180} style={{transform: 'scale(0.5)'}}/></Col>
            </Row>
        </Container>
    );
}

export default InteractiveVideo;