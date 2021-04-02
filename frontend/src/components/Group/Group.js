import React, {Component} from 'react';
import '../../App.css';
import cookie from 'react-cookies';
import Navbar from '../Navbar/Navbar';
import AddExpense from '../Func/AddExpense';
import {Container,Col,Row} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getGroupContent,getGroupList } from '../../api/request';
import { connect } from 'react-redux'
import moment from 'moment-timezone';

class Group extends Component{
    constructor(props) {
         super(props)
         this.state = {
               groupList : [],
               expenses : [],
               members : []
         }
    }
    componentDidMount() {
        getGroupList(this.props.userInfo).then(res => {
             this.setState({
                  groupList : res,
                  currentGroup : res[0] || {}
             })
             if(this.state.currentGroup.id) {
                getGroupContent(this.state.currentGroup.id).then(data => {
                    this.setState({
                        expenses : data.expenses,
                        members : data.members
                    })
                })   
             }
             
        })
        if(!cookie.load('cookie')){
            this.props.history.push('/')
           }
        
    }
    changeGroup(item) {
        this.setState({
             currentGroup : item
        })
        getGroupContent(item.id).then(data => {
            this.setState({
                expenses : data.expenses,
                members : data.members
            })
        })   
    }
    addExpenseResolve() {
        // update view after add expense.
        getGroupContent(this.state.currentGroup.id).then(data => {
            this.setState({
                expenses : data.expenses,
                members : data.members
            })
        })
    }
    render(){
        let {
            groupList,
            currentGroup,
            expenses,
            members
        } = this.state
        let {  Timezone } = this.props.userInfo
        return(
            <div>
                <Navbar history={this.props.history}/>
                <Container>
                    <h1 style={{overflow:'hidden'}}>Group
                      <div style={{ float : 'right'}}>
                        <AddExpense updateCallback={ this.addExpenseResolve.bind(this) }></AddExpense>
                        {/* <a className='btn btn-primary' style={{ marginLeft : '20px' }}>Settle up</a> */}
                      </div>
                    </h1> 
                    <Row className="show-grid">
                        <Col style={{textAlign:'left'}} xs={4} md={4}>
                        <h3 className='mt20'>Groups</h3>
                        <div className='recent-list  mt20'>
                            {
                                groupList.map((item,index) => {
                                    return  <div className={`recent-item cur ${currentGroup.id===item.id?'checked':''}`} key={item.id}  onClick={this.changeGroup.bind(this,item)}>
                                            <img className='pic' alt=" " src={item.picture||''}></img>
                                            <div className='right-box' style={{ textAlign : 'left'}}>
                                                <h4>{item.name}</h4>
                                            </div>
                                    </div>
                                })
                            }
                        </div>
                      </Col>
                      <Col style={{textAlign:'center'}} xs={5} md={5}>
                          <h3 className='mt20'>EXPENSE</h3>
                          {
                               expenses.length ? expenses.map(item => {
                               return <div key={item.id} className='flex' style={{ justifyContent:'space-between',alignItems:'center',paddingBottom:'10px',borderBottom:'1px solid #dddddd' }}>
                                        <div style={{ textAlign:'left'}}>
                                            <div title={moment(item.create_at).format('YYYY-MM-DD')}>{moment(item.create_at).tz(Timezone).format('YYYY-MM-DD ha z')}</div>
                                            <div>Group name:<span className='color-primary'>{item.group_name}</span></div> 
                                            <div>Creator : <span className='color-primary'>{item.creator_name}</span></div> 
                                        </div>
                                        <div>
                                            <div>expense name:<span className='color-primary'>{item.name}</span></div> 
                                            <div><span>{this.props.userInfo.currencyStr}</span><span className='color-primary'>{item.money}</span></div> 
                                        </div>
                                   </div>
                               }):<div>no any expense</div>
                          }
                      </Col>
                      <Col style={{textAlign:'right'}} xs={3} md={3}>
                          <h3 className='mt20'>GROUP BALANCES</h3>
                          {
                               members.length ? members.map(item => {
                               return <div key={item.id}>{item.Name}<span style={{marginLeft:'20px'}}>{this.props.userInfo.currencyStr} {item.balance}</span></div>
                               }):<div>no any balances</div>
                          }
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
Group = connect(mapStateToProps)(Group)
export default Group;