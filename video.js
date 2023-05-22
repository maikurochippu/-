import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航标签数据
    navId: '', // 导航的标识
    videoList: [], // 视频列表数据
    videoId: '', // 视频id标识
    videoUpdateTime: [], // 记录video播放的时长
    offset: 0,  
    isTriggered: false, // 标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    //判断是否登录
    let cookie = wx.getStorageSync('cookie');
    if(!cookie){
      wx.showToast({
         title: '请先登录',
         icon:'error',
         success: ()=>{
           setTimeout(async()=>{
            wx.reLaunch({
              url: '/pages/personal/personal'
            })
           },200)
        }
      })
      return
    }
    // 获取导航数据
    this.getVideoGroupListData();
   
  },
  
  // 获取导航数据
  async getVideoGroupListData(){
    let videoGroupListData = await request('/video/group/list');
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 13),
      navId: videoGroupListData.data[0].id
    })
   // console.log(videoGroupListData)
  
    // 获取视频列表数据
    this.getVideoList(this.data.navId,this.data.offset);
  },
  // 获取视频列表数据
  async getVideoList(navId,offset){
    if(!navId){ // 判断navId为空串的情况
      return;
    }

    let videoListData = await request(`/video/group?offset=${offset}`, {id: navId});
    let i = 0;
    if(videoListData.datas.length === 0){
      wx.showToast({
        title: '当前没有新视频',
        icon:'none'
      })
    }
    while(i<videoListData.datas.length){
      videoListData.datas[i].data.urlInfo = await request(`/video/url?id=${videoListData.datas[i].data.vid}`);
      i++;
      //console.log(i);
    }
    // 关闭消息提示框
    wx.hideLoading();
    
    
    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })

    this.setData({
      videoList,
      isTriggered: false,
    })
  },
  
  // 点击切换导航的回调
  changeNav(event){
    let navId = event.currentTarget.id; // 通过id向event传参的时候如果传的是number会自动转换成string
    // let navId = event.currentTarget.dataset.id;
    this.setData({
      navId: navId>>>0,
      videoList: []
    })
    // 显示正在加载
    this.data.offset = 0
    wx.showLoading({
      title: '正在加载'
    })
    // 动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId,this.data.offset);
  },
  
  // 点击播放/继续播放的回调
 handlePlay(event){
    /*
      问题： 多个视频同时播放的问题
    * 需求：
    *   1. 在点击播放的事件中需要找到上一个播放的视频
    *   2. 在播放新的视频之前关闭上一个正在播放的视频
    * 关键：
    *   1. 如何找到上一个视频的实例对象
    *   2. 如何确认点击播放的视频和正在播放的视频不是同一个视频
    * 单例模式：
    *   1. 需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象，
    *   2. 节省内存空间
    * */
    
    let vid = event.currentTarget.id;
    // 关闭上一个播放的视频
    // this.vid !== vid && this.videoContext && this.videoContext.stop();
    // if(this.vid !== vid){
    //   if(this.videoContext){
    //     this.videoContext.stop()
    //   }
    // }
    // this.vid = vid;
    
    // 更新data中videoId的状态数据
    this.setData({
      videoId: vid
    })
    // 创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);
    // 判断当前的视频之前是否播放过，是否有播放记录, 如果有，跳转至指定的播放位置
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime);
    }
    this.videoContext.play();
    // this.videoContext.stop();
  },
  
  // 监听视频播放进度的回调
  handleTimeUpdate(event){
    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
    let {videoUpdateTime} = this.data;
    /*
    * 思路： 判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
    *   1. 如果有，在原有的播放记录中修改播放时间为当前的播放时间
    *   2. 如果没有，需要在数组中添加当前视频的播放对象
    *
    * */
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if(videoItem){ // 之前有
      videoItem.currentTime = event.detail.currentTime;
    }else { // 之前没有
      videoUpdateTime.push(videoTimeObj);
    }
    // 更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },
  
  // 视频播放结束调用的回调
  handleEnded(event){
    // 移除记录播放时长数组中当前视频的对象
    let {videoUpdateTime} = this.data;
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1);
    this.setData({
      videoUpdateTime
    })
  },
  
  // 自定义下拉刷新的回调： scroll-view
  handleRefresher(){
    console.log('scroll-view 下拉刷新');
    // 再次发请求，获取最新的视频列表数据
    this.data.offset=0
    this.getVideoList(this.data.navId,this.data.offset)
  },
  
  // 自定义上拉触底的回调 scroll-view
  async handleToLower(){
    console.log('scroll-view 上拉触底');
    // 数据分页： 1. 后端分页， 2. 前端分页
    console.log('发送请求 || 在前端截取最新的数据 追加到视频列表的后方');
    let newVideoList = this.data.videoList
    this.data.offset++;
    await this.getVideoList(this.data.navId,this.data.offset)
    let videoList = newVideoList.concat(this.data.videoList)
    this.setData({
      videoList
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
    console.log('页面的下拉刷新');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('页面的上拉触底');

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({from}) {
    console.log(from);
    if(from === 'button'){
      return {
        title: '来自云音乐的视频',
        page: '/pages/video/video',
        imageUrl: '/static/images/logo.jpg'
      }
    }else {
      return {
        title: '来自云音乐的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/logo.jpg'
      }
    }
    
  }
})
