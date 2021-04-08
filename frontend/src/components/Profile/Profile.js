import React, {Component} from 'react';
import '../../App.css';
import cookie from 'react-cookies';
import Navbar from '../Navbar/Navbar';
import {Container,Form} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Profile.scss';
import { getProfile } from '../../api/request';
import { connect } from 'react-redux';
import { SET_USER } from '../../store/actionTypes';
import { changeUserInfo } from '../../api/request';
import UploadPic from '../../components/Func/UploadImg';
import defaultAvatar from './images/default_avatar.jpg';
import moment from 'moment-timezone';
let timeZone = moment.tz.names().map(item => {
    return {
         text : item,
         value : item
    }
})
class Profile extends Component{
    constructor(props){
        super(props);
        this.state = {
            name : "",
            email : "",
            phoneNumber: "",
            language : '',
            currency : '',
            timeZone:'',
            avatarUrl:'',
            err: "",
            currencies : [
                {
                    text:'USD($)',
                    value : 0
                },
                {
                    text:'KWD(KWD)',
                    value : 1
                },
                {
                    text:'BHD(BD)',
                    value : 2
                },
                {
                    text:'GBP(£)',
                    value : 3
                },
                {
                    text:'EUR(EUR)',
                    value : 4
                },
                {
                    text:'CAD($)',
                    value : 5
                }
            ],
            Languagies : [
                {
                     text : 'Chinese',
                     value : 0
                },
                {
                     text : 'English',
                     value : 1
                },
                {
                    text : 'Deutsch',
                    value : 2
               },
               {
                    text : 'Español',
                    value : 3
               },
               {
                        text : 'Français',
                        value : 4
                },
                {
                        text : 'Bahasa Indonesia',
                        value : 5
                },
                {
                            text : 'Italiano',
                            value : 6
                    },
                    {
                            text : '日本語',
                            value : 7
                    },
                    {
                        text : 'Nederlands',
                        value : 8
                },
                {
                    text : 'Português (Brasil)',
                    value : 9
            },
            {
                text : 'Svenska',
                value : 10
        },{
            text : 'ภาษาไทย',
            value : 11
    },
            ],
            timeZonies :timeZone,
            editingName : false,
            editingEmail : false,
            editingPhone : false
        }
    }
//get the books data from backend  
    componentDidMount(){
        if(!cookie.load('cookie')){
            this.props.history.push('/')
           }

        let { _id } = this.props.userInfo
        if(!_id) return;
        getProfile(this.props.userInfo._id).then(data => {
            this.props.setUser(data)
            let { Name,Email,Phone,Currency,Language,Timezone,Picture } = this.props.userInfo
            this.setState({
                name : Name || '',
                email : Email || '',
                phoneNumber : Phone || '',
                currency : Currency || 0,
                language : Language || 0,
                timeZone : Timezone || 'America/New_York',
                avatarUrl : Picture || ''
            })
       })
    }
    uploadSuccess(url) {
         this.setState({
            avatarUrl : url
         })
    }
    render(){
         let { editingName,editingEmail,editingPhone,name,email,phoneNumber } = this.state
       
        let { currencies,avatarUrl,Languagies,timeZonies,timeZone,language,currency } = this.state
        let { userInfo } = this.props
        return(
            <div>
                <Navbar history={this.props.history}/>
                <Container className='mt20'>
                    <h1 style={{overflow:'hidden'}}>Your account</h1> 
                    <div style={{overflow:'hidden'}}>
                        <div className='user-head'>
                            <img className='user-img' alt=" " src={ avatarUrl ||defaultAvatar } />  
                            <div>Change your avatar</div> 
                            <div><UploadPic uploadSuccess={this.uploadSuccess.bind(this)}></UploadPic></div>
                        </div>
                        <div className='user-info'>
                                <div className='title'>Your name</div>
                                <div className='content'>
                                    {
                                        editingName ? <Form.Control onChange = {this.handleControlComponents.bind(this,'name')}  type="text" name = "name" placeholder="Name" value={name} /> : <span className='txt'>{userInfo.Name}</span>
                                    }
                                    <a style={{ display : editingName ? 'none' : 'inline-block' }} className='edit' onClick={
                                         () => {
                                              this.setState({
                                                   editingName : true
                                              })
                                         }
                                    }>edit</a>
                                </div>
                                <div className='title'>Your email address</div>
                                <div className='content'>
                                    {
                                        editingEmail ? <Form.Control onChange = {this.handleControlComponents.bind(this,'email')}  type="email" name = "email" placeholder="email" value={email} /> : <span className='txt'>{userInfo.Email}</span>
                                    }
                                    <a style={{ display : editingEmail ? 'none' : 'inline-block' }} className='edit' onClick={
                                         () => {
                                              this.setState({
                                                   editingEmail : true
                                              })
                                         }
                                    }>edit</a>
                                </div>
                                <div className='title'>Your phone number</div>
                                <div className='content'>
                                    {
                                        editingPhone ? <Form.Control onChange = {this.handleControlComponents.bind(this,'phoneNumber')}  type="tel" name = "phone" placeholder="phone" value={phoneNumber} /> : <span className='txt'>{userInfo.Phone}</span>
                                    }
                                    <a style={{ display : editingPhone ? 'none' : 'inline-block' }} className='edit' onClick={
                                         () => {
                                              this.setState({
                                                   editingPhone : true
                                              })
                                         }
                                    }>edit</a>
                                </div>
                         </div>
                        <div className='config-box'>
                            <div className='title'>Your default currency</div>
                            <div className='chose'>
                                <select className='form-sel' value={currency} onChange={this.handleControlComponents.bind(this,'currency')}>
                                    {
                                         currencies.map((item,index) => {
                                         return <option key={index} value={item.value}>{item.text}</option>
                                         })
                                    }
                                </select>
                            </div>
                            <div className='title'>Your time zone</div>
                            <div className='chose'>
                                <select className='form-sel' value={timeZone} onChange={this.handleControlComponents.bind(this,'timeZone')}>
                                    {
                                         timeZonies.map((item,index) => {
                                            return <option  key={index} value={item.value}>{item.text}</option>
                                         })
                                    }
                                </select></div>
                            <div className='title'>Language</div>
                            <div className='chose'>
                                <select className='form-sel' value={language} onChange={this.handleControlComponents.bind(this,'language')}>
                                    {
                                         Languagies.map((item,index) => {
                                            return <option key={index} value={item.value}>{item.text}</option>
                                         })
                                    }
                                </select>
                            </div>
                         </div>
                    </div>
                    <div style={{ overflow : 'hidden'}}><a style={{float:'right'}} onClick={ this.saveProfile.bind(this) } className='btn btn-success'>save</a></div>
                </Container>
            </div>
        )
    }
    handleControlComponents(field,e) {
        this.setState({
            [field] : e.target.value
       })
    }
    saveProfile() {
         let { name,email,phoneNumber,currency,language,timeZone,avatarUrl } = this.state
         changeUserInfo({
            userId:this.props.userInfo._id,name,email,phoneNumber,currency,language,timeZone,avatarUrl
         }).then(() => {
              this.setState( {
                editingName : false,
                editingEmail : false,
                editingPhone : false
              })
              getProfile(this.props.userInfo._id).then(data => {
                  localStorage.setItem('userInfo',JSON.stringify(data))
                  this.props.setUser(data)
                  let { Name,Email,Phone,Currency,Language,Timezone,Picture } = this.props.userInfo
                  this.setState({
                        name : Name || '',
                        email : Email || '',
                        phoneNumber : Phone || '',
                        currency : Currency || 0,
                        language : Language || 0,
                        timeZone : Timezone || 'America/New_York',
                        avatarUrl : Picture || ''
                    })
              })
              alert('Save succeed')
              
         }).catch(err => {
            console.log('Save faild')
         })
        //  console.log(this.props.userInfo.id,name,email,phoneNumber,currency,language,timeZone,avatarUrl)
    }
}

let mapStateToProps = (state) => {
        return {
             userInfo : state.user
        }
}
let mapDispatch = (dispatch) => {
    return {
         setUser(data) {
              dispatch({
                   type : SET_USER,
                   data
              })
         }
    }
}
Profile = connect(mapStateToProps,mapDispatch)(Profile)
export default Profile;