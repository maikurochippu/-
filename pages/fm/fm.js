// pages/fm/fm.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图
    recommendList:[], //推荐fm
    hotList:[],  //热门fm
    offset:1,
    isTriggered: false, // 标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //轮播图
    let bannerListData = await request('/dj/banner');
    this.setData({
      bannerList: bannerListData.data
    })
    //个性推荐 fm
    let recommendListData = await  request('/dj/recommend');
    this.setData({
      recommendList:recommendListData.djRadios
    })
    //热门fm
    this.gethotfmData(this.data.offset)
  },
  async gethotfmData(offset){
    let limit = 15*offset
    let hotListData = await  request('/dj/toplist?type=hot',{limit});
    this.setData({
      hotList:hotListData.toplist,
      isTriggered: false,
    })
  },
  
    // 自定义下拉刷新的回调： scroll-view
    handleRefresher(){
      console.log('scroll-view 下拉刷新');
      // 再次发请求，获取最新的视频列表数据
      this.data.offset=1
      this.gethotfmData(this.data.offset)
    },

      // 自定义上拉触底的回调 scroll-view
  async handleToLower(){
    console.log('scroll-view 上拉触底');
    // 数据分页： 1. 后端分页， 2. 前端分页
    console.log('发送请求 || 在前端截取最新的数据 追加到后方');
    this.data.offset++;
    if(this.data.offset<8){
      await this.gethotfmData(this.data.offset)
    }else{
      wx.showToast({
        title: '暂无更多电台',
        icon:'none',
      })
    }
  },

  toPlayList(event){
    wx.navigateTo({
      url:'/pages/fmlist/fmlist?id='+event.currentTarget.id
    })
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