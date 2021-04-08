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
import { Link } from 'react-router-dom';

class Recent extends Component{
    constructor(props) {
         super(props)
         this.state = {
            timeSort : false,
            recentList : [],
            searchName : '',
            groupList : [],
            curGroupId : '',
            postsPerPage: 2,
            currentPage: 1,
            totalPost:0
         }
         
         this.changePage= this.changePage.bind(this);
         this.paginate= this.paginate.bind(this);
    }
    componentDidMount() {
        if(!cookie.load('cookie')){
            this.props.history.push('/')
           }
        getRecent(this.props.userInfo,this.state.searchName,this.state.timeSort).then(data => {
            this.setState({
               totalPost : data.length
           })
            var indexOfLastPost = this.state.currentPage * this.state.postsPerPage;
            var indexOfFirstPost = indexOfLastPost - this.state.postsPerPage;
            const currentData = data.slice(indexOfFirstPost, this.state.postsPerPage);
            this.setState({
                 recentList : currentData
            })
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

    changePage(e){
        this.setState({
            postsPerPage : e.target.value,
            currentPage : 1
        })
        getRecent(this.props.userInfo,this.state.searchName,this.state.timeSort).then(data => {
            var indexOfLastPost = this.state.currentPage * this.state.postsPerPage;
            var indexOfFirstPost = indexOfLastPost - this.state.postsPerPage;
            const currentData = data.slice(indexOfFirstPost, indexOfLastPost);
            this.setState({
                 recentList : currentData
            })
       })
    }
    paginate(number) {
        this.setState({
            currentPage : number
        })
        getRecent(this.props.userInfo,this.state.searchName,this.state.timeSort).then(data => {
            var indexOfLastPost = this.state.currentPage * this.state.postsPerPage;
            var indexOfFirstPost = indexOfLastPost - this.state.postsPerPage;
            const currentData = data.slice(indexOfFirstPost, indexOfLastPost);
            this.setState({
                 recentList : currentData
            })
       })
    }
    render(){
        let { recentList} = this.state
        let { _id,currencyStr,Timezone } = this.props.userInfo

        let postsPerPage= this.state.postsPerPage
        const totalPosts = this.state.totalPost

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
            pageNumbers.push(i);
        }
        return(
            <div>
                <Navbar history={this.props.history}/>
                <Container className='mt20'>
                    <h1 style={{overflow:'hidden'}}>Recent activity</h1> 
                        <GroupFilter emitChangeGroup={this.changeGroup.bind(this)}></GroupFilter>
                        <select className='recent-select' value={postsPerPage} onChange={this.changePage}>
                        <option value={2} >Two Page Size</option>
                        <option value={5} >Five Page Size</option>
                        <option value={10}>Ten Page Size</option>
                        </select>
                    <a className='btn btn-link' data-testid='sort' onClick={ this.sortHandler.bind(this) }>{this.state.timeSort?'Sort By Most Recent Last':'Sort By Most Recent First'}</a>
                    <div className='recent-list mt20'>
                        {
                          recentList.map((item,index) => {
                              return  <div key={index} className='recent-item' style={{ flexDirection:'column',alignItems:'flex-start',
                              cursor:'default',borderBottom:'1px solid #ddd',paddingBottom:'10px' }}>
                                <div>{
                                    item.owed_id===_id ? <div>
                                            <div>You added "<span className='color-primary'>{item.expense_id.name}</span>" in group  "<span className='color-primary'>{item.expense_id.group_name}</span>".</div>
                                            <div style={{color:'#5bc5a7'}}> {item.owe_id.Name} owes you {currencyStr}{item.money}</div>
                                            <div title={moment(item.create_at).format('YYYY-MM-DD')}>{moment(item.create_at).tz(Timezone).format('YYYY-MM-DD ha z')}</div>
                                        </div>:
                                        <div>
                                            <div>{item.expense_id.creator_name} added "<span className='color-primary'>{item.expense_id.name}</span>" in group  "<span className='color-primary'>{item.expense_id.group_name}</span>".</div>
                                            <div style={{color:'#ff652f'}}>You owe {currencyStr}{item.money}</div>
                                            <div title={moment(item.create_at).format('YYYY-MM-DD')}>{moment(item.create_at).tz(Timezone).format('YYYY-MM-DD ha z')}</div>
                                        </div>
                                   
                                }
                                </div>
                            </div>
                          })  
                        }
                    </div>
                    <nav>
                    <ul className='pagination'>
                        {pageNumbers.map(number => (
                        <li key={number } className='page-item'>
                            <Link to='/recent' onClick={() => this.paginate(number)} className='page-link'> {number}</Link>
                         </li> 
                        ))}
                    </ul>
                    </nav>
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