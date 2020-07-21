const config: Config = {
    widthLowerBound: 100,
    heightLowerBound: 100,
    areaIgnorePercentage: 0.4,
    hotkeyCtrl: true,
    hotkeyAlt: true,
    hotKey: ']',
    hotkeyEnable: true,
    matchList: [
        {
            match: 'example.com',
            selector: 'img.target',
            isEnabled: true,
        },
    ],
}


chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install' || details.reason === 'update') {
        chrome.storage.local.get(Object.keys(config), function (result: Partial<Config>) {
            Object.assign(config, result)
            chrome.storage.local.set(config)
        })
    }
})


chrome.storage.onChanged.addListener(function (changes) {
    const newConfig: Partial<Config> = {}
    for (const key in changes) {
        (newConfig as any)[key] = changes[key].newValue
    }
    Object.assign(config, newConfig)
})


chrome.browserAction.onClicked.addListener(function (tab) {
    const msg: contentScriptMessage = { action: 'fullscreen' }
    chrome.tabs.sendMessage(tab.id, msg)
})