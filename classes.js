//Helper function for finding the key to a map value
function getByValue(map, searchValue)
{
    for (let [key, value] of map.entries())
    {
        if (value === searchValue)
        return key;
    }
}

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

const EDITPATHTEMPCLASS = 'cell-edit-temp-element';
const MAXSELECTEDCELLS = 40;
const CELLIDPREFIX = 'cell-';
const COLUMNS = 9;

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
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function minecraftToHTML(text = "", bStripFormattingInstead = false, delimiter = minecraftDelimiter)
{
    text = sanitizeHTML(text).replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/ /g, '&nbsp');

    result = '<span>';
    let color = '';

    for (let i = 0; i < text.length;) {

        let c = text[i];

        if (c != delimiter) {
            result += c;
            i++;
            continue;
        }
        //else  
        result += bStripFormattingInstead ? '' : '</span>';
        let decoration = '';
        let style = '';

        do {
            i++;
            charactersLeft = text.length - i;
            if (charactersLeft < 1) {
                break;
            }
            c = text[i];

            if (c in codeDictionaryColor) {
                color = codeDictionaryColor[c];
                i++;
                continue;
            }

            if (c in codeDictionaryDecoration) {
                decoration += " " + codeDictionaryDecoration[c];
                i++;
                continue;
            }

            if (c in codeDictionaryStyle) {
                style += " " + codeDictionaryStyle[c];
                i++;
                continue;
            }

            if (c == 'r') {
                color = '';
                style = '';
                decoration = '';
                i++;
                continue;
            }

            if (charactersLeft >= 7 && c == '#') {
                color = text.substring(i, i + 7);
                i += 7;
                continue;
            }
        } while (text[i] == delimiter)

        span = '<span style="';

        if (decoration.length > 0)
            span += `text-decoration:${decoration};`;

        if (color.length > 0)
            span += `color:${color};`;

        if (style.length > 0)
            span += style;

        span += '">';

        if (!bStripFormattingInstead)
            result += span;
    }

    result += '</span>';

    return result;
}

function insertStringBeforeSelected(insertString) {

    const activeElement = document.activeElement;
    if ( !activeElement || !activeElement.type == 'textarea' || !activeElement.type == 'text' ) {
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
    'Archer' : 'abilities/class/archer',
    'Warrior' : 'abilities/class/warrior',
    'Assassin' : 'abilities/class/assassin',
    'Mage' : 'abilities/class/mage',
    'Shaman' : 'abilities/class/shaman',
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

class Ability
{   
    /**
     * Top-most text
     * @var string
     */
    name = '';

    /**
     * Description
     * @var string
     */
    description = '';

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

    constructor({name = '', description = '', archetype = '', pointsRequired = 0, archetypePointsRequired = 0, type = 'skill', requires = -1}) {
        this.name = name ? name : '';
        this.description = description ? description : '';
        this.archetype = archetype ? archetype : '';
        this.pointsRequired = Number(pointsRequired) ? (Number(pointsRequired) < 0 ? 0 : Number(pointsRequired)) : 0;
        this.archetypePointsRequired = Number(archetypePointsRequired) ? (Number(archetypePointsRequired) < 0 ? 0 : Number(archetypePointsRequired)) : 0;
        this.type = type ? type : 'skill';
        this.requires = Number(requires) ? Number(requires) : -1;
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
        this.up = Number(up) ? Number(up) : 0;
        this.down = Number(down) ? Number(down) : 0;
        this.left = Number(left) ? Number(left) : 0;
        this.right = Number(right) ? Number(right) : 0;
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
    maxAbilityPoints = 1;

    /**
     * Whether the tree can loop along the left and right edge
     * @var bool
     */
    loopTree = false;

    /**
     * Number of ability tree pages unsigned
     * @var int
     */
    pages = 1;

    /**
     * How many cells per page
     * @var int
     */
    rowsPerPage = 6;

    /**
     * How many pages are drawn
     * @var int
     */
    pagesDisplayed = 1;
    
    /**
     * Whether or not you can go up the tree
     * @var bool
     */
    bTravesableUp = false;

    constructor({classs = Object.keys(classDictionary)[0], maxAbilityPoints = 1, loopTree = false, pages = 1, rowsPerPage = 6, pagesDisplayed = 1, bTravesableUp = false}) {
        this.classs = String(classs) ? String(classs) : Object.keys(classDictionary)[0];
        this.maxAbilityPoints = Number(maxAbilityPoints) ? Number(maxAbilityPoints) : 1;
        this.loopTree = Boolean(loopTree) ? Boolean(loopTree) : false;
        this.pages = Number(pages) ? Number(pages) : 1;
        this.rowsPerPage = Number(rowsPerPage) ? Number(rowsPerPage) : 6;
        this.pagesDisplayed = Number(pagesDisplayed) ? Number(pagesDisplayed) : 1;
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

    constructor({changeDescription, state}) {
        this.change = String(changeDescription) ? String(changeDescription) : '';
        this.state = String(state) ? String(state) : '';
    }
}

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
     * @var {id : Ability}
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
        this.readProperties();
        this.renderTree();
        window.addEventListener("mouseup", (e) => {this.finallizeEditNode()});
    }

    // Serialization and history
    toJSON() {
        var result = {};
        for (var x in this) {
            if (x !== "history" && x !== "currentHistoryState" && x !== "selectedAbilityID" && x !== "currentPage"  && x !== "selectedCells") {
                result[x] = this[x];
            }
        }
        return result;
    }

    readProperties(classSelectId = "classSelect", maxAbilityPointsId = "maxAbilityPoints", loopTreeId = "loopTreeSwitch", pagesId = "treePages",
        rowsPerPageId = "rowsPerPage", pagesDisplayedId = "pagesDisplayed", bTravesableUp = "travelUpSwitch") {
        
        this.properties = new Properties({
            classs : document.getElementById(classSelectId).value,
            maxAbilityPoints : document.getElementById(maxAbilityPointsId).value,
            loopTree : document.getElementById(loopTreeId).value,
            pages : document.getElementById(pagesId).value,
            rowsPerPage : document.getElementById(rowsPerPageId).value,
            pagesDisplayed : document.getElementById(pagesDisplayedId).value,
            bTravesableUp : document.getElementById(bTravesableUp).value
        });
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

        this.currentHistoryState = stateIndex;

        this.loadFromJSON(this.history[stateIndex].state);

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
    }

    loadTree(jsonContainerID = "json-container") {
        const jsonContainer = document.getElementById(jsonContainerID);
        if (jsonContainer == null) {
            return;
        }

        this.loadFromJSON(jsonContainer.value);

        this.updateEverything();
        this.saveState('Loaded tree from JSON')
    }

    loadFromJSON(json) {
        const obj = JSON.parse(json);

        this.properties = new Properties(obj.properties);
        
        const archetypes = obj.archetypes;
        if (Array.isArray(archetypes)) {

            this.archetypes = [];

            archetypes.forEach(element => {
                this.archetypes.push(element);
            });
        }

        const abilities = obj.abilities;        
        this.abilities = {};            
        Object.keys(abilities).forEach( id => {

            this.abilities[id] = new Ability(abilities[id]);

        });

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
    // End serialization and history

    // Archetypes
    editArchetype(name = "", nameFormID = "archetypeNameInput") {   

        const nameInputElement = document.getElementById(nameFormID);
        if (nameInputElement == null)
            return;

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
        if (!nameInputElement || nameInputElement.value == "" || this.archetypes.includes(nameInputElement.value) )
            return;
        
        const oldname = nameInputElement.oldname ?? "";
        const newname = nameInputElement.value;
        
        if (oldname == "") {
            
            this.archetypes.push(newname);
            this.saveState('Added archetype');
            
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
        if (container == null)
            return;
        
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

        for (let ability of this.abilities) {
            if (ability.archetype == oldarchetype)
                ability.archetype = newarchetype;
        }
        
        this.renderAbilities();
    }
    // End archetypes

    // Abilities
    renderAbilityTypeSelector(selected = "skill", containerId = "abilityTypeInput") {

        const container = document.getElementById(containerId);
        if (!container)
            return;

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
        pointsRequiredFormID = "pointsRequiredInput", archetypePointsRequiredFormID = "archetypePointsRequiredInput", containerId = "editAbilityTooltip", prerequisiteFormID = "abilityPrerequiseteInput") {

        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);
        const container = document.getElementById(containerId);

        if (!nameInputElement || !descriptionInputElement || !archetypeInputElement ||!pointsRequiredInputElement || !archetypePointsRequiredInputElement || !prerequisiteInputElement || !container)
            return;

        const id = prerequisiteInputElement.value;
        
        if (archetypeInputElement.value == "") {
            container.innerHTML = `
                ${minecraftToHTML(nameInputElement.value)}<br><br>
                ${minecraftToHTML(descriptionInputElement.value)}<br><br>
                <span style="color:#A8A8A8">Ability Points:&nbsp&nbsp</span>${pointsRequiredInputElement.value}<br>
            `;
        } else {
            container.innerHTML = `
                ${minecraftToHTML(nameInputElement.value)}<br><br>
                ${minecraftToHTML(descriptionInputElement.value)}<br><br>
                ${minecraftToHTML(archetypeInputElement.value + '&nbsp&nbspArchetype')}<br><br>
                <span style="color:#A8A8A8">Ability Points:&nbsp&nbsp</span>${pointsRequiredInputElement.value}<br>
                <span style="color:#A8A8A8">Min ${minecraftToHTML(archetypeInputElement.value, true)} Points:&nbsp&nbsp</span>${archetypePointsRequiredInputElement.value}<br>
            `;
        }
        
        if (this.abilities[id] != null)
            container.innerHTML += `<span style="color:#A8A8A8">Required Ability:&nbsp&nbsp</span>${minecraftToHTML(this.abilities[id].name, true)}`;
    }

    renderHoverAbilityTooltip(abilityId = -1, containerId = "cursorTooltip") {

        const container = document.getElementById(containerId);
        const ability = this.abilities[abilityId];

        if (!container || !ability || this.selectedCells.length > 0)
            return;

        container.hidden = false;
        
        if (ability.archetype == "") {
            container.innerHTML = `
                ${minecraftToHTML(ability.name)}<br><br>
                ${minecraftToHTML(ability.description)}<br><br>
                <span style="color:#A8A8A8">Ability Points:&nbsp&nbsp</span>${ability.pointsRequired}<br>
            `;
        } else {
            container.innerHTML = `
                ${minecraftToHTML(ability.name)}<br><br>
                ${minecraftToHTML(ability.description)}<br><br>
                ${minecraftToHTML(ability.archetype + '&nbsp&nbspArchetype')}<br><br>
                <span style="color:#A8A8A8">Ability Points:&nbsp&nbsp</span>${ability.pointsRequired}<br>
                <span style="color:#A8A8A8">Min ${minecraftToHTML(ability.archetype, true)} Points:&nbsp&nbsp</span>${ability.archetypePointsRequired}<br>
            `;
        }
        
        let requiredAbility = this.abilities[ability.requires]
        if (requiredAbility)
            container.innerHTML += `<span style="color:#A8A8A8">Required Ability:&nbsp&nbsp</span>${minecraftToHTML(requiredAbility.name, true)}`;
    }

    hideHoverAbilityTooltip(containerId = "cursorTooltip") {
        const container = document.getElementById(containerId);

        if (!container)
            return;

        container.hidden = true;
        container.innerHTML = "";
    }

    editAbility(abilityID = -1,
        nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", archetypeFormID = "abilityArchetypeInput", pointsRequiredFormID = "pointsRequiredInput",
        archetypePointsRequiredFormID = "archetypePointsRequiredInput", typeFormID = "abilityTypeInput", prerequisiteFormID = "abilityPrerequiseteInput") {   

        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const typeInputElement = document.getElementById(typeFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);
        
        if (!nameInputElement || !descriptionInputElement || !archetypeInputElement || !pointsRequiredInputElement || !archetypePointsRequiredInputElement || !typeInputElement || !prerequisiteInputElement)
            return;
        
        if (abilityID < 0) {

            archetypeInputElement.innerHTML = `<option selected value="">Archetype (none)</option>`;
            for (let archetype of this.archetypes) {

                archetypeInputElement.innerHTML += `<option value="${archetype}">${minecraftToHTML(archetype)}</option>`;

            }

            prerequisiteInputElement.innerHTML = `<option selected value="-1">Prerequisite (none)</option>`;
            for (let id of Object.keys(this.abilities)) {

                prerequisiteInputElement.innerHTML += `<option value="${id}">${minecraftToHTML(this.abilities[id].name)}</option>`;

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

            archetypeInputElement.innerHTML = `<option value="">(none)</option>`;
            for (let archetype of this.archetypes) {

                archetypeInputElement.innerHTML += `<option${archetype == this.abilities[abilityID].archetype ? " selected" : ""} value="${archetype}">${minecraftToHTML(archetype)}</option>`;
            
            }

            prerequisiteInputElement.innerHTML = `<option value="-1">(none)</option>`;
            for (let id of Object.keys(this.abilities)) {

                if (id == abilityID)
                    continue;

                prerequisiteInputElement.innerHTML += `<option value="${id}"${id == this.abilities[abilityID].requires ? " selected" : ""}>${minecraftToHTML(this.abilities[id].name)}</option>`;

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

    saveAbility(nameFormID = "abilityNameInput", descriptionFormID = "abilityDescriptionInput", archetypeFormID = "abilityArchetypeInput", pointsRequiredFormID = "pointsRequiredInput",
    archetypePointsRequiredFormID = "archetypePointsRequiredInput", typeFormID = "abilityTypeInput", prerequisiteFormID = "abilityPrerequiseteInput") {

        const nameInputElement = document.getElementById(nameFormID);
        const descriptionInputElement = document.getElementById(descriptionFormID);
        const archetypeInputElement = document.getElementById(archetypeFormID);
        const pointsRequiredInputElement = document.getElementById(pointsRequiredFormID);
        const archetypePointsRequiredInputElement = document.getElementById(archetypePointsRequiredFormID);
        const typeInputElement = document.getElementById(typeFormID);
        const prerequisiteInputElement = document.getElementById(prerequisiteFormID);

        if (!nameInputElement || !descriptionInputElement || !archetypeInputElement ||!pointsRequiredInputElement || !archetypePointsRequiredInputElement || !prerequisiteInputElement)
            return;
        
        const abilityID = nameInputElement.abilityId;
        
        if (this.abilities[abilityID] == null) {

            let maxId = 0;
            for (let id of Object.keys(this.abilities)) {
                maxId = Math.max(maxId, Number(id));
            }

            const newAbility = new Ability({
                name : nameInputElement.value,
                description : descriptionInputElement.value,
                archetype : archetypeInputElement.value,
                pointsRequired : pointsRequiredInputElement.value,
                archetypePointsRequired : archetypePointsRequiredInputElement.value,
                type : typeInputElement.value,
                requires : prerequisiteInputElement.value
            });

            this.abilities[maxId + 1] = newAbility;
            nameInputElement.abilityId = maxId + 1;

            this.saveState(`Added ability: ${minecraftToHTML(nameInputElement.value)}`);

        } else {

            const oldName = this.abilities[abilityID].name;

            this.abilities[abilityID].name = nameInputElement.value;
            this.abilities[abilityID].description = descriptionInputElement.value;
            this.abilities[abilityID].archetype = archetypeInputElement.value;
            this.abilities[abilityID].pointsRequired = pointsRequiredInputElement.value;
            this.abilities[abilityID].archetypePointsRequired = archetypePointsRequiredInputElement.value;
            this.abilities[abilityID].type = typeInputElement.value;
            this.abilities[abilityID].requires = prerequisiteInputElement.value;

            this.saveState(`Edited ability: ${minecraftToHTML(oldName)} -> ${minecraftToHTML(nameInputElement.value)}`);
        }

        this.renderAbilities();
    }

    deleteAbility(id = -1) {

        if (id == null || id < 0)
            return;

        if (this.abilities[id] != null) {
            this.removeAbilityAsRequirement(id);
            const name = this.abilities[id].name;
            delete this.abilities[id];
            this.saveState(`Deleted ability: ${minecraftToHTML(name)}`);
            this.renderAbilities();
        }

    }

    removeAbilityAsRequirement(abilityId = -1) {

        for (let id of Object.keys(this.abilities)) {
            if (this.abilities[id].requires == abilityId)
                this.abilities[id].requires = -1;
        }

    }
    
    renderAbilities(containerID = "abilityContainer") {
        
        const container = document.getElementById(containerID);
        if (container == null)
            return;
        
        container.innerHTML = "";

        let priorityMap = {};
        Object.keys(abilityIconDictionary).forEach( (elem, i) => {
            priorityMap[elem] = i;
        });

        let sortedAbilityIDs = Object.keys(this.abilities).sort((a, b) => {
            
            if (this.abilities[a].type == null)
                return 1;
            if (this.abilities[b].type == null)
                return -1;

            return priorityMap[this.abilities[a].type] - priorityMap[this.abilities[b].type];
        })

        for (let id of sortedAbilityIDs) {

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
            imgholder.appendChild(generateIconDiv(this.abilities[id].type, null, this.properties.classs, true, false));

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
    // End abilities

    // Tree editing
    incrementPage(increment = 0) {

        this.setCurrentPage(this.currentPage + increment);
        this.renderTree();

    }

    setCurrentPage(page = this.currentPage) {

        if (page == null || typeof page != "number" || page < 1)
            return;

        this.currentPage = Math.max( Math.min(page, this.properties.pages - this.properties.pagesDisplayed + 1), 1 );

    }

    getAjacentCells(cellKey, bUseCellsAsKeys = false) {

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

        //position in row = (cellKey % cells per page) % cells per row
        let cellPositionInRow = cellKey % (this.properties.rowsPerPage * COLUMNS) % COLUMNS;
        cellPositionInRow = cellPositionInRow == 0 ? COLUMNS : cellPositionInRow;
        
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

    /**
     * Returns which direction cellKey2 is from cellKey1
     * @returns {string}
     */
    determineCellRelation(cellKey1, cellKey2) {

        const dif = cellKey2 - cellKey1;

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
                this.cellMap[cellKey1] = null;

            if (!this.cellMap[cellKey2]['travelNode'].hasConnections() && this.cellMap[cellKey2]['abilityID'] == null)
                this.cellMap[cellKey2] = null;

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

    continueEditNode(cellKey) {

        const selectedCellsLength = this.selectedCells.length;

        if (selectedCellsLength == 0 || cellKey == null || Number(cellKey) < 1 || Number(cellKey) > this.properties.pages * this.properties.rowsPerPage * COLUMNS)
            return;

        if (selectedCellsLength > MAXSELECTEDCELLS) {

            this.finallizeEditNodes();
            return;

        }
        
        const ajacentCellsMap = this.getAjacentCells(cellKey, true);
        const prevCellKey = this.selectedCells[selectedCellsLength - 1];
        
        // if cell is not ajacent to the last one - ignore it
        if ( ajacentCellsMap[prevCellKey] == null )
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
            switch (ajacentCellsMap[prevCellKey]) {
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

        switch (selectedCellsLength) {
            case 0:
                return;
            
            case 1:
                const cellKey = this.selectedCells[0];

                this.cellMap[cellKey] = this.cellMap[cellKey] ?? {};

                if (this.abilities[this.selectedAbilityID] != null) {

                    this.cellMap[cellKey]['abilityID'] = this.selectedAbilityID;
                    this.cellMap[cellKey]['travelNode'] = new TravelNode({up : 1, down : 1, left : 1, right : 1});
                    this.selectedAbilityID = -1;
                    this.renderAbilities();
                    
                } else {

                    if (this.cellMap[cellKey]['travelNode'] == null)
                        this.cellMap[cellKey]['travelNode'] = new TravelNode({up : 1, down : 1, left : 1, right : 1});
                    else
                        this.cellMap[cellKey] = null;
                        
                }
                break;

            case 2:
                const cellKey1 = this.selectedCells[0];
                const cellKey2 = this.selectedCells[1];

                this.connectCells(cellKey1, cellKey2, true);
                break;

            default:
                for(let cellKey = 0; cellKey < selectedCellsLength - 1; cellKey++) {

                    const cellKey1 = this.selectedCells[cellKey];
                    const cellKey2 = this.selectedCells[cellKey + 1];

                    this.connectCells(cellKey1, cellKey2, false);

                }
                break;
        }

        const collection = document.getElementsByClassName( EDITPATHTEMPCLASS );

        while(collection[0])
            collection[0].parentNode.removeChild(collection[0]);

        this.selectedCells = [];
        this.renderTree();

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
    // End tree editing
}