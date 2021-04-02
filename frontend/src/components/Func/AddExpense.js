import React, {Component} from 'react';
import '../../App.css';
import {Modal,FormLabel,FormControl,Form} from 'react-bootstrap';
import { connect } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getGroupList,addExpense } from '../../api/request';
// import upLoadImg from './UploadImg';

class Group extends Component{
    constructor(props) {
         super(props)
         this.state = {
            showModal : false,
            money : '',
            expenseName : '',
            groupList : [],
            groupChosed : {}
         }
         this.open = this.open.bind(this)
         this.close = this.close.bind(this)
         this.saveExpense = this.saveExpense.bind(this)
         this.handleExPenseName = this.handleExPenseName.bind(this)
         this.handerMoney = this.handerMoney.bind(this)
         this.handleNote = this.handleNote.bind(this)
    }
    close() {
        this.setState({ showModal: false });
    }
    open() {
        this.setState({ showModal: true });
    }
    saveExpense() {
         // 创建账单
         // ...
         let { groupChosed,expenseName,money } = this.state
         let { id,Name} = this.props.userInfo
         if(!groupChosed.id) {
              alert('Please choose a group')
              return;
         }
         let data = {
              user_id : id,
              user_name : Name,
              group_id : groupChosed.id,
              group_name : groupChosed.name,
              name : expenseName,
              money : Number(money)
         }
         addExpense(data).then(res => {
             if(res.code === 0) {
                 alert('You cannot add an expense without other group members')
             }else {
                alert('add successed')
                this.setState({ showModal: false });   
                this.props.updateCallback && this.props.updateCallback()
             }
         }).catch(err => {
              alert(err.code)
         })
    }
    handleExPenseName(e) {
         this.setState({ expenseName : e.target.value })
    }
    handerMoney(e) {
        this.setState({ money : e.target.value })
    }
    handleNote(e) {
         this.setState({ note : e.target.value })
    }
    choseGroup(item) {
         console.log(item)
    }
    componentDidMount() {
        getGroupList(this.props.userInfo).then(res=> {
            this.setState({
                groupList : res
            })
        })
    }
    searchHandler(e) {
        let val = e.target.value
        getGroupList(this.props.userInfo,val).then(res=> {
            this.setState({
                groupList : res
            })
        })
    }
    render(){
        let { showModal,groupList,groupChosed } = this.state
        let { userInfo } = this.props
        return(
            <span>
                <a className='btn btn-danger' onClick={this.open} href='javascript:void(0)'>Add an expense</a>
                <Modal show={showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add an expense</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control onChange = {this.searchHandler.bind(this)}  type="search" placeholder="chose group" />
                        <div style={{ maxHeight:'350px',overflow:'auto'}}>
                                {
                                    groupList.map(item => {
                                        return <div className={`flex f-center mt20 group-item ${groupChosed.id === item.id? 'checked': ''}`} onClick={() => {
                                             this.setState({
                                                  groupChosed : item
                                             })
                                        }}  key={item.id}><img className='default_avatar mr20' alt=" " src={item.picture} ></img><span>{item.name}</span></div>
                                    })
                                }
                        </div> 
                        <FormLabel className='mt20'>Enter a name</FormLabel>
                        <FormControl
                            type="text"
                            value={this.state.expenseName}
                            placeholder="Enter a expenseName"
                            onChange={this.handleExPenseName}
                        />
                        <div className='mt20 flex'><span style={{ marginRight:'20px' }}>{ userInfo.currencyStr}</span><input className='inp-money flex1' type="number" placeholder='Enter a money' onChange={this.handerMoney} /></div>  
                        {/* <div className='mt20'>
                            <FormLabel>chose image</FormLabel>
                            <UploadPic uploadSuccess={(url) => {
                                this.setState({
                                    expensePicUrl : url
                                })
                            }}></UploadPic>
                        </div>
                        <div className='mt20'>
                            <FormLabel>add note</FormLabel>
                            <FormControl
                                type="text"
                                value={this.state.note}
                                placeholder="add note"
                                onChange={this.handleNote}
                            />
                        </div> */}
                    </Modal.Body>
                    <Modal.Footer>
                        <a className='btn btn-link' href='javascript:void(0)' onClick={this.close}>cancel</a>
                        <a className='btn btn-success' href='javascript:void(0)' onClick={this.saveExpense} >save</a>
                </Modal.Footer>
                </Modal>
            </span>
        )
    }
}
let mapStateToProps = (state) =>{
      return {
           userInfo : state.user
      }
}
Group = connect(mapStateToProps)(Group)
export default Group;