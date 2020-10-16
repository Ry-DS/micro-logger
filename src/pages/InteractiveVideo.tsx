import React, {createRef, useEffect, useState} from 'react';
import {Link, RouteChildrenProps} from "react-router-dom";
import Sketch from "react-p5";
import p5Types from 'p5';
import model from '../resources/mb_simplified.stl'
import {Button, Col, Container, Row} from "react-bootstrap";

import Thermometer from 'react-thermometer-component'
import Compass from '../util/ReactCompass';
import ReactPlayer from "react-player";

// p5js real-time model
let microModel: p5Types.Geometry;
let angles: Angles = {xAngle: 0, yAngle: Math.PI / 2, zAngle: 0};
const setup = (p5: p5Types, elem: Element) => {
    p5.createCanvas(500, 500, "webgl").parent(elem)
    microModel = p5.loadModel(model);
    p5.angleMode('radians');
}
const draw = (p5: p5Types) => {
    p5.background('#000000');
    p5.scale(85)
    p5.orbitControl()
    // z is x angle
    // x is y angle
    // y is z angle
    // flip Y dimension, model is flipped.
    p5.rotateX(Math.PI);
    p5.rotateZ(-angles.xAngle);
    p5.rotateX(-angles.yAngle);
    // p5.rotateY(angles.zAngle)
    p5.model(microModel)
}

type CSVObject = {
    timestamp: number;
    time_took: number;
    acc_x: number;
    acc_y: number;
    acc_z: number;
    temp: number;
    compass: number;
}
type Angles = {
    xAngle: number;
    yAngle: number;
    zAngle: number;

}

function InteractiveVideo({match, history}: RouteChildrenProps<{ filePrefix: string, recordTime: string }>) {
    const file = match?.params?.filePrefix;
    const recordTime = parseInt(match?.params?.recordTime || '');

    const [csvFile, setCsvFile] = useState<CSVObject[]>([]);
    const [resultPosition, setResultPosition] = useState<CSVObject>();
    const videoPlayer = createRef<ReactPlayer>();


    // load file
    useEffect(() => {
        fetch(`/videos/${file}.csv`).then((res) => res.text())
            .then(res => {
                if (res.includes('html'))
                    throw new Error("Not found")
                const lines = res.split('\n');
                const header = lines[0].split(',')
                const items: CSVObject[] = []
                // ignore first and last item (header and newline)
                for (let i = 1; i < lines.length - 1; i++) {
                    const numbers = lines[i].split(',').map(Number);
                    const item: any = {}
                    for (let j = 0; j < header.length; j++) {
                        item[header[j].replace(/[\n\r]/g, '')] = numbers[j];
                    }
                    items.push(item as CSVObject);

                }

                console.log(items);
                setCsvFile(items)
            })
            .catch(err => {
                console.error(err)
                history.push('/404')
            })
    }, [file, history])

    // calculate position in video for meters to update
    useEffect(() => {
        const player = videoPlayer.current;
        if (!player)
            return;

        const onVidPlay = () => {
            if (csvFile.length === 0)
                return;
            const time = player.getCurrentTime() * 1000 + recordTime;
            const closest = binarySearch(csvFile, time);
            setResultPosition(closest);

        }

        const htmlVideo = player.getInternalPlayer() as HTMLVideoElement | null;
        if (htmlVideo)
            htmlVideo.addEventListener('timeupdate', onVidPlay)
        return () => {
            if (htmlVideo)
                htmlVideo.removeEventListener("timeupdate", onVidPlay);
        };

    }, [csvFile, recordTime, videoPlayer]);
    // update p5 model
    useEffect(() => {
        if (resultPosition)
            angles = accToAngles(resultPosition);
    }, [resultPosition])

    if (!file || !recordTime)
        history.push('/404')


    return (
        <Container style={{overflowX: 'hidden'}}>

            <Row className='m-5 ml-1'><Link to='/'><Button>Go Back Home</Button></Link></Row>
            <Row>
                <Col md={6}>
                    <Sketch setup={setup} draw={draw} style={{maxWidth: '100%'}}/>
                </Col>
                <Col md={6}>
                    <ReactPlayer ref={videoPlayer} controls={true} url={`/videos/${file}.mp4`}
                                 style={{maxWidth: '100%'}}/>
                </Col>
            </Row>
            <Row className='mt-4'>
                <Col md={6} className='d-flex align-items-center justify-content-center'>
                    <Thermometer theme="light"
                                 value={resultPosition?.temp}
                                 max="100"
                                 steps="3"
                                 format="°C"
                                 height="300"/>


                </Col>
                <Col md={6}><Compass direction={resultPosition?.compass} style={{transform: 'scale(0.5)'}}/></Col>
            </Row>
        </Container>
    );
}

/**
 * A modified binary search algorithm to find the closest csv result to match the time.
 * Sourced: https://www.geeksforgeeks.org/binary-search-in-javascript/
 * Modified to support closest value instead.
 */
function binarySearch(arr: CSVObject[], target: number, start: number = 0, end: number = arr.length - 1): CSVObject {
    // Base Condition
    if (start > end) throw Error("Unexpected case!");

    // Find the middle index
    let mid = Math.floor((start + end) / 2);

    // Compare mid with given key x
    if (arr[mid].timestamp === target || start === end) return arr[mid];

    // if difference is just one, get the closest between them two
    if (Math.abs(start - end) === 1) {
        if (Math.abs(arr[start].timestamp - target) < Math.abs(arr[end].timestamp - target))
            return arr[start];
        else return arr[end];
    }

    // If element at mid is greater than x,
    // search in the left half of mid
    if (arr[mid].timestamp > target)
        return binarySearch(arr, target, start, mid - 1);
    else
        // If element at mid is smaller than x,
        // search in the right half of mid
        return binarySearch(arr, target, mid + 1, end);
}

/**
 * Acceleration values to angles, in radians
 * Sourced from:
 * http://wizmoz.blogspot.com/2013/01/simple-accelerometer-data-conversion-to.html
 * If this algorithm fails, backup: https://wiki.dfrobot.com/How_to_Use_a_Three-Axis_Accelerometer_for_Tilt_Sensing
 */
function accToAngles(res: CSVObject): Angles {
    const {acc_x: ax, acc_y: ay, acc_z: az} = res;
    const sqrt = Math.sqrt;
    const square = (num: number) => num * num;

    let xAngle = Math.atan(ax / (sqrt(square(ay) + square(az))));
    let yAngle = Math.atan(ay / (sqrt(square(ax) + square(az))));
    // Never used let zAngle = Math.atan(sqrt(square(ax) + square(ay)) / az);

    return {xAngle, yAngle, zAngle: 0};
}

export default InteractiveVideo;