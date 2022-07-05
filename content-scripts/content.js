console.log('i am chameleon.');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
    if (request.action == 'loadDocument') {
        const list = [{
            type: 'div',
            selector: 'body',
            insideId: 'e0'
        }]
        workOnEle($, $("body"), list, "body");
        sendResponse({
            list: list,
            title: $("title").text().trim(),
            url: location.href
        });
    }
    if (request.hiddenDom) {
        handleHiddenDom(request.hiddenDom, request.host)
    }
    if (request.style) {
        handleStyle(request.style, request.host)
    }
});

// 直接渲染
chrome.runtime.sendMessage({
    action: 'switchAll',
});

function handleHiddenDom(hiddenDom, host) {
    if (location.host.endsWith(host)) {
        console.log(host, hiddenDom);
        const styleId = 'chameleon1-' + hiddenDom.name
        // 移除
        if (!hiddenDom.checked) {
            return $('#' + styleId).remove();
        }
        // 或添加
        const style = `<style id="${styleId}">
            ${hiddenDom.selector}{
                display: none
            }
        </style>`
        $('head').append(style)
    }
}

function handleStyle(style, host) {
    if (location.host.endsWith(host)) {
        console.log(host, style);
        const styleId = 'chameleon2-' + style.name
        // 移除
        if (!style.checked) {
            return $('#' + styleId).remove();
        }
        // 或添加
        const styleContent = style.doms.map(dom => {
            return `${dom.selector}{
                ${dom.css}
            }`
        }).join('\n')
        const styleTag = `<style id="${styleId}">
                ${styleContent}
        </style>`
        $('head').append(styleTag)
    }
}

// 解析并递归子节点，输出图文
function workOnEle($, ele, list, seletor, ref) {
    // 最后一个是父元素
    const parent = list[list.length - 1];
    // console.log(ele)
    const current = $(ele);
    if (["script", "style"].includes(ele.tagName)) {
        return;
    }
    if (["img", "video"].includes(ele.tagName)) {
        // console.log(current)
        const src = current.attr("src") || current.attr("data-src");
        if (src) {
            list.push({
                type: ele.tagName,
                content: src,
                selector: seletor,
                insideId: parent.insideId + '-e1',
            });
        }
        return;
    }
    if (ele.tagName == "a") {
        // console.log(current)
        ref = current.attr("href");
    }
    let tagIndex = 0
    current.contents().each((index, child) => {
        // console.log(child)
        switch (child.nodeType) {
            case 1:
                tagIndex++
                const childSeletor = seletor + '>' + child.tagName + ':nth-child(' + tagIndex + ')'
                // 开始递归标签
                const startDiv = {
                    type: 'div',
                    selector: childSeletor,
                    insideId: parent.insideId + '-ea' + index
                }
                const startDivIndex = list.length
                list.push(startDiv)
                workOnEle($, child, list, childSeletor, ref)
                // 如果没有递归到子元素，移除开始递归标签
                if (list[list.length - 1] == startDiv) {
                    list.splice(list.length - 1, 1)
                } else if (list[startDivIndex + 1] == list[list.length - 1] || list[startDivIndex + 1].type == 'div' && list[startDivIndex + 1].selector == list[list.length - 1].selector) {
                    // 子元素就一个，还是个开始递归标签，那么移除此开始递归标签
                    list.splice(startDivIndex, 1)
                } else {
                    // 结束递归标签
                    list.push({
                        type: '/div',
                        selector: childSeletor,
                        insideId: parent.insideId + '-eb' + index
                    })
                }
                break;
            case 3:
                const text = child.data.trim()
                if (text) {
                    list.push({
                        type: 'text',
                        content: text,
                        selector: seletor,
                        ref: ref,
                        insideId: parent.insideId + '-e' + index
                    })
                }
                break;
        }
    })
};