import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter, Route} from 'react-router-dom'
import InteractiveVideo from "./InteractiveVideo";


ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Route path='/file/:filePrefix' component={InteractiveVideo}/>
            <Route exact path='/' component={App}/>
            <Route path='/404'><h1>404 Not Found</h1></Route>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
