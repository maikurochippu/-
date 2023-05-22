// pages/login-QR/Qr.js
import request from '../../utils/request';
import config from '../../utils/config';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pic:'',
    time:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad: async function (options) {
        /*二维码登录*/
      /*let timestamp = Date.parse(new Date()); 时间戳*/
      let pickey = await request(`/login/qr/key?timestamp=${Date.parse(new Date())}`);
      let pickeyData = pickey.data.unikey;
      let picID = await request(`/login/qr/create?qrimg=true&key=${pickeyData}&timestamp=${Date.parse(new Date())}`);
      this.setData({
        pic:picID.data.qrimg
      })


      var index = 0
      this.data.time =  setInterval( async()=>{
        index++
        wx.request({
          url:config.host+`/login/qr/check?key=${pickeyData}&timestamp=${Date.parse(new Date())}`,
          method:'GET',
          success:async (res)=>{
            console.log('请求成功：',res);
            if(res.cookies.length>0){
              clearInterval(this.data.time)
              wx.setStorage({
                key: 'cookie',
                data: res.cookies,
              })
              wx.showToast({
                title: '登录成功',
                icon:'success'
              })
              let loginresult = await request('/login/status','POST')
              //console.log(loginresult);
              wx.setStorageSync('userInfo', loginresult.data.profile)
              await wx.reLaunch({
                url: '/pages/personal/personal'
              })
            }else if(index === 20){
              clearInterval(this.data.time)
              await wx.showToast({
                title: '超时，重新登录',
                icon:'error'
              })
              this.onLoad()
            }
          },
          fail:(err)=>{
            console.log('请求失败：',err);
          }
        })
        }, 2000)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(this.data.time)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})