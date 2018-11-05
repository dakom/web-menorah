import WebFont from "webfontloader";

export const loadFonts = (families:Array<string>) => new Promise(resolve => {
    WebFont.load({
        google: { families },
        active: resolve    
    })
})
