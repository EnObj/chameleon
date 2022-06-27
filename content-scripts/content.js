console.log('i am chameleon.');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
    if (request.action == 'loadDocument') {
        const list = []
        workOnEle($, $("body"), list, "body");
        sendResponse({
            list: list,
            title: $("title").text().trim(),
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
const workOnEle = function ($, ele, list, seletor, ref) {
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
                insideId: "e" + (list.length + 1),
            });
        }
        return;
    }
    if (ele.tagName == "a") {
        // console.log(current)
        ref = current.attr("href");
    }
    const count = list.length;
    current.children().each((index, child) => {
        // console.log(child)
        if (child.children.length > 0) {
            workOnEle(
                $,
                child,
                list,
                seletor + ">" + child.tagName + ":nth-child(" + (index + 1) + ")",
                ref
            );
        } else {
            if (child.innerText.trim()) {
                list.push({
                    type: "text",
                    content: child.innerText.trim(),
                    selector: seletor,
                    ref: ref,
                    insideId: "e" + (list.length + 1),
                });
            }
        }
    });
    if (list.length == count && ele.innerText.trim()) {
        list.push({
            type: "text",
            content: ele.innerText.trim(),
            selector: seletor,
            ref: ref,
            insideId: "e" + (list.length + 1),
        });
    }
};