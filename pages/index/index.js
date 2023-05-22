// index.js
import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图
    recommendList:[], //推荐歌单
    topList:[],//排行榜
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //轮播图
    let bannerListData = await request('/banner',{type:1});
    this.setData({
      bannerList: bannerListData.banners
    });


    //获取推荐歌单
    let recommendListData =await  request('/personalized',{limit:10});
    this.setData({
      recommendList:recommendListData.result
    })

    //排行榜数据
    let resultArr=[];
    let topListData = await request('/toplist/detail');
      let topListID = topListData.list.slice(0, 4);
      for(let item of topListID){
        let detailList = await request(`/playlist/detail?id=${item.id}`, { limit: 10 });
        let topListItem = {name:detailList.playlist.name,tracks:detailList.playlist.tracks.slice(0, 3)};
        
        resultArr.push(topListItem);

        this.setData({
          topList:resultArr
        })
      }

  },
  //跳转每日推荐
  recomend(){
    let cookie = wx.getStorageSync('cookie');
    if(!cookie){
        wx.showToast({
        title: '请先登录',
        icon:'error'
      })
      return
    }else{
      wx.navigateTo({
        url: '/pages/recommendSong/recommendSong'
      })
    }
  },

  //跳转歌单页
songList(){
  wx.navigateTo({
    url: '/pages/song/song'
  })
},
  //跳转排行榜
  top(){
    wx.navigateTo({
      url: '/pages/top/top'
    })
  },
  //跳转随机推荐
  async random(){
    let cookie = wx.getStorageSync('cookie');
    if(!cookie){
       await wx.showToast({
        title: '请先登录',
        icon:'error'
      })
      return
    }
    let fmsong = await request('/personal_fm');
    //console.log(fmsong)
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + fmsong.data[0].id
    })
  },
  //跳转歌手
  songer(){
    wx.navigateTo({
      url: '/pages/songer/songer'
    })
  },

//跳转歌单
  toPlayList(event){
    console.log(event)
    wx.navigateTo({
      url: '/pages/playlist/playlist?id='+event.currentTarget.id
    })
  },
  //跳转音乐
  toSongDetail(event){
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + event.currentTarget.id
    })
  },
    // 跳转至搜索界面
    toSearch(){
      wx.navigateTo({
        url: '/pages/search/search'
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

