import './style.scss'
// import zoomInSVG from './resource/zoom-in.svg'
// import zoomOutSVG from './resource/zoom-out.svg'
import { defaultConfig } from "../global"

import StateHandler from './StateHandler'
import FullscreenImage from './FullscreenImage'
import setVideoFullScreen from './setVideoFullScreen'
import FullscreenCanvas from './FullscreenCanvas'

/* 
    Todos:
    detect iframe elements
*/


const fullscreener = new class {

    start = async () => {

        StateHandler.exit()

        const allTargets = await this.getAllTargetElements()
        const remain = this.filterOutByVisibleArea(allTargets)

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
            StateHandler.exit()
        }
    }

    getVisibleSize = (entry: IntersectionObserverEntry): VisibleInfo => {
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

                    const entrySize = this.getVisibleSize(entry)
                    if (entrySize.widthVisible <= StateHandler.config.widthLowerBound ||
                        entrySize.heightVisible <= StateHandler.config.heightLowerBound)
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

    filterOutByVisibleArea = (targets: FullScreenTarget[]): TargetElement[] => {

        const res: TargetElement[] = []
        const areaVisibleMax = Math.max(...targets.map(candidate => candidate.areaVisible))

        targets.forEach(target => {
            if (target.areaVisible > areaVisibleMax * StateHandler.config.areaIgnorePercentage) {
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

            // 1. create all overlay
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

            // 2. sort by target's z-index, ascending
            overlayDetails.sort((d1, d2) => this.compareZIndex(d1.target, d2.target))

            // 3. filter out overlays with lower z-index and fully covered by other one
            const filtered = overlayDetails.filter((cur, index, all) => {
                for (let i = index + 1; i < all.length; i++) {
                    const cp = this.overlayContainBy(cur, all[i])
                    if (cp === 'equal' || cp === all[i]) return false
                }
                return true
            })

            if (filtered.length === 1)
                resolve(filtered[0].target)
            else {
                filtered
                    .map(this.createOverlay)
                    .forEach(overlay => overlayRoot.appendChild(overlay))

                StateHandler.registerExitStep(() => {
                    resolve('canceled')
                    overlayRoot.remove()
                })
            }

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
            res.push(`Resolution: ${el.naturalWidth} x ${el.naturalHeight}`)
            res.push(el.src.replace(/^.*\//, ''))
        } else if (el instanceof HTMLVideoElement) {
            res.push(`Duration: ${el.duration}s`)
            res.push(el.src)
        }

        return res.join('\n')
    }

    /** return the overlay which contians the other one */
    overlayContainBy = (d1: OverlayDetail, d2: OverlayDetail): OverlayDetail | 'equal' | false => {
        // TODO: only consider size in viewport
        if (d1 === d2) return false
        if (d1.top === d2.top &&
            d1.left === d2.left &&
            d1.top + d1.height === d2.top + d2.height &&
            d1.left + d1.width === d2.left + d2.width)
            return 'equal'
        else if (d1.top <= d2.top &&
            d1.left <= d2.left &&
            d1.top + d1.height >= d2.top + d2.height &&
            d1.left + d1.width >= d2.left + d2.width)
            return d1
        else if (d1.top >= d2.top &&
            d1.left >= d2.left &&
            d1.top + d1.height <= d2.top + d2.height &&
            d1.left + d1.width <= d2.left + d2.width)
            return d2
        else
            return false
    }


    /** return -1 if e1 has lower z-index than e2 */
    compareZIndex = (e1: HTMLElement, e2: HTMLElement): -1 | 1 => {
        const { root, path1, path2 } = this.getNearestCommonAncestor(e1, e2)
        if (root === null) throw new Error('getNearestCommonAncestor return null')

        const len1 = path1.length
        const len2 = path2.length
        let i = 1
        // Check z-index from root down to d1.target and d2.target
        while (i <= len1 && i <= len2) {
            const d1Parent = path1[len1 - i]
            const d2Parent = path2[len2 - i]

            const d1Style = getComputedStyle(d1Parent)
            const d2Style = getComputedStyle(d2Parent)

            if (d1Style.zIndex !== 'auto'
                && d2Style.zIndex !== 'auto') {
                const zIndex1 = parseInt(d1Style.zIndex)
                const zIndex2 = parseInt(d2Style.zIndex)
                if (zIndex1 > zIndex2) return 1
                else if (zIndex2 > zIndex1) return -1
            } else if (d1Style.zIndex !== 'auto'
                && d2Style.zIndex === 'auto') {
                const zIndex1 = parseInt(d1Style.zIndex)
                if (zIndex1 > 0) return 1
                else if (zIndex1 < 0) return -1
            } else if (d1Style.zIndex === 'auto'
                && d2Style.zIndex !== 'auto') {
                const zIndex2 = parseInt(d2Style.zIndex)
                if (zIndex2 > 0) return -1
                else if (zIndex2 < 0) return 1
            }

            i++
        }

        // If no z-index found, compare their relative positon in DOM
        if (e1.compareDocumentPosition(e2) & Node.DOCUMENT_POSITION_PRECEDING)
            return 1  // e1 is positioned after e2
        else
            return -1

    }


    getNearestCommonAncestor = (e1: HTMLElement, e2: HTMLElement): {
        root: HTMLElement | null,
        path1: HTMLElement[],
        path2: HTMLElement[],
    } => {
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
            if (path1[len1 - i] === path2[len2 - i])
                i++
            else
                return {
                    root: path1[len1 - i + 1],
                    path1,
                    path2,
                }
        }

        return {
            root: null,
            path1,
            path2,
        }
    }
}

const Automation = new class {

    start = async () => {
        for (const matchDetail of StateHandler.config.matchList) {

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

    StateHandler.config = result as Config

    // add hotkey to exit fullscreen
    document.addEventListener('keyup', function (ev) {
        if (ev.key === StateHandler.config.hotKey &&
            ev.ctrlKey === StateHandler.config.hotkeyCtrl &&
            ev.altKey === StateHandler.config.hotkeyAlt) {
            if (StateHandler.state === 'on') StateHandler.exit()
            else fullscreener.start()
        } else if (ev.key === 'Escape') {
            StateHandler.exit()
        }
    })

    // when the extension icon being clicked
    chrome.runtime.onMessage.addListener(function (msg: ContentScriptMessage) {
        if (msg.action === 'fullscreen') {
            if (StateHandler.state === 'on') StateHandler.exit()
            else fullscreener.start()
        }
    })

    chrome.storage.onChanged.addListener(function (changes) {
        const newConfig: Partial<Config> = {}
        for (const key in changes) {
            (newConfig as any)[key] = changes[key].newValue
        }
        Object.assign(StateHandler.config, newConfig)
    })

    Automation.start()
})

