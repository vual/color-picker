// index.js
// 获取应用实例

Page({
  data: {
    colorPickerShow: false,
    defaultColor: {
      r: 0,
      g: 0,
      b: 255,
      a: 1
    },
    rgba: {
      r: 0,
      g: 188,
      b: 212,
      a: 1
    }
  },

  onLoad() {

  },

  openPicker() {
    this.setData({
      colorPickerShow: true,
    })
  },

  colorConfirm(event) {
    this.setData({
      rgba: event.detail.rgba
    })
  }
})
