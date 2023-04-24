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
    color: {
      type: Object,
      value: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      }
    },
    spareColor: {
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
    hex: '#000000',
    mode: 'rgb',
    index: 0,
    position: [],
    rgba: {
      r: 0,
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
      r: 244,
      g: 67,
      b: 54,
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
      r: 158,
      g: 158,
      b: 158,
      a: 1
    }, {
      r: 0,
      g: 0,
      b: 0,
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
        rgba: this.properties.color,
      })
      if (this.properties.spareColor.length !== 0) {
        this.setData({
          colorList: this.properties.spareColor
        })
      }
    },
  },

  methods: {
    show() {
      this.setData({
        show: true,
        hsb: this.rgbToHsb(this.data.rgba)
      })
      this.setHexValue(this.data.rgba);
      wx.nextTick(() => {
        setTimeout(() => {
          this.setData({
            active: true
          });
          setTimeout(() => {
            this.getSelectorQuery();
          }, 350);
        }, 50);
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
    confirm() {
      this.close();
      this.triggerEvent('confirm', {
        rgba: this.data.rgba,
        hex: this.data.hex
      })
    },
    // 切换模式
    changeMode() {
      this.setData({
        mode: this.data.mode != 'rgb' ? 'rgb' : 'hex'
      })
    },
    // 常用颜色选择
    selectColor(event) {
      this.setColorBySelect(event.currentTarget.dataset.color)
    },
    touchstart(e) {
      const index = e.currentTarget.dataset.index;
      const {
        pageX,
        pageY
      } = e.touches[0];
      this.setPosition(pageX, pageY, index);
    },
    touchmove(e) {
      const index = e.currentTarget.dataset.index;
      const {
        pageX,
        pageY
      } = e.touches[0];
      this.setPosition(pageX, pageY, index);
    },
    touchend(e) {},
    /**
     * 设置位置
     */
    setPosition(x, y, index) {
      this.setData({
        index: index
      })
      const {
        top,
        left,
        width,
        height
      } = this.data.position[index];
      // 设置最大最小值
      this.data.point[index].left = Math.max(0, Math.min(parseInt(x - left), width));
      this.setData({
        point: this.data.point
      })
      if (index == 0) {
        this.data.point[index].top = Math.max(0, Math.min(parseInt(y - top), height));
        // 设置颜色
        this.data.hsb.s = parseInt((100 * this.data.point[index].left) / width);
        this.data.hsb.b = parseInt(100 - (100 * this.data.point[index].top) / height);
        this.setData({
          point: this.data.point,
          hsb: this.data.hsb
        })
        this.setColor();
        this.setHexValue(this.data.rgba);
      } else {
        this.setControl(index, this.data.point[index].left);
      }
    },
    /**
     * 设置 rgb 颜色
     */
    setColor() {
      const rgb = this.HSBToRGB(this.data.hsb);
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
    /**
     * 设置十六进制颜色
     * @param {Object} rgb
     */
    setHexValue(rgb) {
      this.setData({
        hex: '#' + this.rgbToHex(rgb)
      })
    },
    setControl(index, x) {
      const {
        top,
        left,
        width,
        height
      } = this.data.position[index];

      if (index == 1) {
        this.data.hsb.h = parseInt((360 * x) / width);
        this.setData({
          hsb: this.data.hsb,
          bgcolor: this.HSBToRGB({
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
    /**
     * rgb 转 二进制 hex
     * @param {Object} rgb
     */
    rgbToHex(rgb) {
      let hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
      hex.map(function(str, i) {
        if (str.length == 1) {
          hex[i] = '0' + str;
        }
      });
      return hex.join('');
    },
    setColorBySelect(getrgb) {
      const {
        r,
        g,
        b,
        a
      } = getrgb;
      let rgb = {}
      rgb = {
        r: r ? parseInt(r) : 0,
        g: g ? parseInt(g) : 0,
        b: b ? parseInt(b) : 0,
        a: a ? a : 0,
      };
      this.setData({
        rgba: rgb,
        hsb: this.rgbToHsb(rgb)
      })
      this.changeViewByHsb();
    },
    changeViewByHsb() {
      const [a, b, c, d, e, f] = this.data.position;
      this.data.point[0].left = parseInt(this.data.hsb.s * a.width / 100);
      this.data.point[0].top = parseInt((100 - this.data.hsb.b) * a.height / 100);
      this.data.point[1].left = this.data.hsb.h / 360 * b.width;
      this.data.point[2].left = this.data.rgba.a * c.width;
      this.data.point[3].left = this.data.rgba.r / 255 * d.width;
      this.data.point[4].left = this.data.rgba.g / 255 * e.width;
      this.data.point[5].left = this.data.rgba.b / 255 * f.width;
      this.setData({
        point: this.data.point,
        bgcolor: this.HSBToRGB({h: this.data.hsb.h, s: 100, b: 100})
      })
      this.setColor(this.data.hsb.h);
      this.setHexValue(this.data.rgba);
    },
    /**
     * hsb 转 rgb
     * @param {Object} 颜色模式  H(hues)表示色相，S(saturation)表示饱和度，B（brightness）表示亮度
     */
    HSBToRGB(hsb) {
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
    getSelectorQuery() {
      const views = wx.createSelectorQuery().in(this);
      views.selectAll('.boxs')
          .boundingClientRect(data => {
            if (!data || data.length === 0) {
              setTimeout(() => this.getSelectorQuery(), 20)
              return
            }
            this.setData({
              position: data
            })
            this.setColorBySelect(this.data.rgba);
          })
          .exec();
    }
  }
});