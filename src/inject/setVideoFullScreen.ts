import StateHandler from './StateHandler'
import { appendStyleNode, runInPageContext, concatCSSRuleMap } from './util'


export default function setVideoFullScreen(target: HTMLVideoElement): void {

    const styleNode = appendStyleNode(`
        :not(#for-higher-specificity) {
            visibility: hidden !important;
            overflow: visible !important;
            transform: none !important;
            perspective: none !important;
            filter: none !important;
        }

        html:not(#for-higher-specificity) {
            overflow: hidden !important;
        }
    `)
    StateHandler.registerExitStep(() => styleNode.remove())

    const originalStyleMap = new Map()
    for (const styleName of target.style) {
        const priority = target.style.getPropertyPriority(styleName) === 'important' ? '!important' : ''
        originalStyleMap.set(styleName, `${target.style.getPropertyValue(styleName)} ${priority}`.trim())
    }
    StateHandler.registerExitStep(() => {
        target.style.cssText = concatCSSRuleMap(originalStyleMap)
    })

    const CSSRuleMap: Map<string, string> = new Map([
        ['position', 'fixed !important'],
        ['top', '0px !important'],
        ['left', '0px !important'],
        ['width', '100vw !important'],
        ['height', '100vh !important'],
        ['zIndex', '99999 !important'],
        ['visibility', 'visible !important'],
        ['margin', '0 !important'],
        ['padding', '0 !important'],
        ['opacity', '1 !important'],
    ])

    const fullscreenCssText = concatCSSRuleMap(CSSRuleMap)
    target.style.cssText = fullscreenCssText
    target.focus()

    const obConfig: MutationObserverInit = {
        attributes: true,
        childList: false,
        subtree: false,
        attributeFilter: ['style']
    }
    const ob = new MutationObserver((mutations, observer) => {
        observer.disconnect()
        // detect style change and save to originalStyleMap
        for (const styleName of target.style) {
            const val = target.style.getPropertyValue(styleName)
            const isImportant = target.style.getPropertyPriority(styleName)
            const concatVal = `${val} ${isImportant ? '!important' : ''}`.trim()
            if (CSSRuleMap.has(styleName)) {
                if (CSSRuleMap.get(styleName) === concatVal) continue
                else originalStyleMap.set(styleName, concatVal)
            } else {
                originalStyleMap.set(styleName, concatVal)
            }
        }
        target.style.cssText = fullscreenCssText
        observer.observe(target, obConfig)
    })
    ob.observe(target, obConfig)
    StateHandler.registerExitStep(() => ob.disconnect())


    if (target.getAttribute('controls') === null) {

        /** use this type to prevent ts compile error */
        const hookedVideo = target as FullScreenVideo

        const handleClick = (ev: MouseEvent) => {
            if (ev.target == hookedVideo) {
                if (hookedVideo.paused) hookedVideo.play('fullscreen')
                else hookedVideo.pause('fullscreen')
                ev.preventDefault()
            }
        }

        const handleSpacePress = (ev: KeyboardEvent) => {
            if (ev.key == 'Space') {
                if (hookedVideo.paused) hookedVideo.play('fullscreen')
                else hookedVideo.pause('fullscreen')
                ev.preventDefault()
            }
        }

        const handleContextmenu = (ev: MouseEvent) => {
            if (ev.target === target) {
                ev.stopPropagation()
            }
        }

        document.addEventListener('click', handleClick, { capture: true })
        document.addEventListener('keyup', handleSpacePress)
        document.addEventListener('contextmenu', handleContextmenu, { capture: true })

        StateHandler.registerExitStep(() => {
            document.removeEventListener('click', handleClick, { capture: true })
            document.removeEventListener('keyup', handleSpacePress)
            document.removeEventListener('contextmenu', handleContextmenu, { capture: true })
        })

        runInPageContext(hookMediaPrototype)
        StateHandler.registerExitStep(() => 
            runInPageContext(() => {
                (window as any)['___$recoverHook___']()
            })
        )

        target.setAttribute('controls', '')
        StateHandler.registerExitStep(() => target.removeAttribute('controls'))
    }
}


/**
 * run as injected <script> element
 * hook the play/pause method to prevent conflict
 */
function hookMediaPrototype(): void {
    const mediaProto = HTMLMediaElement.prototype

    const playNative = mediaProto.play;
    (mediaProto as any).play = function (source: 'fullscreen'): void {
        if (source === 'fullscreen') playNative.call(this)
    }

    const pauseNative = mediaProto.pause;
    (mediaProto as any).pause = function (source: 'fullscreen'): void {
        if (source === 'fullscreen') pauseNative.call(this)
    }

    const removeAttributeNative = mediaProto.removeAttribute
    mediaProto.removeAttribute = function (attr): void {
        if (attr === 'controls') return
        else removeAttributeNative.call(this, attr)
    }

    const setNative = Object.getOwnPropertyDescriptor(mediaProto, 'controls')?.set
    Object.defineProperty(mediaProto, 'controls', { set: function () { return } });

    (window as any)['___$recoverHook___'] = (): void => {
        mediaProto.play = playNative
        mediaProto.pause = pauseNative
        mediaProto.removeAttribute = removeAttributeNative
        Object.defineProperty(mediaProto, 'controls', { set: setNative })
    }

}
