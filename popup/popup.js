document.addEventListener('DOMContentLoaded', function () {
    const vue = new Vue({
        data: {
            items: [],
            refreshItems: false,
            currentNav: 'mine',
            page: {
                list: [],
                title: '',
                url: ''
            },
            currentTab: {
                url: ''
            },
            clipPageItems: []
        },
        computed: {},
        render: function (h) {
            const _this = this;
            const contentMine = h('div', {
                class: 'content-mine h-full'
            }, [
                h('div', {
                    class: 'flex items-center justify-between p-2 overflow-hidden'
                }, [
                    h('div', {
                        class: 'bg-green-50'
                    }, ['chameleon']),
                    h('button', {
                        attrs: {
                            class: 'bg-gray-200 px-2 py-1'
                        },
                        on: {
                            click: _this.refresh
                        }
                    }, ['刷新' + (_this.refreshItems ? '...' : '')])
                ]),
                h('div', {
                    attrs: {
                        class: 'items overflow-auto',
                        style: 'height: calc(100% - 42px);'
                    }
                }, _this.items.map(item => {
                    const isFit = new URL(_this.currentTab.url).host.endsWith(item.host)
                    const itemHeader = [
                        item.name,
                    ]
                    if (isFit) {
                        itemHeader.unshift(h('img', {
                            attrs: {
                                src: "./imgs/logo.png",
                                class: 'block mr-1',
                                style: 'block; width: 20px;height:20px;'
                            }
                        }))
                    }
                    return h('div', {
                        class: 'item p-2 border-t hover:bg-gray-50'
                    }, [
                        h('div', {
                                attrs: {
                                    class: 'item text-base mb-1'
                                }
                            },
                            [
                                h('div', {
                                    class: 'flex items-center'
                                }, itemHeader),
                                h('div', {
                                    attrs: {
                                        class: 'text-gray-500 text-sm'
                                    }
                                }, [item.host])
                            ]
                        ),
                        h('div', {
                            attrs: {
                                class: 'hidden-doms'
                            }
                        }, (item.hiddenDoms || []).map(hiddenDom => {
                            return h('div', {
                                attrs: {
                                    class: 'hidden-dom flex items-center hover:bg-gray-200'
                                }
                            }, [h('input', {
                                attrs: {
                                    class: 'hidden-dom-checkbox mr-1',
                                    type: 'checkbox',
                                    checked: hiddenDom.checked,
                                    id: item._id + hiddenDom.name
                                },
                                on: {
                                    change(event) {
                                        hiddenDom.checked = !!event.target.checked
                                        _this.switchHiddenDom(event, hiddenDom, item)
                                    }
                                }
                            }, []), h('label', {
                                attrs: {
                                    for: item._id + hiddenDom.name
                                }
                            }, [hiddenDom.name])])
                        })),
                        h('div', {
                            attrs: {
                                class: 'styles'
                            }
                        }, (item.styles || []).map(style => {
                            return h('div', {
                                attrs: {
                                    class: 'style flex items-center bg-green-50'
                                }
                            }, [h('input', {
                                attrs: {
                                    class: 'style-checkbox mr-1',
                                    type: 'checkbox',
                                    checked: style.checked,
                                    id: item._id + style.name
                                },
                                on: {
                                    change(event) {
                                        style.checked = !!event.target.checked
                                        _this.switchStyle(event, style, item)
                                    }
                                }
                            }, []), h('label', {
                                attrs: {
                                    for: item._id + style.name
                                }
                            }, [style.name])])
                        }))
                    ])
                }))
            ])
            const contentCreate = h('div', {
                class: 'content-create h-full overflow-auto p-2'
            }, [
                h('div', {
                    class: 'page'
                }, [
                    _this.page.title,
                    h('div', {
                        class: 'page-items'
                    }, _this.page.list.filter(item => {
                        // 关闭标签不显示
                        if (item.type == '/div') {
                            return false
                        }
                        // 手动隐藏的容器子元素不显示
                        return _this.clipPageItems.every(clipPageItem => {
                            return clipPageItem == item.insideId || !item.insideId.startsWith(clipPageItem)
                        })
                    }).map(item => {
                        const pageItem = [h('input', {
                            attrs: {
                                class: 'hidden-dom-checkbox mr-1',
                                type: 'checkbox',
                                checked: false,
                                id: item.insideId
                            },
                            on: {
                                change(event) {
                                    _this.switchHiddenDom(event, {
                                        checked: !!event.target.checked,
                                        selector: item.selector,
                                        name: item.insideId
                                    }, {
                                        id: _this.page.url,
                                        host: new URL(_this.page.url).host,
                                        name: _this.page.title,
                                        type: 'local'
                                    })
                                }
                            }
                        }, []), h('label', {
                            attrs: {
                                for: item.insideId
                            }
                        }, [item.content])]
                        if (item.type == 'div') {
                            pageItem.push(h('span', {
                                on: {
                                    click() {
                                        // 隐藏此元素的子元素
                                        if (_this.clipPageItems.includes(item.insideId)) {
                                            _this.clipPageItems.splice(_this.clipPageItems.indexOf(item.insideId), 1)
                                        } else {
                                            _this.clipPageItems.push(item.insideId)
                                        }
                                    }
                                }
                            }, '点我折叠'))
                        }
                        return h('div', {
                            class: 'page-item hover:bg-gray-100',
                            style: `padding-left: ${item.depth*10}px;`
                        }, pageItem)
                    }))
                ])
            ]);

            return h(
                'div', {
                    class: 'w-80 h-96 body flex items-stretch overflow-hidden'
                },
                [
                    h('div', {
                        class: "navs bg-gray-300 p-2 flex-none text-center"
                    }, [
                        h('div', {
                            class: "nav nav-mine cursor-pointer p-2 hover:text-gray-700",
                            on: {
                                click() {
                                    _this.currentNav = 'mine';
                                }
                            }
                        }, ['我的']),
                        h('div', {
                            class: "nav nav-create cursor-pointer p-2 hover:text-gray-700",
                            on: {
                                click() {
                                    _this.currentNav = 'create'
                                }
                            }
                        }, ['DIY'])
                    ]),
                    h('div', {
                        class: 'flex-auto h-full overflow-hidden'
                    }, [_this.currentNav == 'mine' ? contentMine : contentCreate])
                ]
            )
        },
        watch: {
            currentNav(val) {
                if (val == 'mine') {
                    this.refresh()
                } else if (val == 'create') {
                    this.loadDom()
                }
            }
        },
        created() {
            // 加载用户设置
            const _this = this;
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                _this.currentTab.url = tabs[0].url
            })
            chrome.runtime.sendMessage({
                action: 'loadItems',
            }, function (response) {
                console.log(response, chrome.runtime.lastError);
                _this.items = JSON.parse(response)
            });
        },
        methods: {
            loadDom() {
                const _this = this
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.sendMessage(
                        tabs[0].id, {
                            action: 'loadDocument'
                        },
                        function (response) {
                            console.log(response);
                            let depth = 0
                            response.list.forEach((item, index) => {
                                item.depth = depth
                                if (item.type == 'div') {
                                    depth++
                                } else if (item.type == '/div') {
                                    depth--
                                }
                            })
                            _this.page = response;
                            chrome.runtime.sendMessage({
                                action: 'createLocalItem',
                                localItem: {
                                    id: _this.page.url,
                                    host: new URL(_this.page.url).host,
                                    name: _this.page.title
                                }
                            });
                        }
                    );
                });
            },
            refresh() {
                this.refreshItems = true
                this.items = []
                const _this = this
                chrome.runtime.sendMessage({
                    action: 'reloadItems',
                }, function (response) {
                    console.log(response, chrome.runtime.lastError);
                    _this.items = JSON.parse(response)
                    _this.refreshItems = false
                });
            },
            switchHiddenDom(event, hiddenDom, item) {
                console.log(event, hiddenDom, item);
                // 交给background处理
                chrome.runtime.sendMessage({
                    action: 'switchHiddenDom',
                    data: {
                        hiddenDom,
                        item
                    }
                });
            },
            switchStyle(event, style, item) {
                console.log(event, style, item);
                // 交给background处理
                chrome.runtime.sendMessage({
                    action: 'switchStyle',
                    data: {
                        style,
                        item
                    }
                });
            }
        }
    });

    vue.$mount('#app')

});