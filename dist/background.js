/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// CONCATENATED MODULE: ./src/global.ts
const defaultConfig = {
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
};
const configKeys = (/* unused pure expression or super */ null && ([
    'widthLowerBound',
    'heightLowerBound',
    'areaIgnorePercentage',
    'hotkeyCtrl',
    'hotkeyAlt',
    'hotKey',
    'hotkeyEnable',
    'matchList',
]));

;// CONCATENATED MODULE: ./src/background.ts

const config = defaultConfig;
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install' || details.reason === 'update') {
        chrome.storage.local.get(Object.keys(config), function (result) {
            Object.assign(config, result);
            chrome.storage.local.set(config);
        });
    }
});
chrome.storage.onChanged.addListener(function (changes) {
    const newConfig = {};
    for (const key in changes) {
        newConfig[key] = changes[key].newValue;
    }
    Object.assign(config, newConfig);
});
chrome.browserAction.onClicked.addListener(function (tab) {
    const msg = { action: 'fullscreen' };
    chrome.tabs.sendMessage(tab.id, msg);
});

/******/ })()
;