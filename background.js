// // 打开新的tab页
// chrome.tabs.onCreated.addListener((tab) => {
//     dispacheTab(tab.id)
// });

// 切换tab页
// chrome.tabs.onActivated.addListener(
//     activeInfo => {
//         dispacheTab(activeInfo.tabId)
//     }
// )

function dispacheTab(tabId) {
    loadItems().then(function (items) {
        items.forEach(item => {
            item.hiddenDoms.forEach(hiddenDom => {
                chrome.tabs.sendMessage(
                    tabId, {
                        hiddenDom,
                        host: item.host
                    }
                );
            })
            item.styles.forEach(style => {
                chrome.tabs.sendMessage(
                    tabId, {
                        style,
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
            // 保存本地item
            if (item.type == 'local') {
                saveLocalItemHiddenDom(item, hiddenDom);
            }
        } else if (request.action == 'loadItems') {
            loadItems().then(function (items) {
                sendResponse(JSON.stringify(items))
            })
            // 保持通道开放
            return true
        } else if (request.action == 'reloadItems') {
            // 加载数据库中的
            loadItems(true).then(function (items) {
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
        } else if (request.action == 'createLocalItem') {
            createLocalItem(request.localItem)
        } else if (request.action == 'deleteLocalHiddenDom') {
            const {
                item,
                hiddenDom
            } = request.data
            deleteLocalHiddenDom(hiddenDom, item).then(sendResponse)
            return true
        } else if (request.action == 'renameLocalHiddenDom') {
            const {
                item,
                hiddenDom,
                newName,
            } = request.data
            renameLocalHiddenDom(hiddenDom, item, newName).then(sendResponse)
        } else if (request.action == 'deleteLocalItem') {
            const {
                item,
            } = request.data
            deleteLocalItem(item).then(sendResponse)
            return true
        } else if (request.action == 'renameLocalItem') {
            const {
                item,
                newName,
            } = request.data
            renameLocalItem(item, newName).then(sendResponse)
        }
    }
);

function loadItems(fromDb) {
    return new Promise(function (resolve) {
        chrome.storage.sync.get(null, async function (result) {
            let initItems = [];
            if (fromDb) {
                initItems = await loadItemsFromDb();
            } else {
                initItems = await loadItemsWithCache();
            }
            const localItems = await loadLocalItem()
            // 标识一下是本地的
            localItems.forEach(item => {
                item.type = 'local'
            })
            console.log(initItems, localItems);
            const items = initItems.concat(localItems)
            // merge 用户设置
            items.forEach(item => {
                item.hiddenDoms = item.hiddenDoms || []
                item.hiddenDoms.forEach(hiddenDom => {
                    const value = result[`items-${item.name}-hiddenDom-${hiddenDom.name}-checked`]
                    hiddenDom.checked = value === undefined ? hiddenDom.checked : value
                });
                item.styles = item.styles || []
                item.styles.forEach(style => {
                    const value = result[`items-${item.name}-style-${style.name}-checked`]
                    style.checked = value === undefined ? style.checked : value
                });
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
                loadItemsFromDb().then(resolve)
            }
        })
    })
}

function loadItemsFromDb() {
    return new Promise(function (resolve) {
        fetch('https://service-o4amteg7-1252108641.sh.apigw.tencentcs.com/release/tcb-dba', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'query-chameleon'
            })
        }).then(res => res.json()).then(data => {
            // 缓存到session
            chrome.storage.session.set({
                'chameleon_website': data
            }, function () {
                resolve(data)
            })
        })
    })
}

function loadLocalItem() {
    return new Promise(function (resolve) {
        chrome.storage.local.get(['chameleon_website_local'], function (result) {
            resolve(result.chameleon_website_local || [])
        })
    })
}

function createLocalItem(localItem) {
    let localItems = []
    chrome.storage.local.get(['chameleon_website_local'], function (result) {
        if (result.chameleon_website_local) {
            localItems = result.chameleon_website_local
        }
        // 不存在
        if (!localItems.find(item => item.id == localItem.id)) {
            localItems.push(localItem)
            // 更新存储
            chrome.storage.local.set({
                'chameleon_website_local': localItems
            })
        }
    })
}

function deleteLocalItem(localItem) {
    return new Promise(function (resolve) {
        chrome.storage.local.get(['chameleon_website_local'], function (result) {
            const localItems = result.chameleon_website_local

            localItems.splice(localItems.findIndex(item => item.id == localItem.id), 1);
            // 更新存储
            chrome.storage.local.set({
                'chameleon_website_local': localItems
            }, resolve)
        })
    })
}

function renameLocalItem(localItem, newName) {
    return new Promise(function (resolve) {
        chrome.storage.local.get(['chameleon_website_local'], function (result) {
            const localItems = result.chameleon_website_local

            localItem = localItems.find(item => item.id == localItem.id);
            localItem.name = newName

            // 更新存储
            chrome.storage.local.set({
                'chameleon_website_local': localItems
            }, resolve)

        })
    })
}

function saveLocalItemHiddenDom(localItem, hiddenDom) {
    chrome.storage.local.get(['chameleon_website_local'], function (result) {
        const localItems = result.chameleon_website_local

        localItem = localItems.find(item => item.id == localItem.id);
        const hiddenDoms = localItem.hiddenDoms || []

        // 不存在
        if (!hiddenDoms.find(item => item.name == hiddenDom.name)) {
            hiddenDoms.push(hiddenDom)
            localItem.hiddenDoms = hiddenDoms
            console.log(localItems);
            // 更新存储
            chrome.storage.local.set({
                'chameleon_website_local': localItems
            })
        }
    })
}

function deleteLocalHiddenDom(hiddenDom, localItem) {
    return new Promise(function (resolve) {
        chrome.storage.local.get(['chameleon_website_local'], function (result) {
            const localItems = result.chameleon_website_local

            localItem = localItems.find(item => item.id == localItem.id);
            const hiddenDoms = localItem.hiddenDoms || []

            hiddenDoms.splice(hiddenDoms.findIndex(item => item.name == hiddenDom.name), 1)
            // 更新存储
            chrome.storage.local.set({
                'chameleon_website_local': localItems
            }, resolve)
        })
    })
}

function renameLocalHiddenDom(hiddenDom, localItem, newName) {
    return new Promise(function (resolve) {
        chrome.storage.local.get(['chameleon_website_local'], function (result) {
            const localItems = result.chameleon_website_local

            localItem = localItems.find(item => item.id == localItem.id);
            const hiddenDoms = localItem.hiddenDoms || []

            const targetHidddenDom = hiddenDoms.find(item => item.name == hiddenDom.name);
            targetHidddenDom.name = newName

            // 更新存储
            chrome.storage.local.set({
                'chameleon_website_local': localItems
            }, resolve)

        })
    })
}