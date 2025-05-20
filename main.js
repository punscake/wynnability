function moveTooltip(X, Y, checkHidden = false) {
        const cursorTooltip = document.getElementById('cursorTooltip');
        if (checkHidden && cursorTooltip.hidden == true)
        return;

        let leftOffset = (X + cursorTooltip.offsetWidth + 12) > window.innerWidth ? window.innerWidth - cursorTooltip.offsetWidth - 12 : X + 5;
        leftOffset = Math.max(leftOffset, 12);

        let upOffset = Y > (window.innerHeight / 2) ? Y - cursorTooltip.offsetHeight - 2 : Y + 2;
        
        cursorTooltip.style = `top: ${upOffset}px; left: ${leftOffset}px`;
    }
document.addEventListener('DOMContentLoaded', (e) => {
    //Attaches a div to a cursor, used to display content
    document.addEventListener( 'pointermove', (e) => {moveTooltip(e.clientX, e.clientY, true);} );
    //Makes tooltip disappear on tap
    document.addEventListener( 'touchend', () => {tree.hideHoverAbilityTooltip()});
    document.addEventListener( 'wheel', (e) => tree.hideHoverAbilityTooltip() );
})

function copyFromField(fieldID) {

    const field = document.getElementById(fieldID);
    if (field == null || field.value == null)
        return;

    if (!navigator.clipboard) {
        field.select();
        document.execCommand('copy');
        return;
    }

    navigator.clipboard.writeText(field.value);
    
}

function clamp(number, min, max) {

    return Math.max(min, Math.min(number, max));

}

function shortenText(text, maxChars, replaceEndWith = "...") {

    if (text.length <= maxChars || maxChars < 1 || text.length < 2)
        return text;

    if (replaceEndWith.length >= text.length)
        replaceEndWith = replaceEndWith.substring(0, text.length);

    return text.substring(0, maxChars - replaceEndWith.length) + replaceEndWith;
}

function enforceMinMax(inputElementID, min, max) {

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

function showSmallToast(innerHTML = "I'm a toast!", autohide = true, hideDelay = 5000, id = 'smallToast') {

    const container = document.getElementById(id);
    if(container == null)
        return;

    container.querySelector('.toast-body').innerHTML = innerHTML;

    const toast = bootstrap.Toast.getOrCreateInstance( container, {'autohide': autohide, 'delay': autohide ? hideDelay : null} );
    toast.show();
}

let lastTap = 0;
const TAPLENGTH = 250;
const SWIPEMINDISTANCE = 30;
let startX, startY;
let singeTapTimeout;
function processTouch(event, singleTapCallback = (e) => {}, doubleTapCallback = (e) => {},
    holdStartCallback = (e) => {}, holdMoveCallback = (e) => {}, holdEndCallback = (e) => {},
    swipeStartCallback = (e) => {}, swipeMoveCallback = (e) => {}, swipeEndCallback = (e) => {}) {

    if (singeTapTimeout != null) {
        clearTimeout(singeTapTimeout);
        singeTapTimeout = null;
    }

    const currentTime = new Date().getTime();
    const timeSinceLastTap = currentTime - lastTap;

    if (timeSinceLastTap < TAPLENGTH && timeSinceLastTap > 0) {
        doubleTapCallback(event);
    } else {

        const target = event.target;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;

        let touchend;

        target.addEventListener("touchmove", touchmove = function(e) {

            const deltaX = e.changedTouches[0].clientX - startX;
            const deltaY = e.changedTouches[0].clientY - startY;

            if (deltaX ** 2 + deltaY ** 2 >= SWIPEMINDISTANCE ** 2){

                if (holdTimeout) {
                    clearTimeout(holdTimeout);
                    delete holdTimeout;
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
                delete holdTimeout;
            }
            target.removeEventListener("touchmove", touchmove);

            const currentTime = new Date().getTime();
            const timeSinceLastTap = currentTime - lastTap;

            singeTapTimeout = setTimeout(
                () => {
                singleTapCallback(event);
                singeTapTimeout = null;
                },
                TAPLENGTH + lastTap - currentTime
            );
        }, {once: true});
    }
    lastTap = currentTime;
}

const codeDictionaryGenericSymbols = {
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
const codeDictionaryClassSymbols = {
    'focus' : '§e➽',

    'winded' : '§b≈',
    'dilation' : '§3➲',

    'resistance' : '§a❁',
    'corrupted' : '§4☠',
    'armorbreak' : '§c✃',
    'sacred' : '§6✧',
    'provoke' : '§4💢',
    'invincibility' : '§b☗',

    'marked' : '§c✜',
    'clone' : '§5',

    'puppet' : '§6⚘',
    'whipped' : '§6⇶',
    'awakened' : '§f♚',
    'bloodpool' : '§4⚕',
    'bleeding' : '§c',
};
const codeDictionaryCommonAbilityAttributes = {
    
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

const codeDictionaryColor = {
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
};
const codeDictionaryDecoration = {
    'm' : 'line-through',
    'n' : 'underline',
};
const codeDictionaryStyle = {
    'l' : 'fw-bold',
    'o' : 'fst-italic',
};
const minecraftDelimiters = {'§' : true, '&' : true};
const preferredDelimiter = '§';

function sanitizeHTML(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function splitByColorFormats(string) {

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

function splitByOtherFormats(string = '') {

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

function anyToHTML(text = "") {
    return sanitizeHTML(text).replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/ /g, '&nbsp;').replace(/-/g, '-&#8288;');
}

function minecraftToHTML(text = "") {

    result = '';

    const colorSplitArr = splitByColorFormats(text);
    
    colorSplitArr.forEach( colorSplit => {

        let pendingContent = '';

        let spansToClose = 0;
        let pendingTextDecorations = {};
        let pendingTextStyles = {};
        
        const formatSplitArr = splitByOtherFormats(colorSplit['content']);
        
        formatSplitArr.forEach( formatSplit => {
            
            const decoration = formatSplit['decoration'];
            const style = formatSplit['style'];
            const content = formatSplit['content'];

            if (decoration != null && codeDictionaryDecoration[decoration] != null)
                pendingTextDecorations[ decoration ] = true;

            if (style != null && codeDictionaryStyle[style] != null)
                pendingTextStyles[ style ] = true;

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
                pendingContent += '"'
            }

            pendingContent += `>${anyToHTML(content)}`;

        });

        
        if (pendingContent.length == 0)
            return;

        const color = colorSplit['color'];

        if (color != null)
            if (codeDictionaryColor[color] != null)
                result += `<span style="color:${ codeDictionaryColor[color] }">`;
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

function stripMinecraftFormatting(text = "") {

    result = '';

    const colorSplitArr = splitByColorFormats(text);
    
    colorSplitArr.forEach( colorSplit => {
        
        const formatSplitArr = splitByOtherFormats(colorSplit['content']);
        
        formatSplitArr.forEach( formatSplit => {

            result += formatSplit['content'];
        });
    });
    
    return result;
}

function insertStringBeforeSelected(insertString) {

    const activeElement = document.activeElement;
    if ( !activeElement || !(activeElement.type == 'textarea' || activeElement.type == 'text') ) {
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

function convertToMinecraftTooltip(text, outputFieldID) {
    const outputField = document.getElementById(outputFieldID);
    if (outputField != null)
        outputField.innerHTML = minecraftToHTML(text);
}

const classDictionary = {
    'archer' : 'abilities/class/archer',
    'warrior' : 'abilities/class/warrior',
    'assassin' : 'abilities/class/assassin',
    'mage' : 'abilities/class/mage',
    'shaman' : 'abilities/class/shaman',
}

const abilityIconDictionary = {
    'skill' : 'abilities/class/',
    'red' : 'abilities/generic/red',
    'blue' : 'abilities/generic/blue',
    'purple' : 'abilities/generic/purple',
    'yellow' : 'abilities/generic/yellow',
    'white' : 'abilities/generic/white',
}
const altAbilityIconDictionary = {
    'skill' : 'abilities/class/',
    'magenta' : 'abilities/generic/magenta',
    'red' : 'abilities/generic/red',
    'blue' : 'abilities/generic/blue',
    'purple' : 'abilities/generic/purple',
    'yellow' : 'abilities/generic/yellow',
    'white' : 'abilities/generic/white',
}

const travelIconDictionary = {
    'up' : 'abilities/generic/travel_up_1',
    'down' : 'abilities/generic/travel_down_2',
    'right' : 'abilities/generic/travel_right_3',
    'left' : 'abilities/generic/travel_left_4',
}

const reverseDirectionDictionary = {
    'up' : 'down',
    'down' : 'up',
    'right' : 'left',
    'left' : 'right',
}

function generateIconDiv(type, travelnode = new TravelNode(), classs = "", allocationStatus = 0, bScaleAbilityIcon = false, useAlternativeAbilityIcons = false) {

    let result = document.createElement('div');
    result.classList.add('centered-element-container');

    if (travelnode instanceof TravelNode)
        result.innerHTML = travelnode.generateIconHTML();

    let url = null;

    let iconDictionary = abilityIconDictionary;
    if (useAlternativeAbilityIcons)
        iconDictionary = altAbilityIconDictionary;
  
    if (type == 'skill')
        switch (allocationStatus) {
            case 0:
                url = iconDictionary[type] + classs + '/skill_dark.png';
                break;
            case 1:
                url = iconDictionary[type] + classs + '/skill.png';
                break;
            case 2:
                url = iconDictionary[type] + classs + '/skill_a.png';
                break;
            default:
                break;
        }

    else if (type in iconDictionary)
        switch (allocationStatus) {
            case 0:
                url = iconDictionary[type] + '_dark.png';
                break;
            case 1:
                url = iconDictionary[type] + '.png';
                break;
            case 2:
                url = iconDictionary[type] + '_a.png';
                break;
            default:
                break;
        }
        

    if (url != null) {
        let img = document.createElement('img');

        img.src = url;
        img.style.zIndex = 11;

        if (bScaleAbilityIcon) {
            //img.style.width = getImgScaleForType(type) + `%`;

            // here to guarantee nothing breaks
            img.onload = (e) => {img.style.width = `${img.naturalWidth * 100 / 36}%`};
        }


        result.appendChild(img);
    }

    return result;
}

function getImgScaleForType(type) {
    switch (type) {
        case 'skill': return `122.222`;
        case `magenta`: return `200`;
        case 'purple': return `111.111`;
        case 'red': return `144.444`;
        case 'blue': return `122.222`;
        case `yellow`: return `111.111`;
        case `white`: return '100';
        default: return '100';
    }
}

const POINTSREQUIRED_LOWER = 1;
const POINTSREQUIRED_UPPER = 5;
const POINTSREQUIRED_INPUTID = 'pointsRequiredInput';
enforceMinMax(POINTSREQUIRED_INPUTID, POINTSREQUIRED_LOWER, POINTSREQUIRED_UPPER);

const ARCHETYPEPOINTSREQUIRED_LOWER = 0;
const ARCHETYPEPOINTSREQUIRED_UPPER = 100;
const ARCHETYPEPOINTSREQUIRED_INPUTID = 'archetypePointsRequiredInput';
enforceMinMax(ARCHETYPEPOINTSREQUIRED_INPUTID, ARCHETYPEPOINTSREQUIRED_LOWER, ARCHETYPEPOINTSREQUIRED_UPPER);

class Ability
{   
    /**
     * Top-most text
     * @var string
     */
    name = '';

    /**
     * Name without minecraft formatting codes
     * @var string
     */
    _plainname = '';

    /**
     * Description
     * @var string
     */
    description = '';

    /**
     * Blocks these abilities from being allocated
     * @var int[]
     */
    unlockingWillBlock = [];

    /**
     * Archetype
     * @var string
     */
    archetype = '';

    /**
     * Ability point requirement
     * @var int
     */
    pointsRequired = POINTSREQUIRED_LOWER;

    /**
     * Min archetype points required
     * @var int
     */
    archetypePointsRequired = ARCHETYPEPOINTSREQUIRED_LOWER;

    /**
     * Ability type
     * @var string
     */
    type = '';

    /**
     * ID of the required ability
     * @var int
     */
    requires = -1;

    constructor({name = '', description = '', unlockingWillBlock = [], archetype = '', pointsRequired = POINTSREQUIRED_LOWER, archetypePointsRequired = ARCHETYPEPOINTSREQUIRED_LOWER, type = 'skill', requires = -1} = {}) {

        this.name = String(name) ? String(name) : '';
        this._plainname = stripMinecraftFormatting(this.name);
        this.description = String(description) ? String(description) : '';
        this.archetype = String(archetype) ? String(archetype) : '';

        this.unlockingWillBlock = [];
        if (Array.isArray(unlockingWillBlock))
            unlockingWillBlock.forEach(element => {
                if (!isNaN(Number(element)))
                    this.unlockingWillBlock.push(Number(element));
            });

        this.pointsRequired = isNaN(Number(pointsRequired)) ? POINTSREQUIRED_LOWER : clamp(Number(pointsRequired), POINTSREQUIRED_LOWER, POINTSREQUIRED_UPPER);

        this.archetypePointsRequired = isNaN(Number(archetypePointsRequired)) ? ARCHETYPEPOINTSREQUIRED_LOWER : clamp(Number(archetypePointsRequired), ARCHETYPEPOINTSREQUIRED_LOWER, ARCHETYPEPOINTSREQUIRED_UPPER);
        
        this.type = Object.keys(abilityIconDictionary).includes(String(type))
            || Object.keys(altAbilityIconDictionary).includes(String(type))
            ? String(type) : Object.keys(abilityIconDictionary)[0];

        this.requires = isNaN(Number(requires)) ? -1 : Number(requires);
    }

    getPlainName() {
        return this._plainname;
    }
}

const NUMOFVARIANTS = 4;
class TravelNode {
    /**
     * up : empty/0 means unconnected, 1 means connected, 2 means allocated
     * @var int
     */
    up = 0;

    /**
     * down : empty/0 means unconnected, 1 means connected, 2 means allocated
     * @var int
     */
    down = 0;

    /**
     * left : empty/0 means unconnected, 1 means connected, 2 means allocated
     * @var int
     */
    left = 0;

    /**
     * right : empty/0 means unconnected, 1 means connected, 2 means allocated
     * @var int
     */
    right = 0;

    /**
     * Which variant to pick when rendering
     * @var int
     */
    variant = 1;

    constructor({up = 0, down = 0, left = 0, right = 0, variant = Math.ceil(Math.random() * NUMOFVARIANTS)} = {}) {
        this.up = isNaN(Number(up)) ? 0 : clamp(Number(up), 0, 2);
        this.down = isNaN(Number(down)) ? 0 : clamp(Number(down), 0, 2);
        this.left = isNaN(Number(left)) ? 0 : clamp(Number(left), 0, 2);
        this.right = isNaN(Number(right)) ? 0 : clamp(Number(right), 0, 2);
        this.variant = isNaN(Number(variant)) ? 1 : clamp(Number(variant), 1, NUMOFVARIANTS);
    }

    mergeTravelNodes(travelNode) {
        this.up = Math.max(this.up, travelNode.up);
        this.down = Math.max(this.down, travelNode.down);
        this.left = Math.max(this.left, travelNode.left);
        this.right = Math.max(this.right, travelNode.right);
    }

    generateIconHTML() {

        let result = '';

        let connectionCountMap = {'connected' : 0, 'active' : 0};
        const properties = ['up', 'down', 'left', 'right'];
        for (let property of properties)
            if (this[property] == 1)
                connectionCountMap['connected']++;
            else if (this[property] == 2)
                connectionCountMap['active']++;

        if (connectionCountMap['connected'] == 0 && connectionCountMap['active'] == 0)
            return '<img src="abilities/branch/0000.png" class="ability-icon" style="z-index: 1;"></img>\n';

        if (connectionCountMap['connected'] > 0)
            result += `<img src="abilities/branch/${this.up != 0 ? 1 : 0}${this.down != 0 ? 1 : 0}${this.left != 0 ? 1 : 0}${this.right != 0 ? 1 : 0}.png" class="ability-icon" style="z-index: 1;"></img>\n`;

        if (connectionCountMap['active'] == 1 || connectionCountMap['active'] == 4)
            result += `<img src="abilities/branch/${this.up == 2 ? 2 : 0}${this.down == 2 ? 2 : 0}${this.left == 2 ? 2 : 0}${this.right == 2 ? 2 : 0}.png" class="ability-icon" style="z-index: 2;"></img>\n`;
        else if (connectionCountMap['active'] == 2)
            result += `<img src="abilities/branch/${this.up == 2 ? 2 : 0}${this.down == 2 ? 2 : 0}${this.left == 2 ? 2 : 0}${this.right == 2 ? 2 : 0}/${this.variant}.png" class="ability-icon" style="z-index: 2;"></img>\n`;
        else if (connectionCountMap['active'] == 3)
            result += `<img src="abilities/branch/${this.up == 2 ? 2 : 0}${this.down == 2 ? 2 : 0}${this.left == 2 ? 2 : 0}${this.right == 2 ? 2 : 0}/${Math.ceil(this.variant / NUMOFVARIANTS * 2)}.png" class="ability-icon" style="z-index: 2;"></img>\n`;


        return result;
    }

    hasConnections() {
        return this.up != 0 || this.down != 0 || this.left != 0 || this.right != 0;
    }
}

const MAXABILITYPOINTS_LOWER = 1;
const MAXABILITYPOINTS_DEFAULT = 45;
const MAXABILITYPOINTS_UPPER = 100;
const MAXABILITYPOINTS_INPUTID = 'maxAbilityPoints';
enforceMinMax(MAXABILITYPOINTS_INPUTID, MAXABILITYPOINTS_LOWER, MAXABILITYPOINTS_UPPER);

const PAGES_LOWER = 1;
const PAGES_DEFAULT = 7;
const PAGES_UPPER = 30;
const PAGES_INPUTID = 'treePages';
enforceMinMax(PAGES_INPUTID, PAGES_LOWER, PAGES_UPPER);

const HORIZONTAL_PAGES_LOWER = 1;
const HORIZONTAL_PAGES_DEFAULT = 1;
const HORIZONTAL_PAGES_UPPER = 30;
const HORIZONTAL_PAGES_INPUTID = 'horizontalPages';
enforceMinMax(HORIZONTAL_PAGES_INPUTID, HORIZONTAL_PAGES_LOWER, HORIZONTAL_PAGES_UPPER);

const ROWSPERPAGE_LOWER = 3;
const ROWSPERPAGE_DEFAULT = 6;
const ROWSPERPAGE_UPPER = 11;
const ROWSPERPAGE_INPUTID = 'rowsPerPage';
enforceMinMax(ROWSPERPAGE_INPUTID, ROWSPERPAGE_LOWER, ROWSPERPAGE_UPPER);

const PAGESDISPLAYED_LOWER = 1;
const PAGESDISPLAYED_DEFAULT = 2;
const PAGESDISPLAYED_UPPER = 8;
const PAGESDISPLAYED_INPUTID = 'pagesDisplayed';
enforceMinMax(PAGESDISPLAYED_INPUTID, PAGESDISPLAYED_LOWER, PAGESDISPLAYED_UPPER);

class Properties {
    /**
     * Class
     * @var string
     */
    classs = '';

    /**
     * Maximum ability points unsigned
     * @var int
     */
    maxAbilityPoints = 45;

    /**
     * Number of vertical ability tree pages unsigned
     * @var int
     */
    pages = 7;

    /**
     * Number of horizontal ability tree pages unsigned
     * @var int
     */
    horizontalPages = 1;

    /**
     * How many cells per page
     * @var int
     */
    rowsPerPage = 6;

    /**
     * How many pages are drawn
     * @var int
     */
    pagesDisplayed = 2;

    /**
     * Whether the tree can loop along the left and right edge
     * @var bool
     */
    loopTree = false;
    
    /**
     * Whether or not you can go up the tree
     * @var bool
     */
    bTravesableUp = false;

    /**
     * Whether to use extra ability icons
     * @var bool
     */
    useAlternativeAbilityIcons = false;

    constructor({classs = Object.keys(classDictionary)[0], maxAbilityPoints = MAXABILITYPOINTS_DEFAULT, loopTree = false, pages = PAGES_DEFAULT, horizontalPages = HORIZONTAL_PAGES_DEFAULT, rowsPerPage = ROWSPERPAGE_DEFAULT, pagesDisplayed = PAGESDISPLAYED_DEFAULT, bTravesableUp = false, useAlternativeAbilityIcons = false} = {}) {
        
        this.classs = Object.keys(classDictionary).includes(String(classs)) ? String(classs) : Object.keys(classDictionary)[0];

        this.maxAbilityPoints = isNaN(Number(maxAbilityPoints)) ? MAXABILITYPOINTS_DEFAULT : clamp(Number(maxAbilityPoints), MAXABILITYPOINTS_LOWER, MAXABILITYPOINTS_UPPER);

        this.pages = isNaN(Number(pages)) ? PAGES_DEFAULT : clamp(Number(pages), PAGES_LOWER, PAGES_UPPER);

        this.horizontalPages = isNaN(Number(horizontalPages)) ? HORIZONTAL_PAGES_DEFAULT : clamp(Number(horizontalPages), HORIZONTAL_PAGES_LOWER, HORIZONTAL_PAGES_UPPER);

        this.rowsPerPage = isNaN(Number(rowsPerPage)) ? ROWSPERPAGE_DEFAULT : clamp(Number(rowsPerPage), ROWSPERPAGE_LOWER, ROWSPERPAGE_UPPER);

        this.pagesDisplayed = isNaN(Number(pagesDisplayed)) ? PAGESDISPLAYED_DEFAULT : clamp(Number(pagesDisplayed), PAGESDISPLAYED_LOWER, Math.min(PAGESDISPLAYED_UPPER, this.pages));

        this.loopTree = Boolean(loopTree) ? Boolean(loopTree) : false;
        this.bTravesableUp = Boolean(bTravesableUp) ? Boolean(bTravesableUp) : false;
        this.useAlternativeAbilityIcons = Boolean(useAlternativeAbilityIcons) ? Boolean(useAlternativeAbilityIcons) : useAlternativeAbilityIcons;
    }
}

class StateLog {

    /**
     * Latest change description
     * @var string
     */
    change;

    /**
     * JSON string representing the state
     * @var string
     */
    state;

    /**
     * Opional tag to help distinguish changes
     * @var string
     */
    type;

    constructor({changeDescription, state, type} = {}) {
        this.change = String(changeDescription) ? String(changeDescription) : '';
        this.state = String(state) ? String(state) : '';
        this.type = String(type) ? String(type) : '';
    }
}

const RESPONSETIMEOUT = 5000;
const EDITPATHTEMPCLASS = 'cell-edit-temp-element';
const MAXSELECTEDCELLS = 40;
const CELLIDPREFIX = 'cell-';
const COLUMNS = 9;

let abilityTooltipTimeout;
const ABILITYTOOLTIPDURATION = 5000;
class BaseTree
{
    /**
     * Generic properties of the editor
     * @var Properties
     */
    properties;

    /**
     * Archetypes
     * @var string[]
     */
    archetypes = [];

    /**
     * Abilities
     * @var { id : Ability }
     */
    abilities = {};

    /**
     * Selected ability id, waiting to be placed on the tree
     * @var int
     */
    selectedAbilityID = -1;

    /**
     * Selected archetype for ability sorting
     * @var string
     */
    selectedArchetype = null;

    /**
     * Recorded changes queue
     * @var StateLog[]
     */
    history = [];

    /**
     * Current history state
     * @var int
     */
    currentHistoryState = 0;

    /**
     * A map of cells, keys are cell number if counted left to right, up to down, starting at 1
     * @var {int : {'travelNode' : TravelNode, 'abilityID' : int}}
     */
    cellMap = {};

    /**
     * Current horizontal page
     * @var int
     */
    currentVerticalPage = 1;

    /**
     * Current vertical page
     * @var int
     */
    currentHorizontaPage = 1;

    /**
     * Used by initializeEditNode method to keep track of affected cells
     * @var int[]
     */
    selectedCells = [];


    /**
     * Determines if the rendered tree is for editing or allocation
     * @var bool
     */
    bEditMode = true;

    /**
     * Ability ID from which tree allocation starts
     * @var int
     */
    startingAbilityID;

    /**
     * abilitytID : map of allocatable abilities from it as well as connecting nodes (abilityID : [path])
     * @var {int : {int : {cellID : travelNode}}}
     */
    potentialAllocationMap = {};

    /**
     * A map of names for trees, each tree is represented by an array of allocated cellIDs
     * @var {string : int[]}
     */
    abilityTrees = {};

    /**
     * Determines which tree to render
     * @var string
     */
    selectedTree;

    /**
     * A copy of the current tree that
     * Uses allocatedNodes to keep track of allocated nodes (abilityID : true)
     * Uses connectedNodes to keep track of nodes connected to the tree : their connection points (abilityID : abilityID[])
     * Uses blockedNodes to keep track of blocked nodes (abilityID : true)
     * Uses archetypes to keep track of archetype points (archetype : unsignedInt)
     * Uses abilityPoints to keep track of used ability points (unsignedInt)
     * Uses travelNodes to keep track of paths between allocated nodes (cellID : travelNode)
     * @var {
     * 'allocatedNodes' : {int : bool},
     * 'connectedNodes' : {int : int[]},
     * 'blockedNodes' : {int : bool},
     * 'archetypes' : {string : int},
     * 'abilityPoints' : int,
     * 'travelNodes' : {int : travelNode}
     * }
     */
    currentTree;

    constructor() {
        this.properties = new Properties();
        this.writeProperties();
        this.renderEverything();
        this.saveState('Reset tree and settings');
        window.addEventListener("pointerup", (e) => {this.finallizeEditNode()});
    }

    // #region Serialization and history
    toJSON() {
        var result = {};
        for (var x in this) {
            if (x !== "history" && x !== "currentHistoryState" && x !== "selectedAbilityID" && x !== "currentVerticalPage"  &&
                x !== "selectedCells" && x !== "currentTree" && x !== "potentialAllocationMap" && x !== "selectedArchetype") {
                result[x] = this[x];
            }
        }
        return result;
    }

    readProperties(classSelectId = "classSelect", maxAbilityPointsId = MAXABILITYPOINTS_INPUTID, loopTreeId = "loopTreeSwitch", pagesId = PAGES_INPUTID, horizontalPagesId = HORIZONTAL_PAGES_INPUTID,
        rowsPerPageId = ROWSPERPAGE_INPUTID, pagesDisplayedId = PAGESDISPLAYED_INPUTID, bTravesableUp = "travelUpSwitch", useAlternativeAbilityIcons = "altIconSwitch") {

        if (this.properties != null && this.properties.loopTree != document.getElementById(loopTreeId).checked) {

            const totalCells = this.properties.pages * this.properties.rowsPerPage * COLUMNS;

            for (let key = 1; key <= totalCells; key += COLUMNS) {

                if (this.cellMap[key] == null || this.cellMap[key]['travelNode'] == null)
                    continue;
                
                this.cellMap[key]['travelNode']['left'] = 0;
                
            }

            for (let key = COLUMNS; key <= totalCells; key += COLUMNS) {

                if (this.cellMap[key] == null || this.cellMap[key]['travelNode'] == null)
                    continue;
                
                this.cellMap[key]['travelNode']['right'] = 0;
                
            }

        }
        
        this.properties = new Properties({
            classs : document.getElementById(classSelectId).value,
            maxAbilityPoints : document.getElementById(maxAbilityPointsId).value,
            pages : document.getElementById(pagesId).value,
            horizontalPages : document.getElementById(horizontalPagesId).value,
            rowsPerPage : document.getElementById(rowsPerPageId).value,
            pagesDisplayed : document.getElementById(pagesDisplayedId).value,
            loopTree : document.getElementById(loopTreeId).checked,
            bTravesableUp : document.getElementById(bTravesableUp).checked,
            useAlternativeAbilityIcons : document.getElementById(useAlternativeAbilityIcons).checked
        });
        
        this.setMode(this.bEditMode);
        this.writeProperties();
        this.saveState('Updated properties');
    }

    writeProperties(classSelectId = "classSelect", maxAbilityPointsId = MAXABILITYPOINTS_INPUTID, loopTreeId = "loopTreeSwitch", pagesId = PAGES_INPUTID, horizontalPagesId = HORIZONTAL_PAGES_INPUTID,
        rowsPerPageId = ROWSPERPAGE_INPUTID, pagesDisplayedId = PAGESDISPLAYED_INPUTID, bTravesableUp = "travelUpSwitch", useAlternativeAbilityIcons = "altIconSwitch") {

        document.getElementById(classSelectId).value = this.properties.classs;
        document.getElementById(maxAbilityPointsId).value = this.properties.maxAbilityPoints;
        document.getElementById(pagesId).value = this.properties.pages;
        document.getElementById(horizontalPagesId).value = this.properties.horizontalPages;
        document.getElementById(rowsPerPageId).value = this.properties.rowsPerPage;
        document.getElementById(pagesDisplayedId).value = this.properties.pagesDisplayed;
        document.getElementById(loopTreeId).checked = this.properties.loopTree;
        document.getElementById(bTravesableUp).checked = this.properties.bTravesableUp;
        document.getElementById(useAlternativeAbilityIcons).checked = this.properties.useAlternativeAbilityIcons;

    }

    renderScrollArrows(bShowSidewayArrows) {

        let hideElementsOfClass = bShowSidewayArrows ? "shown-on-single-horizontal-page" : "shown-on-multi-horizontal-page";
        let showElementsOfClass = !bShowSidewayArrows ? "shown-on-single-horizontal-page" : "shown-on-multi-horizontal-page";

        const containersToHide = document.getElementsByClassName(hideElementsOfClass);
        const containersToShow = document.getElementsByClassName(showElementsOfClass);

        for (let container of containersToHide)
            container.hidden = true;
        
        for (let container of containersToShow)
          container.hidden = false;

    }

    remapCells(bKeepCurrent) {
        
    }

    saveState(change = "", type = "", replaceSameType = false, jsonContainerID = "json-container") {
        
        const state = JSON.stringify(this, null, 0);

        const replaceLast = replaceSameType && this.history[this.currentHistoryState].type == type;

        const numOfPreservedStates = this.currentHistoryState + (replaceLast ? 0 : 1);

        if (this.history.length > numOfPreservedStates) 
            this.history.splice(numOfPreservedStates, this.history.length - numOfPreservedStates);
        
        const maxSaveStates = Number(document.getElementById('maxSaveStates').value) ?? 10;
        
        const removeElementsBeforeID = this.history.length - maxSaveStates + 1;
        
        if (removeElementsBeforeID > 0) {
            
            let newHistory = [];
            
            this.history.forEach( (element, index) => {

                if (index < removeElementsBeforeID)
                    return;

                newHistory.push(element);
            });

            this.history = newHistory;
        }

        const newStateLog = new StateLog({changeDescription : change, type : type, state : state});

        this.currentHistoryState = this.history.push(newStateLog) - 1;

        document.getElementById(jsonContainerID).value = state;

        this.renderStates();
    }

    loadStateIncrementally(increment) {

        this.loadState(this.currentHistoryState + increment);

    }

    loadState(stateIndex = -1) {
        if (stateIndex < 0 || stateIndex + 1 > this.history.length)
            return;

        this.currentHistoryState = stateIndex;

        this.loadFromJSON(this.history[stateIndex].state, true);
        this.renderStates();
    }

    renderStates(historyContainerID = 'historyContainer') {

        const container = document.getElementById(historyContainerID);
        if (container == null) {
            return;
        }
        
        container.innerHTML = "";

        for (let i = this.history.length - 1; i > this.currentHistoryState; i--) {

            const div = document.createElement("div");
            div.classList.add('history-record-overriden', 'minecraftTooltip');
            div.addEventListener('click', (e) => this.loadState(i));
            div.innerHTML = this.history[i].change;
            container.appendChild(div);

        }

        const div = document.createElement("div");
        div.classList.add('history-record-selected', 'minecraftTooltip');
        div.addEventListener('click', (e) => this.loadState(this.currentHistoryState));
        div.innerHTML = this.history[this.currentHistoryState].change;
        container.appendChild(div);

        for (let i = this.currentHistoryState - 1; i >= 0; i--) {

            const div = document.createElement("div");
            div.classList.add('history-record-not-selected', 'minecraftTooltip');
            div.addEventListener('click', (e) => this.loadState(i));
            div.innerHTML = this.history[i].change;
            container.appendChild(div);

        }
    }

    renderEverything() {
        if (this.bEditMode) {
            this.renderArchetypes();
            this.renderAbilities();
        } else {
            this.renderTreeNames();
            this.renderStartingAbilityList();
            this.renderArchetypeCounts();
            this.renderAbilityPointsUsed();
        }

        this.renderScrollArrows(this.properties.horizontalPages > 1 ? true : false);

        let hideElementsOfClass = this.bEditMode ? "shown-on-allocation" : "shown-on-tree-edit";
        let showElementsOfClass = this.bEditMode ? "shown-on-tree-edit" : "shown-on-allocation";

        const containersToHide = document.getElementsByClassName(hideElementsOfClass);
        const containersToShow = document.getElementsByClassName(showElementsOfClass);

        for (let container of containersToHide)
            container.hidden = true;
  
        for (let container of containersToShow)
            container.hidden = false;

        this.renderTree();
    }

    loadTreeFromPreset(self, classSelectID = 'classSelect') {

        const classSelect = document.getElementById(classSelectID);
        if (classSelect == null) {
            return;
        }

        self.classList.add('btn-secondary');
        self.disabled = true;

        const controller = new AbortController();
        const signal = controller.signal;

        const timeoutId = setTimeout(() => {
            controller.abort();
            console.log('Fetch request timed out');
          }, 5000);

        fetch(`presets/${classSelect.value}.json`, {

            signal,
            cache: 'no-store',
            mode: 'same-origin',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },

        }).then( (response) => {

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
              }

            return response.text();

        }).then( (text) => {

            this.loadFromJSON(text);
            this.saveState(`Loaded default ${classSelect.value} tree`);

        }).catch( (e) => {
            
            if (e != "Couldn't parse")
                showSmallToast("Load Failed: couldn't reach the server");

            console.log(e.stack);
            
        }).finally(() => {

            self.classList.remove('btn-secondary');
            self.disabled = false;
            clearTimeout(timeoutId);

        });

    }

    loadTreeFromField(jsonContainerID = "json-container") {

        const jsonContainer = document.getElementById(jsonContainerID);
        if (jsonContainer == null) {
            return;
        }

        this.loadFromJSON(jsonContainer.value);
        this.saveState('Loaded tree from JSON');
    }

    loadTreeFromFile(dropEvent) {

        dropEvent.preventDefault();
        
        let file;

        if (dropEvent.dataTransfer.items)
            file = dropEvent.dataTransfer.items[0].getAsFile();
        else
            file = dropEvent.dataTransfer.files[0];

        file.text().then( text => {

            this.loadFromJSON(text);
            this.saveState(`Loaded tree from ${file.name}`);

        });
        
    }

    loadEmptyTree() {

        this.loadFromJSON('{}');
        this.saveState('Reset tree and settings');

    }

    loadFromJSON(json, respectEditMode = false) {

        let obj = {};

        try {
            obj = JSON.parse(json);
        } catch (error) {
            showSmallToast("Load Failed: couldn't parse JSON");
            throw ("Couldn't parse");
        }

        this.properties = new Properties(obj.properties);

        this.archetypes = [];
        const archetypes = obj.archetypes;
        if (Array.isArray(archetypes)) {

            archetypes.forEach(element => {
                this.archetypes.push(element);
            });
        }

        this.abilities = {};
        const abilities = obj.abilities;
        if (typeof abilities === 'object' && !Array.isArray(abilities) && abilities !== null) {
            
            Object.keys(abilities).forEach( id => {
    
                this.abilities[id] = new Ability(abilities[id]);
    
            });
        }

        this.cellMap = {};
        const cellMap = obj.cellMap;
        if (typeof cellMap === 'object' && !Array.isArray(cellMap) && cellMap !== null) {
        
            Object.keys(cellMap).forEach( id => {

                this.cellMap[id] = {};
                this.cellMap[id]['travelNode'] = new TravelNode(cellMap[id]['travelNode']);
                this.cellMap[id]['abilityID'] = cellMap[id]['abilityID'];

            });
        }

        if (typeof obj.startingAbilityID === 'string')
            this.startingAbilityID = obj.startingAbilityID;

        if (typeof obj.selectedTree === 'string')
            this.selectedTree = obj.selectedTree;

        this.abilityTrees = {};
        const abilityTrees = obj.abilityTrees;
        if (typeof abilityTrees === 'object' && !Array.isArray(abilityTrees) && abilityTrees !== null) {
        
            Object.keys(abilityTrees).forEach( treeName => {
    
                if (Array.isArray(abilityTrees[treeName]))
                    this.abilityTrees[treeName] = abilityTrees[treeName];
    
            });
        }

        if (respectEditMode && obj.bEditMode != null && obj.bEditMode === false) {
            this.bEditMode = false;
            this.compileAllocationMap();
            this.compileCurrentTree();
        } else
            this.bEditMode = true;

        document.getElementById("json-container").value = json;
        this.writeProperties();
        this.renderEverything();
    }

    downloadJSON() {
        const json = JSON.stringify(this, null, 0);

        const link = document.createElement("a");
        const file = new Blob([json], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = `Wynnability_${this.properties.classs}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    // #endregion

    // #region Archetypes
    editArchetype(name = "", nameFormID = "archetypeNameInput") {   

        const nameInputElement = document.getElementById(nameFormID);

        if (name == "") {
            nameInputElement.value = "";
            nameInputElement.oldname = "";
        }
        else {
            nameInputElement.value = name;
            nameInputElement.oldname = name;
        }

        nameInputElement.dispatchEvent(new Event('input'));
    }

    saveArchetype(nameFormID = "archetypeNameInput") {

        const nameInputElement = document.getElementById(nameFormID);
        if (nameInputElement.value == "" || this.archetypes.includes(nameInputElement.value) )
            return;
        
        const oldname = nameInputElement.oldname ?? "";
        const newname = nameInputElement.value;
        
        if (oldname == "") {
            
            this.archetypes.push(newname);
            this.saveState(`Added archetype: ${minecraftToHTML(newname)}`);
            
        } else {

            const existingIndex = this.archetypes.indexOf(oldname);
            this.archetypes[existingIndex] = newname;
            this.updateArchetype(oldname, newname);
            this.saveState(`Renamed archetype: ${minecraftToHTML(oldname)} -> ${minecraftToHTML(newname)}`);

        }
        
        this.renderArchetypes();

    }

    deleteArchetype(name) {

        if (typeof name != "string" || name == "")
            return;
        
        const index = this.archetypes.indexOf(name);
        if (index > -1)
            this.archetypes.splice(index, 1);

        this.updateArchetype(name);        
        this.renderArchetypes();
        this.saveState(`Deleted archetype: ${minecraftToHTML(name)}`);

    }

    renderArchetypes(containerID = "archetypeContainer", neutralContainerID = "neutralContainer") {

        const container = document.getElementById(containerID);

        let archetypeCounts = {};
        let placedArchetypeCounts = {"" : 0};
        let neutralCount = 0;
        for (let archetype of this.archetypes) {
            archetypeCounts[archetype] = 0;
            placedArchetypeCounts[archetype] = 0;
        }

        for (let ability of Object.values(this.abilities)) {
            if (ability.archetype.length > 0)
                archetypeCounts[ability.archetype]++;
            else
                neutralCount++;
        }
        for(let cellKey of Object.keys(this.cellMap)) {
            if (this.cellMap[cellKey]['abilityID'] != null)
                placedArchetypeCounts[ this.abilities[ this.cellMap[cellKey]['abilityID'] ]['archetype'] ]++;
        }
        
        container.innerHTML = "";
        
        for (let archetype of this.archetypes) {

            const div = document.createElement("div");
            div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1', 'pt-1');

            if (archetype == this.selectedArchetype) {

                div.classList.add('selected-ability');
                div.addEventListener('click', (e) => {
                    if (e.target.nodeName != 'BUTTON')
                        this.selectArchetype(null);
                });

            } else {

                div.addEventListener('click', (e) => {
                    if (e.target.nodeName != 'BUTTON')
                        this.selectArchetype(archetype);
                });

            }

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'overflow-hidden');
            text.innerHTML = minecraftToHTML(archetype);
            div.appendChild(text);

            const abilityCount = document.createElement("div");
            abilityCount.innerHTML = placedArchetypeCounts[archetype] + '/' + archetypeCounts[archetype];
            div.appendChild(abilityCount);
            
            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'ms-2', 'font-default');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#archetypeModal');
            editbtn.addEventListener('click', (e) => this.editArchetype(archetype));
            div.appendChild(editbtn);
            
            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn', 'font-default');
            delbtn.type = "button";
            delbtn.style = "background-color: transparent;";
            delbtn.title = "Delete";
            delbtn.innerHTML = "💀";
            delbtn.addEventListener('click', (e) => this.deleteArchetype(archetype));
            div.appendChild(delbtn);
            
            container.appendChild(div);

        }

        const div = document.createElement("div");
        div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1', 'pt-1');

        if (this.selectedArchetype == "") {

            div.classList.add('selected-ability');
            div.addEventListener('click', (e) => {
                this.selectArchetype(null);
            });

        } else {

            div.addEventListener('click', (e) => {
                this.selectArchetype("");
            });

        }

        const abilityCount = document.createElement("div");
        abilityCount.innerHTML = minecraftToHTML("§f§lNeutral ") + placedArchetypeCounts[""] + '/' + neutralCount;
        div.appendChild(abilityCount);
        
        const neutralContainer = document.getElementById(neutralContainerID);
        neutralContainer.innerHTML = "";
        neutralContainer.appendChild(div);
    }

    updateArchetype(oldarchetype, newarchetype = "") {

        if (typeof newarchetype != 'string')
            return;

        for (let abilityID of Object.keys(this.abilities)) {
            if (this.abilities[abilityID]['archetype'] == oldarchetype)
                this.abilities[abilityID]['archetype'] = newarchetype;
        }
    }

    selectArchetype(archetype = null) {

        this.selectedArchetype = archetype;
        this.renderArchetypes();
        this.renderAbilities();

    }
    // #endregion

    // #region Abilities
    renderAbilityTypeSelector(selected = "skill", containerId = "abilityTypeInput") {

        const container = document.getElementById(containerId);

        container.innerHTML = "";
        container.value = selected;

        let iconDictionary = abilityIconDictionary;
        if (this.properties.useAlternativeAbilityIcons)
            iconDictionary = altAbilityIconDictionary;

        Object.keys(iconDictionary).forEach( (type) => {
            const div = generateIconDiv(type, null, this.properties.classs, type == selected ? 2 : 1, false, this.properties.useAlternativeAbilityIcons);
            div.classList.add('ability-type-selector');
            container.appendChild(div);
            div.addEventListener("click", (e) => { this.renderAbilityTypeSelector(type) });
        });

    }

    renderEditorAbilityTooltip(nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", archetypeFormID = "abilityArchetypeInput", pointsRequiredFormID = POINTSREQUIRED_INPUTID,
        archetypePointsRequiredFormID = ARCHETYPEPOINTSREQUIRED_INPUTID, containerId = "editAbilityTooltip", prerequisiteFormID = "abilityPrerequiseteInput", abilityBlockCountDisplayID="abilityBlockCountDisplay") {
        
        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);
        const container = document.getElementById(containerId);
        
        const abilityBlockCountDisplay = document.getElementById(abilityBlockCountDisplayID);

        let blockedAbilities = this.getBlockedAbilities();
        if (abilityBlockCountDisplay != null)
            abilityBlockCountDisplay.innerHTML = blockedAbilities.length;

        container.innerHTML = this._getAbilityTooltipHTML(new Ability({
            name : nameInputElement.value,
            description : descriptionInputElement.value,
            unlockingWillBlock : blockedAbilities,
            archetype : archetypeInputElement.value,
            pointsRequired : pointsRequiredInputElement.value,
            archetypePointsRequired : archetypePointsRequiredInputElement.value,
            requires : prerequisiteInputElement.value
        }));
    }

    renderHoverAbilityTooltip(abilityId = -1, containerId = "cursorTooltip") {
        const container = document.getElementById(containerId);
        const ability = this.abilities[abilityId];

        if (this.selectedCells.length > 0 || ability == null)
            return;
        
        container.hidden = false;

        container.innerHTML = this._getAbilityTooltipHTML(ability);
    }

    _getAbilityTooltipHTML(ability = new Ability()) {

        result = `
                ${minecraftToHTML(ability.name)}<br><br>
                ${minecraftToHTML(ability.description)}<br><br>`;

        if (ability.unlockingWillBlock.length > 0) {
            result += `<span style="color:${codeDictionaryColor['c']}">Unlocking&nbsp;will&nbsp;block:<br></span>`;
            for (let id of ability.unlockingWillBlock)
                result += `<span style="color:${codeDictionaryColor['c']}">-&#8288;&nbsp;</span><span style="color:${codeDictionaryColor['7']}">${anyToHTML(this.abilities[id].getPlainName())}</span><br>`;
            result += '<br>';
        }

        if (ability.archetype != "")
            result += `${minecraftToHTML(ability.archetype + ' Archetype')}<br><br>`;

        result += `<span style="color:${codeDictionaryColor['7']}">Ability&nbsp;Points:&nbsp;</span>${ability.pointsRequired}<br>`;
        
        if (this.abilities[ability.requires] != null)
            result += `<span style="color:${codeDictionaryColor['7']}">Required&nbsp;Ability:&nbsp;</span>${anyToHTML(stripMinecraftFormatting(this.abilities[ability.requires].name))}<br>`;

        if (ability.archetype != "" && ability.archetypePointsRequired > 0)
            result += `<span style="color:${codeDictionaryColor['7']}">Min&nbsp;${anyToHTML(stripMinecraftFormatting(ability.archetype))}&nbsp;Archetype:&nbsp;</span>${ability.archetypePointsRequired}`;
            
        return result;
    }

    hideHoverAbilityTooltip(containerId = "cursorTooltip") {
        if (abilityTooltipTimeout != null) {
            clearTimeout(abilityTooltipTimeout);
            abilityTooltipTimeout = null;
        }
        const container = document.getElementById(containerId);

        container.hidden = true;
        container.innerHTML = "";
    }

    editAbility(abilityID = -1,
        nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", abilityBlockFormID = "abilityBlockInput", archetypeFormID = "abilityArchetypeInput",
        pointsRequiredFormID = POINTSREQUIRED_INPUTID, archetypePointsRequiredFormID = ARCHETYPEPOINTSREQUIRED_INPUTID, prerequisiteFormID = "abilityPrerequiseteInput") {   

        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const abilityBlockInputElement = document.getElementById(abilityBlockFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);

        let sortedAbilityIDs = this.sortAbilities();

        if (abilityID < 0) {

            archetypeInputElement.innerHTML = `<option class="ability-type-none" selected value="">Archetype (none)</option>`;
            for (let archetype of this.archetypes) {

                const option = document.createElement('option');
                option.value = archetype;
                option.innerHTML = anyToHTML(shortenText(stripMinecraftFormatting(archetype), 50));
                archetypeInputElement.appendChild(option);

            }

            prerequisiteInputElement.innerHTML = `<option class="ability-type-none" selected value="-1">Prerequisite (none)</option>`;
            abilityBlockInputElement.innerHTML = '';
            for (let id of sortedAbilityIDs) {

                const abilityName = anyToHTML(shortenText(stripMinecraftFormatting(this.abilities[id].name), 50));

                const option = document.createElement('option');
                option.value = id;
                option.innerHTML = abilityName;
                option.classList.add("ability-type-" + this.abilities[id].type);
                prerequisiteInputElement.appendChild(option);

                const li = document.createElement('li');
                li.innerHTML = abilityName;
                li.value = id;
                li.classList.add("ability-type-" + this.abilities[id].type, "dropdown-item");
                li.addEventListener('click', (event) => {
                    event.target.classList.toggle('active');
                    this.renderEditorAbilityTooltip();
                });
                abilityBlockInputElement.appendChild(li);

            }

            nameInputElement.abilityId = "";
            nameInputElement.value = "";
            descriptionInputElement.value = "";
            pointsRequiredInputElement.value = 1;
            archetypePointsRequiredInputElement.value = 0;
            prerequisiteInputElement.value = -1;
            this.renderAbilityTypeSelector();

        } else {

            if (this.abilities[abilityID] == null)
                return;

            archetypeInputElement.innerHTML = `<option class="ability-type-none" value="">Archetype (none)</option>`;
            for (let archetype of this.archetypes) {

                const option = document.createElement('option');
                option.value = archetype;
                option.innerHTML = anyToHTML(shortenText(stripMinecraftFormatting(archetype), 50));
                if (archetype == this.abilities[abilityID].archetype)
                    option.selected = true;
                archetypeInputElement.appendChild(option);
            
            }

            let blockedAbilitiesMap = {};
            for (let blockedID of this.abilities[abilityID].unlockingWillBlock)
                blockedAbilitiesMap[blockedID] = true;

            prerequisiteInputElement.innerHTML = `<option class="ability-type-none" value="-1">Prerequisite (none)</option>`;
            abilityBlockInputElement.innerHTML = '';
            for (let id of sortedAbilityIDs) {

                if (id == abilityID)
                    continue;

                const abilityName = anyToHTML(shortenText(stripMinecraftFormatting(this.abilities[id].name), 50));

                const option = document.createElement('option');
                option.value = id;
                option.innerHTML = abilityName;
                option.classList.add("ability-type-" + this.abilities[id].type);
                if (id == this.abilities[abilityID].requires)
                    option.selected = true;
                prerequisiteInputElement.appendChild(option);

                const li = document.createElement('li');
                li.innerHTML = abilityName;
                li.value = id;
                li.classList.add("ability-type-" + this.abilities[id].type, "dropdown-item");
                if (blockedAbilitiesMap[id])
                    li.classList.add("active");
                li.addEventListener('click', (event) => {
                    event.target.classList.toggle('active');
                    this.renderEditorAbilityTooltip();
                });
                abilityBlockInputElement.appendChild(li);

            }

            nameInputElement.abilityId = abilityID;
            nameInputElement.value = this.abilities[abilityID].name;
            descriptionInputElement.value = this.abilities[abilityID].description;
            pointsRequiredInputElement.value = this.abilities[abilityID].pointsRequired;
            archetypePointsRequiredInputElement.value = this.abilities[abilityID].archetypePointsRequired;
            this.renderAbilityTypeSelector(this.abilities[abilityID].type);
            
        }

        nameInputElement.dispatchEvent(new Event('input'));
        descriptionInputElement.dispatchEvent(new Event('input'));
    }

    getBlockedAbilities(abilityBlockFormID = "abilityBlockInput") {

        const abilityBlockInputElement = document.getElementById(abilityBlockFormID);

        let blockedAbilities = [];

        for (let li of abilityBlockInputElement.children) {
            if (li.classList.contains('active'))
                blockedAbilities.push(li.value);
        }
        return blockedAbilities;
    }

    saveAbility(nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", archetypeFormID = "abilityArchetypeInput", pointsRequiredFormID = POINTSREQUIRED_INPUTID,
    archetypePointsRequiredFormID = ARCHETYPEPOINTSREQUIRED_INPUTID, typeFormID = "abilityTypeInput", prerequisiteFormID = "abilityPrerequiseteInput") {

        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const typeInputElement = document.getElementById(typeFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);

        if (nameInputElement.value == '') {
            nameInputElement.value = 'UNNAMED'
            this.renderEditorAbilityTooltip();
        }

        const newAbility = new Ability({
            name : nameInputElement.value,
            description : descriptionInputElement.value,
            unlockingWillBlock : this.getBlockedAbilities(),
            archetype : archetypeInputElement.value,
            pointsRequired : pointsRequiredInputElement.value,
            archetypePointsRequired : archetypePointsRequiredInputElement.value,
            type : typeInputElement.value,
            requires : prerequisiteInputElement.value
        });
        
        let abilityID = nameInputElement.abilityId;
        
        
        if (this.abilities[abilityID] == null) {

            let maxId = 0;
            for (let id of Object.keys(this.abilities)) {
                maxId = Math.max(maxId, Number(id));
            }

            abilityID = maxId + 1;

            this.abilities[abilityID] = newAbility;
            nameInputElement.abilityId = abilityID;

            this.saveState(`Added ability: ${minecraftToHTML(nameInputElement.value)}`);

        } else {

            const oldName = this.abilities[abilityID].name;

            this.abilities[abilityID] = newAbility;

            this.saveState(`Edited ability: ${minecraftToHTML(oldName)} -> ${minecraftToHTML(nameInputElement.value)}`);            
        }

        this.renderAbilities();
        this.renderArchetypes();
        this.renderTree();
    }

    deleteAbility(abilityID = -1) {

        if (abilityID == null || abilityID < 0)
            return;

        if (this.abilities[abilityID] != null) {

            for (let id of Object.keys(this.abilities)) {
                if (this.abilities[id].requires == abilityID)
                    this.abilities[id].requires = -1;

                const index = this.abilities[id].unlockingWillBlock.indexOf(Number(abilityID));
                if (index > -1)
                    this.abilities[id].unlockingWillBlock.splice(index, 1);
            }

            if (this.selectedAbilityID == abilityID)
                this.selectedAbilityID = -1;

            this.removeAbilityFromTree(abilityID);
            const name = this.abilities[abilityID].name;
            delete this.abilities[abilityID];
            this.saveState(`Deleted ability: ${minecraftToHTML(name)}`);
            this.renderArchetypes();
            this.renderAbilities();
            this.renderTree();
        }
    }

    sortAbilities() {

        let priorityMap = {};
        Object.keys(altAbilityIconDictionary).forEach( (elem, i) => {
            priorityMap[elem] = i;
        });
        
        let sortedAbilityIDs = Object.keys(this.abilities).sort((a, b) => {
            
            if (this.abilities[a].type == null)
                return 1;
            if (this.abilities[b].type == null)
                return -1;
            
            const priorityDif = priorityMap[this.abilities[a].type] - priorityMap[this.abilities[b].type];

            if (priorityDif != 0)
                return priorityDif;
            
            return this.abilities[a].getPlainName().localeCompare(this.abilities[b].getPlainName()) || 1;
        })

        return sortedAbilityIDs;

    }
    
    renderAbilities(containerID = "abilityContainer", searchFieldID = "abilitySearch", notOnTreeFilterID = "notOnTreeFilter") {
        
        const container = document.getElementById(containerID);
        if (container == null)
            return;
        
        container.innerHTML = "";

        let sortedAbilityIDs = this.sortAbilities();

        if (this.selectedArchetype != null) {
            sortedAbilityIDs = sortedAbilityIDs.filter( (id) => {
                return this.abilities[id].archetype == this.selectedArchetype;
            });
        }

        const searchContainer = document.getElementById(searchFieldID);
        if (searchFieldID != null && searchContainer.value != null && String(searchContainer.value) != null && String(searchContainer.value) != '') {

            const filterSubstring = String(searchContainer.value).toLowerCase();

            sortedAbilityIDs = sortedAbilityIDs.filter( (id) => {
                return this.abilities[id].getPlainName().toLowerCase().includes(filterSubstring);
            });
        }

        const notOnTreeFilter = document.getElementById(notOnTreeFilterID);
        let bFilterNotOnTree = notOnTreeFilter != null && !notOnTreeFilter.checked;

        let abilitiesOnTree = {};
        for(let cellKey of Object.keys(this.cellMap)) {
            if (this.cellMap[cellKey]['abilityID'] != null)
                abilitiesOnTree[ this.cellMap[cellKey]['abilityID'] ] = true;
        }

        for (let id of sortedAbilityIDs) {

            if (bFilterNotOnTree && abilitiesOnTree[id])
                continue;

            const div = document.createElement("div");

            if (id == this.selectedAbilityID) {

                div.classList.add('selected-ability');
                div.addEventListener('click', (e) => {
                    if (e.target.nodeName != 'BUTTON')
                        this.selectAbility(-1);
                });

            } else {

                div.addEventListener('click', (e) => {
                    if (e.target.nodeName != 'BUTTON')
                        this.selectAbility(id);
                });

            }

            div.classList.add('d-inline-flex', 'align-items-center', 'minecraftTooltip', 'w-100', 'mb-1');

            const imgholder = document.createElement("div");
            imgholder.style = "width: 56px; text-align: center;";
            div.appendChild(imgholder);
            imgholder.appendChild(generateIconDiv(this.abilities[id].type, null, this.properties.classs, abilitiesOnTree[id] ? 2 : 1, false, true));

            imgholder.addEventListener('pointerover', (e) => { this.renderHoverAbilityTooltip(id); });
            imgholder.addEventListener('pointerout', (e) => { this.hideHoverAbilityTooltip(); });

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'align-items-center', 'overflow-hidden', 'ms-2');
            text.innerHTML = minecraftToHTML(this.abilities[id].name);
            div.appendChild(text);
            
            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'ms-2', 'font-default');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#abilityModal');
            editbtn.addEventListener('click', (e) => this.editAbility(id));
            div.appendChild(editbtn);
            
            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn', 'font-default');
            delbtn.type = "button";
            delbtn.style = "background-color: transparent;";
            delbtn.title = "Delete";
            delbtn.innerHTML = "💀";
            delbtn.addEventListener('click', (e) => this.deleteAbility(id));
            div.appendChild(delbtn);
            
            container.appendChild(div);

        }   
    }

    selectAbility(abilityID = -1) {

        this.selectedAbilityID = abilityID;
        this.renderAbilities();

    }

    focusSelectedAbility(containerID = "abilityContainer") {

        const container = document.getElementById(containerID);
        if (container == null)
            return;

        const selected = container.querySelector('.selected-ability');
        if (selected == null)
            return;

        container.scrollTo({top: selected.offsetTop - 10, behavior: "instant"})
        //selected.scrollIntoView({block: "center", inline: "center", behavior: "instant"});

    }
    // #endregion

    // #region Tree editing
    removeAllTravelNodes() {
        for (let cell of Object.keys(this.cellMap))
            if (this.cellMap[cell]['abilityID'] != null)
                delete this.cellMap[cell]['travelNode'];
            else
                delete this.cellMap[cell]
        
        this.saveState(`Removed all paths from the tree`);
        this.renderTree();
    }

    removeAllAbilityNodes() {
        for (let cell of Object.keys(this.cellMap))
            if (this.cellMap[cell]['travelNode'] != null)
                delete this.cellMap[cell]['abilityID'];
            else
                delete this.cellMap[cell]
        
        this.saveState(`Removed all abilities from the tree`);
        this.renderAbilities();
        this.renderArchetypes();
        this.renderTree();
    }

    incrementVerticalPage(increment = 0) {

        this.setcurrentVerticalPage(this.currentVerticalPage + increment);
        this.renderTree();

    }

    incrementHorizontalPage(increment = 0) {

        this.setcurrentHorizontalPage(this.currentHorizontaPage + increment);
        this.renderTree();

    }

    setcurrentVerticalPage(page = this.currentVerticalPage) {

        if (page == null || typeof page != "number" || page < 1)
            return;

        this.currentVerticalPage = clamp(page, 1, this.properties.pages - this.properties.pagesDisplayed + 1);

    }

    setcurrentHorizontalPage(page = this.currentHorizontalPage) {

        if (page == null || typeof page != "number" || page < 1)
            return;

        this.currentHorizontalPage = clamp(page, 1, this.properties.horizontalPages);

    }

    cellPositionInRow(cellKey) {

        //position in row = (cellKey % cells per page) % cells per row
        let cellPositionInRow = cellKey % (this.properties.rowsPerPage * COLUMNS) % COLUMNS;
        return cellPositionInRow == 0 ? COLUMNS : cellPositionInRow;

    }

    getAdjacentCells(cellKey, bUseCellsAsKeys = true) {

        cellKey = Number(cellKey);
        let result = {};

        const totalCells = this.properties.pages * this.properties.rowsPerPage * COLUMNS;

        //up
        const upKey = cellKey - COLUMNS;
        if (upKey >= 1) {

            if (bUseCellsAsKeys)
                result[upKey] = 'up';
            else
                result['up'] = upKey;

        }

        //down
        const downKey = cellKey + COLUMNS;
        if (downKey <= totalCells) {

            if (bUseCellsAsKeys)
                result[downKey] = 'down';
            else
                result['down'] = downKey;

        }
        
        const cellPositionInRow = this.cellPositionInRow(cellKey);
        
        //left
        if (cellPositionInRow > 1) {

            if (bUseCellsAsKeys)
                result[cellKey - 1] = 'left';
            else
                result['left'] = cellKey - 1;

        } else if(this.properties.loopTree) {

            if (bUseCellsAsKeys)
                result[cellKey - 1 + COLUMNS] = 'left';
            else
                result['left'] = cellKey - 1 + COLUMNS;

        }
        
        //right
        if (cellPositionInRow < COLUMNS) {

            if (bUseCellsAsKeys)
                result[cellKey + 1] = 'right';
            else
                result['right'] = cellKey + 1;

        } else if(this.properties.loopTree) {

            if (bUseCellsAsKeys)
                result[cellKey + 1 - COLUMNS] = 'right';
            else
                result['right'] = cellKey + 1 - COLUMNS;

        }
        
        return result;
    }

    getConnectedCells(cellKey) {

        const cell = this.cellMap[cellKey];

        if (cell == null || cell['travelNode'] == null)
            return {};

        const adjacent = this.getAdjacentCells(cellKey, false);
        
        for (let direction of Object.keys(adjacent)) {
            const cellID = adjacent[direction];

            const otherCell = this.cellMap[cellID];
            const reverseDirection = reverseDirectionDictionary[direction];
            
            if   ( otherCell == null
                || otherCell['travelNode'] == null
                || cell['travelNode'][direction] == 0
                || otherCell['travelNode'][reverseDirection] == 0)

                delete adjacent[direction];

        }

        return adjacent;

    }

    /**
     * Returns which direction cellKey2 is from cellKey1
     * @returns {string}
     */
    determineCellRelation(cellKey1, cellKey2) {

        const dif = cellKey2 - cellKey1;

        if (this.properties.loopTree) {

            const position1 = this.cellPositionInRow(cellKey1);
            const position2 = this.cellPositionInRow(cellKey2);

            if ( dif == (COLUMNS - 1) && position1 == 1 && position2 == COLUMNS )
                return 'left';
            if (dif == (1 - COLUMNS) && position2 == 1 && position1 == COLUMNS )
                return 'right';
        }

        if (dif == COLUMNS)
            return 'down';
        if (dif == -COLUMNS)
            return 'up';
        if (dif == 1)
            return 'right';
        if (dif == -1)
            return 'left';

        return null;

    }

    connectCells(cellKey1, cellKey2, bDisconnectIfConnected = true) {
        
        const direction = this.determineCellRelation(cellKey1, cellKey2);

        if (direction == null)
            return;

        const reverseDirection = reverseDirectionDictionary[direction];

        this.cellMap[cellKey1] = this.cellMap[cellKey1] ?? {};
        this.cellMap[cellKey2] = this.cellMap[cellKey2] ?? {};

        if (this.cellMap[cellKey1]['travelNode'] == null)
            this.cellMap[cellKey1]['travelNode'] = new TravelNode();
        
        if (this.cellMap[cellKey2]['travelNode'] == null)
            this.cellMap[cellKey2]['travelNode'] = new TravelNode();
            
        if ( bDisconnectIfConnected && this.cellMap[cellKey1]['travelNode'][direction] != 0 && this.cellMap[cellKey2]['travelNode'][reverseDirection] != 0 ) {

            this.cellMap[cellKey1]['travelNode'][direction] = 0;
            this.cellMap[cellKey2]['travelNode'][reverseDirection] = 0;

            if (!this.cellMap[cellKey1]['travelNode'].hasConnections() && this.cellMap[cellKey1]['abilityID'] == null)
                delete this.cellMap[cellKey1];

            if (!this.cellMap[cellKey2]['travelNode'].hasConnections() && this.cellMap[cellKey2]['abilityID'] == null)
                delete this.cellMap[cellKey2];

        } else {

            this.cellMap[cellKey1]['travelNode'][direction] = 1;
            this.cellMap[cellKey2]['travelNode'][reverseDirection] = 1;

        }
    }

    initializeEditNode(cellKey) {

        if (this.selectedCells.length > 0 || cellKey == null || Number(cellKey) < 1 || Number(cellKey) > this.properties.pages * this.properties.rowsPerPage * COLUMNS)
            return;

        this.selectedCells.push(cellKey);

        const cellElem = document.getElementById(CELLIDPREFIX + cellKey).firstChild;
        cellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + this.selectedCells.length - 1}" src="abilities/generic/travel_center_6_a.png" style="z-index: 26;" draggable="false"></img>\n`;
    
    }

    continueEditWithloopedNode(direction = 1) {

        const selectedCellsLength = this.selectedCells.length;
        
        if (selectedCellsLength == 0 || !(this.properties.loopTree))
            return;

        if (selectedCellsLength > MAXSELECTEDCELLS) {

            this.finallizeEditNodes();
            return;

        }

        const lastCellKey = this.selectedCells[selectedCellsLength - 1];
        const cellPositionInRow = this.cellPositionInRow(lastCellKey);

        switch (direction) {
            case -1:
                if (cellPositionInRow == 1)
                    this.continueEditNode(lastCellKey + COLUMNS - 1);
                break;

            case 1: 
                if (cellPositionInRow == COLUMNS)
                    this.continueEditNode(lastCellKey - COLUMNS + 1);
                break;

            default:
                break;
        }
    }

    continueEditNode(cellKey) {

        const selectedCellsLength = this.selectedCells.length;

        if (selectedCellsLength == 0 || cellKey == null || Number(cellKey) < 1 || Number(cellKey) > this.properties.pages * this.properties.rowsPerPage * COLUMNS)
            return;

        if (selectedCellsLength > MAXSELECTEDCELLS) {

            this.finallizeEditNode();
            return;

        }
        
        const adjacentCellsMap = this.getAdjacentCells(cellKey, true);
        const prevCellKey = this.selectedCells[selectedCellsLength - 1];
        
        // if cell is not adjacent to the last one - ignore it
        if ( adjacentCellsMap[prevCellKey] == null )
            return;
        
        // if backtracked - remove last element and visuals
        if (cellKey == this.selectedCells[selectedCellsLength - 2]) {

            const collection = document.getElementsByClassName( EDITPATHTEMPCLASS + (selectedCellsLength - 1) );

            while(collection[0])
                collection[0].parentNode.removeChild(collection[0]);
            
            this.selectedCells.splice(selectedCellsLength - 1, 1);

        } else {

            const newCellElem = document.getElementById(CELLIDPREFIX + cellKey).firstChild;
            const prevCellElem = document.getElementById(CELLIDPREFIX + prevCellKey).firstChild;

            // add center image to the cell
            if (!this.selectedCells.includes(cellKey))
                newCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_center_6_a.png" style="z-index: 26;"></img>\n`;
            
            // add connection images to this and previous cell
            switch (adjacentCellsMap[prevCellKey]) {
                case 'up':
                    newCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_up_10_a.png" style="z-index: 30;"></img>\n`;
                    prevCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_down_8_a.png" style="z-index: 28;"></img>\n`;
                    break;
                    
                case 'down':
                    newCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_down_8_a.png" style="z-index: 28;"></img>\n`;
                    prevCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_up_10_a.png" style="z-index: 30;"></img>\n`;
                    break;

                case 'left':
                    newCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_left_7_a.png" style="z-index: 27;"></img>\n`;
                    prevCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_right_9_a.png" style="z-index: 29;"></img>\n`;
                    break;

                case 'right':
                    newCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_right_9_a.png" style="z-index: 29;"></img>\n`;
                    prevCellElem.innerHTML += `<img class="ability-icon ${EDITPATHTEMPCLASS} ${EDITPATHTEMPCLASS + selectedCellsLength}" src="abilities/generic/travel_left_7_a.png" style="z-index: 27;"></img>\n`;
                    break;
                
                default:
                    break;
            }

            // add cellKey to array
            this.selectedCells.push(cellKey);

        }

    }    

    finallizeEditNode() {
        
        const selectedCellsLength = this.selectedCells.length;

        let editSummary = '';

        switch (selectedCellsLength) {
            case 0:
                return;
            
            case 1:
                const cellKey = this.selectedCells[0];

                this.cellMap[cellKey] = this.cellMap[cellKey] ?? {};

                if (this.abilities[this.selectedAbilityID] != null) {

                    this.removeAbilityFromTree(this.selectedAbilityID);
                    this.cellMap[cellKey]['abilityID'] = this.selectedAbilityID;
                    editSummary = `Positioned ${minecraftToHTML(this.abilities[this.selectedAbilityID].name)} on tree`;
                    this.selectedAbilityID = -1;
                    
                } else {

                    if (this.cellMap[cellKey]['abilityID'] != null) {

                        const abilityID = this.cellMap[cellKey]['abilityID'];
                        this.removeAbilityFromTree(abilityID);
                        this.hideHoverAbilityTooltip();
                        editSummary = `Removed ${minecraftToHTML(this.abilities[abilityID].name)} from tree`;

                    } else if (this.cellMap[cellKey]['travelNode'] == null) {
                
                        this.cellMap[cellKey]['travelNode'] = new TravelNode({up : 0, down : 0, left : 0, right : 0});

                        editSummary = `Added empty tree node on page ${Math.ceil(cellKey / (this.properties.rowsPerPage * COLUMNS))}`;

                    } else {

                        editSummary = `Removed 1 tree node on page ${Math.ceil(cellKey / (this.properties.rowsPerPage * COLUMNS))}`;

                        this.removeCellFromTree(cellKey);

                    }
                }
                break;

            case 2:
                const cellKey1 = this.selectedCells[0];
                const cellKey2 = this.selectedCells[1];

                this.connectCells(cellKey1, cellKey2, true);
                editSummary = 'Changed 1 tree node connection';
                break;

            default:
                for(let cellKey = 0; cellKey < selectedCellsLength - 1; cellKey++) {

                    const cellKey1 = this.selectedCells[cellKey];
                    const cellKey2 = this.selectedCells[cellKey + 1];

                    this.connectCells(cellKey1, cellKey2, false);

                }

                editSummary = `Changed ${selectedCellsLength - 1} tree node connections`;
                break;
        }

        const collection = document.getElementsByClassName( EDITPATHTEMPCLASS );

        while(collection[0])
            collection[0].parentNode.removeChild(collection[0]);

        this.selectedCells = [];
        this.saveState(editSummary);
        this.renderTree();
        this.renderAbilities();
        this.renderArchetypes();

    }

    removeCellFromTree(cellKey) {

        const connected = this.getConnectedCells(cellKey);
        
        for (let key of Object.keys(connected)) {
            const cellID = connected[key];

            if (this.cellMap[cellID]['travelNode'] == null)
                continue;

            this.cellMap[cellID]['travelNode'][ reverseDirectionDictionary[ key ] ] = 0;

            if (!this.cellMap[cellID]['travelNode'].hasConnections())
                delete this.cellMap[cellID];

        }

        delete this.cellMap[cellKey];

    }

    removeAbilityFromTree(abilityID) {

        for (let cellKey of Object.keys(this.cellMap)) {

            if (this.cellMap[cellKey] != null && this.cellMap[cellKey]['abilityID'] == abilityID) {
                
                if (this.cellMap[cellKey]['travelNode'] == null) {

                    this.removeCellFromTree(cellKey);
                    continue;

                }

                const connected = Object.keys(this.getConnectedCells(cellKey));
                
                if (connected.length == 0)
                    delete this.cellMap[cellKey];
                else
                    delete this.cellMap[cellKey]['abilityID'];
            }
        }
    }

    renderTreeForEditing(tableBodyID = "treeTableBody") {

        const table = document.getElementById(tableBodyID);
        if (table == null)
            return;

        table.innerHTML = '';

        this.setcurrentVerticalPage();

        const CELLSPERPAGE = this.properties.rowsPerPage * COLUMNS;

        for (let page = this.currentVerticalPage; page < this.currentVerticalPage + this.properties.pagesDisplayed; page++) {
            
            const pageRow = document.createElement('tr');
            table.appendChild(pageRow);

            const pageCol = document.createElement('td');
            pageCol.colSpan = COLUMNS;
            pageRow.appendChild(pageCol);

            const pageDiv = document.createElement('div');
            pageDiv.classList.add("page-display");
            pageDiv.innerHTML = `PAGE ${page}`;
            pageCol.appendChild(pageDiv);

            for (let row = 1; row <= this.properties.rowsPerPage; row++) {

                const newRow = document.createElement('tr');
                table.appendChild(newRow);
    
                for (let col = 1; col <= COLUMNS; col++) {

                    const cellKey = (page - 1) * (CELLSPERPAGE) + (row - 1) * COLUMNS + col;
                    
                    const newCol = document.createElement('td');
                    newCol.id = CELLIDPREFIX + cellKey;
                    newCol.cellKey = cellKey;
                    newRow.appendChild(newCol);

                    const cell = this.cellMap[cellKey];

                    let div = null;

                    if (cell != null) {

                        div = generateIconDiv(
                            this.abilities[ cell['abilityID'] ] ? this.abilities[ cell['abilityID'] ].type : null,
                            cell['travelNode'],
                            this.properties.classs,
                            1,
                            true,
                            true
                        );

                        if (this.abilities[ cell['abilityID'] ] != null) {

                            div.addEventListener('pointerover', (e) => {if (e.pointerType !== "touch") this.renderHoverAbilityTooltip(cell['abilityID'])});
                            
                            div.addEventListener('pointerout', (e) => {if (e.pointerType !== "touch") this.hideHoverAbilityTooltip()});
    
                        }

                    } else {
                        div = document.createElement('div');
                        div.classList.add("centered-element-container");
                    }

                    div.style.userSelect = 'none';
                    div.addEventListener('pointerdown', (e) => {if (e.pointerType !== "touch") this.initializeEditNode(cellKey)});
                    div.addEventListener('pointerenter', (e) => {if (e.pointerType !== "touch") this.continueEditNode(cellKey)});
                    div.addEventListener('touchstart', (e) => {
                        processTouch(
                            e,
                            () => {
                                if (this.abilities[this.selectedAbilityID] != null) {

                                    this.removeAbilityFromTree(this.selectedAbilityID);
                                    this.cellMap[cellKey] = this.cellMap[cellKey] ?? {};
                                    this.cellMap[cellKey]['abilityID'] = this.selectedAbilityID;
                                    let editSummary = `Positioned ${minecraftToHTML(this.abilities[this.selectedAbilityID].name)} on tree`;
                                    this.selectedAbilityID = -1;
                                    this.saveState(editSummary);
                                    this.renderAbilities();
                                    this.renderArchetypes();
                                    this.renderTree();
                                    
                                } else {
                                    const td = e.target.closest("td");
                                    try {
                                        this.renderHoverAbilityTooltip(this.cellMap[td.cellKey]['abilityID']);
                                        moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                                    } catch (e) {};
                                }
                            },
                            () => {}, 
                            () => {
                                this.hideHoverAbilityTooltip();
                                document.body.style.overflow = 'hidden';
                                this.initializeEditNode(cellKey);
                            },
                            (event) => {
                                const location = event.changedTouches[0];
                                const target = document.elementFromPoint(location.clientX, location.clientY);
                                if (target == null)
                                    return;

                                if (target.id == "rightTreeBoundary")
                                    this.continueEditWithloopedNode(1);
                                else if (target.id == "leftTreeBoundary")
                                    this.continueEditWithloopedNode(-1);
                                else {
                                    const td = target.closest("td");
                                    if (td && td.cellKey != null)
                                        this.continueEditNode(td.cellKey);
                                }
                            },
                            () => {
                                document.body.style.overflow = 'auto';
                                this.finallizeEditNode();
                            }
                        );
                        }, {passive: false});
                    newCol.appendChild(div);
                    
                }
            }
        }
    }


    // #endregion

    renderTree(tableBodyID = "treeTableBody") {

        if (this.bEditMode)
            this.renderTreeForEditing(tableBodyID);
        else
            this.renderTreeForAllocation(tableBodyID);

    }

    // #region Tree allocation
    setMode(bEditMode) {
        this.bEditMode = bEditMode;
        if (!bEditMode) {
            this.compileAllocationMap();
            this.selectTree(this.selectedTree);
        }
        this.renderEverything();
    }

    ensureStartingAbility() {
        if (this.startingAbilityID != null && this.abilities[ this.startingAbilityID ] != null)
            return;

        const abilityList = Object.keys(this.abilities);
        if (abilityList.length < 1)
            return;
        this.startingAbilityID = abilityList[0];
    }
    
    ensureDefaultTree() {

        if (Object.keys(this.abilityTrees).length == 0) {
            this.abilityTrees['Default'] = [];
            this.selectTree('Default');
        }
    }

    ensureSelectedTree() {
        this.ensureDefaultTree();
        if (this.abilityTrees[this.selectedTree] == null)
            this.selectedTree = Object.keys(this.abilityTrees)[0];
    }

    compileAllocationMap() {
        this.potentialAllocationMap = {};

        //cellID : {direction : cellID}
        let undirectedConnectionsMap = {};
        for (let key of Object.keys(this.cellMap)) {
            undirectedConnectionsMap[key] = this.getConnectedCells(key);
        }
        let directedConnectionsMap = {};
        if (this.properties.bTravesableUp) {
            directedConnectionsMap = undirectedConnectionsMap;
        } else {
            for (let key of Object.keys(undirectedConnectionsMap)) {
                directedConnectionsMap[key] = Object.assign({}, undirectedConnectionsMap[key]);
                if (directedConnectionsMap[key]['up'] != null)
                    delete directedConnectionsMap[key]['up'];
            }
        }

        // cellID : {abilityID : distance from ability}
        let pathwayMap = {};

        for (let cellID of Object.keys(this.cellMap)) {
            if (this.cellMap[cellID]["abilityID"] != null) {
                pathwayMap[cellID] = pathwayMap[cellID] ?? {};
                pathwayMap[cellID][ this.cellMap[cellID]["abilityID"] ] = 0;
            }
        }

        let currentProcessingTarget = 0;
        let keepGoing;
        do {
            keepGoing = false;
            for (let cellID of Object.keys(pathwayMap)) {

                let pendingAbilityIDs = [];
                for (let abilityID of Object.keys(pathwayMap[cellID])) {
                    if (pathwayMap[cellID][abilityID] == currentProcessingTarget)
                        pendingAbilityIDs.push(abilityID);
                }

                if (pendingAbilityIDs.length != 0) {
                    keepGoing = true;

                    let connectedCellNumbers = Object.values(directedConnectionsMap[cellID]);
                    for (let connectedCellNumber of connectedCellNumbers) {

                        if (this.cellMap[connectedCellNumber]["abilityID"] == null) {

                            pathwayMap[connectedCellNumber] = pathwayMap[connectedCellNumber] ?? {};

                            for (let abilityID of pendingAbilityIDs) {
                                    pathwayMap[connectedCellNumber][abilityID] = pathwayMap[connectedCellNumber][abilityID] ?? currentProcessingTarget + 1;
                            }

                        } else {
                            for (let parentAbilityID of pendingAbilityIDs) {

                                const childAbilityID = this.cellMap[connectedCellNumber]["abilityID"];

                                if (parentAbilityID == childAbilityID)
                                    continue;
                                
                                this.potentialAllocationMap[parentAbilityID] = this.potentialAllocationMap[parentAbilityID] ?? {};

                                if (this.potentialAllocationMap[parentAbilityID][childAbilityID] == null) {
                                    
                                    this.potentialAllocationMap[parentAbilityID][childAbilityID] = {};

                                    let backtrackProcessingTarget = currentProcessingTarget;
                                    let currentCell = connectedCellNumber;
                                    let lastTravelNode = new TravelNode( this.cellMap[currentCell]['travelNode'] );

                                    for (backtrackProcessingTarget; backtrackProcessingTarget >= 0; backtrackProcessingTarget--) {

                                        for (let direction of Object.keys(undirectedConnectionsMap[currentCell])) {

                                            const cellID = undirectedConnectionsMap[currentCell][direction];

                                            if (pathwayMap[cellID] &&
                                                pathwayMap[cellID][parentAbilityID] == backtrackProcessingTarget) {

                                                lastTravelNode[direction] = 2;
                                                this.potentialAllocationMap[parentAbilityID][childAbilityID][currentCell] = lastTravelNode;

                                                currentCell = cellID;
                                                lastTravelNode = new TravelNode( this.cellMap[currentCell]['travelNode'] );
                                                lastTravelNode[reverseDirectionDictionary[direction]] = 2;
                                                break;
                                            }
                                        }
                                    }
                                    this.potentialAllocationMap[parentAbilityID][childAbilityID][currentCell] = lastTravelNode;
                                }
                            }
                        }
                    }
                }
            }

            currentProcessingTarget++;

        } while (keepGoing);
    }

    compileCurrentTree() {
        this.ensureStartingAbility();
        this.ensureSelectedTree();
        this.currentTree = {'allocatedNodes' : {}, 'connectedNodes' : {}, 'blockedNodes' : {}, 'archetypes' : {}, 'abilityPoints' : 0, 'travelNodes' : {}};
        if (this.startingAbilityID == null || this.abilities[this.startingAbilityID] == null)
            return;

        this.currentTree['connectedNodes'][this.startingAbilityID] = [];
        for (let archetype of this.archetypes) {
            this.currentTree['archetypes'][archetype] = 0;
        }
        for (let abilityID of this.abilityTrees[this.selectedTree]) {
            this.currentTree['allocatedNodes'][abilityID] = false;
        }
        this.abilityTrees[this.selectedTree] = [];

        let allocatableNodes = [];
        do {
            for (let abilityID of allocatableNodes) {
                this.allocateNode(abilityID, false);
            }

            allocatableNodes = [];
            for (let abilityID of Object.keys( this.currentTree['connectedNodes'] )) {
                if (this.currentTree['allocatedNodes'][abilityID] == false &&
                    this.isAllocatable(abilityID))
                    allocatableNodes.push(abilityID);
            }
        } while (allocatableNodes.length > 0);

        for (let abilityID of Object.keys( this.currentTree['allocatedNodes'] ))
            if ( !this.currentTree['allocatedNodes'][abilityID] )
                delete this.currentTree['allocatedNodes'][abilityID];
    }

    isAllocatable(abilityID) {

        if (this.currentTree['blockedNodes'][abilityID])
            return false;

        if (this.abilities[abilityID].archetype != '' &&
            this.currentTree['archetypes'][ this.abilities[abilityID].archetype ] < this.abilities[abilityID].archetypePointsRequired)
            return false;

        if (this.abilities[abilityID].requires != -1 &&
            !this.currentTree['allocatedNodes'][ this.abilities[abilityID].requires ])
            return false;

        return this.currentTree['connectedNodes'][abilityID] != null
            && this.properties.maxAbilityPoints - this.currentTree['abilityPoints'] >= this.abilities[abilityID].pointsRequired;
    }

    allocateNode(abilityID, saveAfter = true) {

        for (let blockedID of this.abilities[abilityID].unlockingWillBlock)
            this.currentTree['blockedNodes'][blockedID] = true;
        if (this.abilities[abilityID].archetype != '')
            this.currentTree['archetypes'][ this.abilities[abilityID].archetype ] += 1;
        this.currentTree['abilityPoints'] += this.abilities[abilityID].pointsRequired;
        this.currentTree['allocatedNodes'][abilityID] = true;
        this.abilityTrees[this.selectedTree].push(abilityID);

        for (let connectedAbilityID of this.currentTree['connectedNodes'][abilityID])
            this.allocateTravelNodes(connectedAbilityID, abilityID);

        delete this.currentTree['connectedNodes'][abilityID];
        this.addConnectedNodes(abilityID);

        if (saveAfter)
            this.saveState(`Reallocated nodes on '${minecraftToHTML(this.selectedTree)}'`, 'treeAllocation', true);
    }

    deallocateNode(abilityID) {
        this.abilityTrees[this.selectedTree].splice( this.abilityTrees[this.selectedTree].indexOf(abilityID) , 1);
        this.compileCurrentTree();
        this.saveState(`Reallocated nodes on '${minecraftToHTML(this.selectedTree)}'`, 'treeAllocation', true);
    }

    addConnectedNodes(abilityID) {
        if (this.potentialAllocationMap[abilityID] == null)
            return;
        
        for (let connectedAbilityID of Object.keys( this.potentialAllocationMap[abilityID] )) {

            if (this.currentTree['allocatedNodes'][connectedAbilityID])
                this.allocateTravelNodes(abilityID, connectedAbilityID);

            else {
                if (this.currentTree['connectedNodes'][connectedAbilityID] == null)
                    this.currentTree['connectedNodes'][connectedAbilityID] = [];
                this.currentTree['connectedNodes'][connectedAbilityID].push(abilityID);
            }
        }
    }

    allocateTravelNodes(originAbilityID, destinationAbilityID) {
        if (this.potentialAllocationMap[originAbilityID][destinationAbilityID] == null)
            return;
        const travelNodeMap = this.potentialAllocationMap[originAbilityID][destinationAbilityID];
        for (let cellID of Object.keys(travelNodeMap)) {
            if (this.currentTree['travelNodes'][cellID] == null)
                this.currentTree['travelNodes'][cellID] = new TravelNode(travelNodeMap[cellID]);
            else
                this.currentTree['travelNodes'][cellID].mergeTravelNodes( travelNodeMap[cellID] );
        }
    }

    getAllocatableNodes() {
        let nodeMap = {};
        for (let abilityID of Object.keys(this.currentTree['connectedNodes']))
            if (this.isAllocatable(abilityID))
                nodeMap[abilityID] = true;
        return nodeMap;
    }

    editTree(name = "", nameFormID = "treeNameInput") {

        const nameInputElement = document.getElementById(nameFormID);

        if (name == "") {
            nameInputElement.value = "";
            nameInputElement.oldname = "";
        }
        else {
            nameInputElement.value = name;
            nameInputElement.oldname = name;
        }
        
        nameInputElement.dispatchEvent(new Event('input'));
    }

    saveTree(nameFormID = "treeNameInput") {

        const nameInputElement = document.getElementById(nameFormID);
        if (nameInputElement.value == "")
            return;
        
        const oldname = nameInputElement.oldname ?? "";
        let newname = nameInputElement.value;

        if (this.abilityTrees[newname] != null && newname != oldname) {
            for (let i = 1; i < 100; i++)
                if (this.abilityTrees[newname + `(${i})`] == null) {
                    newname = newname + `(${i})`;
                    break;
                }
        }
        
        if (oldname == "") {
            
            this.abilityTrees[newname] = [];
            this.saveState(`Added tree: ${minecraftToHTML(newname)}`);
            this.selectTree(newname);
            
        } else {

            this.abilityTrees[newname] = this.abilityTrees[oldname];
            if (this.selectedTree == oldname)
                this.selectedTree = newname;
            delete this.abilityTrees[oldname];
            this.saveState(`Renamed tree: ${minecraftToHTML(oldname)} -> ${minecraftToHTML(newname)}`);
            this.renderTreeNames();

        }
    }

    deleteTree(name) {

        if (typeof name != "string" || name == "")
            return;


        delete this.abilityTrees[name];

        this.ensureDefaultTree(); 
        this.renderTreeNames();
        this.saveState(`Deleted tree: ${minecraftToHTML(name)}`);

    }

    renderTreeNames(containerID = "treeNameContainer") {

        const container = document.getElementById(containerID);
        
        container.innerHTML = "";
        
        for (let treeName of Object.keys(this.abilityTrees)) {

            const div = document.createElement("div");
            div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1');

            if (treeName == this.selectedTree) {

                div.classList.add('selected-ability');

            } else {

                div.addEventListener('click', (e) => {
                    if (e.target.nodeName != 'BUTTON')
                        this.selectTree(treeName);
                });

            }

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'overflow-hidden');
            text.innerHTML = minecraftToHTML(treeName);
            div.appendChild(text);
            
            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'ms-2', 'font-default');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#treeModal');
            editbtn.addEventListener('click', (e) => this.editTree(treeName));
            div.appendChild(editbtn);
            
            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn', 'font-default');
            delbtn.type = "button";
            delbtn.style = "background-color: transparent;";
            delbtn.title = "Delete";
            delbtn.innerHTML = "💀";
            delbtn.addEventListener('click', (e) => this.deleteTree(treeName));
            div.appendChild(delbtn);
            
            container.appendChild(div);

        }
    }

    selectTree(name) {
        this.selectedTree = name;
        this.compileCurrentTree();
        this.saveState(`Selected '${minecraftToHTML(this.selectedTree)}' tree for allocation`, `${this.selectedTree}`, true);
        this.renderTreeNames();
        this.renderArchetypeCounts();
        this.renderAbilityPointsUsed()
        this.renderTree();
    }

    selectStartingAbility(abilityID) {
        this.startingAbilityID = abilityID;
        this.compileCurrentTree();
        this.saveState(`Made ${minecraftToHTML(this.abilities[abilityID].name)} the starting ability`);
        this.renderArchetypeCounts();
        this.renderAbilityPointsUsed()
        this.renderTree();
    }

    renderStartingAbilityList(startingAbilityInputID = "startingAbilityInput") {
        
        const startingAbilityInputElement = document.getElementById(startingAbilityInputID);

        startingAbilityInputElement.innerHTML = '';

        let sortedAbilityIDs = this.sortAbilities();
        for (let id of sortedAbilityIDs) {

            const abilityName = anyToHTML(shortenText(stripMinecraftFormatting(this.abilities[id].name), 30));

            const option = document.createElement('option');
            option.value = id;
            option.innerHTML = abilityName;
            if (id == this.startingAbilityID)
                option.selected = true;

            option.classList.add("ability-type-" + this.abilities[id].type);
            startingAbilityInputElement.appendChild(option);

        }
    }

    renderAbilityPointsUsed(containerID = "abilityPointsUsed") {
        const container = document.getElementById(containerID);
        container.innerHTML = `AP: ${this.currentTree['abilityPoints']} / ${this.properties.maxAbilityPoints}`;
    }

    renderArchetypeCounts(containerID = "archetypeCountContainer") {

        const container = document.getElementById(containerID);
        
        container.innerHTML = "";
        
        for (let archetype of this.archetypes) {

            const div = document.createElement("div");
            div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1');

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'overflow-hidden');
            text.innerHTML = minecraftToHTML(archetype);
            div.appendChild(text);

            const abilityCount = document.createElement("div");
            abilityCount.innerHTML = this.currentTree['archetypes'][archetype] ?? 0;
            div.appendChild(abilityCount);
            
            container.appendChild(div);

        }
    }

    renderTreeForAllocation(tableBodyID = "treeTableBody") {
        const table = document.getElementById(tableBodyID);
        if (table == null)
            return;

        table.innerHTML = '';

        this.setcurrentVerticalPage();

        const CELLSPERPAGE = this.properties.rowsPerPage * COLUMNS;

        const allocatableNodes = this.getAllocatableNodes();

        for (let page = this.currentVerticalPage; page < this.currentVerticalPage + this.properties.pagesDisplayed; page++) {
            
            const pageRow = document.createElement('tr');
            table.appendChild(pageRow);

            const pageCol = document.createElement('td');
            pageCol.colSpan = COLUMNS;
            pageRow.appendChild(pageCol);

            const pageDiv = document.createElement('div');
            pageDiv.classList.add("page-display");
            pageDiv.innerHTML = `PAGE ${page}`;
            pageCol.appendChild(pageDiv);

            for (let row = 1; row <= this.properties.rowsPerPage; row++) {

                const newRow = document.createElement('tr');
                table.appendChild(newRow);
    
                for (let col = 1; col <= COLUMNS; col++) {

                    const cellKey = (page - 1) * (CELLSPERPAGE) + (row - 1) * COLUMNS + col;
                    
                    const newCol = document.createElement('td');
                    newCol.id = CELLIDPREFIX + cellKey;
                    newRow.appendChild(newCol);

                    const cell = this.cellMap[cellKey];

                    let div = null;

                    if (cell != null) {

                        const travelNode = this.currentTree['travelNodes'][cellKey] ?? cell['travelNode'];
                        let allocationStatus = 0;
                        if (this.currentTree['allocatedNodes'][ cell['abilityID'] ] != null)
                            allocationStatus = 2;
                        else if (allocatableNodes[ cell['abilityID'] ] != null)
                            allocationStatus = 1;

                        div = generateIconDiv(
                            this.abilities[ cell['abilityID'] ] ? this.abilities[ cell['abilityID'] ].type : null,
                            travelNode,
                            this.properties.classs,
                            allocationStatus,
                            true,
                            true
                        );

                        if (this.abilities[ cell['abilityID'] ] != null) {
                            
                            switch (allocationStatus) {
                                case 1:
                                    div.addEventListener('click', (e) => {
                                        this.allocateNode( cell['abilityID'] );
                                        this.renderTree();
                                        this.renderArchetypeCounts();
                                        this.renderAbilityPointsUsed()}
                                    );
                                    break;
                                case 2:
                                    div.addEventListener('click', (e) => {
                                        this.deallocateNode( cell['abilityID'] );
                                        this.renderTree();
                                        this.renderArchetypeCounts();
                                        this.renderAbilityPointsUsed()}
                                    );
                                    break;
                                default:
                                    break;
                            }

                            div.addEventListener('pointerover', (e) => {if (e.pointerType !== "touch") this.renderHoverAbilityTooltip(cell['abilityID'])} );
                            div.addEventListener('pointerout', (e) => {if (e.pointerType !== "touch") this.hideHoverAbilityTooltip()} );
                            div.addEventListener('touchstart', (e) => {
                                e.preventDefault();
                                processTouch(
                                    e,
                                    () => {
                                        switch (allocationStatus) {
                                            case 1:
                                                this.allocateNode( cell['abilityID'] );
                                                this.renderTree();
                                                this.renderArchetypeCounts();
                                                this.renderAbilityPointsUsed();
                                                break;
                                            case 2:
                                                this.deallocateNode( cell['abilityID'] );
                                                this.renderTree();
                                                this.renderArchetypeCounts();
                                                this.renderAbilityPointsUsed();
                                                break;
                                            default:
                                                break;
                                        }
                                    },
                                    () => {}, 
                                    () => {
                                        document.body.style.overflow = 'hidden';
                                        this.renderHoverAbilityTooltip(cell['abilityID']);
                                        moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                                    },
                                    (e) => {
                                        moveTooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                                    },
                                    () => {
                                        this.hideHoverAbilityTooltip();
                                        document.body.style.overflow = 'auto';
                                    }
                                );
                                }, {passive: false});
            
                            }
                    } else {
                        div = document.createElement('div');
                        div.classList.add("centered-element-container");
                    }

                    div.style.userSelect = 'none';
                    newCol.appendChild(div);
                    
                }
            }
        }
    }
    // #endregion
}