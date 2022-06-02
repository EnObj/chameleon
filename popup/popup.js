document.addEventListener('DOMContentLoaded', function () {
    const vue = new Vue({
        data: {
            items: []
        },
        computed: {},
        render: function (h) {
            const _this = this;
            return h(
                'div', {
                    attrs: {
                        class: 'w-40 h-80 pb-1 body'
                    }
                },
                [h('div', {
                    attrs: {
                        class: 'items'
                    }
                }, _this.items.map(item => {
                    return h('div', {
                        attrs: {
                            class: 'item p-2'
                        }
                    }, [h('div', {}, item.name), h('div', {
                        attrs: {
                            class: 'hidden-doms'
                        }
                    }, item.hiddenDoms.map(hiddenDom => {
                        return h('div', {
                            attrs: {
                                class: 'hidden-dom'
                            }
                        }, [h('input', {
                            attrs: {
                                class: 'hidden-dom-checkbox',
                                type: 'checkbox',
                                checked: hiddenDom.checked
                            },
                            on: {
                                change(event) {
                                    hiddenDom.checked = !!event.target.checked
                                    _this.switchHiddenDom(event, hiddenDom, item)
                                }
                            }
                        }, []), hiddenDom.name])
                    }))])
                }))]
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