Vue.component("share-card-console", {
  data() {
    return {
      shardCardStyleOptions: {
        bg: [
          "#ff4500",
          "#ff8c00",
          "#ffd700",
          "#90ee90",
          "#00ced1",
          "#1e90ff",
          "rgba(255, 69, 0, 0.68)",
          "rgb(255, 120, 0)",
          "#c7158577",
        ],
      },
      shardCardStyle: {
        bg: "#90ee90", // 背景
      },
    }
  },
  props: ["shareCardContent"],
  render(h) {
    const _this = this
    return h("div", {}, [
      // 复制or下载
      h(
        "div",
        {
          class: "ctrl m-2",
        },
        [
          // h(
          //   "button",
          //   {
          //     class: "bg-gray-200 hover:bg-gray-100 px-2 py-1 mr-2",
          //     on: {
          //       click: _this.handleCopyShareCardImg,
          //     },
          //   },
          //   ["复制"]
          // ),
          h(
            "button",
            {
              class: "bg-gray-200 hover:bg-gray-100 px-2 py-1 mr-2",
              on: {
                click: _this.handleDownloadShareCardImg,
              },
            },
            ["下载"]
          ),
          h(
            "span",
            {
              class: "text-gray-500",
            },
            ["或右键复制/保存卡片。"]
          ),
        ]
      ),
      // 生成前的预览
      h(
        "div",
        {
          class:
            "share-card-demo m-2 p-2 hidden border-4 border-dashed border-gray-300",
          style: {
            backgroundColor: _this.shardCardStyle.bg,
          },
          ref: "shareCardDemo",
        },
        [
          h(
            "h2",
            {
              class: "text-lg text-center font-bold mb-2",
            },
            [_this.shareCardContent.title]
          ),

          ..._this.shareCardContent.items.map((item) =>
            h(
              "div",
              {
                class: "py-1",
              },
              [item.content]
            )
          ),
          h(
            "div",
            {
              class: "mt-2",
            },
            [
              _this.shareCardContent.imgUrl
                ? h(
                    "img",
                    {
                      domProps: {
                        src: _this.shareCardContent.imgUrl,
                      },
                    },
                    []
                  )
                : "",
            ]
          ),
          h(
            "div",
            {
              class: "py-1 break-all",
            },
            [_this.shareCardContent.url]
          ),
          h(
            "div",
            {
              class: "flex items-center mt-2 justify-between",
            },
            [
              h("div", {}, [
                h("div", {}, ["识别二维码浏览全文"]),
                h(
                  "div",
                  {
                    class: "text-xs",
                  },
                  ["By 变色龙@chrome插件"]
                ),
              ]),
              h("div", {}, [
                h(
                  "img",
                  {
                    class: "block w-16 h-16",
                    ref: "qrcode",
                  },
                  []
                ),
              ]),
            ]
          ),
        ]
      ),
      // 生成的卡片
      h(
        "div",
        {
          class: "share-card m-2",
        },
        [
          h(
            "img",
            {
              class: "w-80",
              ref: "shareCardImg",
            },
            []
          ),
        ]
      ),
      // 选择样式
      h(
        "div",
        {
          class: "card-style m-2",
        },
        [
          h(
            "div",
            {
              class: "border-gray-400 border-l-2 my-2 pl-1",
            },
            ["选择样式"]
          ),
          h(
            "div",
            {
              class: "card-style-bg flex justify-between",
            },
            _this.shardCardStyleOptions.bg.map((bg) => {
              return h(
                "div",
                {
                  class: "card-style-bg-gray w-4 h-4 cursor-pointer",
                  style: {
                    backgroundColor: bg,
                  },
                  on: {
                    // 切换背景色
                    click() {
                      _this.shardCardStyle.bg = bg
                    },
                  },
                },
                []
              )
            })
          ),
        ]
      ),
      // 确认按钮
      // h(
      //   "div",
      //   {
      //     class: "ctrl text-center mt-2",
      //   },
      //   [
      //     h(
      //       "button",
      //       {
      //         class: "bg-gray-200 hover:bg-gray-100 px-2 py-1",
      //         on: {
      //           click: _this.shareByCard,
      //         },
      //       },
      //       ["刷新"]
      //     ),
      //   ]
      // ),
    ])
  },
  watch: {
    shardCardStyle: {
      deep: true,
      handler: "shareByCard",
    },
    shareCardContent: {
      deep: true,
      handler: "shareByCard",
    },
  },
  methods: {
    async shareByCard() {
      if (!this.shareCardContent.url) {
        return alert("请重试")
      }
      this.$refs.shareCardImg.src = ""
      // 生成二维码
      const url = await QRCode.toDataURL(this.shareCardContent.url, {
        color: { light: "#ffffff00" },
      })
      console.log(url)
      this.$refs.qrcode.src = url

      // 导出卡片
      this.$refs.shareCardDemo.style.display = "block"
      const canvas = (this.shareCardCanvas = await html2canvas(
        this.$refs.shareCardDemo,
        {
          scale: 3, // 清晰度更高
          allowTaint: true,
          useCORS: true,
        }
      ))
      // 插入到文档里面
      this.$refs.shareCardDemo.style.display = "none"
      this.$refs.shareCardImg.src = canvas.toDataURL("image/png")
    },
    handleCopyShareCardImg() {
      const selection = window.getSelection() // 清除选中
      if (selection.rangeCount > 0) selection.removeAllRanges() // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/queryCommandSupported
      if (!document.queryCommandSupported("copy"))
        return alert("浏览器暂不支持复制命令") // 创建range区域
      const range = document.createRange()
      range.selectNode(this.$refs.shareCardImg)
      selection.addRange(range)
      document.execCommand("copy")
      selection.removeAllRanges()
    },
    handleDownloadShareCardImg() {
      let a = document.createElement("a")
      let event = new MouseEvent("click")
      a.download = "share.png"
      a.href = this.$refs.shareCardImg.src
      a.dispatchEvent(event)
    },
  },
})
