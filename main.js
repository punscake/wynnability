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

const codeDictionaryGenericSymbols = {
    'mana' : '§b✺',

    'damage' : '§c⚔',
    'neuteral' : '§6✣',
    'earth' : '§2✤',
    'thunder' : '§e✦',
    'water' : '§b✽',
    'fire' : '§c✹',
    'air' : '§f❋',

    'effect' : '§e🛡',
    'duration' : '§d⌛',
    'AoE' : '§3☀',
    'range' : '§a➼',
    'heal' : '§d❤',
    'blindness' : '§c⬣',
    'slowness' : '§c⬤',
};
const codeDictionaryClassSymbols = {
    'focus' : '§e➽',

    'winded' : '§b≈',
    'timelocked' : '§3⌚',

    'resistance' : '§a❁',
    'corrupted' : '§4☠',
    'armorbreak' : '§c✃',
    'sacred' : '§6✧',
    'invincibility' : '§b☗',

    'marked' : '§c✜',
    'clone' : '§5⁂',

    'bloodpool' : '§4⚕',
    'puppet' : '§6⚘',
    'tethered' : '§c۞',
    'whipped' : '§6⇶',
    'awakened' : '§f♚',
};
const codeDictionaryCommonAbilityAttributes = {
    
    'manacost' : ['§b✺', '\n§b✺ §7Mana Cost: §f_'],

    'damage' : ['§c⚔', '\n§c⚔ §7Total Damage: §f_% §8(of your DPS)'],
    'neuteral' : ['§6✣', '\n   §8(§6✣ §8Damage: _%)'],
    'earth' : ['§2✤', '\n   §8(§2✤ §8Earth: _%)'],
    'thunder' : ['§e✦', '\n   §8(§e✦ §8Thunder: _%)'],
    'water' : ['§b✽', '\n   §8(§b✽ §8Water: _%)'],
    'fire' : ['§c✹', '\n   §8(§c✹ §8Fire: _%)'],
    'air' : ['§f❋', '\n   §8(§f❋ §8Air: _%)'],
    
    'effect' : ['§e🛡', '\n§e🛡 §7Effect:'],
    'duration' : ['§d⌛', '\n§d⌛ §7Duration: §f_s'],
    'AoE' : ['§3☀', '\n§3☀ §7Area  of Effect: §f_ Blocks §7(Circle-Shaped)'],
    'range' : ['§a➼', '\n§a➼ §7Range: §f_ Blocks'],

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
    'l' : 'font-weight: bold;',
    'o' : 'font-style: italic;',
};
const minecraftDelimiter = '§';

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
    for (i; i < string.length - 1; i++) {

        let char = string[i];

        if (char != minecraftDelimiter) {

            result[result.length - 1]['content'] += char;
            continue;

        }

        i++;
        const code = string[i];
        
        if (code in codeDictionaryColor)
            result.push( {color : code, content : ''} );
        else
            result[result.length - 1]['content'] += minecraftDelimiter + code;
    }
    if (i < string.length && string[string.length - 1] != minecraftDelimiter)
        result[result.length - 1]['content'] += string[string.length - 1];

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
        
        if (char != minecraftDelimiter) {

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
    if (i < string.length && string[string.length - 1] != minecraftDelimiter)
        result[result.length - 1]['content'] += string[string.length - 1];
    
    return result;

}

function anyToHTML(text = "") {
    return sanitizeHTML(text).replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/ /g, '&nbsp;').replace(/-/g, '-&#8288;');
}

function minecraftToHTML(text = "") {

    text = anyToHTML(text);

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

            if (bUseDecorations || bUseStyles)
                pendingContent += ' style="';

            if (bUseDecorations) {
                pendingContent += 'text-decoration:';

                for (let decoration of decorations)
                    pendingContent += ' ' + codeDictionaryDecoration[decoration];

                pendingContent += ';';
            }

            if (bUseStyles)
                for (let style of styles)
                    pendingContent += codeDictionaryStyle[style];
            
            if (bUseDecorations || bUseStyles)
                pendingContent += '"';

            pendingContent += `>${content}`;

        });

        
        if (pendingContent.length == 0)
            return;

        const color = colorSplit['color'];

        if (color != null && codeDictionaryColor[color] != null)
            result += `<span style="color:${ codeDictionaryColor[color] }">`;
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

function generateIconDiv(type, travelnode = new TravelNode(), classs = "", bAllocated = false, bScaleAbilityIcon = false) {

    let result = document.createElement('div');
    result.classList.add('centered-element-container');

    if (travelnode instanceof TravelNode)
        result.innerHTML = travelnode.generateIconHTML();

    let url = null;
  
    if (type == 'skill')
        url = abilityIconDictionary[type] + classs + (bAllocated ? '/skill_a.png' : '/skill.png');

    else if (type in abilityIconDictionary)
        url = abilityIconDictionary[type] + (bAllocated ? '_a.png' : '.png');

    if (url != null) {
        let img = document.createElement('img');

        img.src = url;
        img.style.zIndex = 11;
    
        if (bScaleAbilityIcon)
            img.onload = (e) => {img.style.width = `${img.naturalWidth * 100 / 36}%`};
    
        result.appendChild(img);
    }

    return result;
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
    pointsRequired = 0;

    /**
     * Min archetype points required
     * @var int
     */
    archetypePointsRequired = 0;

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
        
        this.type = Object.keys(abilityIconDictionary).includes(String(type)) ? String(type) : Object.keys(abilityIconDictionary)[0];

        this.requires = isNaN(Number(requires)) ? -1 : Number(requires);
    }

    getPlainName() {
        return this._plainname;
    }
}

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

    constructor({up = 0, down = 0, left = 0, right = 0} = {}) {
        this.up = isNaN(Number(up)) ? 0 : clamp(Number(up), 0, 2);
        this.down = isNaN(Number(down)) ? 0 : clamp(Number(down), 0, 2);
        this.left = isNaN(Number(left)) ? 0 : clamp(Number(left), 0, 2);
        this.right = isNaN(Number(right)) ? 0 : clamp(Number(right), 0, 2);
    }

    generateIconHTML() {

        let result = '';

        if (this.up == 2 || this.down == 2 || this.left == 2 || this.right == 2)
            result += '<img src="abilities/generic/travel_center_6_a.png" class="ability-icon" style="z-index: 6;"></img>\n';
        else
            result += '<img src="abilities/generic/travel_center_1.png" class="ability-icon" style="z-index: 1;"></img>\n';

        switch (this.left) {
            case 1 :
                result += '<img src="abilities/generic/travel_left_2.png" class="ability-icon" style="z-index: 2;"></img>\n';
                break;
            case 2 :
                result += '<img src="abilities/generic/travel_left_7_a.png" class="ability-icon" style="z-index: 7;"></img>\n';
                break;
            default :
                break;
        }

        switch (this.down) {
            case 1 :
                result += '<img src="abilities/generic/travel_down_3.png" class="ability-icon" style="z-index: 3;"></img>\n';
                break;
            case 2 :
                result += '<img src="abilities/generic/travel_down_8_a.png" class="ability-icon" style="z-index: 8;"></img>\n';
                break;
            default :
                break;
        }

        switch (this.right) {
            case 1 :
                result += '<img src="abilities/generic/travel_right_4.png" class="ability-icon" style="z-index: 4;"></img>\n';
                break;
            case 2 :
                result += '<img src="abilities/generic/travel_right_9_a.png" class="ability-icon" style="z-index: 9;"></img>\n';
                break;
            default :
                break;
        }

        switch (this.up) {
            case 1 :
                result += '<img src="abilities/generic/travel_up_5.png" class="ability-icon" style="z-index: 5;"></img>\n';
                break;
            case 2 :
                result += '<img src="abilities/generic/travel_up_10_a.png" class="ability-icon" style="z-index: 10;"></img>\n';
                break;
            default :
                break;
        }

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
     * Number of ability tree pages unsigned
     * @var int
     */
    pages = 7;

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

    constructor({classs = Object.keys(classDictionary)[0], maxAbilityPoints = MAXABILITYPOINTS_DEFAULT, loopTree = false, pages = PAGES_DEFAULT, rowsPerPage = ROWSPERPAGE_DEFAULT, pagesDisplayed = PAGESDISPLAYED_DEFAULT, bTravesableUp = false} = {}) {
        
        this.classs = Object.keys(classDictionary).includes(String(classs)) ? String(classs) : Object.keys(classDictionary)[0];

        this.maxAbilityPoints = isNaN(Number(maxAbilityPoints)) ? MAXABILITYPOINTS_DEFAULT : clamp(Number(maxAbilityPoints), MAXABILITYPOINTS_LOWER, MAXABILITYPOINTS_UPPER);

        this.pages = isNaN(Number(pages)) ? PAGES_DEFAULT : clamp(Number(pages), PAGES_LOWER, PAGES_UPPER);

        this.rowsPerPage = isNaN(Number(rowsPerPage)) ? ROWSPERPAGE_DEFAULT : clamp(Number(rowsPerPage), ROWSPERPAGE_LOWER, ROWSPERPAGE_UPPER);

        this.pagesDisplayed = isNaN(Number(pagesDisplayed)) ? PAGESDISPLAYED_DEFAULT : clamp(Number(pagesDisplayed), PAGESDISPLAYED_LOWER, Math.min(PAGESDISPLAYED_UPPER, this.pages));

        this.loopTree = Boolean(loopTree) ? Boolean(loopTree) : false;
        this.bTravesableUp = Boolean(bTravesableUp) ? Boolean(bTravesableUp) : false;
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

    constructor({changeDescription, state} = {}) {
        this.change = String(changeDescription) ? String(changeDescription) : '';
        this.state = String(state) ? String(state) : '';
    }
}

const RESPONSETIMEOUT = 5000;
const EDITPATHTEMPCLASS = 'cell-edit-temp-element';
const MAXSELECTEDCELLS = 40;
const CELLIDPREFIX = 'cell-';
const COLUMNS = 9;

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
     * Current page
     * @var int
     */
    currentPage = 1;

    /**
     * Used by initializeEditNode method to keep track of affected cells
     * @var int[]
     */
    selectedCells = [];

    constructor() {
        this.properties = new Properties();
        this.updateEverything();
        this.saveState('Reset tree and settings');
        window.addEventListener("mouseup", (e) => {this.finallizeEditNode()});
    }

    // #region Serialization and history
    toJSON() {
        var result = {};
        for (var x in this) {
            if (x !== "history" && x !== "currentHistoryState" && x !== "selectedAbilityID" && x !== "currentPage"  && x !== "selectedCells") {
                result[x] = this[x];
            }
        }
        return result;
    }

    readProperties(classSelectId = "classSelect", maxAbilityPointsId = MAXABILITYPOINTS_INPUTID, loopTreeId = "loopTreeSwitch", pagesId = PAGES_INPUTID,
        rowsPerPageId = ROWSPERPAGE_INPUTID, pagesDisplayedId = PAGESDISPLAYED_INPUTID, bTravesableUp = "travelUpSwitch") {

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
            loopTree : document.getElementById(loopTreeId).checked,
            pages : document.getElementById(pagesId).value,
            rowsPerPage : document.getElementById(rowsPerPageId).value,
            pagesDisplayed : document.getElementById(pagesDisplayedId).value,
            bTravesableUp : document.getElementById(bTravesableUp).checked
        });
        
        this.updateEverything();
        this.saveState('Updated properties');
    }

    writeProperties(classSelectId = "classSelect", maxAbilityPointsId = MAXABILITYPOINTS_INPUTID, loopTreeId = "loopTreeSwitch", pagesId = PAGES_INPUTID,
        rowsPerPageId = ROWSPERPAGE_INPUTID, pagesDisplayedId = PAGESDISPLAYED_INPUTID, bTravesableUp = "travelUpSwitch") {

        document.getElementById(classSelectId).value = this.properties.classs;
        document.getElementById(maxAbilityPointsId).value = this.properties.maxAbilityPoints;
        document.getElementById(loopTreeId).checked = this.properties.loopTree;
        document.getElementById(pagesId).value = this.properties.pages;
        document.getElementById(rowsPerPageId).value = this.properties.rowsPerPage;
        document.getElementById(pagesDisplayedId).value = this.properties.pagesDisplayed;
        document.getElementById(bTravesableUp).checked = this.properties.bTravesableUp;

    }

    saveState(change = '', jsonContainerID = "json-container") {
        
        const state = JSON.stringify(this, null, 0);

        const numOfPreservedStates = this.currentHistoryState + 1;

        if (this.history.length > numOfPreservedStates) 
            this.history.splice(this.currentHistoryState + 1, this.history.length - numOfPreservedStates);
        
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

        const newStateLog = new StateLog({changeDescription : change, state : state});

        this.currentHistoryState = this.history.push(newStateLog) - 1;

        document.getElementById("json-container").value = state;

        this.renderStates();
    }

    loadStateIncrementally(increment) {

        this.loadState(this.currentHistoryState + increment);

    }

    loadState(stateIndex = -1) {
        if (stateIndex < 0 || stateIndex + 1 > this.history.length)
            return;

        this.loadFromJSON(this.history[stateIndex].state);

        this.currentHistoryState = stateIndex;
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

    updateEverything() {
        this.renderArchetypes();
        this.renderAbilities();
        this.renderTree();
        this.writeProperties();
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
                showSmallToast("Load Failed: couldn't reach server");

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

    loadFromJSON(json) {

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

        document.getElementById("json-container").value = json;
        this.updateEverything();

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
            this.saveState(`Edited archetype: ${minecraftToHTML(oldname)} -> ${minecraftToHTML(newname)}`);

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

    renderArchetypes(containerID = "archetypeContainer") {
        const container = document.getElementById(containerID);
        
        container.innerHTML = "";
        
        for (let archetype of this.archetypes) {

            const div = document.createElement("div");
            div.classList.add('d-inline-flex', 'minecraftTooltip', 'w-100', 'mb-1');

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'overflow-hidden');
            text.innerHTML = minecraftToHTML(archetype);
            div.appendChild(text);
            
            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'ms-2');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#archetypeModal');
            editbtn.addEventListener('click', (e) => this.editArchetype(archetype));
            div.appendChild(editbtn);
            
            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn');
            delbtn.type = "button";
            delbtn.style = "background-color: transparent;";
            delbtn.title = "Delete";
            delbtn.innerHTML = "💀";
            delbtn.addEventListener('click', (e) => this.deleteArchetype(archetype));
            div.appendChild(delbtn);
            
            container.appendChild(div);

        }
    }

    updateArchetype(oldarchetype, newarchetype = "") {

        if (typeof newarchetype != 'string')
            return;

        for (let abilityID of Object.keys(this.abilities)) {
            if (this.abilities[abilityID]['archetype'] == oldarchetype)
                this.abilities[abilityID]['archetype'] = newarchetype;
        }
        
        this.renderAbilities();
    }
    // #endregion

    // #region Abilities
    renderAbilityTypeSelector(selected = "skill", containerId = "abilityTypeInput") {

        const container = document.getElementById(containerId);

        container.innerHTML = "";
        container.value = selected;

        Object.keys(abilityIconDictionary).forEach( (type) => {
            const div = generateIconDiv(type, null, this.properties.classs, type == selected, false);
            div.classList.add('ability-type-selector');
            container.appendChild(div);
            div.addEventListener("click", (e) => { this.renderAbilityTypeSelector(type) });
        });

    }

    renderEditorAbilityTooltip(nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", archetypeFormID = "abilityArchetypeInput",
        pointsRequiredFormID = POINTSREQUIRED_INPUTID, archetypePointsRequiredFormID = ARCHETYPEPOINTSREQUIRED_INPUTID, containerId = "editAbilityTooltip", prerequisiteFormID = "abilityPrerequiseteInput") {
        
        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);
        const container = document.getElementById(containerId);

        const id = prerequisiteInputElement.value;

        container.innerHTML = `
                ${minecraftToHTML(nameInputElement.value)}<br><br>
                ${minecraftToHTML(descriptionInputElement.value)}<br><br>`;

        let blockedAbilities = this.getBlockedAbilities();
        if (blockedAbilities.length > 0) {
            container.innerHTML += `<span style="color:${codeDictionaryColor['c']}">Unlocking will block<br></span>`;
            for (let id of blockedAbilities)
                container.innerHTML += `<span style="color:${codeDictionaryColor['c']}">-&#8288;&nbsp;</span><span style="color:${codeDictionaryColor['7']}">${anyToHTML(this.abilities[id].getPlainName())}<span><br>`;
            container.innerHTML += '<br>';
        }
        
        if (archetypeInputElement.value == "") {
            container.innerHTML += `
                <span style="color:${codeDictionaryColor['7']}">Ability Points:&nbsp;</span>${pointsRequiredInputElement.value}<br>
            `;
        } else {
            container.innerHTML += `
                ${minecraftToHTML(archetypeInputElement.value + ' Archetype')}<br><br>
                <span style="color:${codeDictionaryColor['7']}">Ability Points:&nbsp;</span>${pointsRequiredInputElement.value}<br>                
            `;
            if (archetypePointsRequiredInputElement.value > 0)
                container.innerHTML += `<span style="color:${codeDictionaryColor['7']}">Min ${anyToHTML(stripMinecraftFormatting(archetypeInputElement.value))} Archetype:&nbsp;</span>${archetypePointsRequiredInputElement.value}<br>`;
        }
        
        if (this.abilities[id] != null)
            container.innerHTML += `<span style="color:${codeDictionaryColor['7']}">Required Ability:&nbsp;</span>${anyToHTML(stripMinecraftFormatting(this.abilities[id].name))}`;
    }

    renderHoverAbilityTooltip(abilityId = -1, containerId = "cursorTooltip") {

        const container = document.getElementById(containerId);
        const ability = this.abilities[abilityId];

        if (this.selectedCells.length > 0)
            return;

        container.hidden = false;

        container.innerHTML = `
                ${minecraftToHTML(ability.name)}<br><br>
                ${minecraftToHTML(ability.description)}<br><br>`;

        let blockedAbilities = ability.unlockingWillBlock;
        if (blockedAbilities.length > 0) {
            container.innerHTML += `<span style="color:${codeDictionaryColor['c']}">Unlocking will block<br></span>`;
            for (let id of blockedAbilities)
                container.innerHTML += `<span style="color:${codeDictionaryColor['c']}">-&#8288;&nbsp;</span><span style="color:${codeDictionaryColor['7']}">${anyToHTML(this.abilities[id].getPlainName())}<span><br>`;
            container.innerHTML += '<br>';
        }
        
        if (ability.archetype == "") {
            container.innerHTML += `
                <span style="color:${codeDictionaryColor['7']}">Ability Points:&nbsp;</span>${ability.pointsRequired}<br>
            `;
        } else {
            container.innerHTML += `
                ${minecraftToHTML(ability.archetype + ' Archetype')}<br><br>
                <span style="color:${codeDictionaryColor['7']}">Ability Points:&nbsp;</span>${ability.pointsRequired}<br>                
            `;
            if (ability.archetypePointsRequired > 0)
                container.innerHTML += `<span style="color:${codeDictionaryColor['7']}">Min ${anyToHTML(stripMinecraftFormatting(ability.archetype))} Archetype:&nbsp;</span>${ability.archetypePointsRequired}<br>`;
        }
        
        let requiredAbility = this.abilities[ability.requires]
        if (requiredAbility)
            container.innerHTML += `<span style="color:${codeDictionaryColor['7']}">Required Ability:&nbsp;</span>${anyToHTML(stripMinecraftFormatting(requiredAbility.name))}`;
    }

    hideHoverAbilityTooltip(containerId = "cursorTooltip") {
        const container = document.getElementById(containerId);

        container.hidden = true;
        container.innerHTML = "";
    }

    editAbility(abilityID = -1,
        nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", abilityBlockFormID = "abilityBlockInput", archetypeFormID = "abilityArchetypeInput", pointsRequiredFormID = POINTSREQUIRED_INPUTID,
        archetypePointsRequiredFormID = ARCHETYPEPOINTSREQUIRED_INPUTID, prerequisiteFormID = "abilityPrerequiseteInput") {   

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

                const option = document.createElement('option');
                option.value = id;
                option.innerHTML = anyToHTML(shortenText(stripMinecraftFormatting(this.abilities[id].name), 50));
                option.classList.add("ability-type-" + this.abilities[id].type);
                if (id == this.abilities[abilityID].requires)
                    option.selected = true;
                prerequisiteInputElement.appendChild(option);

                const abilityName = anyToHTML(shortenText(stripMinecraftFormatting(this.abilities[id].name), 50));

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
        this.renderTree();
    }

    deleteAbility(abilityID = -1) {

        if (abilityID == null || abilityID < 0)
            return;

        if (this.abilities[abilityID] != null) {

            for (let elem of Object.keys(this.abilities)) {
                if (this.abilities[elem].requires == abilityID)
                    this.abilities[elem].requires = -1;
            }

            if (this.selectedAbilityID == abilityID)
                this.selectedAbilityID = -1;

            this.removeAbilityFromTree(abilityID);
            const name = this.abilities[abilityID].name;
            delete this.abilities[abilityID];
            this.saveState(`Deleted ability: ${minecraftToHTML(name)}`);
            this.updateEverything();
        }

    }

    sortAbilities() {

        let priorityMap = {};
        Object.keys(abilityIconDictionary).forEach( (elem, i) => {
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
            imgholder.appendChild(generateIconDiv(this.abilities[id].type, null, this.properties.classs, abilitiesOnTree[id], false));

            imgholder.addEventListener('mouseover', (e) => { this.renderHoverAbilityTooltip(id); });
            imgholder.addEventListener('mouseout', (e) => { this.hideHoverAbilityTooltip(); });

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'align-items-center', 'overflow-hidden', 'ms-2');
            text.innerHTML = minecraftToHTML(this.abilities[id].name);
            div.appendChild(text);
            
            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'ms-2');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#abilityModal');
            editbtn.addEventListener('click', (e) => this.editAbility(id));
            div.appendChild(editbtn);
            
            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn');
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
    incrementPage(increment = 0) {

        this.setCurrentPage(this.currentPage + increment);
        this.renderTree();

    }

    setCurrentPage(page = this.currentPage) {

        if (page == null || typeof page != "number" || page < 1)
            return;

        this.currentPage = clamp(page, 1, this.properties.pages - this.properties.pagesDisplayed + 1);

    }

    cellPositionInRow(cellKey) {

        //position in row = (cellKey % cells per page) % cells per row
        let cellPositionInRow = cellKey % (this.properties.rowsPerPage * COLUMNS) % COLUMNS;
        return cellPositionInRow == 0 ? COLUMNS : cellPositionInRow;

    }

    getAdjacentCells(cellKey, bUseCellsAsKeys = false) {

        cellKey = Number(cellKey);
        let result = {};

        const totalCells = this.properties.pages * this.properties.rowsPerPage * COLUMNS;

        //up
        const upKey = cellKey - COLUMNS;
        if (upKey > 0) {

            if (bUseCellsAsKeys)
                result[upKey] = 'up';
            else
                result['up'] = upKey;

        }

        //down
        const downKey = cellKey + COLUMNS;
        if (downKey < totalCells) {

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

    getConnectedCells(cellKey, bAllocatedOnly = false, bTravesableUp = true) {

        const cell = this.cellMap[cellKey];
        const threshold = bAllocatedOnly ? 2 : 1;

        if (cell == null || cell['travelNode'] == null)
            return {};

        const adjacent = this.getAdjacentCells(cellKey, true);
        
        for (let key of Object.keys(adjacent)) {

            const otherCell = this.cellMap[key];
            const direction = adjacent[key];
            const reverseDirection = reverseDirectionDictionary[direction];
            
            if   ( otherCell == null
                || otherCell['travelNode'] == null
                || cell['travelNode'][direction] < threshold
                || otherCell['travelNode'][reverseDirection] < threshold)

                delete adjacent[key];

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

            this.finallizeEditNodes();
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

                    if (this.cellMap[cellKey]['abilityID'] == this.selectedAbilityID)
                        break;

                    this.removeAbilityFromTree(this.selectedAbilityID);
                    this.cellMap[cellKey]['abilityID'] = this.selectedAbilityID;
                    editSummary = `Positioned ${minecraftToHTML(this.abilities[this.selectedAbilityID].name)} on tree`;
                    this.selectedAbilityID = -1;
                    this.renderAbilities();

                    if (this.cellMap[cellKey]['travelNode'] == null)
                        this.cellMap[cellKey]['travelNode'] = new TravelNode({up : 0, down : 0, left : 0, right : 0});
                    
                } else {

                    if (this.cellMap[cellKey]['abilityID'] != null) {

                        const abilityID = this.cellMap[cellKey]['abilityID'];
                        this.removeAbilityFromTree(abilityID);
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

    }

    removeCellFromTree(cellKey) {

        const connected = this.getConnectedCells(cellKey, false, true);
        
        for (let key of Object.keys(connected)) {

            if (this.cellMap[key]['travelNode'] == null)
                continue;

            this.cellMap[key]['travelNode'][ reverseDirectionDictionary[ connected[key] ] ] = 0;

            if (!this.cellMap[key]['travelNode'].hasConnections())
                delete this.cellMap[key];

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

                const connected = this.getConnectedCells(cellKey, false, true);
                
                if (connected.length == 0)
                    this.removeCellFromTree(cellKey);
                else
                    this.cellMap[cellKey]['abilityID'] = null;

            }
        }

        this.renderAbilities();
    }

    renderTree(tableBodyID = "treeTableBody") {

        const table = document.getElementById(tableBodyID);
        if (table == null)
            return;

        table.innerHTML = '';

        this.setCurrentPage();

        const CELLSPERPAGE = this.properties.rowsPerPage * COLUMNS;

        for (let page = this.currentPage; page < this.currentPage + this.properties.pagesDisplayed; page++) {
            
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

                        div = generateIconDiv(
                            this.abilities[ cell['abilityID'] ] ? this.abilities[ cell['abilityID'] ].type : null,
                            cell['travelNode'],
                            this.properties.classs,
                            false,
                            true
                        );

                        if (this.abilities[ cell['abilityID'] ] != null) {

                            div.addEventListener('mouseover', (e) => { this.renderHoverAbilityTooltip(cell['abilityID']); });
                            div.addEventListener('mouseout', (e) => { this.hideHoverAbilityTooltip(); });
    
                        }

                    } else {
                        div = document.createElement('div');
                        div.classList.add("centered-element-container");
                    }

                    div.style.userSelect = 'none';
                    div.addEventListener('mousedown', (e) => { this.initializeEditNode(cellKey) });
                    div.addEventListener('mouseenter', (e) => { this.continueEditNode(cellKey) });
                    newCol.appendChild(div);
                    
                }
            }
        }
    }
    // #endregion
}