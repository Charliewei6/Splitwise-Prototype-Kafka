import { Component } from 'react';
import { Image,FormControl } from 'react-bootstrap'
import memberImg from '../images/avatar-grey1-50px.png'
import './member.scss'
import { searchUser } from '../../../api/request';
import { connect } from 'react-redux';

class Member extends Component {
     constructor(props) {
          super(props)
          this.state ={
               findUsers : [],
               showName : false
          }
          this.inpChange = this.inpChange.bind(this)
     }
     inpChange(stateName,e) {
     //    this.props.onAttrChange(stateName,e.target.value,this.props.memberIndex);
        console.log(e.target.value)
        searchUser(e.target.value).then(data => {
          //     if(data && data.length) {
                   this.setState({
                         findUsers: data.filter(item => item._id !== this.props.userInfo._id )
                   })
          //     }
        })
     }
     deleteCurrentMember() {
         this.props.onCurrentMemberDelete(this.props.memberIndex)
     }
     choseUser(item) {
          this.props.onAttrChange(item,this.props.memberIndex)     
          this.setState({
                showName : true,
                findUsers : []
          })
     }
     render() {
          let { memberAttr } = this.props
          let { findUsers,showName } = this.state

          let memberShow = memberAttr.isDetail || showName
          return (
            <div className='member-item'>
                    <Image className={['member-avatar',!memberAttr.name&&!memberAttr.email ?'faded' :null].join(' ')} src={memberImg} roundedCircle ></Image>
                    
                    {
                         memberShow?<FormControl className='ctl' type='text' value={memberAttr.name} disabled={memberShow} />:
                         <ul className={`dropdown-menu ${ findUsers.length ? 'open' : '' }`}>
                              {
                                   findUsers.map(item => {
                                        return <li className='user-item' key={item._id} href="javascript:void(0)" onClick={this.choseUser.bind(this,item)}><span>{item.Name}</span><span style={{marginLeft:'20px'}}>{item.Email}</span></li>
                                   })
                              }
                              
                         </ul>
                    }
                    {
                          memberAttr.isDetail ? null : 
                          <FormControl disabled={memberShow} className='ctl' type='emial' placeholder='Please input Email or User name' onChange={ this.inpChange.bind(this,'email')} />
                    } 
                    {
                         memberAttr.isDetail ? null : <a className='delete' href='javascript:void(0)' onClick={ this.deleteCurrentMember.bind(this) }>×</a>
                    }
                    
            </div>
          )
     }
}
const mapStateToprops=(state) => {
      return {
          userInfo : state.user
      }
}
Member = connect(mapStateToprops)(Member)
export default Member;