import { defaultConfig } from "./global";

const config: Config = defaultConfig


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
    chrome.tabs.sendMessage(tab.id as number, msg)
})
