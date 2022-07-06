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
                url: '',
                id: 0
            },
            clipPageItems: []
        },
        computed: {},
        render: function (h) {
            const _this = this;
            console.log(_this.items);
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
                    const itemHeader = [
                        h('button', {
                            attrs: {
                                type: 'button'
                            },
                            class: 'flex-none',
                            on: {
                                click() {
                                    _this.$set(item, 'isShowDetail', !item.isShowDetail)
                                }
                            }
                        }, [h('img', {
                            attrs: {
                                src: `./imgs/${item.isShowDetail ? 'arrow-down-s-fill' : 'arrow-right-s-fill'}.png`,
                                style: 'width: 15px;height:15px;'
                            }
                        })]),
                        h('div', {
                            class: 'text-base truncate',
                        }, [item.name])
                    ]
                    if (item.isFitCurrentTab) {
                        itemHeader.push(h('div', {
                            class: 'mx-1 flex-none'
                        }, [h('img', {
                            attrs: {
                                src: "./imgs/logo.png",
                                style: 'width: 20px;height:20px;'
                            }
                        })]))
                    }
                    // 只有本地的才可以删除和重命名
                    if (item.type == 'local') {
                        itemHeader.push(h('div', {
                            class: 'flex-auto text-right actions',
                            style: 'min-width: 50px;'
                        }, [
                            h('button', {
                                class: 'mr-1',
                                on: {
                                    click(event) {
                                        _this.deleteLocalItem(event, item);
                                    }
                                }
                            }, [h('img', {
                                attrs: {
                                    src: './imgs/delete-bin-7-line.png',
                                    style: 'width: 15px;height:15px;'
                                }
                            })]),
                            h('button', {
                                on: {
                                    click(event) {
                                        _this.renameLocalItem(event, item);
                                    }
                                }
                            }, [h('img', {
                                attrs: {
                                    src: './imgs/edit-line.png',
                                    style: 'width: 15px;height:15px;'
                                }
                            })])
                        ]))
                    }
                    return h('div', {
                        class: 'item p-2 border-t hover:bg-gray-50'
                    }, [
                        h('div', {
                                attrs: {
                                    class: 'item mb-1'
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
                            style: {
                                'display': item.isShowDetail ? 'initial' : 'none'
                            },
                            attrs: {
                                class: 'hidden-doms'
                            }
                        }, (item.hiddenDoms || []).map(hiddenDom => {
                            const hiddenDomChildren = [
                                h('div', {
                                    class: 'truncate mr-1'
                                }, [
                                    h('input', {
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
                                    }, []),
                                    h('label', {
                                        attrs: {
                                            for: item._id + hiddenDom.name
                                        }
                                    }, [hiddenDom.name])
                                ])

                            ]
                            // 只有本地的才可以删除和重命名
                            if (item.type == 'local') {
                                hiddenDomChildren.push(h('div', {
                                    class: 'flex-none'
                                }, [
                                    h('button', {
                                        class: 'mr-1',
                                        on: {
                                            click(event) {
                                                _this.deleteLocalHiddenDom(event, hiddenDom, item);
                                            }
                                        }
                                    }, [h('img', {
                                        attrs: {
                                            src: './imgs/delete-bin-7-line.png',
                                            style: 'width: 15px;height:15px;'
                                        }
                                    })]),
                                    ' ',
                                    h('button', {
                                        on: {
                                            click(event) {
                                                _this.renameLocalHiddenDom(event, hiddenDom, item);
                                            }
                                        }
                                    }, [h('img', {
                                        attrs: {
                                            src: './imgs/edit-line.png',
                                            style: 'width: 15px;height:15px;'
                                        }
                                    })])
                                ]))
                            }
                            return h('div', {
                                attrs: {
                                    class: 'hidden-dom flex items-center hover:bg-gray-200 justify-between'
                                }
                            }, hiddenDomChildren)
                        })),
                        h('div', {
                            style: {
                                'display': item.isShowDetail ? 'initial' : 'none'
                            },
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
                            pageItem.unshift(h('img', {
                                attrs: {
                                    src: `./imgs/${!_this.clipPageItems.includes(item.insideId) ? 'arrow-down-s-fill' : 'arrow-right-s-fill'}.png`,
                                    style: 'width: 15px;height:15px;'
                                },
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
                            }))
                        } else {
                            pageItem.unshift(h('div', {
                                style: 'width: 15px;height:15px;'
                            }))
                        }
                        return h('div', {
                            class: 'page-item hover:bg-gray-100 flex items-center',
                            style: `padding-left: ${item.depth*10}px;`,
                            on: {
                                mouseenter(event) {
                                    console.log('mouseenter', event, item);
                                    _this.highLightDom(item, true)
                                },
                                mouseleave(event) {
                                    console.log('mouseleave', event, item);
                                    _this.highLightDom(item, false)
                                }
                            }
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
                        }, ['变色龙']),
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
                _this.currentTab.id = tabs[0].id
            })
            chrome.runtime.sendMessage({
                action: 'loadItems',
            }, function (response) {
                console.log(response, chrome.runtime.lastError);
                _this.setItems(JSON.parse(response))
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
                    _this.setItems(JSON.parse(response))
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
            },
            deleteLocalHiddenDom(event, hiddenDom, item) {
                console.log(event, hiddenDom, item);
                const _this = this
                if (confirm('确认删除吗')) {
                    // 交给background处理
                    chrome.runtime.sendMessage({
                        action: 'deleteLocalHiddenDom',
                        data: {
                            hiddenDom,
                            item
                        }
                    }, function (response) {
                        console.log('deleted', response);
                        _this.refresh()
                    });
                }
            },
            renameLocalHiddenDom(event, hiddenDom, item) {
                console.log(event, hiddenDom, item);
                const _this = this
                const newName = prompt('请输入新名称', hiddenDom.name)
                if (newName) {
                    // 交给background处理
                    chrome.runtime.sendMessage({
                        action: 'renameLocalHiddenDom',
                        data: {
                            hiddenDom,
                            item,
                            newName
                        }
                    }, function (response) {
                        console.log('renamed', response);
                        _this.refresh()
                    });
                }
            },
            deleteLocalItem(event, item) {
                console.log(event, item);
                const _this = this
                if (confirm('确认删除吗')) {
                    // 交给background处理
                    chrome.runtime.sendMessage({
                        action: 'deleteLocalItem',
                        data: {
                            item
                        }
                    }, function (response) {
                        console.log('deleted', response);
                        _this.refresh()
                    });
                }
            },
            renameLocalItem(event, item) {
                console.log(event, item);
                const _this = this
                const newName = prompt('请输入新名称', item.name)
                if (newName) {
                    // 交给background处理
                    chrome.runtime.sendMessage({
                        action: 'renameLocalItem',
                        data: {
                            item,
                            newName
                        }
                    }, function (response) {
                        console.log('renameed', response);
                        _this.refresh()
                    });
                }
            },
            highLightDom(pageItem, checked) {
                const _this = this;
                chrome.tabs.sendMessage(
                    _this.currentTab.id, {
                        style: {
                            doms: [{
                                name: pageItem.insideId,
                                css: 'border: 2px gray solid;box-sizing: border-box',
                                selector: pageItem.selector,
                            }],
                            name: '高亮',
                            checked
                        },
                        host: new URL(_this.page.url).host,
                    },
                    function (response) {
                        // window.close();
                        console.log(response);
                    }
                );
            },
            setItems(items) {
                const currentHost = new URL(this.currentTab.url).host
                this.items = items.map(item => {
                    item.isFitCurrentTab = currentHost.endsWith(item.host)
                    item.isShowDetail = item.isFitCurrentTab
                    return item
                })
                console.log(this.items);
            }
        }
    });

    vue.$mount('#app')

});