// components/NavHeader/NavHeader.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      value:'默认标题'
    },
    nav:{
      type:String,
      value:'为你精心推荐'
    },
    bind:{
      type:String,
      value:'1'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    tap(event){
      //console.log(event)
      switch(event.target.dataset.type){
        case '推荐歌单':
            wx.navigateTo({
              url: '/pages/song/song'
            })
        break
        case '排行榜':
          wx.navigateTo({
            url: '/pages/top/top'
          })
        break
        default:
          wx.showToast({
            title: '没有更多了哦',
            icon:'none'
          })
      }
    }
  }
})
