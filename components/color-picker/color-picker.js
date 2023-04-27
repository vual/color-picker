Component( {
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer(t) {
        if (t) {
          this.show()
        }
      }
    },
    defaultColor: {
      type: Object,
      value: {
        r: 255,
        g: 0,
        b: 0,
        a: 1
      }
    },
    optionColorList: {
      type: Array,
      value: [],
      observer(newVal) {
        this.setData({
          colorList: newVal
        })
      }
    }
  },
  data: {
    show: false,
    active: false,
    mode: 'rgb',
    boundaryData: [], // 元素边界信息
    hex: '#000000',
    rgba: {
      r: 255,
      g: 0,
      b: 0,
      a: 1
    },
    hsb: {
      h: 0,
      s: 0,
      b: 0
    },
    bgcolor: {
      r: 255,
      g: 0,
      b: 0,
      a: 1
    },
    point: [{
      top: 0, // 颜色盒子里位置信息
      left: 0
    }, {
      left: 0 // 颜色条
    }, {
      left: 0 // 透明度
    }, {
      left: 0 // rgb-r
    }, {
      left: 0 // rgb-g
    }, {
      left: 0 // rgb-b
    }],
    colorList: [{
      r: 255,
      g: 0,
      b: 0,
      a: 1
    }, {
      r: 233,
      g: 30,
      b: 99,
      a: 1
    }, {
      r: 156,
      g: 39,
      b: 176,
      a: 1
    }, {
      r: 103,
      g: 58,
      b: 183,
      a: 1
    }, {
      r: 12,
      g: 27,
      b: 230,
      a: 1
    }, {
      r: 63,
      g: 81,
      b: 181,
      a: 1
    }, {
      r: 33,
      g: 150,
      b: 243,
      a: 1
    }, {
      r: 3,
      g: 169,
      b: 244,
      a: 1
    }, {
      r: 0,
      g: 188,
      b: 212,
      a: 1
    }, {
      r: 0,
      g: 150,
      b: 136,
      a: 1
    }, {
      r: 76,
      g: 175,
      b: 80,
      a: 1
    }, {
      r: 50,
      g: 250,
      b: 3,
      a: 1
    }, {
      r: 139,
      g: 195,
      b: 74,
      a: 1
    }, {
      r: 205,
      g: 220,
      b: 57,
      a: 1
    }, {
      r: 255,
      g: 235,
      b: 59,
      a: 1
    }, {
      r: 255,
      g: 193,
      b: 7,
      a: 1
    }, {
      r: 255,
      g: 152,
      b: 0,
      a: 1
    }, {
      r: 255,
      g: 87,
      b: 34,
      a: 1
    }, {
      r: 121,
      g: 85,
      b: 72,
      a: 1
    }, {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    }, {
      r: 158,
      g: 158,
      b: 158,
      a: 1
    }, {
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }, {
      r: 0,
      g: 0,
      b: 0,
      a: 0.5
    }, {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    }]
  },
  lifetimes: {
    attached() {
      this.setData({
        rgba: this.properties.defaultColor,
      })
      if (this.properties.optionColorList.length !== 0) {
        this.setData({
          colorList: this.properties.optionColorList
        })
      }
    },
  },

  methods: {
    show() {
      this.setData({
        show: true,
        hsb: this.rgbToHsb(this.data.rgba),
        hex: '#' + this.rgbToHex(this.data.rgba),
      })
      wx.nextTick(() => {
        setTimeout(() => {
          this.setData({
            active: true
          });
          setTimeout(() => {
            this.getBoundaryData();
          }, 300);
        }, 50);
      })
    },

    // 获取元素边界值
    getBoundaryData() {
      wx.createSelectorQuery().in(this)
          .selectAll('.range-box')
          .boundingClientRect(data => {
            if (!data || data.length === 0) {
              setTimeout(() => this.getBoundaryData(), 20)
              return
            }
            this.setData({
              boundaryData: data
            })
            this.setColorByOption(this.data.rgba);
          })
          .exec();
    },

    confirm() {
      this.close();
      this.triggerEvent('confirm', {
        rgba: this.data.rgba,
        hex: this.data.hex
      })
    },

    close() {
      this.setData({
        active: false
      })
      wx.nextTick(() => {
        setTimeout(() => {
          this.setData({
            show: false
          })
        }, 500)
      })
    },

    touchstart(e) {
      const index = e.currentTarget.dataset.index;
      const {
        pageX,
        pageY
      } = e.touches[0];
      this.setPointAndColor(pageX, pageY, index);
    },

    touchmove(e) {
      const index = e.currentTarget.dataset.index;
      const {
        pageX,
        pageY
      } = e.touches[0];
      this.setPointAndColor(pageX, pageY, index);
    },
    
    // 设置位置和颜色
    setPointAndColor(x, y, index) {
      const {
        top,
        left,
        width,
        height
      } = this.data.boundaryData[index];
      // 颜色盒
      if (index == 0) {
        this.changeColorBox(x, y, index, top, left, width, height);
      }
      // 颜色条
      else if (index == 1) {
        this.changeColorHSB(x, y, index, top, left, width, height);
      }
      // 透明度
      else if (index == 2) {
        this.changeTransparency(x, y, index, top, left, width, height);
      }
      // rgb条
      else {
        this.changeColorRGB(x, y, index, top, left, width, height);
      }
    },

    // 点击操作颜色盒
    changeColorBox(x, y, index, top, left, width, height) {
      let pointTop = Math.max(0, Math.min(parseInt(y - top), height));
      let pointLeft = Math.max(0, Math.min(parseInt(x - left), width));
      // 设置颜色
      let hsb = {
        h: this.data.hsb.h,
        s: parseInt((100 * pointLeft) / width),
        b: parseInt(100 - (100 * pointTop) / height)
      }
      const rgb = this.hsbToRgb(hsb);
      let rgba = {
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        a: this.data.rgba.a
      }
      // 计算rgb条的位置
      let rgb_r_left = parseInt(rgb.r / 255 * this.data.boundaryData[3].width);
      let rgb_g_left = parseInt(rgb.g / 255 * this.data.boundaryData[4].width);
      let rgb_b_left = parseInt(rgb.b / 255 * this.data.boundaryData[5].width);
      // 设置data
      this.setData({
        ['point[' + index + ']']: {
          top: pointTop,
          left: pointLeft
        },
        ['point[3].left']: rgb_r_left,
        ['point[4].left']: rgb_g_left,
        ['point[5].left']: rgb_b_left,
        hsb: hsb,
        rgba: rgba,
        hex: '#' + this.rgbToHex(rgb)
      })
    },

    // 颜色条，饱和度
    changeColorHSB(x, y, index, top, left, width, height) {
      let pointLeft = Math.max(0, Math.min(parseInt(x - left), width));
      let hsb = {
        h: parseInt((360 * pointLeft) / width),
        s: 100,
        b: 100,
      }
      let rgb = this.hsbToRgb(hsb);
      let rgba = {
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        a: this.data.rgba.a
      }
      // 计算rgb条的位置
      let rgb_r_left = parseInt(rgb.r / 255 * this.data.boundaryData[3].width);
      let rgb_g_left = parseInt(rgb.g / 255 * this.data.boundaryData[4].width);
      let rgb_b_left = parseInt(rgb.b / 255 * this.data.boundaryData[5].width);
      this.setData({
        ['point[' + index + '].left']: pointLeft,
        ['point[3].left']: rgb_r_left,
        ['point[4].left']: rgb_g_left,
        ['point[5].left']: rgb_b_left,
        hsb: hsb,
        rgba: rgba,
        hex: '#' + this.rgbToHex(rgb),
        bgcolor: this.hsbToRgb(hsb)
      })
    },

    // 透明度
    changeTransparency(x, y, index, top, left, width, height) {
      let pointLeft = Math.max(0, Math.min(parseInt(x - left), width));
      this.setData({
        ['point[' + index + '].left']: pointLeft,
        'rgba.a': (pointLeft / width).toFixed(1)
      })
    },

    // rgb条
    changeColorRGB(x, y, index, top, left, width, height) {
      let pointLeft = Math.max(0, Math.min(parseInt(x - left), width));
      let pointValue = parseInt(pointLeft / width * 255);
      let rgba = {
        r: index == 3 ? pointValue : this.data.rgba.r,
        g: index == 4 ? pointValue : this.data.rgba.g,
        b: index == 5 ? pointValue : this.data.rgba.b,
        a: this.data.rgba.a
      }
      let hsb = this.rgbToHsb(rgba);
      // 计算颜色条的位置
      let hsb_left = parseInt((hsb.h * this.data.boundaryData[1].width) / 360);
      // 设置data
      this.setData({
        ['point[' + index + '].left']: pointLeft,
        ['point[1].left']: hsb_left,
        hsb: hsb,
        rgba: rgba,
        hex: '#' + this.rgbToHex(rgba),
        bgcolor: this.hsbToRgb(hsb)
      })
    },

    // 设置 rgb 颜色
    setColor() {
      const rgb = this.hsbToRgb(this.data.hsb);
      let rgba = {
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        a: this.data.rgba.a
      }
      this.setData({
        rgba: rgba
      })
    },

    // 根据rgb设置十六进制颜色
    setHexValue(rgb) {
      this.setData({
        hex: '#' + this.rgbToHex(rgb)
      })
    },

    // 设置颜色面板
    setPanel(index, x) {
      const {
        top,
        left,
        width,
        height
      } = this.data.boundaryData[index];

      if (index == 1) {
        this.data.hsb.h = parseInt((360 * x) / width);
        this.setData({
          hsb: this.data.hsb,
          bgcolor: this.hsbToRgb({
            h: this.data.hsb.h,
            s: 100,
            b: 100
          })
        })
        this.setColor()
      } else {
        this.data.rgba.a = (x / width).toFixed(1);
        this.setData({
          rgba: this.data.rgba
        })
      }
      this.setHexValue(this.data.rgba);
    },

    // 切换模式
    changeMode() {
      this.setData({
        mode: this.data.mode != 'rgb' ? 'rgb' : 'hex'
      })
    },
    
    // 常用颜色选择
    selectColor(event) {
      this.setColorByOption(event.currentTarget.dataset.color)
    },
    
    setColorByOption(optionColor) {
      const {
        r,
        g,
        b,
        a
      } = optionColor;
      let rgba = {
        r: r ? parseInt(r) : 0,
        g: g ? parseInt(g) : 0,
        b: b ? parseInt(b) : 0,
        a: a ? a : 0,
      };
      let hsb = this.rgbToHsb(rgba);
      this.setData({
        rgba: rgba,
        hsb: hsb,
        hex: '#' + this.rgbToHex(rgba),
        bgcolor: this.hsbToRgb(hsb)
      })
      this.changePoint();
    },
    
    changePoint() {
      const [a, b, c, d, e, f] = this.data.boundaryData;
      let point = [{
          top: parseInt((100 - this.data.hsb.b) * a.height / 100), // 颜色盒子
          left: parseInt(this.data.hsb.s * a.width / 100)
        }, {
          left: this.data.hsb.h / 360 * b.width // 颜色条
        }, {
          left: this.data.rgba.a * c.width // 透明度
        }, {
          left: this.data.rgba.r / 255 * d.width // rgb-r
        }, {
          left: this.data.rgba.g / 255 * e.width // rgb-g
        }, {
          left: this.data.rgba.b / 255 * f.width // rgb-b
        }
      ]

      this.setData({
        point: point,
      })
    },

    // rgb 转 hex
    rgbToHex(rgb) {
      let hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
      hex.map(function(str, i) {
        if (str.length == 1) {
          hex[i] = '0' + str;
        }
      });
      return hex.join('');
    },

    // rgb 转 hsb
    rgbToHsb(rgb) {
      let hsb = {
        h: 0,
        s: 0,
        b: 0
      };
      let min = Math.min(rgb.r, rgb.g, rgb.b);
      let max = Math.max(rgb.r, rgb.g, rgb.b);
      let delta = max - min;
      hsb.b = max;
      hsb.s = max != 0 ? 255 * delta / max : 0;
      if (hsb.s != 0) {
        if (rgb.r == max) hsb.h = (rgb.g - rgb.b) / delta;
        else if (rgb.g == max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
        else hsb.h = 4 + (rgb.r - rgb.g) / delta;
      } else hsb.h = -1;
      hsb.h *= 60;
      if (hsb.h < 0) hsb.h = 0;
      hsb.s *= 100 / 255;
      hsb.b *= 100 / 255;
      return hsb;
    },

    // hsb 转 rgb 颜色模式  H(hues)表示色相，S(saturation)表示饱和度，B（brightness）表示亮度
    hsbToRgb(hsb) {
      let rgb = {};
      let h = Math.round(hsb.h);
      let s = Math.round((hsb.s * 255) / 100);
      let v = Math.round((hsb.b * 255) / 100);
      if (s == 0) {
        rgb.r = rgb.g = rgb.b = v;
      } else {
        let t1 = v;
        let t2 = ((255 - s) * v) / 255;
        let t3 = ((t1 - t2) * (h % 60)) / 60;
        if (h == 360) h = 0;
        if (h < 60) {
          rgb.r = t1;
          rgb.b = t2;
          rgb.g = t2 + t3;
        } else if (h < 120) {
          rgb.g = t1;
          rgb.b = t2;
          rgb.r = t1 - t3;
        } else if (h < 180) {
          rgb.g = t1;
          rgb.r = t2;
          rgb.b = t2 + t3;
        } else if (h < 240) {
          rgb.b = t1;
          rgb.r = t2;
          rgb.g = t1 - t3;
        } else if (h < 300) {
          rgb.b = t1;
          rgb.g = t2;
          rgb.r = t2 + t3;
        } else if (h < 360) {
          rgb.r = t1;
          rgb.g = t2;
          rgb.b = t1 - t3;
        } else {
          rgb.r = 0;
          rgb.g = 0;
          rgb.b = 0;
        }
      }
      return {
        r: Math.round(rgb.r),
        g: Math.round(rgb.g),
        b: Math.round(rgb.b)
      };
    },
  }
});