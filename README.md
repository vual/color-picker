# color-picker

微信小程序拾色器（颜色选择器或取色器）组件，快速获取颜色值，小程序原生语法，方便集成。

# 使用方式

1.json里引入控件：

    "usingComponents": {
        "color-picker": "/components/color-picker/color-picker"
    }

2.定义Page：
    
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

3.编写页面：
    
    <view class="color-button">
        <button bind:tap="openPicker" style="background-color: rgba({{rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a}})">选择颜色</button>
        <color-picker show="{{colorPickerShow}}" defaultColor="{{defaultColor}}" bind:confirm="colorConfirm"></color-picker>
    </view>

# 演示

    ![demo.gif](https://github.com/vual/color-picker/raw/main/images/demo.gif)
