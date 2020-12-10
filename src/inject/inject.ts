import './inject.scss'
import closeSVG from './resource/close.svg'
import clockwiseSVG from './resource/clockwise.svg'
import anticlockwiseSVG from './resource/anticlockwise.svg'
import exitFitViewportSVG from './resource/fullscreen-exit.svg'
import fitViewportSVG from './resource/fit-viewport.svg'
// import zoomInSVG from './resource/zoom-in.svg'
// import zoomOutSVG from './resource/zoom-out.svg'

import { appendStyleNode, runInPageContext, concatCSSRuleMap } from './util'
import { defaultConfig } from "../global";

/* 
    Todos:
    1. support canvas image (ongoing)
    2. add zoom-in/zoom-out function for image
    3. detect iframe elements
*/



const stateHandler = new class {
    config: Config
    state: 'on' | 'off'
    exitSteps: Function[]

    constructor() {
        this.config = defaultConfig
        this.state = 'off'
        this.exitSteps = []
    }

    registerExitStep = (step: Function) => {
        this.exitSteps.push(step)
        this.state = 'on'
    }

    exit = () => {
        for (const step of this.exitSteps) step()
        this.exitSteps = []
        this.state = 'off'
    }
}


const fullscreener = new class {

    start = async () => {

        stateHandler.exit()

        const allTargets = await this.getAllTargetElements()
        const remain = this.filterOut(allTargets)

        let target: TargetElement | 'canceled'
        if (remain.length === 0)
            target = 'canceled'
        else if (remain.length === 1)
            target = remain[0]
        else
            target = await this.waitForManualSelection(remain)


        if (target instanceof HTMLImageElement) {
            new FullscreenImage(target)
        } else if (target instanceof HTMLVideoElement) {
            setVideoFullScreen(target)
        } else if (target instanceof HTMLCanvasElement) {
            new FullscreenCanvas(target)
        } else {
            stateHandler.exit()
        }
    }

    getEntrySize = (entry: IntersectionObserverEntry): VisibleInfo => {
        const widthVisible = entry.intersectionRect.right - entry.intersectionRect.left
        const heightVisible = entry.intersectionRect.bottom - entry.intersectionRect.top
        const areaVisible = widthVisible * heightVisible
        return { widthVisible, heightVisible, areaVisible }
    }

    getAllTargetElements = (): Promise<FullScreenTarget[]> => {
        return new Promise(resolve => {

            const observer = new IntersectionObserver((entries, observer) => {
                const fullScreenTargets: FullScreenTarget[] = []

                entries.forEach(entry => {
                    if (!entry.isIntersecting) return

                    const entrySize = this.getEntrySize(entry)
                    if (entrySize.widthVisible <= stateHandler.config.widthLowerBound ||
                        entrySize.heightVisible <= stateHandler.config.heightLowerBound)
                        return

                    fullScreenTargets.push({
                        target: entry.target as TargetElement,
                        areaVisible: entrySize.areaVisible,
                    })
                })

                observer.disconnect()
                resolve(fullScreenTargets)
            })

            const allCandidate = document.querySelectorAll('img, video, canvas')
            for (const image of allCandidate) {
                observer.observe(image)
            }
        })
    }

    filterOut = (targets: FullScreenTarget[]): TargetElement[] => {

        const res: TargetElement[] = []
        const areaVisibleMax = Math.max(...targets.map(candidate => candidate.areaVisible))

        targets.forEach(target => {
            if (target.areaVisible > areaVisibleMax * stateHandler.config.areaIgnorePercentage) {
                res.push(target.target)
            }
        })

        return res
    }

    waitForManualSelection = (targetElements: TargetElement[]): Promise<TargetElement | 'canceled'> => {
        return new Promise(resolve => {
            const overlayRoot = document.createElement('overlay-root')
            overlayRoot.className = '--auto-fullscreen-overlay-root'
            document.body.appendChild(overlayRoot)

            const overlayDetails: OverlayDetail[] = targetElements.map(el => {
                const targetRect = el.getBoundingClientRect()
                return {
                    width: targetRect.right - targetRect.left,
                    height: targetRect.bottom - targetRect.top,
                    top: targetRect.top + window.pageYOffset,
                    left: targetRect.left + window.pageXOffset,
                    text: this.createOverlayText(el),
                    target: el,
                    onClick: () => { resolve(el) },
                }
            })

            const filtered = this.overlapOverlayFilter(overlayDetails).map(this.createOverlay)
            if (filtered.length === 1)
                resolve(filtered[0] as TargetElement)
            else
                filtered.forEach(overlay => {
                    overlayRoot.appendChild(overlay)
                })


            stateHandler.registerExitStep(() => {
                resolve('canceled')
                overlayRoot.remove()
            })
        })
    }

    createOverlay = (detail: OverlayDetail): HTMLElement => {
        const overlay = document.createElement('target-overlay')
        overlay.innerText = detail.text
        overlay.style.width = `${detail.width}px`
        overlay.style.height = `${detail.height}px`
        overlay.style.left = `${detail.left}px`
        overlay.style.top = `${detail.top}px`
        overlay.onclick = detail.onClick
        return overlay
    }

    createOverlayText = (el: TargetElement): string => {
        const res: string[] = ['Click to maximize']
        if (el instanceof HTMLImageElement) {
            res.push(el.src)
        } else if (el instanceof HTMLVideoElement) {
            res.push(el.src)
        }

        return res.join('\n')
    }

    /**
     * If some elements' overlay cover each other completely,
     * those with lower z-index get filtered out.
     * See resolveOverLap() for detail.
     */
    overlapOverlayFilter = (details: OverlayDetail[]): OverlayDetail[] => {

        const res: Set<OverlayDetail> = new Set(details)
        const toDel: Set<OverlayDetail> = new Set()

        const isOverlap = (d1: OverlayDetail, d2: OverlayDetail): Boolean => {
            if (d1 === d2) return false
            if (d1.top > d2.top) [d2, d1] = [d1, d2]
            // check if d1 covers d2
            if (d1.left <= d2.left &&
                d1.top + d1.height >= d2.top + d2.height &&
                d1.left + d1.width >= d2.left + d2.width)
                return true
            else return false
        }

        for (const d1 of res) {
            for (const d2 of res) {
                if (isOverlap(d1, d2)) {
                    toDel.add(this.resolveOverLap(d1, d2) === d1 ? d2 : d1)
                }
            }
        }

        for (const d of toDel) res.delete(d)

        return Array.from(res)
    }


    /** return the overlay to keep */
    resolveOverLap = (d1: OverlayDetail, d2: OverlayDetail): OverlayDetail => {

        const getRootPath = (node: HTMLElement, root: HTMLElement): HTMLElement[] => {
            const res: HTMLElement[] = []
            let cur: HTMLElement | null = node
            while (cur !== root && cur !== null) {
                res.push(cur)
                cur = cur.parentElement
            }
            return res
        }

        const root = this.getNearestCommonAncestor(d1.target, d2.target)
        if (root === null) throw new Error('getNearestCommonAncestor return null')

        const path1 = getRootPath(d1.target, root)
        const path2 = getRootPath(d2.target, root)

        const len1 = path1.length
        const len2 = path2.length
        let i = 1
        // Check z-index from root all the way to d1.target and d2.target
        while (i <= len1 && i <= len2) {
            const d1Parent = path1[len1 - i]
            const d2Parent = path2[len2 - i]

            const d1Style = getComputedStyle(d1Parent)
            const d2Style = getComputedStyle(d2Parent)

            if (d1Style.zIndex !== 'auto'
                && d2Style.zIndex !== 'auto') {
                const zIndex1 = parseInt(d1Style.zIndex)
                const zIndex2 = parseInt(d2Style.zIndex)
                if (zIndex1 > zIndex2) return d1
                else if (zIndex2 > zIndex1) return d2
            } else if (d1Style.zIndex !== 'auto'
                && d2Style.zIndex === 'auto') {
                const zIndex1 = parseInt(d1Style.zIndex)
                if (zIndex1 > 0) return d1
                else if (zIndex1 < 0) return d2
            } else if (d1Style.zIndex === 'auto'
                && d2Style.zIndex !== 'auto') {
                const zIndex2 = parseInt(d2Style.zIndex)
                if (zIndex2 > 0) return d2
                else if (zIndex2 < 0) return d1
            }

            i++
        }

        // If no z-index found, compare their relative positon in DOM
        console.log('no z-index found')
        if (d1.target.compareDocumentPosition(d2.target) & Node.DOCUMENT_POSITION_PRECEDING) {
            // d1 is positioned after d2
            return d1
        } else {
            return d2
        }
    }


    getNearestCommonAncestor = (e1: HTMLElement, e2: HTMLElement): HTMLElement | null => {
        const path1: HTMLElement[] = []
        const path2: HTMLElement[] = []

        let cur: HTMLElement | null = e1
        while (cur) {
            path1.push(cur)
            cur = cur.parentElement
        }

        cur = e2
        while (cur) {
            path2.push(cur)
            cur = cur.parentElement
        }

        const len1 = path1.length
        const len2 = path2.length
        let i = 0
        while (i <= len1 && i <= len2) {
            if (path1[len1 - i] === path2[len2 - i]) i++
            else return path1[len1 - i + 1]
        }

        return null
    }
}


const automation = new class {

    start = async () => {
        for (const matchDetail of stateHandler.config.matchList) {

            // skip disabled rules
            if (!matchDetail.isEnabled) continue

            if (location.href.match(matchDetail.match)) {
                if (matchDetail.selector) {
                    const target = await this.waitForElement(matchDetail.selector)
                    if (target instanceof HTMLImageElement) {
                        new FullscreenImage(target)
                    } else if (target instanceof HTMLVideoElement) {
                        setVideoFullScreen(target)
                    } else if (target instanceof HTMLCanvasElement) {
                        new FullscreenCanvas(target)
                    } else {
                        console.log(`Target element: ${matchDetail.selector} not found!`)
                    }
                } else {
                    await this.waitForDOMLoad()
                    await this.waitForVisible()
                    fullscreener.start()
                }

                break  // only the first match applies
            }
        }
    }

    waitForElement = (selector: string): Promise<TargetElement | false> => {
        return new Promise(resolve => {
            let retryCount = 0
            const handler = setInterval(() => {
                retryCount += 1
                if (retryCount === 30) resolve(false)
                const target = document.querySelector(selector)
                if (target instanceof HTMLImageElement ||
                    target instanceof HTMLVideoElement) {
                    clearInterval(handler)
                    resolve(target)
                }
            }, 1000)
        })
    }

    waitForDOMLoad = (): Promise<void> => {
        return new Promise(resolve => {
            if (document.readyState == 'complete') {
                resolve()
            } else {
                window.addEventListener('load', () => resolve())
            }
        })
    }

    waitForVisible = (): Promise<void> => {
        return new Promise(resolve => {
            if (document.hidden) {
                document.addEventListener('visibilitychange', () => {
                    resolve()
                }, { once: true })
            } else {
                resolve()
            }
        })
    }

}



chrome.storage.local.get(Object.keys(defaultConfig), function (result) {

    stateHandler.config = result as Config

    // add hotkey to exit fullscreen
    document.addEventListener('keyup', function (ev) {
        if (ev.key === stateHandler.config.hotKey &&
            ev.ctrlKey === stateHandler.config.hotkeyCtrl &&
            ev.altKey === stateHandler.config.hotkeyAlt) {
            if (stateHandler.state === 'on') stateHandler.exit()
            else fullscreener.start()
        } else if (ev.key === 'Escape') {
            stateHandler.exit()
        }
    })

    // when the extension icon being clicked
    chrome.runtime.onMessage.addListener(function (msg: contentScriptMessage) {
        if (msg.action === 'fullscreen') {
            if (stateHandler.state === 'on') stateHandler.exit()
            else fullscreener.start()
        }
    })

    chrome.storage.onChanged.addListener(function (changes) {
        const newConfig: Partial<Config> = {}
        for (const key in changes) {
            (newConfig as any)[key] = changes[key].newValue
        }
        Object.assign(stateHandler.config, newConfig)
    })

    automation.start()
})


class FullscreenImage {
    src: string
    originalBodyStyle: string

    container = document.createElement('div')
    img = document.createElement('img')
    toolsContainer = document.createElement('div')

    close = FullscreenImage.createSVGNode(closeSVG)
    routateAnticlockwise = FullscreenImage.createSVGNode(anticlockwiseSVG)
    routateClockwise = FullscreenImage.createSVGNode(clockwiseSVG)
    exitFitViewport = FullscreenImage.createSVGNode(exitFitViewportSVG)
    fitViewport = FullscreenImage.createSVGNode(fitViewportSVG)

    constructor(target: HTMLImageElement | string) {

        if (target instanceof HTMLImageElement) this.src = target.src
        else this.src = target

        this.originalBodyStyle = document.body.style.cssText
        this.addAttr()
        this.addEventHandler()
        this.arrangeDOM()
    }

    addAttr = () => {
        this.container.className = '--auto-fullscreen-contianer fit-viewport'

        this.img.className = 'fullscreen-image horizontal'
        this.img.setAttribute('rotate-state', '0')
        this.img.src = this.src

        this.toolsContainer.className = '--fullscreen-image-tools-container hide-button'
    }


    addEventHandler = () => {
        this.routateAnticlockwise.onclick = () => this.routateImg('anticlockwise')
        this.routateClockwise.onclick = () => this.routateImg('clockwise')

        // exit fit viewport mode
        this.exitFitViewport.onclick = () => {
            this.container.classList.remove('fit-viewport')
            this.container.classList.add('custom-size')
            this.exitFitViewport.remove()
            this.toolsContainer.appendChild(this.fitViewport)
        }

        // fit viewport mode
        this.fitViewport.onclick = () => {
            this.container.classList.add('fit-viewport')
            this.container.classList.remove('custom-size')
            this.fitViewport.remove()
            this.toolsContainer.appendChild(this.exitFitViewport)
        }

        const closeImage = () => this.container.remove()
        stateHandler.registerExitStep(closeImage)
        this.close.onclick = stateHandler.exit

        this.toolsContainer.addEventListener('mouseover', (ev) => {
            this.toolsContainer.classList.remove('hide-button')
            this.toolsContainer.classList.add('show-button')
        })

        this.toolsContainer.addEventListener('mouseleave', (ev) => {
            this.toolsContainer.classList.add('hide-button')
            this.toolsContainer.classList.remove('show-button')
        })
    }

    arrangeDOM = () => {
        document.body.appendChild(this.container)

        this.container.appendChild(this.img)
        this.container.appendChild(this.toolsContainer)

        this.toolsContainer.appendChild(this.close)
        this.toolsContainer.appendChild(this.routateAnticlockwise)
        this.toolsContainer.appendChild(this.routateClockwise)
        this.toolsContainer.appendChild(this.exitFitViewport)

    }

    static createSVGNode(svgString: string): SVGElement {
        const template = document.createElement('template')
        template.innerHTML = svgString
        return template.content.firstChild as SVGElement
    }

    routateImg = (action: 'clockwise' | 'anticlockwise') => {
        const rotateState = parseInt(this.img.getAttribute('rotate-state') ?? '0')
        const newRotateState = action === 'clockwise' ? rotateState + 1 : rotateState - 1
        this.img.style.transform = `rotate(calc(${newRotateState} * 90deg))`
        this.img.setAttribute('rotate-state', newRotateState.toString())

        // if newRotateState is even, add 'horizontal', remove 'vertical'
        this.img.classList.toggle('horizontal', newRotateState % 2 === 0)
        this.img.classList.toggle('vertical', newRotateState % 2 === 1)
    }

}


class FullscreenCanvas {
    target: HTMLCanvasElement | HTMLVideoElement

    fullscreenRules: Map<string, string> = new Map([
        ['position', 'fixed !important'],
        ['zIndex', '99999 !important'],
        ['visibility', 'visible !important'],
        ['margin', '0 !important'],
        ['padding', '0 !important'],
        ['opacity', '1 !important'],
    ])

    originalTargetStyle: Map<string, string> = new Map()

    constructor(target: HTMLCanvasElement | HTMLVideoElement) {
        this.target = target

        // store original style
        for (const styleName of this.target.style) {
            const priority = this.target.style.getPropertyPriority(styleName) === 'important' ? '!important' : ''
            this.originalTargetStyle.set(styleName, `${this.target.style.getPropertyValue(styleName)} ${priority}`.trim())
        }
        stateHandler.registerExitStep(() => {
            this.target.style.cssText = concatCSSRuleMap(this.originalTargetStyle)
        })

        // set fullscreen rules
        const { width, height, top, left } = this.computeFullscreenSize(this.target.width, this.target.height)
        this.fullscreenRules.set('width', `${width}px !important`)
        this.fullscreenRules.set('height', `${height}px !important`)
        this.fullscreenRules.set('top', `${top}px !important`)
        this.fullscreenRules.set('left', `${left}px !important`)

        this.target.style.cssText = concatCSSRuleMap(this.fullscreenRules)

        this.hideRestElements()

    }

    hideRestElements = () => {
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
        stateHandler.registerExitStep(() => {
            styleNode.remove()
        })
    }

    computeFullscreenSize(originalWidth: number, originalHeidgt: number) {
        const canvasRatio = originalWidth / originalHeidgt
        const screenRatio = window.innerWidth / window.innerHeight
        if (canvasRatio > screenRatio) {
            const height = window.innerWidth / canvasRatio
            return {
                width: window.innerWidth,
                height,
                top: (window.innerHeight - height) / 2,
                left: 0
            }
        }
        else {
            const width = window.innerHeight * canvasRatio
            return {
                width,
                height: window.innerHeight,
                top: 0,
                left: (window.innerWidth - width) / 2,
            }
        }
    }
}

function setVideoFullScreen(target: HTMLVideoElement): void {

    const styleNode = appendStyleNode(`
        /* same to: * { ... } */
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

    const originalStyleMap = new Map()
    for (const styleName of target.style) {
        const priority = target.style.getPropertyPriority(styleName) === 'important' ? '!important' : ''
        originalStyleMap.set(styleName, `${target.style.getPropertyValue(styleName)} ${priority}`.trim())
    }

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


    if (target.getAttribute('controls') !== null) {
        stateHandler.registerExitStep(() => {
            target.style.cssText = concatCSSRuleMap(originalStyleMap)
            ob.disconnect()
            styleNode.remove()
        })
    } else {
        target.setAttribute('controls', '')

        /** use this type to prevent ts compile error */
        const hookedVideo = target as FullScreenVideo

        const handleClick = (ev: MouseEvent): void => {
            if (ev.target == hookedVideo) {
                if (hookedVideo.paused) hookedVideo.play('fullscreen')
                else hookedVideo.pause('fullscreen')
                ev.preventDefault()
            }
        }

        const handleSpacePress = (ev: KeyboardEvent): void => {
            if (ev.key == 'Space') {
                if (hookedVideo.paused) hookedVideo.play('fullscreen')
                else hookedVideo.pause('fullscreen')
                ev.preventDefault()
            }
        }

        document.addEventListener('click', handleClick, { capture: true })
        document.addEventListener('keyup', handleSpacePress)

        runInPageContext(hookMediaPrototype)

        stateHandler.registerExitStep(() => {
            // this looks like a callback but it runs synchronously
            // so the hooked removeAttribute method get recovered before
            // target.removeAttribute('controls') remove controls
            runInPageContext(() => {
                (window as any)['___$recoverHook___']()
            })

            target.style.cssText = concatCSSRuleMap(originalStyleMap)
            ob.disconnect()
            // target.style.cssText = originalStyle
            target.removeAttribute('controls')
            styleNode.remove()

            document.removeEventListener('click', handleClick, { capture: true })
            document.removeEventListener('keyup', handleSpacePress)
        })
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
