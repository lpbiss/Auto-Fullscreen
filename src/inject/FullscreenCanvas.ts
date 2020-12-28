import StateHandler from './StateHandler'
import { appendStyleNode, concatCSSRuleMap } from './util'

export default class FullscreenCanvas {
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
        StateHandler.registerExitStep(() => {
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
        StateHandler.registerExitStep(() => {
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
