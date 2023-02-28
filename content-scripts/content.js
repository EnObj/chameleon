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
    if (request.action == 'readPageItem') {
        chameleonReader.init()
    }
    if (request.hiddenDom) {
        handleHiddenDom(request.hiddenDom, request.host)
    }
    if (request.style) {
        handleStyle(request.style, request.host)
    }
    if (request.action == 'switchCountdown'){
        if(p5Canvas.style('display') == 'none'){
            p5Canvas.style('display', 'block')
        }else{
            p5Canvas.style('display', 'none')
        }
        console.log(p5Canvas.style('display'));
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
                // const startDivIndex = list.length
                list.push(startDiv)
                workOnEle($, child, list, childSeletor, ref)
                // // 如果没有递归到子元素，移除开始递归标签
                // if (list[list.length - 1] == startDiv) {
                //     list.splice(list.length - 1, 1)
                // } else if (list[startDivIndex + 1] == list[list.length - 1] || list[startDivIndex + 1].type == 'div' && list[startDivIndex + 1].selector == list[list.length - 1].selector) {
                //     // 子元素就一个，还是个开始递归标签，那么移除此开始递归标签
                //     list.splice(startDivIndex, 1)
                // } else {
                // }
                // 结束递归标签
                list.push({
                    type: '/div',
                    selector: childSeletor,
                    insideId: parent.insideId + '-eb' + index
                })
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

var chameleonReader = {
    page: null,
    init() {
        const list = [{
            type: 'div',
            selector: 'body',
            insideId: 'e0'
        }]
        workOnEle($, $("body"), list, "body");
        this.page = {
            list: list,
            title: $("title").text().trim(),
            url: location.href
        }
        $('body').append(`
            <div style="z-index:10000;position:fixed;top:0;bottom:0;left:0;right:0;display:flex;flex-direction:column;background:rgb(255, 255, 255, 0.9);" class="duanshu">
                <div style="flex:auto;display:flex;overflow:auto;">
                    <div style="max-width:500px;margin:auto;" class="duanshu-items">
                        <div class="duanshu-item">准备完毕</div>
                    </div>
                </div>
                <div style="flex:none;margin:10px 0;text-align:center;">
                    <button class="btn-pre">Pre</button>
                    <button class="btn-next">Next</button>
                </div>
                <div style="flex:none;margin:0 0 10px 0;text-align:center;">
                    <button class="btn-exit">Exit</button>
                    <select class="select-step">
                        <option value="1">一步一个脚印</option>
                        <option value="2">事半功倍</option>
                        <option value="5">五彩缤纷</option>
                        <option value="10">一目十行</option>
                    </select>
                </div>
            </div>`)
        $('.btn-next').click(this.nextPageItem.bind(this))
        $('.btn-pre').click(this.prePageItem.bind(this))
        $('.btn-exit').click(function () {
            $('.duanshu').remove()
        })
        const _this = this;
        $('.select-step').change(function (event) {
            _this.bucketSize = +event.target.value
            _this.nextPageItem()
        })
    },
    readItemIndex: 0,
    bucketSize: 1,
    nextPageItem() {
        this.oneByOnePageItem()
    },
    prePageItem() {
        this.oneByOnePageItem(true)
    },
    oneByOnePageItem(back, bucket = []) {
        this.readItemIndex += back ? -1 : 1
        const pageItem = this.page.list[this.readItemIndex];
        if (pageItem) {
            if (!pageItem.content) {
                this.oneByOnePageItem(back, bucket);
            } else {
                // 桶满了就继续
                bucket.push(`<div class="duanshu-item" style="margin:10px 0;">${pageItem.content}</div>`)
                if (bucket.length == this.bucketSize) {
                    $('.duanshu-items').html(bucket.join(''));
                } else {
                    this.oneByOnePageItem(back, bucket)
                }
            }
        }
    }
}

let myFont;
let p5Canvas;
function preload () {
    myFont = loadFont('https://enobj-cdn-1252108641.cos.ap-nanjing.myqcloud.com/pabellona-c-triplex.ttf');
}

function setup () {
    const width = 400, height = 100;
    p5Canvas = createCanvas(width, height);
    const x = Math.floor(screen.availWidth / 2 - width / 2)
    const y = Math.floor(screen.availHeight / 2 - height / 2)
    console.log('三体倒计时', x, y)
    p5Canvas.position(x, y, 'fixed');
}

function draw () {
    clear();
    background('rgba(100%,0%,100%,0)');

    fill('#F2921D');
    textSize(60);
    textAlign(CENTER, CENTER);
    textFont(myFont);

    const remainingTime = calculateRemainingTime();
    if (remainingTime.remainingTime > 1000) {
        const timeText =
            "" +
            getTrueNumber(remainingTime.hours) +
            " " +
            getTrueNumber(remainingTime.mins) +
            " " +
            getTrueNumber(remainingTime.secs);
        text(timeText, width / 2, height / 2)
    }
}

function calculateRemainingTime () {
    const comingYear = new Date().getFullYear() + 1;
    const comingDate = new Date(`Jan 1, ${comingYear} 00:00:00`);

    const now = new Date();
    const remainingTime = comingDate.getTime() - now.getTime();
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const mins = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return { hours: days * 24 + hours, mins, secs, remainingTime };
}

function getTrueNumber (num) {
    return num < 10 ? "0" + num : num;
}