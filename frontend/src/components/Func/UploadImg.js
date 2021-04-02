import React, {Component} from 'react';
import { uploadImg } from '../../api/request';
class Profile extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div style={{overflow:"hidden"}}><input type='file' onChange={ this.upLoadAvatar.bind(this)}></input></div>
        )
    }
    upLoadAvatar(e) {
        let file = e.target.files[0]
        if(!file) return
        let data = new FormData();
        data.append('file',file)
        uploadImg(data).then(res => {
            let url = res.data.url
            this.props.uploadSuccess(url)
        }).catch(err => {
             alert('Upload Failed')
        })
    }
}
export default Profile;