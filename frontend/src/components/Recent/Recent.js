import React, {Component} from 'react';
import '../../App.css';
import cookie from 'react-cookies';
import Navbar from '../Navbar/Navbar';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRecent,getGroupList } from '../../api/request'
import { connect } from 'react-redux'
import GroupFilter from '../Func/groupFilter'
import  moment  from 'moment-timezone'
class Recent extends Component{
    constructor(props) {
         super(props)
         this.state = {
            timeSort : false,
            recentList : [],
            searchName : '',
            groupList : [],
            curGroupId : ''
         }
         
    }
    componentDidMount() {
        if(!cookie.load('cookie')){
            this.props.history.push('/')
           }
        getRecent(this.props.userInfo,this.state.searchName,this.state.timeSort).then(data => {
            this.setState({
                 recentList : data
            })
       })
       this.searchGroup()
       
    }
    searchGroup() {
        getGroupList(this.props.userInfo,'').then(res=> {
            this.setState({
                groupList : res
            })
            console.log(res)
        })
    }
    sortHandler() {
        let timeSort = !this.state.timeSort
        this.setState({
            timeSort
        })
        getRecent(this.props.userInfo,this.state.searchName,timeSort).then(data => {
            this.setState({
                 recentList : data
            })
       })
    }
    changeGroup(groupId) {
        getRecent(this.props.userInfo,groupId,this.state.timeSort).then(data => {
            this.setState({
                    recentList : data
            })
        }) 
    }
    render(){
        let { recentList} = this.state
        let { id,currencyStr,Timezone } = this.props.userInfo
        return(
            <div>
                <Navbar history={this.props.history}/>
                <Container className='mt20'>
                    <h1 style={{overflow:'hidden'}}>Recent activity</h1> 
                        <GroupFilter emitChangeGroup={this.changeGroup.bind(this)}></GroupFilter>
                    <a className='btn btn-link' data-testid='sort' onClick={ this.sortHandler.bind(this) }>{this.state.timeSort?'Sort By Most Recent Last':'Sort By Most Recent First'}</a>
                    <div className='recent-list mt20'>
                        {
                          recentList.map((item,index) => {
                              return  <div key={index} className='recent-item' style={{ flexDirection:'column',alignItems:'flex-start',
                              cursor:'default',borderBottom:'1px solid #ddd',paddingBottom:'10px' }}>
                                <div>{
                                    item.owed_id===id ? <div>
                                            <div>You added "<span className='color-primary'>{item.name}</span>" in group  "<span className='color-primary'>{item.group_name}</span>".</div>
                                            <div style={{color:'#5bc5a7'}}> you add a expense {currencyStr}{item.money}</div>
                                            <div title={moment(item.create_at).format('YYYY-MM-DD')}>{moment(item.create_at).tz(Timezone).format('YYYY-MM-DD ha z')}</div>
                                        </div>:
                                        <div>
                                            <div>{item.creator_name} added "<span className='color-primary'>{item.name}</span>" in group  "<span className='color-primary'>{item.group_name}</span>".</div>
                                            <div style={{color:'#ff652f'}}>You owe {currencyStr}{item.item_money}</div>
                                            <div title={moment(item.create_at).format('YYYY-MM-DD')}>{moment(item.create_at).tz(Timezone).format('YYYY-MM-DD ha z')}</div>
                                        </div>
                                   
                                }
                                </div>
                            </div>
                          })  
                        }
                    </div>
                    
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
Recent = connect(mapStateToProps)(Recent)
export default Recent;