console.log('i am chameleon.');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
    handleHiddenDom(request.hiddenDom, request.host)
});

// 直接渲染
chrome.runtime.sendMessage({
    action: 'loadItems',
}, function (response) {
    const items = JSON.parse(response);
    console.log('chameleon 初始化', items);
    items.forEach(item => {
        // 只处理能匹配host的
        item.hiddenDoms.forEach(hiddenDom => {
            handleHiddenDom(hiddenDom, item.host)
        })
    })
});

function handleHiddenDom(hiddenDom, host) {
    if (location.host.endsWith(host)) {
        if (hiddenDom.checked) {
            $(hiddenDom.selector).show()
        } else {
            $(hiddenDom.selector).hide()
        }
    }
}