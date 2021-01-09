type OverlayDetail = {
    width: number;
    height: number;
    left: number;
    top: number;
    text: string;
    target: TargetElement;
    onClick: (ev: MouseEvent) => void;
}

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

type ContentScriptMessage = {
    action: 'fullscreen';
}



type MatchDetail = {
    match: string;
    selector?: string;
    isEnabled: boolean;
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
