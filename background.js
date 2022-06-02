const initItems = [{
    name: '数据中台',
    hiddenDoms: [{
        name: '菜单栏',
        selector: '#app > div.main.theme-telBlue > div.main-sider.menu-scrollbar',
        checked: true
    }, {
        name: '顶栏',
        selector: '#app > div.main.theme-telBlue > div.main-header',
        checked: true
    }]
}, {
    name: 'dolphin',
    hiddenDoms: [{
        name: '菜单栏',
        selector: 'body > div.main-layout-model > div.m-bottom > div > div.secondary-menu-model',
        checked: true
    }, {
        name: '顶栏',
        selector: 'body > div.main-layout-model > div.m-top',
        checked: true
    }]
}, {
    name: 'douban',
    hiddenDoms: [{
        name: '菜单栏',
        selector: '#db-global-nav',
        checked: true
    }, {
        name: 'logo栏',
        selector: '#db-nav-sns',
        checked: true
    }, {
        name: '图片',
        selector: 'img',
        checked: true
    }, {
        name: '右下角广告',
        selector: '#dale_explore_home_middle_right',
        checked: true
    }, {
        name: 'h1大标题',
        selector: 'h1',
        checked: true
    }, {
        name: '小组导航栏',
        selector: '#db-nav-group',
        checked: false
    }]
}]

// // 打开新的tab页
// chrome.tabs.onCreated.addListener((tab) => {
//     dispacheTab(tab.id)
// });

// 切换tab页
chrome.tabs.onActivated.addListener(
    activeInfo => {
        dispacheTab(activeInfo.tabId)
    }
)

function dispacheTab(tabId) {
    loadItems().then(function (items) {
        // merge 用户设置
        items.forEach(item => {
            item.hiddenDoms.forEach(hiddenDom => {
                chrome.tabs.sendMessage(
                    tabId, {
                        hiddenDom
                    }
                );
            })
        })
    })
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('background 收到消息', request);
        // 切换
        if (request.action == 'switchHiddenDom') {
            const {
                item,
                hiddenDom
            } = request.data
            // 本地存储用户设置
            chrome.storage.sync.set({
                [`items-${item.name}-hiddenDom-${hiddenDom.name}-checked`]: hiddenDom.checked
            })
            // 使设置作用到页面
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                console.log('background 查询到tabs', tabs);
                chrome.tabs.sendMessage(
                    tabs[0].id, request.data,
                    function (response) {
                        // window.close();
                        console.log(response);
                    }
                );
            });
        } else if (request.action == 'loadItems') {
            loadItems().then(function (items) {
                sendResponse(JSON.stringify(items))
            })
            // 保持通道开放
            return true
        }
    }
);

async function loadItems() {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.get(null, function (result) {
            console.log('background 查询缓存', result);
            const items = JSON.parse(JSON.stringify(initItems))
            // merge 用户设置
            items.forEach(item => {
                item.hiddenDoms.forEach(hiddenDom => {
                    const value = result[`items-${item.name}-hiddenDom-${hiddenDom.name}-checked`]
                    hiddenDom.checked = value === undefined ? hiddenDom.checked : value
                })
            })
            resolve(items)
        })
    })
}