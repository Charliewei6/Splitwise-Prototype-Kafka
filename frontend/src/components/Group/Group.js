import React, {Component} from 'react';
import '../../App.css';
import cookie from 'react-cookies';
import Navbar from '../Navbar/Navbar';
import AddExpense from '../Func/AddExpense';
import {Container,Col,Row} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getGroupContent,getGroupList,addComment,deleteComment} from '../../api/request';
import { connect } from 'react-redux'
import moment from 'moment-timezone';
import Accordion from 'react-bootstrap/Accordion';
import {Button,Card} from 'react-bootstrap';

class Group extends Component{
    constructor(props) {
         super(props)
         this.state = {
               groupList : [],
               expenses : [],
               members : [],
               comment: '',
               expenseid: null
         }
        this.saveComment = this.saveComment.bind(this);
        this.commentHandler  = this.commentHandler .bind(this);
    }
    componentDidMount() {
        getGroupList(this.props.userInfo).then(res => {
            // alert(res[0].group_id._id)
             this.setState({
                  groupList : res,
                  currentGroup : res[0] || {}
             })
             if(this.state.currentGroup._id) {
                getGroupContent(this.state.currentGroup.group_id._id).then(data => {
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
        getGroupContent(item.group_id._id).then(data => {
            this.setState({
                expenses : data.expenses,
                members : data.members
            })
        })   
    }
    addExpenseResolve() {
        // update view after add expense.
        getGroupContent(this.state.currentGroup.group_id._id).then(data => {
            this.setState({
                expenses : data.expenses,
                members : data.members
            })
        })
    }
    commentHandler = (expid,e) => {
        e.preventDefault();
        this.setState({
            comment : e.target.value,
            expenseid: expid
        })
    }
    
    delComment =  (id,e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you wish to delete this comment?'))
        {
            let data = {
                noteId:id
            }
            
            deleteComment(data).then(res => {
                alert('delete comment successed')
                getGroupContent(this.state.currentGroup.group_id._id).then(data => {
                    this.setState({
                        expenses : data.expenses,
                        members : data.members
                    })
                })
            }).catch(err => {
                 alert(err)
            })
        }
        
    }
    saveComment = (e) => {
        e.preventDefault();
        let {_id} = this.props.userInfo
        let data = {
             user_id : _id,
             expense_id: this.state.expenseid,
             note: this.state.comment
        }
        addComment(data).then(res => {
            alert('add comment successed')
            getGroupContent(this.state.currentGroup.group_id._id).then(data => {
                this.setState({
                    expenses : data.expenses,
                    members : data.members
                })
            })
        }).catch(err => {
             alert(err)
        })
   }
    render(){
        let {
            groupList,
            currentGroup,
            expenses,
            members
        } = this.state
        let {  _id,Timezone } = this.props.userInfo
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
                                    return  <div className={`recent-item cur ${currentGroup.group_id._id===item.group_id._id?'checked':''}`} key={item.group_id._id}  onClick={this.changeGroup.bind(this,item)}>
                                            <img className='pic' alt=" " src={item.picture||''}></img>
                                            <div className='right-box' style={{ textAlign : 'left'}}>
                                                <h4>{item.group_id.name}</h4>
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

                               return <div>
                                    <div key={item._id} className='flex' style={{ justifyContent:'space-between',alignItems:'center',paddingBottom:'10px',borderBottom:'1px solid #dddddd' }}>
                                        <div style={{ textAlign:'left'}}>
                                            <div title={moment(item.create_at).format('YYYY-MM-DD')}>{moment(item.create_at).tz(Timezone).format('YYYY-MM-DD ha z')}</div>
                                            <div>Group name:<span className='color-primary'>{item.group_name}</span></div> 
                                            <div>Creator : <span className='color-primary'>{item.creator_name}</span></div> 
                                        </div>
                                        <div>
                                            <div>Expense Description:<span className='color-primary'>{item.name}</span></div> 
                                            <div>Expense Money: <span>{this.props.userInfo.currencyStr}</span><span className='color-primary'>{item.money}</span></div> 
                                        </div> 
                                   </div>

                                   <Accordion defaultActiveKey="1">
                                        <Card>
                                            <Card.Header>
                                            <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                                Expense Notes and Comments
                                            </Accordion.Toggle>
                                            </Card.Header>
                                            <Accordion.Collapse eventKey="0">
                                            <Card.Body>
                                              <h4>Notes and Comments</h4>  
                                            {
                                                item.comment_list.map(ite => {     
                                                    return ite.creator_id._id===_id ? 
                                                            <div className='flex' style={{ justifyContent:'space-between',alignItems:'flex-start',paddingBottom:'10px'}}>
                                                               You: {ite.notes}           
                                                               <Button style={{height: '30px', width : '80px'}} onClick = {(e) =>this.delComment(ite._id,e)} size = 'xs' variant="outline-dark">Delete </Button>
                                                            </div >
                                                            :<div className='flex' style={{ justifyContent:'space-between',alignItems:'flex-start',paddingBottom:'10px'}}>{ite.creator_id.Name}:  {ite.notes}</div>
                                                })
                                            }
                                            <form onSubmit = {this.saveComment} method="POST" >
                                                    <textarea  type="text" rows="3" name="body" placeholder="Add a comment" onChange={(e) =>this.commentHandler(item._id,e) } />
                                                    <div>
                                                        <button className="btn" class="btn btn-outline-info" type="submit"> Post </button>
                                                    </div>
                                            </form>
                                            </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                    </Accordion> 
                                
                                    
                                    

                                   </div>
                                   
                               }):<div>no any expense</div>
                          }
                      </Col>
                      <Col style={{textAlign:'right'}} xs={3} md={3}>
                          <h3 className='mt20'>GROUP BALANCES</h3>
                          {
                               members.length ? members.map(item => {
                               return <div key={item.person_id._id}>{item.person_id.Name}<span style={{marginLeft:'20px'}}>{this.props.userInfo.currencyStr} {item.balance}</span></div>
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