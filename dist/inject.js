/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 63:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".--auto-fullscreen-contianer{z-index:999999;position:fixed;top:0px;height:100vh;width:100vw;background-color:rgba(0,0,0,0.8);user-select:none}.--auto-fullscreen-contianer.fit-viewport{overflow:hidden;display:flex;justify-content:center;align-items:center}.--auto-fullscreen-contianer.fit-viewport img.fullscreen-image{object-fit:contain}.--auto-fullscreen-contianer.fit-viewport img.fullscreen-image.horizontal{width:100vw;height:100vh}.--auto-fullscreen-contianer.fit-viewport img.fullscreen-image.vertical{width:100vh;height:100vw}.--auto-fullscreen-contianer.custom-size{overflow:auto}.--auto-fullscreen-contianer.custom-size img.fullscreen-image{position:relative;display:block;cursor:move}.--auto-fullscreen-contianer .--fullscreen-image-tools-container{overflow:hidden;position:fixed;top:0;width:70px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-evenly}.--auto-fullscreen-contianer .--fullscreen-image-tools-container.show-button{animation-name:show-button;animation-duration:0.5s;animation-fill-mode:forwards}.--auto-fullscreen-contianer .--fullscreen-image-tools-container.hide-button{animation-name:hide-button;animation-duration:2s;animation-fill-mode:forwards}.--auto-fullscreen-contianer .--fullscreen-image-tools-container svg{width:50px;height:50px;fill:white;cursor:pointer}.--auto-fullscreen-contianer .--fullscreen-image-tools-container svg:hover{fill:red}overlay-root.--auto-fullscreen-overlay-root target-overlay{cursor:pointer;position:absolute;opacity:0.5;background-color:#f66;z-index:999999;display:flex;justify-content:center;align-items:center;text-align:center;overflow-wrap:anywhere}overlay-root.--auto-fullscreen-overlay-root target-overlay:hover{opacity:0.9}@keyframes show-button{from{padding-left:70px}to{padding-left:0px}}@keyframes hide-button{from{padding-left:0px}30%{padding-left:0px}to{padding-left:70px}}\n", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 645:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ 379:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 200:
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M11 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H11a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zm1 2v8h8v-8h-8zm-6-.414l1.828-1.829 1.415 1.415L5 14.414.757 10.172l1.415-1.415L4 10.586V8a5 5 0 0 1 5-5h4v2H9a3 3 0 0 0-3 3v2.586z\"></path></svg>"

/***/ }),

/***/ 62:
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M20 10.586l1.828-1.829 1.415 1.415L19 14.414l-4.243-4.242 1.415-1.415L18 10.586V8a3 3 0 0 0-3-3h-4V3h4a5 5 0 0 1 5 5v2.586zM13 9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h10zm-1 2H4v8h8v-8z\"></path></svg>"

/***/ }),

/***/ 290:
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z\"></path></svg>"

/***/ }),

/***/ 521:
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M20 3h2v6h-2V5h-4V3h4zM4 3h4v2H4v4H2V3h2zm16 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z\"></path></svg>"

/***/ }),

/***/ 770:
/***/ ((module) => {

module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z\"></path></svg>"

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/************************************************************************/
(() => {
"use strict";

// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(379);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/inject/style.scss
var style = __webpack_require__(63);
;// CONCATENATED MODULE: ./src/inject/style.scss

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = injectStylesIntoStyleTag_default()(style/* default */.Z, options);



/* harmony default export */ const inject_style = (style/* default.locals */.Z.locals || {});
;// CONCATENATED MODULE: ./src/global.ts
const defaultConfig = {
    widthLowerBound: 100,
    heightLowerBound: 100,
    areaIgnorePercentage: 0.4,
    hotkeyCtrl: true,
    hotkeyAlt: true,
    hotKey: ']',
    hotkeyEnable: true,
    matchList: [
        {
            match: 'example.com',
            selector: 'img.target',
            isEnabled: true,
        },
    ],
};

;// CONCATENATED MODULE: ./src/inject/StateHandler.ts

/* harmony default export */ const StateHandler = (new class {
    constructor() {
        this.registerExitStep = (step) => {
            this.exitSteps.push(step);
            this.state = 'on';
        };
        this.exit = () => {
            for (const step of this.exitSteps)
                step();
            this.exitSteps = [];
            this.state = 'off';
        };
        this.config = defaultConfig;
        this.state = 'off';
        this.exitSteps = [];
    }
});

// EXTERNAL MODULE: ./src/inject/resource/close.svg
var resource_close = __webpack_require__(290);
var close_default = /*#__PURE__*/__webpack_require__.n(resource_close);
// EXTERNAL MODULE: ./src/inject/resource/clockwise.svg
var clockwise = __webpack_require__(62);
var clockwise_default = /*#__PURE__*/__webpack_require__.n(clockwise);
// EXTERNAL MODULE: ./src/inject/resource/anticlockwise.svg
var anticlockwise = __webpack_require__(200);
var anticlockwise_default = /*#__PURE__*/__webpack_require__.n(anticlockwise);
// EXTERNAL MODULE: ./src/inject/resource/fullscreen-exit.svg
var fullscreen_exit = __webpack_require__(770);
var fullscreen_exit_default = /*#__PURE__*/__webpack_require__.n(fullscreen_exit);
// EXTERNAL MODULE: ./src/inject/resource/fit-viewport.svg
var fit_viewport = __webpack_require__(521);
var fit_viewport_default = /*#__PURE__*/__webpack_require__.n(fit_viewport);
;// CONCATENATED MODULE: ./src/inject/FullscreenImage.ts






class FullscreenImage {
    constructor(target) {
        this.container = document.createElement('div');
        this.img = document.createElement('img');
        this.toolsContainer = document.createElement('div');
        this.close = createSVGNode((close_default()));
        this.routateAnticlockwise = createSVGNode((anticlockwise_default()));
        this.routateClockwise = createSVGNode((clockwise_default()));
        this.exitFitViewport = createSVGNode((fullscreen_exit_default()));
        this.fitViewport = createSVGNode((fit_viewport_default()));
        this.state = {
            showToolbar: false,
            viewMode: 'fit-viewport',
            rotateDegree: 0,
            // scale: 1,
            customWidth: 0,
            customHeight: 0,
            top: 0,
            left: 0,
        };
        this.setState = (state) => {
            const newState = { ...this.state, ...state };
            if (newState.viewMode === 'fit-viewport') {
                this.container.classList.add('fit-viewport');
                this.container.classList.remove('custom-size');
                this.fitViewport.remove();
                this.toolsContainer.appendChild(this.exitFitViewport);
                this.img.style.width = '';
                this.img.style.height = '';
                this.img.style.top = '';
                this.img.style.left = '';
            }
            else if (newState.viewMode === 'custom-size') {
                this.container.classList.remove('fit-viewport');
                this.container.classList.add('custom-size');
                this.exitFitViewport.remove();
                this.toolsContainer.appendChild(this.fitViewport);
                this.img.style.top = `${newState.top}px`;
                this.img.style.left = `${newState.left}px`;
                this.img.style.width = `${newState.customWidth}px`;
                this.img.style.height = `${newState.customHeight}px`;
            }
            this.img.style.transform = `rotate(${newState.rotateDegree}deg)`;
            // toolbar
            this.toolsContainer.classList.toggle('hide-button', !newState.showToolbar);
            this.toolsContainer.classList.toggle('show-button', newState.showToolbar);
            const scrollbarWidth = this.container.offsetWidth - this.container.clientWidth;
            const scrollbarHeight = this.container.offsetHeight - this.container.clientHeight;
            this.toolsContainer.style.right = `${scrollbarWidth}px`;
            this.toolsContainer.style.height = `calc(100% - ${scrollbarHeight}px)`;
            this.img.classList.toggle('horizontal', newState.rotateDegree === 0 || newState.rotateDegree === 180);
            this.img.classList.toggle('vertical', newState.rotateDegree === 90 || newState.rotateDegree === 270);
            this.state = newState;
        };
        this.addClassName = () => {
            this.container.className = '--auto-fullscreen-contianer';
            this.img.className = 'fullscreen-image';
            this.toolsContainer.className = '--fullscreen-image-tools-container';
        };
        this.addEventHandler = () => {
            this.routateAnticlockwise.onclick = () => {
                const rotateDegree = (this.state.rotateDegree - 90) % 360;
                this.setState({ rotateDegree });
            };
            this.routateClockwise.onclick = () => {
                const rotateDegree = (this.state.rotateDegree + 90) % 360;
                this.setState({ rotateDegree });
            };
            this.exitFitViewport.onclick = () => {
                this.setState({
                    viewMode: 'custom-size',
                    top: (window.innerHeight - this.img.naturalHeight) / 2,
                    left: (window.innerWidth - this.img.naturalWidth) / 2,
                    customHeight: this.img.naturalHeight,
                    customWidth: this.img.naturalWidth,
                });
            };
            this.fitViewport.onclick = () => {
                this.setState({
                    viewMode: 'fit-viewport',
                    customHeight: this.img.naturalHeight,
                    customWidth: this.img.naturalWidth,
                });
            };
            const closeImage = () => this.container.remove();
            StateHandler.registerExitStep(closeImage);
            this.close.onclick = StateHandler.exit;
            this.toolsContainer.addEventListener('mouseover', ev => {
                this.setState({ showToolbar: true });
            });
            this.toolsContainer.addEventListener('mouseleave', ev => {
                this.setState({ showToolbar: false });
            });
            // zoom
            this.img.addEventListener('wheel', ev => {
                ev.preventDefault();
                if (this.state.viewMode === 'custom-size') {
                    const hDiff = this.state.customHeight * 0.05;
                    const wDiff = this.state.customWidth * 0.05;
                    if (ev.deltaY > 0) {
                        this.setState({
                            customWidth: this.state.customWidth + wDiff,
                            customHeight: this.state.customHeight + hDiff,
                            left: this.state.left - wDiff / 2,
                            top: this.state.top - hDiff / 2,
                        });
                    }
                    else if (ev.deltaY < 0) {
                        this.setState({
                            customWidth: this.state.customWidth - wDiff,
                            customHeight: this.state.customHeight - hDiff,
                            left: this.state.left + wDiff / 2,
                            top: this.state.top + hDiff / 2,
                        });
                    }
                }
            });
            // drag image
            let pos1;
            let pos2;
            let pos3;
            let pos4;
            const handleImageDrag = (ev) => {
                pos1 = pos3 - ev.clientX;
                pos2 = pos4 - ev.clientY;
                pos3 = ev.clientX;
                pos4 = ev.clientY;
                this.setState({
                    top: this.img.offsetTop - pos2,
                    left: this.img.offsetLeft - pos1
                });
            };
            this.img.addEventListener('mousedown', ev => {
                ev.preventDefault();
                pos3 = ev.clientX;
                pos4 = ev.clientY;
                this.img.addEventListener('mousemove', handleImageDrag);
                document.addEventListener('mouseup', ev => {
                    this.img.removeEventListener('mousemove', handleImageDrag);
                }, { once: true });
            });
        };
        this.arrangeDOM = () => {
            document.body.appendChild(this.container);
            this.container.appendChild(this.img);
            this.container.appendChild(this.toolsContainer);
            this.toolsContainer.appendChild(this.close);
            this.toolsContainer.appendChild(this.routateAnticlockwise);
            this.toolsContainer.appendChild(this.routateClockwise);
            this.toolsContainer.appendChild(this.exitFitViewport);
        };
        if (target instanceof HTMLImageElement)
            this.img.src = target.src;
        else
            this.img.src = target;
        this.state.customHeight = this.img.naturalHeight;
        this.state.customWidth = this.img.naturalWidth;
        this.originalBodyStyle = document.body.style.cssText;
        document.body.style.cssText = 'overflow: hidden !important';
        StateHandler.registerExitStep(() => {
            document.body.style.cssText = this.originalBodyStyle;
        });
        this.addClassName();
        this.addEventHandler();
        this.arrangeDOM();
        this.setState(this.state);
    }
}
function createSVGNode(svgString) {
    const template = document.createElement('template');
    template.innerHTML = svgString;
    return template.content.firstChild;
}

;// CONCATENATED MODULE: ./src/inject/util.ts
function appendStyleNode(cssRules) {
    const styleNode = document.createElement('style');
    styleNode.appendChild(document.createTextNode(cssRules));
    document.head.appendChild(styleNode);
    return styleNode;
}
/**
 * Create a script tag and inject it into the document.
 * ref: https://intoli.com/blog/sandbox-breakout/
 */
function runInPageContext(func) {
    const scriptContent = `
        (${func.toString()})();
        document.currentScript.remove();
    `;
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = scriptContent;
    document.documentElement.prepend(scriptElement);
}
function concatCSSRuleMap(CSSRuleMap) {
    let res = '';
    CSSRuleMap.forEach((val, ruleName) => {
        res += `${ruleName}: ${val};`;
    });
    return res;
}

;// CONCATENATED MODULE: ./src/inject/setVideoFullScreen.ts


function setVideoFullScreen(target) {
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
    `);
    StateHandler.registerExitStep(() => styleNode.remove());
    const originalStyleMap = new Map();
    for (const styleName of target.style) {
        const priority = target.style.getPropertyPriority(styleName) === 'important' ? '!important' : '';
        originalStyleMap.set(styleName, `${target.style.getPropertyValue(styleName)} ${priority}`.trim());
    }
    StateHandler.registerExitStep(() => {
        target.style.cssText = concatCSSRuleMap(originalStyleMap);
    });
    const CSSRuleMap = new Map([
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
    ]);
    const fullscreenCssText = concatCSSRuleMap(CSSRuleMap);
    target.style.cssText = fullscreenCssText;
    target.focus();
    const obConfig = {
        attributes: true,
        childList: false,
        subtree: false,
        attributeFilter: ['style']
    };
    const ob = new MutationObserver((mutations, observer) => {
        observer.disconnect();
        // detect style change and save to originalStyleMap
        for (const styleName of target.style) {
            const val = target.style.getPropertyValue(styleName);
            const isImportant = target.style.getPropertyPriority(styleName);
            const concatVal = `${val} ${isImportant ? '!important' : ''}`.trim();
            if (CSSRuleMap.has(styleName)) {
                if (CSSRuleMap.get(styleName) === concatVal)
                    continue;
                else
                    originalStyleMap.set(styleName, concatVal);
            }
            else {
                originalStyleMap.set(styleName, concatVal);
            }
        }
        target.style.cssText = fullscreenCssText;
        observer.observe(target, obConfig);
    });
    ob.observe(target, obConfig);
    StateHandler.registerExitStep(() => ob.disconnect());
    if (target.getAttribute('controls') === null) {
        /** use this type to prevent ts compile error */
        const hookedVideo = target;
        const handleClick = (ev) => {
            if (ev.target == hookedVideo) {
                if (hookedVideo.paused)
                    hookedVideo.play('fullscreen');
                else
                    hookedVideo.pause('fullscreen');
                ev.preventDefault();
            }
        };
        const handleSpacePress = (ev) => {
            if (ev.key == 'Space') {
                if (hookedVideo.paused)
                    hookedVideo.play('fullscreen');
                else
                    hookedVideo.pause('fullscreen');
                ev.preventDefault();
            }
        };
        const handleContextmenu = (ev) => {
            if (ev.target === target) {
                ev.stopPropagation();
            }
        };
        document.addEventListener('click', handleClick, { capture: true });
        document.addEventListener('keyup', handleSpacePress);
        document.addEventListener('contextmenu', handleContextmenu, { capture: true });
        StateHandler.registerExitStep(() => {
            document.removeEventListener('click', handleClick, { capture: true });
            document.removeEventListener('keyup', handleSpacePress);
            document.removeEventListener('contextmenu', handleContextmenu, { capture: true });
        });
        runInPageContext(hookMediaPrototype);
        StateHandler.registerExitStep(() => runInPageContext(() => {
            window['___$recoverHook___']();
        }));
        target.setAttribute('controls', '');
        StateHandler.registerExitStep(() => target.removeAttribute('controls'));
    }
}
/**
 * run as injected <script> element
 * hook the play/pause method to prevent conflict
 */
function hookMediaPrototype() {
    var _a;
    const mediaProto = HTMLMediaElement.prototype;
    const playNative = mediaProto.play;
    mediaProto.play = function (source) {
        if (source === 'fullscreen')
            playNative.call(this);
    };
    const pauseNative = mediaProto.pause;
    mediaProto.pause = function (source) {
        if (source === 'fullscreen')
            pauseNative.call(this);
    };
    const removeAttributeNative = mediaProto.removeAttribute;
    mediaProto.removeAttribute = function (attr) {
        if (attr === 'controls')
            return;
        else
            removeAttributeNative.call(this, attr);
    };
    const setNative = (_a = Object.getOwnPropertyDescriptor(mediaProto, 'controls')) === null || _a === void 0 ? void 0 : _a.set;
    Object.defineProperty(mediaProto, 'controls', { set: function () { return; } });
    window['___$recoverHook___'] = () => {
        mediaProto.play = playNative;
        mediaProto.pause = pauseNative;
        mediaProto.removeAttribute = removeAttributeNative;
        Object.defineProperty(mediaProto, 'controls', { set: setNative });
    };
}

;// CONCATENATED MODULE: ./src/inject/FullscreenCanvas.ts


class FullscreenCanvas {
    constructor(target) {
        this.fullscreenRules = new Map([
            ['position', 'fixed !important'],
            ['zIndex', '99999 !important'],
            ['visibility', 'visible !important'],
            ['margin', '0 !important'],
            ['padding', '0 !important'],
            ['opacity', '1 !important'],
        ]);
        this.originalTargetStyle = new Map();
        this.hideRestElements = () => {
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
        `);
            StateHandler.registerExitStep(() => {
                styleNode.remove();
            });
        };
        this.target = target;
        // store original style
        for (const styleName of this.target.style) {
            const priority = this.target.style.getPropertyPriority(styleName) === 'important' ? '!important' : '';
            this.originalTargetStyle.set(styleName, `${this.target.style.getPropertyValue(styleName)} ${priority}`.trim());
        }
        StateHandler.registerExitStep(() => {
            this.target.style.cssText = concatCSSRuleMap(this.originalTargetStyle);
        });
        // set fullscreen rules
        const { width, height, top, left } = this.computeFullscreenSize(this.target.width, this.target.height);
        this.fullscreenRules.set('width', `${width}px !important`);
        this.fullscreenRules.set('height', `${height}px !important`);
        this.fullscreenRules.set('top', `${top}px !important`);
        this.fullscreenRules.set('left', `${left}px !important`);
        this.target.style.cssText = concatCSSRuleMap(this.fullscreenRules);
        this.hideRestElements();
    }
    computeFullscreenSize(originalWidth, originalHeidgt) {
        const canvasRatio = originalWidth / originalHeidgt;
        const screenRatio = window.innerWidth / window.innerHeight;
        if (canvasRatio > screenRatio) {
            const height = window.innerWidth / canvasRatio;
            return {
                width: window.innerWidth,
                height,
                top: (window.innerHeight - height) / 2,
                left: 0
            };
        }
        else {
            const width = window.innerHeight * canvasRatio;
            return {
                width,
                height: window.innerHeight,
                top: 0,
                left: (window.innerWidth - width) / 2,
            };
        }
    }
}

;// CONCATENATED MODULE: ./src/inject/index.ts

// import zoomInSVG from './resource/zoom-in.svg'
// import zoomOutSVG from './resource/zoom-out.svg'





/*
    Todos:
    detect iframe elements
*/
const fullscreener = new class {
    constructor() {
        this.start = async () => {
            StateHandler.exit();
            const allTargets = await this.getAllTargetElements();
            const remain = this.filterOutByVisibleArea(allTargets);
            let target;
            if (remain.length === 0)
                target = 'canceled';
            else if (remain.length === 1)
                target = remain[0];
            else
                target = await this.waitForManualSelection(remain);
            if (target instanceof HTMLImageElement) {
                new FullscreenImage(target);
            }
            else if (target instanceof HTMLVideoElement) {
                setVideoFullScreen(target);
            }
            else if (target instanceof HTMLCanvasElement) {
                new FullscreenCanvas(target);
            }
            else {
                StateHandler.exit();
            }
        };
        this.getVisibleSize = (entry) => {
            const widthVisible = entry.intersectionRect.right - entry.intersectionRect.left;
            const heightVisible = entry.intersectionRect.bottom - entry.intersectionRect.top;
            const areaVisible = widthVisible * heightVisible;
            return { widthVisible, heightVisible, areaVisible };
        };
        this.getAllTargetElements = () => {
            return new Promise(resolve => {
                const observer = new IntersectionObserver((entries, observer) => {
                    const fullScreenTargets = [];
                    entries.forEach(entry => {
                        if (!entry.isIntersecting)
                            return;
                        const entrySize = this.getVisibleSize(entry);
                        if (entrySize.widthVisible <= StateHandler.config.widthLowerBound ||
                            entrySize.heightVisible <= StateHandler.config.heightLowerBound)
                            return;
                        fullScreenTargets.push({
                            target: entry.target,
                            areaVisible: entrySize.areaVisible,
                        });
                    });
                    observer.disconnect();
                    resolve(fullScreenTargets);
                });
                const allCandidate = document.querySelectorAll('img, video, canvas');
                for (const image of allCandidate) {
                    observer.observe(image);
                }
            });
        };
        this.filterOutByVisibleArea = (targets) => {
            const res = [];
            const areaVisibleMax = Math.max(...targets.map(candidate => candidate.areaVisible));
            targets.forEach(target => {
                if (target.areaVisible > areaVisibleMax * StateHandler.config.areaIgnorePercentage) {
                    res.push(target.target);
                }
            });
            return res;
        };
        this.waitForManualSelection = (targetElements) => {
            return new Promise(resolve => {
                const overlayRoot = document.createElement('overlay-root');
                overlayRoot.className = '--auto-fullscreen-overlay-root';
                document.body.appendChild(overlayRoot);
                // 1. create all overlay
                const overlayDetails = targetElements.map(el => {
                    const targetRect = el.getBoundingClientRect();
                    return {
                        width: targetRect.right - targetRect.left,
                        height: targetRect.bottom - targetRect.top,
                        top: targetRect.top + window.pageYOffset,
                        left: targetRect.left + window.pageXOffset,
                        text: this.createOverlayText(el),
                        target: el,
                        onClick: () => { resolve(el); },
                    };
                });
                // 2. sort by target's z-index, ascending
                overlayDetails.sort((d1, d2) => this.compareZIndex(d1.target, d2.target));
                // 3. filter out overlays with lower z-index and fully covered by other one
                const filtered = overlayDetails.filter((cur, index, all) => {
                    for (let i = index + 1; i < all.length; i++) {
                        const cp = this.overlayContainBy(cur, all[i]);
                        if (cp === 'equal' || cp === all[i])
                            return false;
                    }
                    return true;
                });
                if (filtered.length === 1)
                    resolve(filtered[0].target);
                else {
                    filtered
                        .map(this.createOverlay)
                        .forEach(overlay => overlayRoot.appendChild(overlay));
                    StateHandler.registerExitStep(() => {
                        resolve('canceled');
                        overlayRoot.remove();
                    });
                }
            });
        };
        this.createOverlay = (detail) => {
            const overlay = document.createElement('target-overlay');
            overlay.innerText = detail.text;
            overlay.style.width = `${detail.width}px`;
            overlay.style.height = `${detail.height}px`;
            overlay.style.left = `${detail.left}px`;
            overlay.style.top = `${detail.top}px`;
            overlay.onclick = detail.onClick;
            return overlay;
        };
        this.createOverlayText = (el) => {
            const res = ['Click to maximize'];
            if (el instanceof HTMLImageElement) {
                res.push(`Resolution: ${el.naturalWidth} x ${el.naturalHeight}`);
                res.push(el.src.replace(/^.*\//, ''));
            }
            else if (el instanceof HTMLVideoElement) {
                res.push(`Duration: ${el.duration}s`);
                res.push(el.src);
            }
            return res.join('\n');
        };
        /** return the overlay which contians the other one */
        this.overlayContainBy = (d1, d2) => {
            // TODO: only consider size in viewport
            if (d1 === d2)
                return false;
            if (d1.top === d2.top &&
                d1.left === d2.left &&
                d1.top + d1.height === d2.top + d2.height &&
                d1.left + d1.width === d2.left + d2.width)
                return 'equal';
            else if (d1.top <= d2.top &&
                d1.left <= d2.left &&
                d1.top + d1.height >= d2.top + d2.height &&
                d1.left + d1.width >= d2.left + d2.width)
                return d1;
            else if (d1.top >= d2.top &&
                d1.left >= d2.left &&
                d1.top + d1.height <= d2.top + d2.height &&
                d1.left + d1.width <= d2.left + d2.width)
                return d2;
            else
                return false;
        };
        /** return -1 if e1 has lower z-index than e2 */
        this.compareZIndex = (e1, e2) => {
            const { root, path1, path2 } = this.getNearestCommonAncestor(e1, e2);
            if (root === null)
                throw new Error('getNearestCommonAncestor return null');
            const len1 = path1.length;
            const len2 = path2.length;
            let i = 1;
            // Check z-index from root down to d1.target and d2.target
            while (i <= len1 && i <= len2) {
                const d1Parent = path1[len1 - i];
                const d2Parent = path2[len2 - i];
                const d1Style = getComputedStyle(d1Parent);
                const d2Style = getComputedStyle(d2Parent);
                if (d1Style.zIndex !== 'auto'
                    && d2Style.zIndex !== 'auto') {
                    const zIndex1 = parseInt(d1Style.zIndex);
                    const zIndex2 = parseInt(d2Style.zIndex);
                    if (zIndex1 > zIndex2)
                        return 1;
                    else if (zIndex2 > zIndex1)
                        return -1;
                }
                else if (d1Style.zIndex !== 'auto'
                    && d2Style.zIndex === 'auto') {
                    const zIndex1 = parseInt(d1Style.zIndex);
                    if (zIndex1 > 0)
                        return 1;
                    else if (zIndex1 < 0)
                        return -1;
                }
                else if (d1Style.zIndex === 'auto'
                    && d2Style.zIndex !== 'auto') {
                    const zIndex2 = parseInt(d2Style.zIndex);
                    if (zIndex2 > 0)
                        return -1;
                    else if (zIndex2 < 0)
                        return 1;
                }
                i++;
            }
            // If no z-index found, compare their relative positon in DOM
            if (e1.compareDocumentPosition(e2) & Node.DOCUMENT_POSITION_PRECEDING)
                return 1; // e1 is positioned after e2
            else
                return -1;
        };
        this.getNearestCommonAncestor = (e1, e2) => {
            const path1 = [];
            const path2 = [];
            let cur = e1;
            while (cur) {
                path1.push(cur);
                cur = cur.parentElement;
            }
            cur = e2;
            while (cur) {
                path2.push(cur);
                cur = cur.parentElement;
            }
            const len1 = path1.length;
            const len2 = path2.length;
            let i = 0;
            while (i <= len1 && i <= len2) {
                if (path1[len1 - i] === path2[len2 - i])
                    i++;
                else
                    return {
                        root: path1[len1 - i + 1],
                        path1,
                        path2,
                    };
            }
            return {
                root: null,
                path1,
                path2,
            };
        };
    }
};
const Automation = new class {
    constructor() {
        this.start = async () => {
            for (const matchDetail of StateHandler.config.matchList) {
                // skip disabled rules
                if (!matchDetail.isEnabled)
                    continue;
                if (location.href.match(matchDetail.match)) {
                    if (matchDetail.selector) {
                        const target = await this.waitForElement(matchDetail.selector);
                        if (target instanceof HTMLImageElement) {
                            new FullscreenImage(target);
                        }
                        else if (target instanceof HTMLVideoElement) {
                            setVideoFullScreen(target);
                        }
                        else if (target instanceof HTMLCanvasElement) {
                            new FullscreenCanvas(target);
                        }
                        else {
                            console.log(`Target element: ${matchDetail.selector} not found!`);
                        }
                    }
                    else {
                        await this.waitForDOMLoad();
                        await this.waitForVisible();
                        fullscreener.start();
                    }
                    break; // only the first match applies
                }
            }
        };
        this.waitForElement = (selector) => {
            return new Promise(resolve => {
                let retryCount = 0;
                const handler = setInterval(() => {
                    retryCount += 1;
                    if (retryCount === 30)
                        resolve(false);
                    const target = document.querySelector(selector);
                    if (target instanceof HTMLImageElement ||
                        target instanceof HTMLVideoElement) {
                        clearInterval(handler);
                        resolve(target);
                    }
                }, 1000);
            });
        };
        this.waitForDOMLoad = () => {
            return new Promise(resolve => {
                if (document.readyState == 'complete') {
                    resolve();
                }
                else {
                    window.addEventListener('load', () => resolve());
                }
            });
        };
        this.waitForVisible = () => {
            return new Promise(resolve => {
                if (document.hidden) {
                    document.addEventListener('visibilitychange', () => {
                        resolve();
                    }, { once: true });
                }
                else {
                    resolve();
                }
            });
        };
    }
};
chrome.storage.local.get(Object.keys(defaultConfig), function (result) {
    StateHandler.config = result;
    // add hotkey to exit fullscreen
    document.addEventListener('keyup', function (ev) {
        if (ev.key === StateHandler.config.hotKey &&
            ev.ctrlKey === StateHandler.config.hotkeyCtrl &&
            ev.altKey === StateHandler.config.hotkeyAlt) {
            if (StateHandler.state === 'on')
                StateHandler.exit();
            else
                fullscreener.start();
        }
        else if (ev.key === 'Escape') {
            StateHandler.exit();
        }
    });
    // when the extension icon being clicked
    chrome.runtime.onMessage.addListener(function (msg) {
        if (msg.action === 'fullscreen') {
            if (StateHandler.state === 'on')
                StateHandler.exit();
            else
                fullscreener.start();
        }
    });
    chrome.storage.onChanged.addListener(function (changes) {
        const newConfig = {};
        for (const key in changes) {
            newConfig[key] = changes[key].newValue;
        }
        Object.assign(StateHandler.config, newConfig);
    });
    Automation.start();
});

})();

/******/ })()
;