type VisibleInfo = {
    widthVisible: number;
    heightVisible: number;
    areaVisible: number;
}

type TargetElement = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement

type FullScreenTarget = {
    target: TargetElement;
    areaVisible: number;
}

type MatchDetail = {
    match: string;
    selector?: string;
    isEnabled: boolean;
}

declare module "*.svg" {
    const content: string
    export default content
}

// ref: https://stackoverflow.com/questions/41285211/
type Modify<T, R> = Omit<T, keyof R> & R

type FullScreenVideo = Modify<HTMLMediaElement, {
    play: (source: 'fullscreen') => void;
    pause: (source: 'fullscreen') => void;
}>

type contentScriptMessage = {
    action: 'fullscreen';
}

type Config = {
    widthLowerBound: number;
    heightLowerBound: number;
    areaIgnorePercentage: number;
    hotkeyCtrl: boolean;
    hotkeyAlt: boolean;
    hotKey: string;
    hotkeyEnable: boolean;
    matchList: MatchDetail[];
}
