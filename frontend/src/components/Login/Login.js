import React, {Component} from 'react';
import '../../App.css';
import cookie from 'react-cookies';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Form,Col,Card} from 'react-bootstrap';
import { login,getProfile } from '../../api/request';
import { connect } from 'react-redux';
import { SET_USER } from '../../store/actionTypes';
class Login extends Component{
    //call the constructor method
    constructor(props){
        //Call the constrictor of Super class i.e The Component
        super(props);
        //maintain the state required for this component
        this.state = {
            email : "",
            password : "",
            err: ""
        }
        //Bind the handlers to this class
        this.emailChangeHandler = this.emailChangeHandler.bind(this);
        this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
        this.submitLogin = this.submitLogin.bind(this);
    }
    emailChangeHandler = (e) => {
        this.setState({
            email : e.target.value
        })
    }
    //password change handler to update state variable with the text entered by the user
    passwordChangeHandler = (e) => {
        this.setState({
            password : e.target.value
        })
    }
    //submit Login handler to send a request to the node backend
    submitLogin = (e) => {
        //prevent page from refresh
        e.preventDefault();
        const data = {
            email : this.state.email,
            password : this.state.password
        }
        //set the with credentials to true
        login(data).then(response => {
            cookie.save('cookie', response.id);
            getProfile(response.id).then(data => {
                data.Timezone = data.Timezone || 'Africa/Abidjan'
                data.Currency = data.Currency || 0
                localStorage.setItem('userInfo',JSON.stringify(data))                
                this.props.setUser(data)
                this.props.history.push('/dashboard')
            })
        }).catch((error) => this.setState({
            err: "Username or password invalid!"
        }))
    }

    render(){
        return(
            <div align="center">
                <Card className="text-white">
                <Card.Img src="https://i.picsum.photos/id/3/5616/3744.jpg?hmac=QSuBxtSpEv3Qm3iStn2b_Ikzj2EVD0jzn99m1n6JD9I" alt="Card image" />
                <Card.ImgOverlay>
                    <Card.Title>WELCOME TO SPLITWISE</Card.Title>
                <div align = "center">
                <Form onSubmit = {this.submitLogin} method="POST">
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Email address</Form.Label>
                        <Form.Control data-testid='login-email' onChange = {this.emailChangeHandler} type="email" name="email" placeholder="Enter email" required/>
                        <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control data-testid='login-password' onChange = {this.passwordChangeHandler}  type="password" name = "password" placeholder="Password" required/>
                    </Form.Group>
                </Col>
                <button class="btn btn-primary" type="submit">Log In</button>
                {/* <Button onClick = {this.submitLogin} variant="primary" type="submit">Submit</Button> */}
                </Form>
                <h5>{this.state.err}</h5>
                </div>
                </Card.ImgOverlay>
                </Card>
            </div>
        )
    }
}


Login = connect(null,(dispatch) => {
     return {
          setUser(user) {
            dispatch({
                 type:SET_USER,
                 data : user
            })
          }
     }
})(Login)



export default Login;