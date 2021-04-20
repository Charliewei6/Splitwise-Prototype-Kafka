import axios from 'axios';
axios.defaults.withCredentials = false;
const domain = 'http://localhost:3001' 
const login = (data) => {
    return axios.post(`${domain}/login`,data).then(res => res.data)
    // return Promise.resolve({
    //      id : 1,
    //      name : 'test'
    // })
}
const signUP = (data) => {
    return axios.post(`${domain}/signUP`,data).then(res => res.data)
}
const getDashboard = (userId) => {
    return axios.get(`${domain}/dashboard?user_id=${userId}`).then(res => res.data)
}
const settleUp = (userId) => {
    return axios.post(`${domain}/settle_up`,{
         user_id : userId
    }).then(res => res.data)
}
const getProfile = (userId) => {
    return axios.get(`${domain}/profile?user_id=${userId}`).then(res => res.data)
}
const uploadImg = (file) => {
     return axios.post(`${domain}/upload`,file,{
         onUploadProgress : e => {
              console.log('上传进度 =>',e.loaded/e.total*100)
         }
     }).then(res => res.data)
}
const changeUserInfo = ({ userId,email,name,avatarUrl,phoneNumber,currency,timeZone,language }) => {
    return axios.post(`${domain}/profile`,{
         user_id : userId,
         email,
         name,
         picture:avatarUrl,
         phone : phoneNumber,
         currency,
         timezone:timeZone,
         language
    }).then(res => res.data)
}
const searchUser = (email) => {
     return axios.get(`${domain}/search_person?email=${email}`).then(res => res.data)
}
const createGroup = (data) => {
    return axios.post(`${domain}/group`,data).then(res => res.data)
}
const getInvite = (userInfo) => {
    return axios.get(`${domain}/invite?user_id=${userInfo._id}`).then(res => res.data)
}
const getGroupList = (userInfo,name='') => {
    return axios.get(`${domain}/groups?user_id=${userInfo._id}&name=${name}`).then(res => res.data)
}

const getGroupDetail = (groupId) => {
    return axios.get(`${domain}/group?group_id=${groupId}`).then(res => res.data)
}
const getRecent =(userInfo,group_id='',order=0) => {
     order = order ? 1 : 0;
     return axios.get(`${domain}/activity?user_id=${userInfo._id}&group_id=${group_id}&order=${order}`).then(res => res.data)
}
const addExpense =(data) => {
     return axios.post(`${domain}/add_expense`,data).then(res => res)
}
const addComment =(data) => {
    return axios.post(`${domain}/add_comment`,data).then(res => res)
}
const deleteComment =(data) => {
    return axios.post(`${domain}/delete_comment`,data).then(res => res)
}
const getGroupContent = (groupId) => {
    return axios.get(`${domain}/group_page?group_id=${groupId}`).then(res => res.data)
}

const agreeRequest = (invite_id) => {
    return axios.post(`${domain}/invite`,{invite_id}).then(res => res.data)
}
const quitGroup = (data) => {
    return axios.post(`${domain}/quit`,data).then(res => res.data)
}

export {
     login,
     signUP,
     getDashboard,
     settleUp,
     getProfile,
     uploadImg,
     changeUserInfo,
     searchUser,
     createGroup,
     getInvite,
     getGroupList,
     getGroupDetail,
     getRecent,
     getGroupContent,
     addExpense,
     quitGroup,
     agreeRequest,
     addComment,
     deleteComment
}