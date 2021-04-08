import React, {Component} from 'react';
import '../../App.css';
import cookie from 'react-cookies';
import LogoPng from './createGroup.svg';
import './createGroup.scss';
import Member from './Member';
import Navbar from '../Navbar/Navbar';
import { FormControl,FormGroup,FormLabel }  from 'react-bootstrap';
import UploadPic from '../Func/UploadImg';
import { createGroup,getGroupDetail } from '../../api/request'
import { connect } from 'react-redux';
let addMembersId = 3
class Creategroup extends Component{
    constructor(props) {
         super(props)
         this.state = {
              groupName : '',
              members : [
                   {
                       name : '',
                       email : '',
                       key : 1
                   },
                   {
                        name : '',
                        email : '',
                        key : 2
                   },
                    {
                        name : '',
                        email : '',
                        key :3
                    }
              ],
              groupPicUrl : '',
              detailId : this.props.match.params._id,
              detailContent : {}
         }
         this.getValidationState = this.getValidationState.bind(this)
         this.handleChange = this.handleChange.bind(this)
    }
    componentDidMount() {
        let { detailId } = this.state
         if(detailId) {

              getGroupDetail(detailId).then(data => {
                //    this.members = data.members
                    data.members && data.members.map(item => {
                         item.key=item._id
                         item.name = item.Name 
                         item.isDetail = true
                         return item   
                    }) 
                    
                    // let group = data.group && data.group[0]
                    let group = data.group
                   this.setState({
                        members : data.members,
                        groupName :  group.name,
                        groupPicUrl : group.picture
                   })
              })
         }
         if(!cookie.load('cookie')){
          this.props.history.push('/')
         }
    }
    handleChange(e) {
         this.setState({
              groupName : e.target.value
         })
    }
    getValidationState() {
        const length = this.state.groupName.length;
        if (length > 10) return 'success';
        else if (length > 5) return 'warning';
        else if (length > 0) return 'error';
    }
    addPerson() {
        let { members } = this.state
         members.push({
              name : '',
              email : '',
              key : ++addMembersId
         })
         this.setState({
            members : members
         })
    }
    attrChange(item,index) {
         this.state.members[index]['name'] = item.Name
         this.state.members[index]['email'] = item.Email
         this.state.members[index]['id'] = item._id
         this.setState({
              members : this.state.members
         })
    }
    memberChange(index) {
         this.state.members.splice(index,1)
         this.setState({
              members : this.state.members
         })
    }
    saveToGroup() {
        let { groupPicUrl,groupName,members,detailId } = this.state
        let data = {
            user_id : this.props.userInfo._id,
            user_name : this.props.userInfo.Name,
            name : groupName,
            picture : groupPicUrl,
            members : members.filter(item => item.id && !item.isDetail).map(item => item.id)
        }
        if(detailId) {
             data.group_id = detailId
        }
        createGroup(data).then(res => {
             alert('Save succeed')
        })
    }
    render(){
        let { members,groupPicUrl,groupName } = this.state
        return(
            <div>
                <Navbar history={this.props.history}/>
                <div className='create-group'>
                    <div className='leftbox'>
                        <img className='logo' alt="Logo" src={ groupPicUrl || LogoPng } />
                        <UploadPic uploadSuccess={(url) => {
                             this.setState({
                                groupPicUrl : url
                             })
                        }}></UploadPic>
                    </div>
                    <div className='content'>
                        <h2>Start a new group</h2> 
                        <FormGroup>
                            <FormLabel>My group shall be called…</FormLabel>
                            <FormControl
                                type="text"
                                value={groupName}
                                placeholder="group name"
                                onChange={this.handleChange}
                            />
                            <hr  />
                            <FormLabel>GROUP MEMBERS</FormLabel>
                            {
                                 members.map((item,index) => {
                                    return <Member memberAttr={item} key={item.key} memberIndex={index} 
                                    onAttrChange={ this.attrChange.bind(this) }
                                    onCurrentMemberDelete={ this.memberChange.bind(this) }
                                    ></Member>
                                })
                            }
                            <a className='add' href='javascript:void(0)' onClick={ this.addPerson.bind(this) }>+ Add a person</a>
                            <a className='btn btn-success mt20' onClick={this.saveToGroup.bind(this)} href='javascript:void(0)'>save</a>
                        </FormGroup>
                    </div>
                </div>
            </div>
        )
    }
}
let mapStateToProps = (state) => {
     return {
          userInfo : state.user
     }
}
Creategroup = connect(mapStateToProps)(Creategroup)
export default Creategroup;