import React from 'react';
import ReactDOM from 'react-dom';
import App from './pages/App';
import * as serviceWorker from './serviceWorker';
import {HashRouter, Redirect, Route, Switch} from 'react-router-dom'
import InteractiveVideo from "./pages/InteractiveVideo";
import './scss/index.scss'
import 'bootstrap/scss/bootstrap.scss'

ReactDOM.render(
    <React.StrictMode>
        <HashRouter basename='/'>
            <Switch>
                <Route exact path='/' component={App}/>
                <Route path='/file/:filePrefix/:recordTime' component={InteractiveVideo}/>
                <Route path='/404'><h1>404 Not Found</h1></Route>
                <Redirect to='/404'/>
            </Switch>
        </HashRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
