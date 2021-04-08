import { Component } from "react";
import { getGroupList } from '../../api/request'
import { connect } from 'react-redux';
class GroupFilter extends Component {
     constructor(props) {
        super(props);
        this.state = {
            curGroupId : '',
            groupList : []
        }
     }
     componentDidMount() {
        getGroupList(this.props.userInfo,'').then(res=> {
            this.setState({
                groupList : res
            })
        })
     }
    changeGroup(e) {
        this.setState({
            curGroupId : e.target.value
        },function() {
            this.props.emitChangeGroup && this.props.emitChangeGroup(this.state.curGroupId)
        })

    }
     render() {
        let { curGroupId,groupList } = this.state;
        
        return <select className='recent-select' value={curGroupId} onChange={this.changeGroup.bind(this)}>
                <option value='' >allGroup</option>
                {
                    groupList.map(item => {
                        return <option key={item.group_id._id} value={item.group_id._id}>{item.group_id.name}</option>
                    })
                }
        </select>
     }

}
let mapStateToprops = (state) => {
     return {
          userInfo : state.user
     }
}
GroupFilter = connect(mapStateToprops)(GroupFilter)
export default GroupFilter;