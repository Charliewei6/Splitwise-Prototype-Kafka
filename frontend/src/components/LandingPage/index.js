import { Jumbotron } from 'react-bootstrap';
import { Redirect } from 'react-router';
import cookie from 'react-cookies';
import Navbar from '../Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

export default function Index(props) {
     return (
        <div>
            {
                // cookie.load('cookie')?<Redirect to= "/dashboard"/>:null
            }
            <Navbar histroy={props.history}></Navbar>
            <Jumbotron style={{ height : 'calc(100vh - 64px)', marginBottom:0}}>
                <h1>Less stress when sharing expenses on trips.</h1>
                <p>TKeep track of your shared expenses and balances with housemates, trips, groups, friends, and family.</p>
                <p>
                    {/* <a className="btn btn-info btn-lg" href="/signup" role="button">Sign Up</a> */}
                    <Link className="btn btn-info btn-lg" to='/signup'>Sign Up</Link>
                    
                </p>
            </Jumbotron>
        </div>
    )
}