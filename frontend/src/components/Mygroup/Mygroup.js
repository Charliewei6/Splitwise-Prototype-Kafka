import React, {Component} from 'react';
import '../../App.css';
import cookie from 'react-cookies';
import axios from 'axios';
import {Container,Col,Row,Form} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../Navbar/Navbar';
import { getInvite,getGroupList,agreeRequest,quitGroup } from '../../api/request'
import { connect } from 'react-redux';
class Mygroup extends Component{
    constructor(props) {
         super(props)
         this.state = {
            inviteList : [],
            groupList : []
         }
         this.searchHandler = this.searchGroup.bind(this)
    }
    searchGroup(e) {
        let val = e.target.value
        getGroupList(this.props.userInfo,val).then(res=> {
            this.setState({
                groupList : res
            })
        })
    }
    componentDidMount() {
        if(!localStorage.getItem('token')){
            this.props.history.push('/')
        }
        axios.defaults.headers.common['authorization'] = localStorage.getItem('token');
        getInvite(this.props.userInfo).then(res=> {
             this.setState({
                 inviteList : res
             })
             
        })
        getGroupList(this.props.userInfo).then(res=> {
            this.setState({
                groupList : res
            })
        })
        // if(!cookie.load('cookie')){
        //     this.props.history.push('/')
        //    }
    }
    logoutGroup(item,e) {
         e.stopPropagation()
         let data = {
            user_id : this.props.userInfo._id,
            group_id : item.group_id._id
         }
         quitGroup(data).then(res => {
              if(res.code === 0) {
                   alert('You can only leave this group after cleared all dues')
              }else {
                getGroupList(this.props.userInfo).then(res=> {
                    this.setState({
                        groupList : res
                    })
                }) 
              }
         })
    }
    handlerAgree(item) {
        agreeRequest(item._id).then(data => {
            
              getInvite(this.props.userInfo).then(res=> {
                this.setState({
                    inviteList : res
                })
                getGroupList(this.props.userInfo).then(res=> {
                    this.setState({
                        groupList : res
                    })
                }) 
           })
         })
    }
    render(){
        let { inviteList,groupList } = this.state
        return(
            <div>
                <Navbar history={this.props.history}/>
                <Container>
                    <h1 style={{overflow:'hidden'}}>My Group</h1> 
                    <Row className="show-grid">
                      <Col style={{textAlign:'left'}} xs={6} md={6}>
                          <h3 className='mt20'>invite list</h3>
                          {
                               inviteList.length ? 
                               inviteList.map((item,index) => {
                               return <div style={{margin:'10px 0',paddingBottom:'10px',borderBottom:'1px solid #dddddd'}} key={item._id} >
                                   <span className='color-primary'>{item.inviter_name}</span> invites you join in the group: <span className='color-primary'>{item.group_name}</span>
                               <a className='btn btn-primary' style={{marginLeft:'10px'}} onClick={this.handlerAgree.bind(this,item)}>Agree</a></div>
                               })
                               :<div className='mt20'>nothing</div>
                          }
                      </Col>
                      <Col style={{textAlign:'right'}} xs={6} md={6}>
                          <h3 className='mt20'>Group list</h3>
                          <Form.Control onChange = {this.searchHandler}  type="search" name = "search" placeholder="search group" />
                          <div className='recent-list mt20'>
                            {
                                groupList.map((item,index) => {
                                    return  <div className='recent-item' key={item.group_id._id} onClick={() => {
                                        this.props.history.push(`/detail/${item.group_id._id}`) 
                                    }}>
                                            <img className='pic' alt=" " src={item.group_id.picture||''}></img>
                                            <div className='right-box' style={{ textAlign : 'left'}}>
                                                <h4>{item.group_id.name}</h4>
                                            </div>
                                            <a className='btn btn-info' style={{marginLeft:'10px'}} onClick={this.logoutGroup.bind(this,item)}>Leave</a>
                                    </div>
                                })
                            }
                        </div>
                      </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
let mapStateToProps = (state) => {
     return {
          userInfo : state.user
     }
}
Mygroup = connect(mapStateToProps)(Mygroup)
export default Mygroup;