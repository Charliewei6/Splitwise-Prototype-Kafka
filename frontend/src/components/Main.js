import React, {Component} from 'react';
import { Provider } from 'react-redux';
import {Route,Switch} from 'react-router-dom';
import Login from './Login/Login';
import Index from './LandingPage/index';
import Signup from './Signup/Signup';
import Dashboard from './Dashboard/Dashboard';
import Mygroup from './Mygroup/Mygroup';
import Creategroup from './Creategroup/Creategroup';
import Group from './Group/Group';
import Recent from './Recent/Recent';
import Profile from './Profile/Profile';
import store from '../store';

//Create a Main Component
class Main extends Component {
    render(){
        return(
            <Provider store={store}>
                {/*Render Different Component based on Route*/}
                {/* <Route path="/splitwise"  component={Navbar}/> */}
                <Switch>
                    <Route path="/login"  render={ (props) => <Login {...props} /> }/>
                    <Route path="/signup" render={ (props) => <Signup {...props} /> } />
                    <Route path="/dashboard" render={ (props) => <Dashboard {...props} /> }/>
                    <Route path="/mygroup" render={ (props) => <Mygroup {...props} /> }/>
                    <Route path="/creategroup" render={ (props) => <Creategroup {...props} /> } />
                    <Route path="/detail/:id" render={ (props) => <Creategroup {...props} /> } />
                    <Route path="/group" render={ (props) => <Group {...props} /> } />
                    <Route path="/recent" render={ (props) => <Recent {...props} /> }  />
                    <Route path="/profile" render={ (props) => <Profile {...props} /> } />
                    <Route path="/" render={ (props) => <Index {...props} /> } />
                </Switch>
            </Provider>
        )
    }
}
//Export The Main Component
export default Main;