// pages/toplist/toplist.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topList:[],//排行榜
    Top:[] //所有排行榜
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let resultArr=[];
    let topListData = await request('/toplist/detail');
      let topListID = topListData.list.slice(0, 4);
      for(let item of topListID){
        let detailList = await request(`/playlist/detail?id=${item.id}`, { limit: 10 });
        let topListItem = {id:detailList.playlist.id,name:detailList.playlist.name,tracks:detailList.playlist.tracks.slice(0, 5)};
        resultArr.push(topListItem);
        this.setData({
          topList:resultArr,
          Top:topListData.list.slice(5,41)
        })
      }
  },
//跳转歌单
toPlayList(event){
  console.log(event)
  wx.navigateTo({
    url: `/pages/playlist/playlist?id=${event.currentTarget.id}&type=${event.currentTarget.dataset.type}` 
  })
},
  //跳转音乐
  toSongDetail(event){
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + event.currentTarget.id
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