import { defaultConfig } from "../global";

export default new class {
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