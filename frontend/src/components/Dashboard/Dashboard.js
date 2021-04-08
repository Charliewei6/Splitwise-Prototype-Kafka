import React, {Component} from 'react';
import '../../App.css';
import cookie from 'react-cookies';
import Navbar from '../Navbar/Navbar';
import {Container,Col,Row} from 'react-bootstrap';
import { connect } from 'react-redux';
import { getDashboard,settleUp,settleUpp } from '../../api/request';
import { SET_DASHBOARD } from '../../store/actionTypes'
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.scss';
class Dashboard extends Component{
    componentDidMount() {
      getDashboard(this.props.userInfo._id).then(data => {
          this.props.setDashBoard(data)
      })
      if(!cookie.load('cookie')){
        this.props.history.push('/')
       }
    }
    settleUpHandler() {
      settleUp(this.props.userInfo._id).then(res => {
          getDashboard(this.props.userInfo._id).then(data => {
            this.props.setDashBoard(data)
        })
      })
    }
    render(){
        let { dashData,userInfo } = this.props
        return(
            <div>
                <Navbar history={this.props.history}/>
                <Container>
                    <h1 style={{overflow:'hidden',marginRight:'-15px',marginLeft:'-20px'}}>Dashboard
                      <div style={{ float : 'right'}}>
                        <a className='btn btn-primary' style={{ marginLeft : '20px' }} onClick={this.settleUpHandler.bind(this)}>Settle up</a>
                      </div>
                    </h1> 
                    <Row className="show-grid">
                      <Col style={{ border: '1px solid #ccc'}} xs={6} md={4}>
                        <div className='txt'>total balance</div>
                        <div className='txt'><span>{userInfo.currencyStr}</span>{(dashData.total_balance || 0).toFixed(2)}</div>
                      </Col>
                      <Col style={{ border: '1px solid #ccc'}} xs={6} md={4}>
                        <div className='txt'>you owe</div>
                        <div className='txt'><span>{userInfo.currencyStr}</span>{(dashData.total_owe || 0).toFixed(2)}</div>
                      </Col>
                      <Col style={{ border: '1px solid #ccc'}} xs={6} md={4}>
                        <div className='txt'>you are owed</div>
                        <div className='txt'><span>{userInfo.currencyStr}</span>{(dashData.total_owed || 0).toFixed(2)}</div>
                      </Col>
                    </Row>
                    <Row className="show-grid">
                      <Col style={{textAlign:'left'}} xs={6} md={6}>
                          <h3 className='mt20'>YOU OWE</h3>
                          {
                            (dashData.owe && dashData.owe.length)?
                            <div className='recent-list mt20'>
                              {
                                  dashData.owe.map((item,index) => {
                                     return <div className='recent-item' key={index} style={{justifyContent:'flex-start',color:'#ff652f',cursor:'default'}}>
                                       you owe  {item.owed_id.Name} {userInfo.currencyStr}{item.money} in group "{item.expense_id.group_name}"
                                  </div>
                                  })
                               }
                            </div>
                            :
                            <div className='mt20'>You do not owe anything</div>
                          }
                          
                      </Col>
                      <Col style={{textAlign:'right'}} xs={6} md={6}>
                          <h3 className='mt20'>YOU ARE OWED</h3>
                          {
                            (dashData.owed && dashData.owed.length)?
                            <div className='recent-list mt20' style={{cursor:'default'}}>
                               {
                                  dashData.owed.map((item,index) => {
                                     return <div className='recent-item' key={index} style={{justifyContent:'flex-end',color:'#5bc5a7',cursor:'default'}}>
                                         {item.owe_id.Name}  owes you  {userInfo.currencyStr}{item.money}  in group "{item.expense_id.group_name}"
                                      </div>
                                  })
                               }
                            </div>
                            :<div className='mt20'>You are not owed anything</div>
                          }
                          
                      </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
let mapStateToProps = (state) => {
  console.log(state)
   return {
      dashData : state.dashboard,
      userInfo : state.user
   }
}
let mapDispatch = (dispatch) => {
  return {
      setDashBoard(data) {
         dispatch({
            type : SET_DASHBOARD,
            data
         })
      }
  }
}
Dashboard = connect(mapStateToProps,mapDispatch)(Dashboard)
export default Dashboard;