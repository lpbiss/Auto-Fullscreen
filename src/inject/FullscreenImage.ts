import closeSVG from './resource/close.svg'
import clockwiseSVG from './resource/clockwise.svg'
import anticlockwiseSVG from './resource/anticlockwise.svg'
import exitFitViewportSVG from './resource/fullscreen-exit.svg'
import fitViewportSVG from './resource/fit-viewport.svg'

import StateHandler from './StateHandler'

type FullscreenImageState = {
    showToolbar: boolean,
    viewMode: 'fit-viewport' | 'custom-size',
    rotateDegree: 0 | 90 | 180 | 270,
    scale: number,
}

export default class FullscreenImage {
    originalBodyStyle: string

    container = document.createElement('div')
    img = document.createElement('img')
    toolsContainer = document.createElement('div')

    close = createSVGNode(closeSVG)
    routateAnticlockwise = createSVGNode(anticlockwiseSVG)
    routateClockwise = createSVGNode(clockwiseSVG)
    exitFitViewport = createSVGNode(exitFitViewportSVG)
    fitViewport = createSVGNode(fitViewportSVG)

    state: FullscreenImageState = {
        showToolbar: false,
        viewMode: 'fit-viewport',
        rotateDegree: 0,
        scale: 1,
    }

    constructor(target: HTMLImageElement | string) {

        if (target instanceof HTMLImageElement) this.img.src = target.src
        else this.img.src = target

        this.originalBodyStyle = document.body.style.cssText
        document.body.style.cssText = 'overflow: hidden !important'
        StateHandler.registerExitStep(() => {
            document.body.style.cssText = this.originalBodyStyle
        })

        this.addClassName()
        this.addEventHandler()
        this.arrangeDOM()

        this.setState(this.state)
    }


    setState = (newState: Partial<FullscreenImageState>) => {

        this.state = { ...this.state, ...newState }

        if (this.state.viewMode === 'fit-viewport') {
            this.container.classList.add('fit-viewport')
            this.container.classList.remove('custom-size')

            this.fitViewport.remove()
            this.toolsContainer.appendChild(this.exitFitViewport)

            // do not scale image in fit-viewport mode
            this.img.style.transform = `rotate(${this.state.rotateDegree}deg)`

        } else if (this.state.viewMode === 'custom-size') {
            this.container.classList.remove('fit-viewport')
            this.container.classList.add('custom-size')

            this.exitFitViewport.remove()
            this.toolsContainer.appendChild(this.fitViewport)

            this.img.style.transform = `rotate(${this.state.rotateDegree}deg) scale(${this.state.scale})`
            
        }

        // toolbar
        this.toolsContainer.classList.toggle('hide-button', !this.state.showToolbar)
        this.toolsContainer.classList.toggle('show-button', this.state.showToolbar)

        const scrollbarWidth = this.container.offsetWidth - this.container.clientWidth
        const scrollbarHeight = this.container.offsetHeight - this.container.clientHeight
        this.toolsContainer.style.right = `${scrollbarWidth}px`
        this.toolsContainer.style.height = `calc(100% - ${scrollbarHeight}px)`

        this.img.classList.toggle('horizontal', this.state.rotateDegree === 0 || this.state.rotateDegree === 180)
        this.img.classList.toggle('vertical', this.state.rotateDegree === 90 || this.state.rotateDegree === 270)

    }


    addClassName = () => {
        this.container.className = '--auto-fullscreen-contianer'
        this.img.className = 'fullscreen-image'
        this.toolsContainer.className = '--fullscreen-image-tools-container'
    }


    addEventHandler = () => {
        this.routateAnticlockwise.onclick = () => {
            const rotateDegree = (this.state.rotateDegree - 90) % 360 as FullscreenImageState['rotateDegree']
            this.setState({ rotateDegree })
        }

        this.routateClockwise.onclick = () => {
            const rotateDegree = (this.state.rotateDegree + 90) % 360 as FullscreenImageState['rotateDegree']
            this.setState({ rotateDegree })
        }

        this.exitFitViewport.onclick = () => {
            this.setState({ viewMode: 'custom-size' })
        }

        this.fitViewport.onclick = () => {
            this.setState({ viewMode: 'fit-viewport' })
        }

        const closeImage = () => this.container.remove()
        StateHandler.registerExitStep(closeImage)
        this.close.onclick = StateHandler.exit

        this.toolsContainer.addEventListener('mouseover', ev => {
            this.setState({ showToolbar: true })
        })

        this.toolsContainer.addEventListener('mouseleave', ev => {
            this.setState({ showToolbar: false })
        })

        // zoom
        this.img.addEventListener('wheel', ev => {
            ev.preventDefault()
            if (this.state.viewMode === 'custom-size') {
                if (ev.deltaY > 0) {
                    this.setState({ scale: this.state.scale - 0.05 })
                } else if (ev.deltaY < 0) {
                    this.setState({ scale: this.state.scale + 0.05 })
                }
            }
        })
        // drag image
        let pos1: number
        let pos2: number
        let pos3: number
        let pos4: number

        const handleImageDrag = (ev: MouseEvent) => {
            pos1 = pos3 - ev.clientX
            pos2 = pos4 - ev.clientY
            pos3 = ev.clientX
            pos4 = ev.clientY
            this.img.style.top = `${this.img.offsetTop - pos2}px`
            this.img.style.left = `${this.img.offsetLeft - pos1}px`
        }

        this.img.addEventListener('mousedown', ev => {
            ev.preventDefault()
            pos3 = ev.clientX
            pos4 = ev.clientY
            this.img.addEventListener('mousemove', handleImageDrag)

            document.addEventListener('mouseup', ev => {
                this.img.removeEventListener('mousemove', handleImageDrag)
            }, { once: true })
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


}


function createSVGNode(svgString: string): SVGElement {
    const template = document.createElement('template')
    template.innerHTML = svgString
    return template.content.firstChild as SVGElement
}