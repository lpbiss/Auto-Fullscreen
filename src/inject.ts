import './inject.scss'
import closeSVG from './resource/close.svg'
import clockwiseSVG from './resource/clockwise.svg'
import anticlockwiseSVG from './resource/anticlockwise.svg'
import exitFitViewportSVG from './resource/fullscreen-exit.svg'
import fitViewportSVG from './resource/fit-viewport.svg'
// import zoomInSVG from './resource/zoom-in.svg'
// import zoomOutSVG from './resource/zoom-out.svg'

import {createStyleNode, runInPageContext, concatCSSRuleMap} from './util'


const configKeys: Array<keyof Config> = [
    'widthLowerBound',
    'heightLowerBound',
    'areaIgnorePercentage',
    'hotkeyCtrl',
    'hotkeyAlt',
    'hotKey',
    'hotkeyEnable',
    'matchList',
]

let config: Config

/** 
 * This variable will be set to true when
 * setVideoFullScreen or setImageFullScreen is called.
 */
let isFullScreenState = false
/** this function should set isFullScreenState to false */
let exitFullScreen: () => void


chrome.storage.local.get(configKeys, function (result) {

    config = result as Config

    // add hotkey to exit fullscreen
    document.addEventListener('keyup', function (ev) {
        if (ev.key === config.hotKey &&
            ev.ctrlKey === config.hotkeyCtrl &&
            ev.altKey === config.hotkeyAlt) {
            if (isFullScreenState) {
                exitFullScreen()
                exitFullScreen = null
            } else {
                startAutoFullScreen()
            }
        } else if (ev.key === 'Escape' && isFullScreenState) {
            exitFullScreen()
            exitFullScreen = null
        }
    })

    // when the extension icon being clicked
    chrome.runtime.onMessage.addListener(function (msg: contentScriptMessage) {
        if (msg.action === 'fullscreen') {
            if (isFullScreenState) {
                exitFullScreen()
                exitFullScreen = null
            } else {
                startAutoFullScreen()
            }
        }
    })

    chrome.storage.onChanged.addListener(function (changes) {
        const newConfig: Partial<Config> = {}
        for (const key in changes) {
            (newConfig as any)[key] = changes[key].newValue
        }
        Object.assign(config, newConfig)
    })

    startAutomating()
})


function startAutoFullScreen(): void {

    const observer = new IntersectionObserver(function (entries, observer) {
        const fullScreenCandidates: FullScreenCandidate[] = []

        entries.forEach(entry => {
            if (!entry.isIntersecting) return

            const entrySize = getEntrySize(entry)
            if (entrySize.widthVisible <= config.widthLowerBound ||
                entrySize.heightVisible <= config.heightLowerBound)
                return

            fullScreenCandidates.push({
                target: entry.target as CandidateElement,
                areaVisible: entrySize.areaVisible,
            })
        })

        observer.disconnect()

        candidatesFilter(fullScreenCandidates)
    })

    const allCandidate = document.querySelectorAll('img, video')
    for (const image of allCandidate) {
        observer.observe(image)
    }
}


function getEntrySize(entry: IntersectionObserverEntry): VisibleInfo {
    const widthVisible = entry.intersectionRect.right - entry.intersectionRect.left
    const heightVisible = entry.intersectionRect.bottom - entry.intersectionRect.top
    const areaVisible = widthVisible * heightVisible
    return { widthVisible, heightVisible, areaVisible }
}


function setImageFullScreen(imageSrc: string): void {

    isFullScreenState = true

    const originalBodyStyle = document.body.style.cssText
    document.body.style.cssText = `overflow: hidden !important;`

    const imageContainer = document.createElement('div')
    imageContainer.className = '--auto-fullscreen-image-contianer fit-viewport'
    document.body.appendChild(imageContainer)

    const img = document.createElement('img')
    img.className = 'fullscreen-image horizontal'
    img.setAttribute('rotate-state', '0')
    img.src = imageSrc
    imageContainer.appendChild(img)

    const toolsContainer = document.createElement('div')
    toolsContainer.className = '--fullscreen-image-tools-container'
    imageContainer.appendChild(toolsContainer)

    function stringToSVG(svgString: string): SVGElement {
        const template = document.createElement('template')
        template.innerHTML = svgString
        return template.content.firstChild as SVGElement
    }

    const close = stringToSVG(closeSVG)
    toolsContainer.appendChild(close)

    function routateImg(action: 'clockwise' | 'anticlockwise'): void {
        const rotateState = parseInt(img.getAttribute('rotate-state'))
        let newRotateState
        if (action == 'clockwise') {
            newRotateState = rotateState + 1
        } else if (action == 'anticlockwise') {
            newRotateState = rotateState - 1
        }
        img.style.transform = `rotate(calc(${newRotateState} * 90deg))`
        img.setAttribute('rotate-state', newRotateState.toString())

        if (newRotateState % 2 !== 0) {
            img.classList.remove('horizontal')
            img.classList.add('vertical')
        } else {
            img.classList.remove('vertical')
            img.classList.add('horizontal')
        }
    }

    // routate
    const routateAnticlockwise = stringToSVG(anticlockwiseSVG)
    routateAnticlockwise.onclick = (): void => routateImg('anticlockwise')
    toolsContainer.appendChild(routateAnticlockwise)

    const routateClockwise = stringToSVG(clockwiseSVG)
    routateClockwise.onclick = (): void => routateImg('clockwise')
    toolsContainer.appendChild(routateClockwise)


    // exit fit viewport mode
    const exitFitViewport = stringToSVG(exitFitViewportSVG)
    exitFitViewport.onclick = (): void => {
        imageContainer.classList.remove('fit-viewport')
        imageContainer.classList.add('custom-size')
        exitFitViewport.remove()
        toolsContainer.appendChild(fitViewport)
    }
    toolsContainer.appendChild(exitFitViewport)


    // fit viewport mode
    const fitViewport = stringToSVG(fitViewportSVG)
    fitViewport.onclick = (): void => {
        imageContainer.classList.add('fit-viewport')
        imageContainer.classList.remove('custom-size')
        fitViewport.remove()
        toolsContainer.appendChild(exitFitViewport)
    }


    // close callback
    const closeImage = (): void => {
        imageContainer.remove()
        isFullScreenState = false
        document.body.style.cssText = originalBodyStyle
    }

    exitFullScreen = closeImage

    close.onclick = closeImage
}


function setVideoFullScreen(target: HTMLVideoElement): void {

    isFullScreenState = true

    const styleNode = createStyleNode(`
        /* same to: * { ... } */
        :not(#for-higher-specificity) {
            visibility: hidden !important;
            overflow: visible !important;
            /*
                see https://developer.mozilla.org/en-US/docs/Web/CSS/position
                for why set transform, perspective, filter to none
            */
            transform: none !important;
            perspective: none !important;
            filter: none !important;
        }

        /*
            prevent scrolling in fullscreen mode
            using inline css would be more reliable, but at risk of being overrided
        */
        html { overflow: hidden !important; }
    `)

    const originalStyleMap = new Map()
    for (const styleName of target.style) {
        const priority =  target.style.getPropertyPriority(styleName) === 'important' ? '!important' : ''
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
        exitFullScreen = (): void => {
            target.style.cssText = concatCSSRuleMap(originalStyleMap)
            ob.disconnect()
            // target.style.cssText = originalStyle
            styleNode.remove()
            isFullScreenState = false
        }
    } else {
        target.setAttribute('controls', '')

        /** use this type to prevent ts compile error */
        const hookedVideo = target as FullScreenVideo

        const handleClick = (ev: MouseEvent): void => {
            if (ev.target == hookedVideo) {
                if (hookedVideo.paused) hookedVideo.play('fullscreen')
                else hookedVideo.pause('fullscreen')
                ev.preventDefault()
                ev.stopPropagation()
                ev.stopImmediatePropagation()
            }
        }

        const handleSpacePress = (ev: KeyboardEvent): void => {
            if (ev.key == 'Space') {
                if (hookedVideo.paused) hookedVideo.play('fullscreen')
                else hookedVideo.pause('fullscreen')
                ev.preventDefault()
                ev.stopPropagation()
                ev.stopImmediatePropagation()
            }
        }

        document.addEventListener('click', handleClick, { capture: true })
        document.addEventListener('keyup', handleSpacePress)

        runInPageContext(hookMediaPrototype)

        exitFullScreen = (): void => {
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

            isFullScreenState = false
        }
    }
}


function createCandidateOverlay(candidateElements: CandidateElement[]): void {

    document.querySelector('overlay-root.--auto-fullscreen-overlay-root')?.remove()

    const overlayRoot = document.createElement('overlay-root')
    overlayRoot.className = '--auto-fullscreen-overlay-root'
    document.body.appendChild(overlayRoot)

    candidateElements.forEach(elem => {
        const targetRect = elem.getBoundingClientRect()
        const candidateOverlay = document.createElement('candidate-overlay')
        overlayRoot.appendChild(candidateOverlay)

        const textSpan = document.createElement('span')
        textSpan.innerText = 'Click to maximize'
        candidateOverlay.style.display = 'flex'
        candidateOverlay.style.justifyContent = 'center'
        candidateOverlay.style.alignItems = 'center'
        candidateOverlay.appendChild(textSpan)

        candidateOverlay.style.width = `${targetRect.right - targetRect.left}px`
        candidateOverlay.style.height = `${targetRect.bottom - targetRect.top}px`
        candidateOverlay.style.top = `${targetRect.top + window.pageYOffset}px`
        candidateOverlay.style.left = `${targetRect.left + window.pageXOffset}px`

        if (elem instanceof HTMLImageElement) {
            candidateOverlay.onclick = (): void => {
                overlayRoot.remove()
                setImageFullScreen(elem.src)
            }
        } else if (elem instanceof HTMLVideoElement) {
            candidateOverlay.onclick = (): void => {
                overlayRoot.remove()
                setVideoFullScreen(elem)
            }
        }
    })
}


function candidatesFilter(candidates: FullScreenCandidate[]): void {

    const candidateElements: CandidateElement[] = []
    const areaVisibleMax = Math.max(...candidates.map(candidate => candidate.areaVisible))

    candidates.forEach(candidate => {
        if (candidate.areaVisible > areaVisibleMax * config.areaIgnorePercentage) {
            candidateElements.push(candidate.target)
        }
    })

    if (candidates.length === 1) {
        const target = candidates[0].target
        if (target instanceof HTMLImageElement) {
            setImageFullScreen(target.src)
        } else if (target instanceof HTMLVideoElement) {
            setVideoFullScreen(target)
        }
    } else {
        createCandidateOverlay(candidateElements)
    }
}


async function startAutomating(): Promise<void> {

    for (const matchDetail of config.matchList) {

        // skip disabled rules
        if (!matchDetail.isEnabled) continue

        if (location.href.match(matchDetail.match)) {
            if (matchDetail.selector) {
                const target = await waitForElement(matchDetail.selector)
                if (target === false) {
                    console.log(`Target element: ${matchDetail.selector} not found!`)
                } else if (target instanceof HTMLImageElement) {
                    setImageFullScreen(target.src)
                } else if (target instanceof HTMLVideoElement) {
                    setVideoFullScreen(target)
                }
            } else {
                await waitForLoad()
                await waitForVisible()
                startAutoFullScreen()
            }
            break  // only the first match applies
        }
    }
}


function waitForElement(selector: string): Promise<CandidateElement | false> {
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


function waitForLoad(): Promise<void> {
    return new Promise(resolve => {
        if (document.readyState == 'complete') {
            resolve()
        } else {
            window.addEventListener('load', () => resolve())
        }
    })
}


function waitForVisible(): Promise<void> {
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


/**
 * run as injected script element
 * hook the play/pause method to prevent the website's player behavior
 */
function hookMediaPrototype() {
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

    const setNative = Object.getOwnPropertyDescriptor(mediaProto, 'controls').set
    Object.defineProperty(mediaProto, 'controls', { set: function () { return } });

    (window as any)['___$recoverHook___'] = (): void => {
        mediaProto.play = playNative
        mediaProto.pause = pauseNative
        mediaProto.removeAttribute = removeAttributeNative
        Object.defineProperty(mediaProto, 'controls', { set: setNative })
    }

}