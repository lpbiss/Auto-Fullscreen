export function createStyleNode(cssRules: string): HTMLStyleElement {
    const styleNode = document.createElement('style')
    styleNode.appendChild(document.createTextNode(cssRules))
    document.head.appendChild(styleNode)
    return styleNode
}

/**
 * Create a script tag and inject it into the document.
 * ref: https://intoli.com/blog/sandbox-breakout/
 */
export function runInPageContext(func: Function): void {

    const scriptContent = `
        (${func.toString()})();
        document.currentScript.remove();
    `

    const scriptElement = document.createElement('script')
    scriptElement.innerHTML = scriptContent
    document.documentElement.prepend(scriptElement)
}


export function concatCSSRuleMap(CSSRuleMap: Map<string, string>): string {
    let res = ''
    CSSRuleMap.forEach((val, ruleName) => {
        res += `${ruleName}: ${val};`
    })
    return res
}

