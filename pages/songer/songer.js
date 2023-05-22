// pages/calender/calender.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaId: '-1', // 导航的标识
    areaList:[
        {id:'-1',name:'全部'},
        {id:'7',name:'华语'},
        {id:'96',name:'欧美'},
        {id:'8',name:'日本'},
        {id:'16',name:'韩国'},
        {id:'0',name:'其他'}
    ],
    typeList:[
      {id:'-1',name:'全部'},
      {id:'1',name:'男歌手'},
      {id:'2',name:'女歌手'},
      {id:'3',name:'乐队'},
    ],
    offset:18,
    typeId: '-1', // 导航的标识
    List: [], // 歌单列表数据
    isTriggered: false, // 标识下拉刷新是否被触发
    Trigger:true    //上拉触底标志位
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getList(this.data.typeId,this.data.areaId,this.data.offset);
  },
  async getList(typeId,areaId,offset){

    let ListData = await request('/artist/list', {type:typeId,area:areaId,limit:offset});
    let List = ListData.artists
    this.setData({
      List,
      isTriggered: false,
    })
    // 关闭消息提示框
    wx.hideLoading();

    if(!ListData.more){
      wx.showToast({
        title: '没有更多的歌手了',
        icon:'none'
      })
    }
  },
  // 点击切换导航的回调
  changeNav(event){
    console.log(event)
    //let areaId = event.currentTarget.id; // 通过id向event传参的时候如果传的是number会自动转换成string
    if(event.currentTarget.dataset.navid === '0'){
      let areaId = event.currentTarget.id;
      //console.log(areaId)
     this.setData({
       areaId,
       typeId:'-1'
     })
    }else{
      let typeId = event.currentTarget.id;
      this.setData({
        typeId
      })
    }
    // 显示正在加载
    this.data.offset=18
    wx.showLoading({
      title: '正在加载'
    })
    // 动态获取当前导航对应的视频数据
    this.getList(this.data.typeId,this.data.areaId,this.data.offset);
  },
  tosongerList(event){
    //console.log(event)
    wx.navigateTo({
      url: `/pages/songerlist/songerlist?songer=${event.currentTarget.id}&name=${event.currentTarget.dataset.name}`
    })
  },
  // 自定义下拉刷新的回调： scroll-view
handleRefresher(){
  console.log('scroll-view 下拉刷新');
  // 再次发请求，获取最新的视频列表数据
  this.data.offset=18
  this.getList(this.data.typeId,this.data.areaId,this.data.offset);
},
  // 自定义上拉触底的回调 scroll-view
  async handleToLower(){
    if(this.data.Trigger){ //防止反复触底
      this.setData({
        Trigger: false,
      })
      console.log('scroll-view 上拉触底');
      // 数据分页： 1. 后端分页， 2. 前端分页
      console.log('发送请求 || 在前端截取最新的数据 追加到视频列表的后方');
      wx.showLoading({
        title: '正在加载'
      })
      this.data.offset = this.data.offset+18
      await this.getList(this.data.typeId,this.data.areaId,this.data.offset);
      this.setData({
        Trigger: true,
      })
    }
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