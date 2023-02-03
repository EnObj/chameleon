document.addEventListener("DOMContentLoaded", function () {
  const vue = new Vue({
    data: {
      items: [],
      refreshItems: false,
      currentNav: "mine",
      page: {
        list: [],
        title: "",
        url: "",
      },
      currentTab: {
        url: "",
        id: 0,
      },
      clipPageItems: [],
      readItemIndex: 0, // 正在阅读的段落
    },
    computed: {
      shareCardContent() {
        return {
          title: this.page.title,
          url: this.page.url,
          items: this.page.list.filter((item) => item.shareCardContentChecked),
        }
      },
    },
    render: function (h) {
      const _this = this
      console.log(_this.items)
      // 变色龙模块
      const contentMine = h(
        "div",
        {
          class: "content-mine h-full",
        },
        [
          h(
            "div",
            {
              class: "flex items-center justify-between p-2 overflow-hidden",
            },
            [
              h(
                "div",
                {
                  class: "bg-green-50",
                },
                ["网站新皮肤"]
              ),
              h(
                "button",
                {
                  attrs: {
                    class: "bg-gray-200 px-2 py-1",
                  },
                  on: {
                    click: _this.refresh,
                  },
                },
                ["刷新列表" + (_this.refreshItems ? "..." : "")]
              ),
            ]
          ),
          h(
            "div",
            {
              attrs: {
                class: "items overflow-auto",
                style: "height: calc(100% - 42px);",
              },
            },
            // 包含内容的才会被展示
            _this.items
              .filter((item) => item.hiddenDoms.length || item.styles.length)
              .map((item) => {
                const itemHeader = [
                  h(
                    "input",
                    {
                      attrs: {
                        class: "item-checkbox mr-1",
                        type: "checkbox",
                        id: item._id,
                      },
                      domProps: {
                        checked:
                          item.hiddenDoms.every(
                            (hiddenDom) => hiddenDom.checked
                          ) && item.styles.every((style) => style.checked),
                      },
                      on: {
                        change(event) {
                          const checked = !!event.target.checked
                          for (const hiddenDom of item.hiddenDoms) {
                            if (hiddenDom.checked != checked) {
                              hiddenDom.checked = checked
                              _this.switchHiddenDom(event, hiddenDom, item)
                            }
                          }
                          for (const style of item.styles) {
                            if (style.checked != checked) {
                              style.checked = checked
                              _this.switchStyle(event, style, item)
                            }
                          }
                        },
                      },
                    },
                    []
                  ),
                  h(
                    "label",
                    {
                      attrs: {
                        for: item._id,
                      },
                    },
                    [item.name]
                  ),
                  h(
                    "button",
                    {
                      attrs: {
                        type: "button",
                      },
                      class: "flex-none",
                      on: {
                        click() {
                          _this.$set(item, "isShowDetail", !item.isShowDetail)
                        },
                      },
                    },
                    [
                      h("img", {
                        attrs: {
                          src: `./imgs/${
                            item.isShowDetail
                              ? "arrow-down-s-fill"
                              : "arrow-right-s-fill"
                          }.png`,
                          style: "width: 15px;height:15px;",
                        },
                      }),
                    ]
                  ),
                ]
                if (item.isFitCurrentTab) {
                  itemHeader.push(
                    h(
                      "div",
                      {
                        class: "mx-1 flex-none",
                      },
                      [
                        h("img", {
                          attrs: {
                            src: "./imgs/logo.png",
                            style: "width: 15px;height:15px;",
                          },
                        }),
                      ]
                    )
                  )
                }
                // 只有本地的才可以删除和重命名
                if (item.type == "local") {
                  itemHeader.push(
                    h(
                      "div",
                      {
                        class: "flex-auto text-right actions",
                        style: "min-width: 60px;",
                      },
                      [
                        h(
                          "button",
                          {
                            class: "mr-1",
                            on: {
                              click(event) {
                                _this.deleteLocalItem(event, item)
                              },
                            },
                          },
                          [
                            h("img", {
                              attrs: {
                                src: "./imgs/delete-bin-7-line.png",
                                style: "width: 15px;height:15px;",
                              },
                            }),
                          ]
                        ),
                        h(
                          "button",
                          {
                            class: "mr-1",
                            on: {
                              click(event) {
                                _this.renameLocalItem(event, item)
                              },
                            },
                          },
                          [
                            h("img", {
                              attrs: {
                                src: "./imgs/edit-line.png",
                                style: "width: 15px;height:15px;",
                              },
                            }),
                          ]
                        ),
                        h(
                          "button",
                          {
                            on: {
                              click(event) {
                                _this.publishLocalItem(event, item)
                              },
                            },
                          },
                          [
                            h("img", {
                              attrs: {
                                src: "./imgs/upload-cloud-line.png",
                                style: "width: 15px;height:15px;",
                              },
                            }),
                          ]
                        ),
                      ]
                    )
                  )
                }
                return h(
                  "div",
                  {
                    class: "item p-2 border-t hover:bg-gray-50",
                  },
                  [
                    h(
                      "div",
                      {
                        attrs: {
                          class: "item mb-1",
                        },
                      },
                      [
                        h(
                          "div",
                          {
                            class: "flex items-center",
                          },
                          itemHeader
                        ),
                        h(
                          "div",
                          {
                            attrs: {
                              class: "text-gray-500 text-sm",
                            },
                          },
                          [item.host]
                        ),
                      ]
                    ),
                    h(
                      "div",
                      {
                        style: {
                          display: item.isShowDetail ? "initial" : "none",
                        },
                        attrs: {
                          class: "hidden-doms",
                        },
                      },
                      (item.hiddenDoms || []).map((hiddenDom) => {
                        const hiddenDomChildren = [
                          h(
                            "div",
                            {
                              class: "truncate mr-1",
                            },
                            [
                              h(
                                "input",
                                {
                                  attrs: {
                                    class: "hidden-dom-checkbox mr-1",
                                    type: "checkbox",
                                    id: item._id + hiddenDom.name,
                                  },
                                  domProps: {
                                    checked: hiddenDom.checked,
                                  },
                                  on: {
                                    change(event) {
                                      hiddenDom.checked = !!event.target.checked
                                      _this.switchHiddenDom(
                                        event,
                                        hiddenDom,
                                        item
                                      )
                                    },
                                  },
                                },
                                []
                              ),
                              h(
                                "label",
                                {
                                  attrs: {
                                    for: item._id + hiddenDom.name,
                                  },
                                },
                                [hiddenDom.name]
                              ),
                            ]
                          ),
                        ]
                        // 只有本地的才可以删除和重命名
                        if (item.type == "local") {
                          hiddenDomChildren.push(
                            h(
                              "div",
                              {
                                class: "flex-none",
                              },
                              [
                                h(
                                  "button",
                                  {
                                    class: "mr-1",
                                    on: {
                                      click(event) {
                                        _this.deleteLocalHiddenDom(
                                          event,
                                          hiddenDom,
                                          item
                                        )
                                      },
                                    },
                                  },
                                  [
                                    h("img", {
                                      attrs: {
                                        src: "./imgs/delete-bin-7-line.png",
                                        style: "width: 15px;height:15px;",
                                      },
                                    }),
                                  ]
                                ),
                                " ",
                                h(
                                  "button",
                                  {
                                    on: {
                                      click(event) {
                                        _this.renameLocalHiddenDom(
                                          event,
                                          hiddenDom,
                                          item
                                        )
                                      },
                                    },
                                  },
                                  [
                                    h("img", {
                                      attrs: {
                                        src: "./imgs/edit-line.png",
                                        style: "width: 15px;height:15px;",
                                      },
                                    }),
                                  ]
                                ),
                              ]
                            )
                          )
                        }
                        return h(
                          "div",
                          {
                            attrs: {
                              class:
                                "hidden-dom flex items-center hover:bg-gray-200 justify-between",
                            },
                          },
                          hiddenDomChildren
                        )
                      })
                    ),
                    h(
                      "div",
                      {
                        style: {
                          display: item.isShowDetail ? "initial" : "none",
                        },
                        attrs: {
                          class: "styles",
                        },
                      },
                      (item.styles || []).map((style) => {
                        return h(
                          "div",
                          {
                            attrs: {
                              class: "style flex items-center bg-green-50",
                            },
                          },
                          [
                            h(
                              "input",
                              {
                                attrs: {
                                  class: "style-checkbox mr-1",
                                  type: "checkbox",
                                  id: item._id + style.name,
                                },
                                domProps: {
                                  checked: style.checked,
                                },
                                on: {
                                  change(event) {
                                    style.checked = !!event.target.checked
                                    _this.switchStyle(event, style, item)
                                  },
                                },
                              },
                              []
                            ),
                            h(
                              "label",
                              {
                                attrs: {
                                  for: item._id + style.name,
                                },
                              },
                              [style.name]
                            ),
                          ]
                        )
                      })
                    ),
                  ]
                )
              })
          ),
        ]
      )
      // diy模块
      const contentCreate = h(
        "div",
        {
          class: "content-create p-2",
        },
        [
          h(
            "div",
            {
              class: "page",
            },
            [
              h(
                "div",
                {
                  class: "my-2 text-lg",
                },
                [_this.page.title]
              ),
              h(
                "div",
                {
                  class: "page-items",
                },
                _this.page.list
                  .filter((item) => {
                    // 关闭标签不显示
                    if (item.type == "/div") {
                      return false
                    }
                    // 手动隐藏的容器子元素不显示
                    return _this.clipPageItems.every((clipPageItem) => {
                      return (
                        clipPageItem == item.insideId ||
                        !item.insideId.startsWith(clipPageItem)
                      )
                    })
                  })
                  .map((item) => {
                    const pageItem = [
                      h(
                        "input",
                        {
                          attrs: {
                            class: "hidden-dom-checkbox mr-1",
                            type: "checkbox",
                            checked: false,
                            id: item.insideId,
                          },
                          on: {
                            change(event) {
                              _this.switchHiddenDom(
                                event,
                                {
                                  checked: !!event.target.checked,
                                  selector: item.selector,
                                  name: item.insideId,
                                },
                                {
                                  id: _this.page.url,
                                  host: new URL(_this.page.url).host,
                                  name: _this.page.title,
                                  type: "local",
                                }
                              )
                            },
                          },
                        },
                        []
                      ),
                      h(
                        "label",
                        {
                          attrs: {
                            for: item.insideId,
                          },
                        },
                        [item.content]
                      ),
                    ]
                    if (item.type == "div") {
                      pageItem.unshift(
                        h("img", {
                          attrs: {
                            src: `./imgs/${
                              !_this.clipPageItems.includes(item.insideId)
                                ? "arrow-down-s-fill"
                                : "arrow-right-s-fill"
                            }.png`,
                            style: "width: 15px;height:15px;",
                          },
                          on: {
                            click() {
                              // 隐藏此元素的子元素
                              if (_this.clipPageItems.includes(item.insideId)) {
                                _this.clipPageItems.splice(
                                  _this.clipPageItems.indexOf(item.insideId),
                                  1
                                )
                              } else {
                                _this.clipPageItems.push(item.insideId)
                              }
                            },
                          },
                        })
                      )
                    } else {
                      pageItem.unshift(
                        h("div", {
                          style: "width: 15px;height:15px;",
                        })
                      )
                    }
                    return h(
                      "div",
                      {
                        class: "page-item hover:bg-gray-100 flex items-center",
                        style: `padding-left: ${item.depth * 10}px;`,
                        on: {
                          mouseenter(event) {
                            console.log("mouseenter", event, item)
                            _this.highLightDom(item, true)
                          },
                          mouseleave(event) {
                            console.log("mouseleave", event, item)
                            _this.highLightDom(item, false)
                          },
                        },
                      },
                      pageItem
                    )
                  })
              ),
            ]
          ),
        ]
      )
      // 短书模块
      const contentRead = h(
        "div",
        {
          class: "read",
        },
        [
          h(
            "div",
            {
              class: "text-center my-20",
            },
            [
              h(
                "button",
                {
                  attrs: {
                    class: "bg-gray-200 px-2 py-1",
                  },
                  on: {
                    click: _this.startRead,
                  },
                },
                ["开始"]
              ),
            ]
          ),
        ]
      )
      // 分享二维码卡片模块
      const contentShare = h("div", {}, [
        h(
          "share-card-console",
          {
            props: {
              shareCardContent: _this.shareCardContent,
            },
          },
          []
        ),
        // 选择段落
        h(
          "div",
          {
            class: "m-2",
          },
          [
            h(
              "div",
              {
                class: "border-gray-400 border-l-2 my-2 pl-1",
              },
              ["选择内容"]
            ),
            h(
              "div",
              {},
              _this.page.list
                .filter((item) => item.type == "text")
                .map((item) => {
                  return h("div", {}, [
                    h(
                      "input",
                      {
                        attrs: {
                          class: "hidden-dom-checkbox mr-1",
                          type: "checkbox",
                          checked: false,
                          id: item.insideId,
                        },
                        on: {
                          change(event) {
                            _this.$set(
                              item,
                              "shareCardContentChecked",
                              !!event.target.checked
                            )
                          },
                        },
                      },
                      []
                    ),
                    h(
                      "label",
                      {
                        attrs: {
                          for: item.insideId,
                        },
                        class: "break-all",
                      },
                      [item.content]
                    ),
                  ])
                })
            ),
          ]
        ),
      ])

      const tabs = {
        mine: contentMine,
        create: contentCreate,
        read: contentRead,
        share: contentShare,
      }

      return h(
        "div",
        {
          class: "w-80 h-96 body flex items-stretch overflow-hidden",
        },
        [h(
            "div",
            {
              class: "flex-auto h-full overflow-auto",
            },
            [tabs[_this.currentNav]]
          ),
        ]
      )
    },
    watch: {
      currentNav(val) {
        if (val == "mine") {
          this.refresh()
        } else if (val == "create") {
          this.loadDom().then(() => {
            // 创建本地变色龙
            chrome.runtime.sendMessage({
              action: "createLocalItem",
              localItem: {
                id: this.page.url,
                host: new URL(_this.page.url).host,
                name: this.page.title,
              },
            })
          })
        } else if (val == "read") {
          this.loadDom()
        } else if (val == "share") {
          this.loadDom().then(() => {
            // this.shareByCard();
          })
        }
      },
    },
    created() {
      // 加载用户设置
      const _this = this
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        function (tabs) {
          _this.currentTab.url = tabs[0].url
          _this.currentTab.id = tabs[0].id
        }
      )
      chrome.runtime.sendMessage(
        {
          action: "loadItems",
        },
        function (response) {
          console.log(response, chrome.runtime.lastError)
          _this.setItems(JSON.parse(response))
        }
      )
    },
    methods: {
      loadDom() {
        const _this = this
        return new Promise((resolve, reject) => {
          chrome.tabs.query(
            {
              active: true,
              currentWindow: true,
            },
            function (tabs) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  action: "loadDocument",
                },
                function (response) {
                  console.log(response)
                  let depth = 0
                  response.list.forEach((item, index) => {
                    item.depth = depth
                    if (item.type == "div") {
                      depth++
                    } else if (item.type == "/div") {
                      depth--
                    }
                  })
                  _this.page = response
                  resolve(_this.page)
                }
              )
            }
          )
        })
      },
      refresh() {
        this.refreshItems = true
        this.items = []
        const _this = this
        chrome.runtime.sendMessage(
          {
            action: "reloadItems",
          },
          function (response) {
            console.log(response, chrome.runtime.lastError)
            _this.setItems(JSON.parse(response))
            _this.refreshItems = false
          }
        )
      },
      switchHiddenDom(event, hiddenDom, item) {
        console.log(event, hiddenDom, item)
        // 交给background处理
        chrome.runtime.sendMessage({
          action: "switchHiddenDom",
          data: {
            hiddenDom,
            item,
          },
        })
      },
      switchStyle(event, style, item) {
        console.log(event, style, item)
        // 交给background处理
        chrome.runtime.sendMessage({
          action: "switchStyle",
          data: {
            style,
            item,
          },
        })
      },
      deleteLocalHiddenDom(event, hiddenDom, item) {
        console.log(event, hiddenDom, item)
        const _this = this
        if (confirm("确认删除吗")) {
          // 交给background处理
          chrome.runtime.sendMessage(
            {
              action: "deleteLocalHiddenDom",
              data: {
                hiddenDom,
                item,
              },
            },
            function (response) {
              console.log("deleted", response)
              item.hiddenDoms.splice(item.hiddenDoms.indexOf(hiddenDom), 1) // 更新本地
            }
          )
        }
      },
      renameLocalHiddenDom(event, hiddenDom, item) {
        console.log(event, hiddenDom, item)
        const _this = this
        const newName = prompt("请输入新名称", hiddenDom.name)
        if (newName) {
          // 交给background处理
          chrome.runtime.sendMessage(
            {
              action: "renameLocalHiddenDom",
              data: {
                hiddenDom,
                item,
                newName,
              },
            },
            function (response) {
              console.log("renamed", response)
              hiddenDom.name = newName
            }
          )
        }
      },
      deleteLocalItem(event, item) {
        console.log(event, item)
        const _this = this
        if (confirm("确认删除吗")) {
          // 交给background处理
          chrome.runtime.sendMessage(
            {
              action: "deleteLocalItem",
              data: {
                item,
              },
            },
            function (response) {
              console.log("deleted", response)
              // 本地清除
              _this.items.splice(_this.items.indexOf(item), 1)
            }
          )
        }
      },
      renameLocalItem(event, item) {
        console.log(event, item)
        const _this = this
        const newName = prompt("请输入新名称", item.name)
        if (newName) {
          // 交给background处理
          chrome.runtime.sendMessage(
            {
              action: "renameLocalItem",
              data: {
                item,
                newName,
              },
            },
            function (response) {
              console.log("renameed", response)
              item.name = newName // 更新新名称
            }
          )
        }
      },
      publishLocalItem(event, item) {
        console.log(event, item)
        const ans = confirm(
          "上线申请审核通过后自动上线展示，是否确认提交申请？"
        )
        if (ans) {
          // 交给background处理
          chrome.runtime.sendMessage(
            {
              action: "publishLocalItem",
              data: {
                item,
              },
            },
            function (response) {
              console.log("published", response)
              alert("已提交。")
            }
          )
        }
      },
      highLightDom(pageItem, checked) {
        const _this = this
        chrome.tabs.sendMessage(
          _this.currentTab.id,
          {
            style: {
              doms: [
                {
                  name: pageItem.insideId,
                  css: "border: 2px gray solid;box-sizing: border-box",
                  selector: pageItem.selector,
                },
              ],
              name: "高亮",
              checked,
            },
            host: new URL(_this.page.url).host,
          },
          function (response) {
            // window.close();
            console.log(response)
          }
        )
      },
      setItems(items) {
        const currentHost = new URL(this.currentTab.url).host
        const sortitems = items.map((item) => {
          item.isFitCurrentTab = currentHost.endsWith(item.host)
          item.isShowDetail = item.isFitCurrentTab
          return item
        })

        sortitems.sort(function (a, b) {
          return a.isFitCurrentTab && !b.isFitCurrentTab ? -1 : 0
        })

        this.items = sortitems
        console.log(this.items)
      },
      startRead() {
        const _this = this
        chrome.tabs.sendMessage(
          _this.currentTab.id,
          {
            action: "readPageItem",
          },
          function (response) {
            // window.close();
            console.log(response)
          }
        )
      },
    },
  })

  vue.$mount("#app")
})
