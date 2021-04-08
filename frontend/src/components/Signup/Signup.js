import React, {Component} from 'react';
import '../../App.css';
import { signUP,login,getProfile } from '../../api/request.js';
import cookie from 'react-cookies';
import {Form,Col,Card} from 'react-bootstrap';
import { connect } from 'react-redux';
import { SET_USER } from '../../store/actionTypes';
//Define a Signup Component
class Signup extends Component{
    
    constructor(props){
        super(props);
        this.state = {
            name : "",
            email : "",
            password : "",
            err: ""
        }
        // Bind the handlers to this class
        this.nameHandler = this.nameHandler.bind(this);
        this.emailHandler = this.emailHandler.bind(this);
        this.passwordHandler = this.passwordHandler.bind(this);
        this.submitSignup = this.submitSignup.bind(this);
    }
    nameHandler = (e) => {
        this.setState({
            name : e.target.value
        })
    }
    emailHandler = (e) => {
        this.setState({
            email : e.target.value
        })
    }
    //password change handler to update state variable with the text entered by the user
    passwordHandler = (e) => {
        this.setState({
            password : e.target.value
        })
    }
    //submit Login handler to send a request to the node backend
    submitSignup = (e) => {
        e.preventDefault();
        const data = {
            email : this.state.email,
            name : this.state.name,
            password : this.state.password
        }
        let emailPartten = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
        if(!emailPartten.test(data.email)) {
            this.setState({
                 err : 'Email format invalid!'
            })
        }else {
            signUP(data)
                .then(response => {
                      this.loginHandler()
                }).catch((error) => this.setState({
                    err: "Email Already Existed!"
                }))    
        }
        
    }
    loginHandler() {
        login({
            email:this.state.email,
            password : this.state.password
        }).then(res => {
            cookie.save('cookie', res.id);
            getProfile(res.id).then(data => {
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
            <div>
                <div align = "center">
                <Card className="text-white">
                <Card.Img src="https://i.picsum.photos/id/3/5616/3744.jpg?hmac=QSuBxtSpEv3Qm3iStn2b_Ikzj2EVD0jzn99m1n6JD9I" alt="Card image" />
                <Card.ImgOverlay>
                    <Card.Title>INTRODUCE YOURSELF</Card.Title>
                    <Form onSubmit={this.submitSignup} method="POST">
                        <Col xs={3}>
                            <Form.Group>
                            <Form.Label>Hi there! My name is</Form.Label>
                            <Form.Control data-testid='Signup-name' onChange = {this.nameHandler} required type="text" name = "name" placeholder="Name" required />
                            </Form.Group>
                        </Col>
                        <Col xs={3}>
                            <Form.Group>
                                <Form.Label>Here’s my email address:</Form.Label>
                                <Form.Control data-testid='Signup-email' onChange = {this.emailHandler} type="email" name="email" placeholder="Email Address"required />
                            </Form.Group>
                        </Col>
                        <Col xs={3}>
                            <Form.Group>
                            <Form.Label>And here’s my password:</Form.Label>
                            <Form.Control data-testid='Signup-password' onChange = {this.passwordHandler}  type="password" name = "password" placeholder="Password" required/>
                            </Form.Group>
                        </Col>
                        <button class="btn btn-primary" type="submit">Submit</button>
                        {/* <Button onClick = {this.submitSignup}  variant="primary" type="submit">Submit</Button> */}

                </Form>
                {this.state.err}

                </Card.ImgOverlay>
                </Card>     

                
            </div>

            </div>
        )
    }
}
Signup = connect(null,(dispatch) => {
    return {
         setUser(user) {
           dispatch({
                type:SET_USER,
                data : user
           })
         }
    }
})(Signup)
export default Signup;