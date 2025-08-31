export function movetooltip(X, Y, checkHidden = false) {
    const cursorTooltip = document.getElementById('cursorTooltip');
    if (checkHidden && cursorTooltip.hidden)
    return;

    cursorTooltip.originX = X;
    cursorTooltip.originY = Y;

    adjustTooltipSize();
}

export function adjustTooltipSize() {
    const cursorTooltip = document.getElementById('cursorTooltip');
    const X = cursorTooltip.originX ?? 0;
    const Y = cursorTooltip.originY ?? 0;

    let scale = 1;
    if (cursorTooltip.offsetWidth + 24 > window.innerWidth)
        scale = (window.innerWidth - 24) / cursorTooltip.offsetWidth;
    cursorTooltip.style.transform = `scale(${scale})`;

    let leftOffset = (X + cursorTooltip.offsetWidth + 12) > window.innerWidth ? window.innerWidth - cursorTooltip.offsetWidth - 12 : X + 5;
    leftOffset = Math.max(leftOffset, 12);

    let upOffset = Y + 2;
    if (Y > (window.innerHeight / 2)) {
        upOffset = Y - cursorTooltip.offsetHeight - 2;
        cursorTooltip.style.transformOrigin = `bottom left`;
    } else
        cursorTooltip.style.transformOrigin = `top left`;
    
    cursorTooltip.style.top = `${upOffset}px`;
    cursorTooltip.style.left = `${leftOffset}px`;
} 

export function hideHoverAbilityTooltip(containerId = "cursorTooltip") {
    const container = document.getElementById(containerId);

    container.hidden = true;
    container.innerHTML = "";
}

export function clamp(number, min, max) {

    return Math.max(min, Math.min(number, max));

}

export function shortenText(text, maxChars, replaceEndWith = "...") {

    if (text.length <= maxChars || maxChars < 1 || text.length < 2)
        return text;

    if (replaceEndWith.length >= text.length)
        replaceEndWith = replaceEndWith.substring(0, text.length);

    return text.substring(0, maxChars - replaceEndWith.length) + replaceEndWith;
}

export function enforceMinMax(inputElementID, min, max) {

    const inputElement = document.getElementById(inputElementID);

    if (inputElement == null)
        return;

    min = isNaN(Number(min)) ? null : Number(min);
    max = isNaN(Number(max)) ? null : Number(max);

    if (document.readyState === "complete" || document.readyState === "loaded") {

        if (min != null)
            inputElement.min = min;

        if (max != null)
            inputElement.max = max;

        inputElement.addEventListener('change', (e) => {
    
            if (inputElement.hasAttribute('min'))
                inputElement.value = Math.max(inputElement.value, inputElement.min);
    
            if (inputElement.hasAttribute('max'))
                inputElement.value = Math.min(inputElement.value, inputElement.max);
    
        }, true)

    } else {

        document.addEventListener("DOMContentLoaded", () => {

            if (min != null)
                inputElement.min = min;

            if (max != null)
                inputElement.max = max;

            inputElement.addEventListener('change', (e) => {
        
                if (inputElement.hasAttribute('min'))
                    inputElement.value = Math.max(inputElement.value, inputElement.min);

                if (inputElement.hasAttribute('max'))
                    inputElement.value = Math.min(inputElement.value, inputElement.max);
        
            }, true)

        });
   }
}

export function showSmallToast(innerHTML = "I'm a toast!", autohide = true, hideDelay = 5000, id = 'smallToast') {

    const container = document.getElementById(id);
    if(container == null)
        return;

    container.querySelector('.toast-body').innerHTML = innerHTML;

    const toast = bootstrap.Toast.getOrCreateInstance( container, {'autohide': autohide, 'delay': autohide ? hideDelay : null} );
    toast.show();
}

const TAPLENGTH = 250;
const SWIPEMINDISTANCE = 30;
export class TouchProcessor{

    lastTap = 0;

    taplength = 250;

    swipemindistance = 30;
    
    startX;
    startY;

    singeTapTimeout;

    constructor({taplength = TAPLENGTH, swipemindistance = SWIPEMINDISTANCE} = {}) {
        this.taplength = isNaN(Number(taplength)) ? TAPLENGTH : Math.max(Number(taplength), 0);
        this.swipemindistance = isNaN(Number(swipemindistance)) ? SWIPEMINDISTANCE : Math.max(Number(swipemindistance), 0);
    }

    processTouch(event, singleTapCallback = (e) => {}, doubleTapCallback = (e) => {},
        holdStartCallback = (e) => {}, holdMoveCallback = (e) => {}, holdEndCallback = (e) => {},
        swipeStartCallback = (e) => {}, swipeMoveCallback = (e) => {}, swipeEndCallback = (e) => {}) {

        if (this.singeTapTimeout != null) {
            clearTimeout(this.singeTapTimeout);
            this.singeTapTimeout = null;
        }

        const currentTime = new Date().getTime();
        const timeSinceLastTap = currentTime - this.lastTap;

        if (timeSinceLastTap < TAPLENGTH && timeSinceLastTap > 0) {
            event.preventDefault();
            doubleTapCallback(event);
        } else {

            const target = event.target;
            this.startX = event.touches[0].clientX;
            this.startY = event.touches[0].clientY;

            let touchmove;
            let touchmoveElectricBoogaloo;
            let touchend;

            let processor = this;

            target.addEventListener("touchmove", touchmove = function(e) {

                const deltaX = e.changedTouches[0].clientX - processor.startX;
                const deltaY = e.changedTouches[0].clientY - processor.startY;

                if (deltaX ** 2 + deltaY ** 2 >= processor.swipemindistance ** 2){

                    if (holdTimeout) {
                        clearTimeout(holdTimeout);
                        holdTimeout = null;
                    }
                    target.removeEventListener("touchend", touchend);
                    target.removeEventListener("touchmove", touchmove);

                    swipeStartCallback(event);
                    target.addEventListener("touchmove", touchmoveElectricBoogaloo = function(e) {
                        swipeMoveCallback(e);
                    }, {passive: true});
                    target.addEventListener("touchend", (e) => {
                        target.removeEventListener("touchmove", touchmoveElectricBoogaloo);
                        swipeEndCallback(e);
                    }, {once: true});

                }
            }, {passive: true});

            let holdTimeout = setTimeout(
                () => {
                    target.removeEventListener("touchend", touchend);
                    target.removeEventListener("touchmove", touchmove);
                    holdStartCallback(event);
                    target.addEventListener("touchmove", (e) => holdMoveCallback(e), {passive: true});
                    target.addEventListener("touchend", (e) => {
                        holdEndCallback(e);
                        target.removeEventListener("touchmove", (e) => holdMoveCallback(e), {passive: true});
                    }, {once: true});
                },
                TAPLENGTH
            );

            target.addEventListener("touchend", touchend = function() {
                if (holdTimeout) {
                    clearTimeout(holdTimeout);
                    holdTimeout = null;
                }
                target.removeEventListener("touchmove", touchmove);

                const currentTime = new Date().getTime();

                processor.singeTapTimeout = setTimeout(
                    () => {
                    singleTapCallback(event);
                    processor.singeTapTimeout = null;
                    },
                    TAPLENGTH + processor.lastTap - currentTime
                );
            }, {once: true});
        }
        this.lastTap = currentTime;
    }

    touchmove(e) {
        const deltaX = e.changedTouches[0].clientX - this.startX;
        const deltaY = e.changedTouches[0].clientY - this.startY;

        if (deltaX ** 2 + deltaY ** 2 >= this.swipemindistance ** 2){

            if (holdTimeout) {
                clearTimeout(holdTimeout);
                holdTimeout = null;
            }
            target.removeEventListener("touchend", touchend);
            target.removeEventListener("touchmove", touchmove);

            swipeStartCallback(event);
            target.addEventListener("touchmove", touchmoveElectricBoogaloo = function(e) {
                swipeMoveCallback(e);
            }, {passive: true});
            target.addEventListener("touchend", (e) => {
                target.removeEventListener("touchmove", touchmoveElectricBoogaloo);
                swipeEndCallback(e);
            }, {once: true});

        }
    }
}

export const codeDictionaryGenericSymbols = {
    'mana' : '§b✺',

    'damage' : '§c⚔',
    'neuteral' : '§6✣',
    'earth' : '§2✤',
    'thunder' : '§e✦',
    'water' : '§b❉',
    'fire' : '§c✹',
    'air' : '§f❋',

    'effect' : '§e✧',
    'duration' : '§d⌛',
    'AoE' : '§3☀',
    'range' : '§a➼',
    'cooldown' : '§3⌚',
    'heal' : '§d❤',
    'blindness' : '§c⬣',
    'slowness' : '§c⬤',
};
export const codeDictionaryClassSymbols = {
    'focus' : '§e➽',

    'winded' : '§b≈',
    'dilation' : '§3➲',

    'resistance' : '§a❁',
    'corrupted' : '§4☠',
    'armorbreak' : '§c✃',
    'sacred' : '§6✧',
    'provoke' : '§4💢',
    'invincibility' : '§b☗',

    'puppet' : '§6⚘',
    'whipped' : '§6⇶',
    'awakened' : '§f♚',
    'bloodpool' : '§4⚕',
    'bleeding' : '§c',

    'old clones' : '§5',
    'marked' : '§c✜',
    'mirror clone' : '§#c267f7',
    'mirage clone' : '§#f5cfff',
    'shadow clone' : '§#d84c4c',
    'tricks' : '§#6afa65',
    'confused' : '§#e1dca4',
    'contaminated' : '§#94a771',
    'enkindled' : '§#ff8e8e',
    'noxious' : '§#eb3dfe',
    'drained' : '§#a1fad9',
};
export const codeDictionaryCommonAbilityAttributes = {
    
    'manacost' : ['§b✺', '\n§b✺ §7Mana Cost: §f_'],

    'damage' : ['§c⚔', '\n§c⚔ §7Total Damage: §f_% §8(of your DPS)'],
    'neuteral' : ['§6✣', '\n   §8(§6✣ §8Damage: _%)'],
    'earth' : ['§2✤', '\n   §8(§2✤ §8Earth: _%)'],
    'thunder' : ['§e✦', '\n   §8(§e✦ §8Thunder: _%)'],
    'water' : ['§b❉', '\n   §8(§b❉ §8Water: _%)'],
    'fire' : ['§c✹', '\n   §8(§c✹ §8Fire: _%)'],
    'air' : ['§f❋', '\n   §8(§f❋ §8Air: _%)'],
    
    'effect' : ['§e✧', '\n§e✧ §7Effect: §f_'],
    'duration' : ['§d⌛', '\n§d⌛ §7Duration: §f_s'],
    'range' : ['§a➼', '\n§a➼ §7Range: §f_ Blocks'],
    'AoE' : ['§3☀', '\n§3☀ §7Area of Effect: §f_ Blocks §7(Circle-Shaped)'],
    'cooldown' : ['§3⌚', '\n§3⌚ §7Cooldown: §f_s'],

};

export const codeDictionaryColor = {
    '0' : '#000000',
    '1' : '#0000AA',
    '2' : '#00AA00',
    '3' : '#00AAAA',
    '4' : '#AA0000',
    '5' : '#AA00AA',
    '6' : '#FFAA00',
    '7' : '#AAAAAA',
    '8' : '#555555',
    '9' : '#5555FF',
    'a' : '#55FF55',
    'b' : '#55FFFF',
    'c' : '#FF5555',
    'd' : '#FF55FF',
    'e' : '#FFFF55',
    'f' : '#FFFFFF',
    'r' : null,
    'g' : '#87DD47',
    'h' : '#FFE14D',
    'i' : '#F747C2',
    'j' : '#99E9FF',
    'k' : '#FF4545',
};
export const codeDictionaryDecoration = {
    'm' : 'line-through',
    'n' : 'underline',
};
export const codeDictionaryStyle = {
    'l' : 'fw-bold',
    'o' : 'fst-italic',
};
export const minecraftDelimiters = {'§' : true, '&' : true};
export const preferredDelimiter = '§';

export function splitByColorFormats(string) {

    let result =
        [
            {
                color : null,
                content : ''
            }
        ];

    if (string.length == 0)
        return result;

    let i = 0;
    for (i; i < string.length; i++) {

        let char = string[i];

        if (!minecraftDelimiters[char]) {
            result[result.length - 1]['content'] += char;
            continue;
        }

        i++;
        if (i >= string.length)
            continue;

        let code = string[i];
        
        if (code in codeDictionaryColor)
            result.push( {color : code, content : ''} );

        else if (code == '#' && string.length - i >= 7) {
            const endOfColorCode = i + 6;
            for (i; i < endOfColorCode; i++) {
                code += string[i + 1];
            }
            result.push( {color : code, content : ''} );

        } else
            result[result.length - 1]['content'] += char + code;
    }
    
    return result;

}

export function splitByOtherFormats(string = '') {

    let result =
        [
            {
                decoration : null,
                style : null,
                content : ''
            }
        ];

    if (string.length == 0)
        return result;
    
    let i = 0;
    for (i; i < string.length - 1; i++) {

        const char = string[i];
        
        if (!minecraftDelimiters[char]) {

            result[result.length - 1]['content'] += char;
            continue;

        }
        
        i++;
        const code = string[i];
        
        if (code in codeDictionaryStyle)
            result.push( {style : code, content : ''} );

        else if (code in codeDictionaryDecoration)
            result.push( {decoration : code, content : ''} );
    }
    if (i < string.length && !minecraftDelimiters[string[string.length - 1]])
        result[result.length - 1]['content'] += string[string.length - 1];
    
    return result;

}

export function stripMinecraftFormatting(text = "") {

    let result = '';

    const colorSplitArr = splitByColorFormats(text);
    
    colorSplitArr.forEach( colorSplit => {
        
        const formatSplitArr = splitByOtherFormats(colorSplit['content']);
        
        formatSplitArr.forEach( formatSplit => {

            result += formatSplit['content'];
        });
    });
    
    return result;
}

export function convertToMinecraftTooltip(text, outputFieldID) {
    const outputField = document.getElementById(outputFieldID);
    if (outputField != null)
        outputField.innerHTML = minecraftToHTML(text);
}

export function insertStringBeforeSelected(insertString) {

    const activeElement = document.activeElement;
    if (!activeElement || !(activeElement.type == 'textarea' || activeElement.type == 'text')) {
        return;
    }

    if (activeElement.maxLength != null && activeElement.value.length + insertString.length > activeElement.maxLength) {
        return;
    }

    const currentValue = activeElement.value;
    const cursorPosition = activeElement.selectionStart;

    activeElement.value = currentValue.substring(0, cursorPosition) + insertString + currentValue.substring(cursorPosition, currentValue.length);

    activeElement.selectionStart = cursorPosition + insertString.length;
    activeElement.selectionEnd = activeElement.selectionStart;

    activeElement.dispatchEvent(new Event('input'));
}

export function minecraftToHTML(text = "") {

    let result = '';

    const colorSplitArr = splitByColorFormats(text);

    colorSplitArr.forEach(colorSplit => {

        let pendingContent = '';

        let spansToClose = 0;
        let pendingTextDecorations = {};
        let pendingTextStyles = {};

        const formatSplitArr = splitByOtherFormats(colorSplit['content']);

        formatSplitArr.forEach(formatSplit => {

            const decoration = formatSplit['decoration'];
            const style = formatSplit['style'];
            const content = formatSplit['content'];

            if (decoration != null && codeDictionaryDecoration[decoration] != null)
                pendingTextDecorations[decoration] = true;

            if (style != null && codeDictionaryStyle[style] != null)
                pendingTextStyles[style] = true;

            if (content == null || content == '')
                return;


            pendingContent += '<span';
            spansToClose++;
            const decorations = Object.keys(pendingTextDecorations);
            const styles = Object.keys(pendingTextStyles);
            pendingTextDecorations = {};
            pendingTextStyles = {};
            const bUseDecorations = decorations.length > 0;
            const bUseStyles = styles.length > 0;

            if (bUseDecorations) {
                pendingContent += ' style="text-decoration:';

                for (let decoration of decorations)
                    pendingContent += ' ' + codeDictionaryDecoration[decoration];

                pendingContent += '; text-decoration-thickness: 2px;"';
            }

            if (bUseStyles) {
                pendingContent += ' class="';
                for (let style of styles)
                    pendingContent += ' ' + codeDictionaryStyle[style];
                pendingContent += '"';
            }

            pendingContent += `>${anyToHTML(content)}`;

        });


        if (pendingContent.length == 0)
            return;

        const color = colorSplit['color'];

        if (color != null)
            if (codeDictionaryColor[color] != null)
                result += `<span style="color:${codeDictionaryColor[color]}">`;

            else
                result += `<span style="color:${sanitizeHTML(color)}">`;

        else
            result += '<span>';

        result += pendingContent;

        for (spansToClose; spansToClose >= 0; spansToClose--)
            result += '</span>';

    });

    return result;
}

export function sanitizeHTML(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function anyToHTML(text = "") {
    return sanitizeHTML(text).replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/ /g, '&nbsp;').replace(/-/g, '-&#8288;');
}