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
                        hiddenDom,
                        host: item.host
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
        if (request.action == 'switchStyle') {
            const {
                item,
                style
            } = request.data
            // 本地存储用户设置
            chrome.storage.sync.set({
                [`items-${item.name}-style-${style.name}-checked`]: style.checked
            })
            // 使设置作用到页面
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                console.log('background 查询到tabs', tabs);
                chrome.tabs.sendMessage(
                    tabs[0].id, {
                        style,
                        host: item.host
                    },
                    function (response) {
                        // window.close();
                        console.log(response);
                    }
                );
            });
        } else if (request.action == 'switchHiddenDom') {
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
                    tabs[0].id, {
                        hiddenDom,
                        host: item.host
                    },
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
        } else if (request.action == 'loadItemsFromDb') {
            loadItemsFromDb(items => {
                sendResponse(JSON.stringify(items))
            })
            // 保持通道开放
            return true
        } else if (request.action == 'switchAll') {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                console.log('background 查询到tabs', tabs);
                dispacheTab(tabs[0].id)
            });
        }
    }
);

function loadItems() {
    return new Promise(function (resolve) {
        chrome.storage.sync.get(null, async function (result) {
            const initItems = await loadItemsWithCache();
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

function loadItemsWithCache() {
    return new Promise(function (resolve) {
        chrome.storage.session.get(['chameleon_website'], function (result) {
            if (result.chameleon_website) {
                resolve(result.chameleon_website)
            } else {
                loadItemsFromDb(resolve)
            }
        })
    })
}

function loadItemsFromDb(resolve) {
    fetch('https://service-o4amteg7-1252108641.sh.apigw.tencentcs.com/release/tcb-dba', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'query-chameleon'
        })
    }).then(res => res.json()).then(data => {
        chrome.storage.session.set({
            'chameleon_website': data
        }, function () {
            resolve(data)
        })
    })
}