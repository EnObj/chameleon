document.addEventListener("DOMContentLoaded", function () {
  const vue = new Vue({
    data: {
      shareCardContent: {
        url: "http://baidu.com",
        title: "百度",
        items: [],
      },
    },
    render: function (h) {
      const _this = this
      // 分享二维码卡片模块
      const contentShare = h(
        "div",
        {
          class: "w-80",
        },
        [
          h(
            "share-card-console",
            {
              props: {
                shareCardContent: _this.shareCardContent,
              },
            },
            []
          ),
        ]
      )

      return h(
        "div",
        {
          class: "body flex justify-center overflow-hidden",
        },
        [contentShare]
      )
    },
    watch: {},
    created() {
      const _this = this
      chrome.runtime.sendMessage(
        {
          action: "querySelection",
        },
        function (response) {
          console.log(response, chrome.runtime.lastError)
          _this.shareCardContent = {
            url: response.pageUrl,
            title: response.pageTitle,
            imgUrl: response.srcUrl,
            items: [
              {
                content: response.text,
              },
            ],
          }
        }
      )
    },
    methods: {},
  })

  vue.$mount("#app")
})
