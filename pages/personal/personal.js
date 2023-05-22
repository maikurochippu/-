// pages/personal/personal.js
import request from "../../utils/request";

let startY = 0; // 手指起始的坐标
let moveY = 0; // 手指移动的坐标
let moveDistance = 0; // 手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coveTransition: '',
    userInfo: {}, // 用户信息
    recentPlayList: [], // 用户播放记录
    collectList:[],  //我的收藏
    songList:{},  //我喜欢的音乐
    likeid:'',  //我喜欢的id
    singerList:[],   //关注的歌手
    fmList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 读取用户的基本信息
      if(wx.getStorageSync('userInfo')){
      // 获取用户播放记录
      this.setData({
        userInfo:wx.getStorageSync('userInfo')
      })
      this.get(this.data.userInfo.userId)
      }
  },
  get(userId){
     this.getUserRecentPlayList(userId)
     this.getsongPlayList(userId)
     this.getUsercollectList(userId)
     this.getUsersinger(userId)
     this.getUserfmList(userId)
  },
  // 获取用户播放记录的功能函数
  async getUserRecentPlayList(){
    let recentPlayListData = await request('/record/recent/song');
    //console.log(recentPlayListData)
    let index = 0;
    let recentPlayList = recentPlayListData.data.list.splice(0, 10).map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      recentPlayList
    })
  },
//获取我喜欢音乐
async getsongPlayList(userId){
  let musicDataList = await request("/likelist",{uid: userId});
  let resultArr=[];
  for( let index = 0;index < musicDataList.ids.length && index < 80;index++){
    let songid = musicDataList.ids[index];
    let songListData = await request("/song/detail",{ids: songid});
    resultArr.push(songListData);
    this.setData({
      songList:resultArr
    })
  }
},


  // 获取用户歌单，抽离我喜欢的歌单
  async getUsercollectList(userId){
    let collectListData = await request('/user/playlist', {uid: userId});
    let collectList = collectListData.playlist
    this.data.likeid = collectList.shift().id
    this.setData({
      collectList
    })
  },

  // 获取用户关注的歌手
  async getUsersinger(userId){
    let singerData = await request('/artist/sublist', {uid: userId})
    let singerList = singerData.data
    this.setData({
      singerList
    })
  },


  // 获取用户关注的电台
  async getUserfmList(){
    let fmListData = await request('/dj/sublist')
    let fmList = fmListData.djRadios
    this.setData({
      fmList
    })
  },

  /*手指点击*/
  handleTouchStart(event){
    
    this.setData({
      coveTransition: ''
    })
    // 获取手指起始坐标
    startY = event.touches[0].clientY;
  },
  /*手指移动 */
  handleTouchMove(event){
    /*console.log('move');*/
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;
    
    if(moveDistance <= 0){
      return;
    }
    if(moveDistance >= 80){
      moveDistance = 80;
    }
    // 动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd(){
    /*console.log('end');*/
    // 动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(0rpx)`,
      coveTransition: 'transform 1s linear'
    })
  },
  
  // 跳转至登录login页面的回调
  toLogin(){
    let cookie = wx.getStorageSync('cookie');
    if(!cookie){
      wx.navigateTo({
        url: '/pages/login-QR/QR'
      })
    }else{
        wx.showToast({
        title: '已登录',
        icon:'success'
      })
    }
  },
  //跳转音乐
  toSongDetail(event){
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + event.currentTarget.id
    })
  },
  //跳转我喜欢的歌单
  like(){
    wx.navigateTo({
      url: `/pages/playlist/playlist?id=${this.data.likeid}&type=${'0'}` 
    })
  },
  //跳转歌单
    toPlayList(event){
      wx.navigateTo({
        url: '/pages/playlist/playlist?id=' + event.currentTarget.id
      })
    },

    tofmList(event){
      wx.navigateTo({
        url:'/pages/fmlist/fmlist?id='+event.currentTarget.id
      })
    },
//跳转歌手
tosongerList(event){
  //console.log(event)
  wx.navigateTo({
    url: `/pages/songerlist/songerlist?songer=${event.currentTarget.id}&name=${event.currentTarget.dataset.name}`
  })
},
  //退出
  logout(){
    request('/logout')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('cookie')
    wx.reLaunch({
      url: '/pages/personal/personal'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
