import React,{Component} from 'react';
import cookie from 'react-cookies';
import {NavDropdown} from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
//create the Navbar Component
class Navbar extends Component {
    handleLogout = () => {
        // cookie.remove('cookie', { path: '/' })
        // localStorage.removeItem('userInfo')
        localStorage.clear();
        this.props.history.push('/');
    }
    render(){
        if(localStorage.getItem('token')){
            return(
                <div>   
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div className="container-fluid">
                        {/* <a className="navbar-brand" href="/dashboard">Splitwise</a> */}
                        <Link className="navbar-brand" to='/dashboard'>Splitwise</Link>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                        </button>
                    
                        <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav mr-auto" >
                            <li className="nav-item">
                            {/* <a className="nav-link active" aria-current="page" href="/dashboard">Dashboard</a> */}
                            <Link className="nav-link active" to='/dashboard'>Dashboard</Link>
                            </li>
                            <li className="nav-item">
                            <Link className="nav-link active" to='/recent'>Recent Activities</Link>
                            {/* <a className="nav-link active" href="/recent">Recent Activities</a> */}
                            </li>
                            <li className="nav-item">
                            <Link className="nav-link active" to='/group'>Group</Link>
                            {/* <a className="nav-link active" href="/group">Group</a> */}
                            </li>
                            
                        </ul>
                            <NavDropdown color="white" title={ this.props.userInfo.Name } id="basic-nav-dropdown"> 
                                <NavDropdown.Item ><Link to='/profile'>My Profile</Link></NavDropdown.Item>
                                <NavDropdown.Item ><Link to='/mygroup'>My group</Link></NavDropdown.Item>
                                <NavDropdown.Item ><Link to='/creategroup'>Create a group</Link></NavDropdown.Item>
                            </NavDropdown>
                            <a className="btn btn btn-outline-success btn-lg" onClick = {this.handleLogout} role="button">Logout</a>
                        </div>
                        </div>
                </nav> 
                </div>
        )}
        else{
            return(
                <div>
                    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                        <div className="container-fluid">
                            <Link to='/' className="navbar-brand">Splitwise</Link>
                            {/* <a className="navbar-brand" href="/">Splitwise</a> */}
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                            </button>
                            <div>
                            <Link to='/login' style={{ color : '#FFFFFF'}} className="btn btn-lg">Login</Link>
                            <Link to='/signup' className="btn btn-info btn-lg">SignUp</Link>
                            {/* <a style={{ color : '#FFFFFF'}} className="btn btn-lg" data-testid='Login' href="/login" role="button">Login</a>
                            <a className="btn btn-info btn-lg" href="/signup" role="button">SignUp</a> */}
                        </div>
                        </div>
                    </nav>
                </div>        
        )
        }
    }
}

let mapStateToProps = (state) => {
    return {
       userInfo : state.user
    }
 }
 Navbar = connect(mapStateToProps)(Navbar)
 export default Navbar;