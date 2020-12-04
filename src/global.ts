export const defaultConfig: Config= {
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

export const configKeys: Array<keyof Config> = [
    'widthLowerBound',
    'heightLowerBound',
    'areaIgnorePercentage',
    'hotkeyCtrl',
    'hotkeyAlt',
    'hotKey',
    'hotkeyEnable',
    'matchList',
]