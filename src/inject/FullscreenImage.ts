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
    // scale: number,
    customWidth: number,
    customHeight: number,
    top: number,
    left: number,
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
        // scale: 1,
        customWidth: 0,
        customHeight: 0,
        top: 0,
        left: 0,
    }

    constructor(target: HTMLImageElement | string) {

        if (target instanceof HTMLImageElement) this.img.src = target.src
        else this.img.src = target

        this.state.customHeight = this.img.naturalHeight
        this.state.customWidth = this.img.naturalWidth

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


    setState = (state: Partial<FullscreenImageState>) => {

        const newState = { ...this.state, ...state }

        if (newState.viewMode === 'fit-viewport') {
            this.container.classList.add('fit-viewport')
            this.container.classList.remove('custom-size')

            this.fitViewport.remove()
            this.toolsContainer.appendChild(this.exitFitViewport)

            this.img.style.width = ''
            this.img.style.height = ''
            this.img.style.top = ''
            this.img.style.left = ''
        } else if (newState.viewMode === 'custom-size') {
            this.container.classList.remove('fit-viewport')
            this.container.classList.add('custom-size')

            this.exitFitViewport.remove()
            this.toolsContainer.appendChild(this.fitViewport)

            this.img.style.top = `${newState.top}px`
            this.img.style.left = `${newState.left}px`
            this.img.style.width = `${newState.customWidth}px`
            this.img.style.height = `${newState.customHeight}px`
        }
        this.img.style.transform = `rotate(${newState.rotateDegree}deg)`

        // toolbar
        this.toolsContainer.classList.toggle('hide-button', !newState.showToolbar)
        this.toolsContainer.classList.toggle('show-button', newState.showToolbar)

        const scrollbarWidth = this.container.offsetWidth - this.container.clientWidth
        const scrollbarHeight = this.container.offsetHeight - this.container.clientHeight
        this.toolsContainer.style.right = `${scrollbarWidth}px`
        this.toolsContainer.style.height = `calc(100% - ${scrollbarHeight}px)`

        this.img.classList.toggle('horizontal', newState.rotateDegree === 0 || newState.rotateDegree === 180)
        this.img.classList.toggle('vertical', newState.rotateDegree === 90 || newState.rotateDegree === 270)


        this.state = newState
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
            this.setState({
                viewMode: 'custom-size',
                top: (window.innerHeight - this.img.naturalHeight) / 2,
                left: (window.innerWidth - this.img.naturalWidth) / 2,
                customHeight: this.img.naturalHeight,
                customWidth: this.img.naturalWidth,
            })
        }

        this.fitViewport.onclick = () => {
            this.setState({
                viewMode: 'fit-viewport',
                customHeight: this.img.naturalHeight,
                customWidth: this.img.naturalWidth,
            })
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
                const hDiff = this.state.customHeight * 0.05
                const wDiff = this.state.customWidth * 0.05
                if (ev.deltaY > 0) {
                    this.setState({
                        customWidth: this.state.customWidth + wDiff,
                        customHeight: this.state.customHeight + hDiff,
                        left: this.state.left - wDiff / 2,
                        top: this.state.top - hDiff / 2,
                    })
                } else if (ev.deltaY < 0) {
                    this.setState({
                        customWidth: this.state.customWidth - wDiff,
                        customHeight: this.state.customHeight - hDiff,
                        left: this.state.left + wDiff / 2,
                        top: this.state.top + hDiff / 2,
                    })
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
            this.setState({
                top: this.img.offsetTop - pos2,
                left: this.img.offsetLeft - pos1
            })
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