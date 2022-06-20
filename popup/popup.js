document.addEventListener('DOMContentLoaded', function () {
    const vue = new Vue({
        data: {
            items: [],
            refreshItems: false
        },
        computed: {},
        render: function (h) {
            const _this = this;
            return h(
                'div', {
                    attrs: {
                        class: 'w-60 h-80 pb-1 body'
                    }
                },
                [
                    h('div', {
                        attrs: {
                            class: 'flex items-center justify-between p-2 overflow-hidden'
                        }
                    }, [
                        h('div', {
                            attrs: {
                                class: 'bg-green-50'
                            }
                        }, ['chameleon']),
                        h('button', {
                            attrs: {
                                class: 'bg-gray-200 px-2 py-1'
                            },
                            on: {
                                click: () => {
                                    _this.refreshItems = true
                                    _this.items = []
                                    chrome.runtime.sendMessage({
                                        action: 'loadItemsFromDb',
                                    }, function (response) {
                                        console.log(response, chrome.runtime.lastError);
                                        _this.items = JSON.parse(response)
                                        _this.refreshItems = false
                                    });
                                }
                            }
                        }, ['刷新' + (_this.refreshItems ? '...' : '')])
                    ]),
                    h('div', {
                        attrs: {
                            class: 'items'
                        }
                    }, _this.items.map(item => {
                        return h('div', {
                            attrs: {
                                class: 'item p-2 border-t'
                            }
                        }, [h('div', {
                            attrs: {
                                class: 'item text-base mb-1'
                            }
                        }, item.name), h('div', {
                            attrs: {
                                class: 'hidden-doms'
                            }
                        }, item.hiddenDoms.map(hiddenDom => {
                            return h('div', {
                                attrs: {
                                    class: 'hidden-dom flex items-center'
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
                        }))])
                    }))
                ]
            )
        },
        watch: {},
        created() {
            // 加载用户设置
            const _this = this;
            chrome.runtime.sendMessage({
                action: 'loadItems',
            }, function (response) {
                console.log(response, chrome.runtime.lastError);
                _this.items = JSON.parse(response)
            });
        },
        methods: {
            switchHiddenDom(event, hiddenDom, item) {
                console.log(event, hiddenDom, item);
                // 交给background处理
                chrome.runtime.sendMessage({
                    action: 'switchHiddenDom',
                    data: {
                        hiddenDom,
                        item
                    }
                }, function (response) {
                    console.log(response.farewell);
                });
            }
        }
    });

    vue.$mount('#app')

});