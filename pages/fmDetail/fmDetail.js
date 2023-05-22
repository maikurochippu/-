// pages/songDetail/songDetail.js
import PubSub from 'pubsub-js';
import moment from 'moment';
import request from '../../utils/request';
//获取全局实例
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,//标识播放状态
    song: {},//歌曲详情对象
    musicId: '',//歌曲Id
    currentTime: '00:00',//当前时长
    durationTime:'00:00',//总时长
    currentWidth: 0,//实时进度条宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options路由跳转参数
    console.log(options)
    let musicId = options.song;
    this.setData({
      musicId: musicId
    })
    this.getMusicInfo(musicId);

    //创建控制音乐播放实例对象
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    //判断当前页面音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      //修改当前页面音乐播放状态
      this.setData({
        isPlay: true
      })
    }else{
      this.backgroundAudioManager.pause();
    }
    //监视音乐播放与暂停
    this.backgroundAudioManager.onPlay(()=>{
      //修改音乐播放状态
      this.changePlayState(true);

      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(()=>{
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(()=>{
      this.changePlayState(false);
    });
    //音乐播放自然结束
    this.backgroundAudioManager.onEnded(()=>{
      //切歌
      PubSub.publish('switchMusic','next');
      //重置所有数据
      this.setData({
        song: {},
        currentWidth: 0,
        currentTime: '00:00',
        isPlay: false,
      })
      PubSub.subscribe('musicId',async (msg,musicId) => {
        //获取歌曲
        await this.getMusicInfo(musicId);
        //自动播放当前音乐
        await this.musicControl(true,musicId);
        //取消订阅
        PubSub.unsubscribe('musicId');
      })
    })
    //监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      this.musicPlayTime()
    })

  },

  //观察音乐播放进度
  musicPlayTime(){
    let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss');
    let currentWidth = (this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration) * 450;
    this.setData({
      currentTime,
      currentWidth
    })
  },

  //修改播放状态
  changePlayState(isPlay){
    this.setData({
      isPlay: isPlay
    })
    //修改全局播放状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  //点击暂停/播放的回调
  handleMusicPlay(){
    //修改是否播放的状态
    let isPlay = !this.data.isPlay;
    let {musicId} = this.data;
    this.musicControl(isPlay,musicId);
  },
  //请求歌曲信息
  async getMusicInfo(musicId){
    let songData = await request('/dj/program/detail',{id: musicId});
    let durationTime = moment(songData.program.duration).format('mm:ss');
    this.setData({
      song: songData.program,
      durationTime
    })
    //动态修改窗口标题
   /* wx.setNavigationBarTitle({
      title: this.data.song.name
    })*/
  },

  //歌曲播放控制功能
  async musicControl(isPlay,musicId){

    if(isPlay){//音乐播放
      //获取音频资源
      let id = this.data.song.mainSong.id ;
      let musicLinkData = await request('/song/url',{id: id})
      //console.log(musicLinkData)
      let musicLink = musicLinkData.data[0].url;
      this.setData({
        isPlay: isPlay
      })
      //歌曲播放
      this.backgroundAudioManager.coverImgUrl = this.data.song.coverUrl;
      this.backgroundAudioManager.epname = this.data.song.dj.brand;
      this.backgroundAudioManager.singer = this.data.song.dj.nickname;
      this.backgroundAudioManager.title = this.data.song.name;
      this.backgroundAudioManager.src = musicLink;
    }else{//音乐暂停
      this.backgroundAudioManager.pause();
    }
  },

  //歌曲切换
handleSwitch(event){
    //切换类型
    let type = event.currentTarget.id;
    //关闭当前播放音乐
    this.backgroundAudioManager.stop();

    //发布消息数据给recommendSong页面
    PubSub.publish('switchMusic',type);

    //订阅来自recommendSong页面
    PubSub.subscribe('musicId',  async(msg,musicId) => {
      //获取歌曲
      await this.getMusicInfo(musicId);
      //自动播放当前音乐
      await this.musicControl(true,musicId);
      //取消订阅
      PubSub.unsubscribe('musicId');
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