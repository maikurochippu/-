//发送ajax请求
/*封装功能函数和组件*/
import config from './config'
export default (url,data={},method='GET') =>{
  return new Promise((resolve,reject)=>{     //pending
    wx.request({
      url:config.host+url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync('cookie') ? wx.getStorageSync('cookie').find(item => item.indexOf('MUSIC_U') !== -1):''
      },
      success:(res)=>{
        if(data.isLogin){//登录请求,将用户cookie存入
          wx.setStorage({
            key: 'cookie',
            data: res.cookies,
          })
        }
        console.log('请求成功：',res);
        resolve(res.data);
      },
      fail:(err)=>{
        console.log('请求失败：',err);
        reject(err);
      }
    })
  })
}