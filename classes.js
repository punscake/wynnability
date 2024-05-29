//Helper function for finding the key to a map value
function getByValue(map, searchValue)
{
    for (let [key, value] of map.entries())
    {
        if (value === searchValue)
        return key;
    }
}

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

function generateIconHTML(type, travelnode = new TravelNode(), classs = "", bAllocated = false) {

    let result = "";

    if (typeof travelnode == TravelNode)
        result += travelnode.generateIconHTML();

    if (type == 'travel')
        return;
    
    if (type == 'skill')
        return result + `<img src="${abilityIconDictionary[type] + classs + (bAllocated ? '/skill_a.png' : '/skill.png')}" style="z-index: 5;"></img>`;

    if (type in abilityIconDictionary)
        result += `<img src="${abilityIconDictionary[type] + (bAllocated ? '_a.png' : '.png')}" style="z-index: 5;"></img>`;

    return result;
}

class Ability
{   
    /**
     * ID
     * @var int
     */
    id = 0;

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

    constructor({id = -1, name = '', description = '', archetype = '', pointsRequired = 0, archetypePointsRequired = 0, type = 'skill', requires = -1}) {
        this.id = Number(id) ? Number(id) : -1;
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
        result = "";

        switch (up) {
            case 1 :
                result += '<img src="abilities/generic/travel_up_1.png" style="z-index: 1;"></img>\n';
                break;
            case 2 :
                result += '<img src="abilities/generic/travel_up_1_a.png" style="z-index: 1;"></img>\n';
                break;
            default :
                break;
        }

        switch (down) {
            case 1 :
                result += '<img src="abilities/generic/travel_down_2.png" style="z-index: 2;"></img>\n';
                break;
            case 2 :
                result += '<img src="abilities/generic/travel_down_2_a.png" style="z-index: 2;"></img>\n';
                break;
            default :
                break;
        }

        switch (left) {
            case 1 :
                result += '<img src="abilities/generic/travel_left_3.png" style="z-index: 3;"></img>\n';
                break;
            case 2 :
                result += '<img src="abilities/generic/travel_left_3_a.png" style="z-index: 3;"></img>\n';
                break;
            default :
                break;
        }

        switch (right) {
            case 1 :
                result += '<img src="abilities/generic/travel_right_4.png" style="z-index: 4;"></img>\n';
                break;
            case 2 :
                result += '<img src="abilities/generic/travel_right_4_a.png" style="z-index: 4;"></img>\n';
                break;
            default :
                break;
        }

        return result;
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
     * @var Ability[]
     */
    abilities = [];

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
     * @var {"cellNumber" : "ability"}
     */
    cellMap;

    /**
     * Current page
     * @var int
     */
    currentPage;

    constructor() {
        this.readProperties();
    }

    toJSON() {
        var result = {};
        for (var x in this) {
            if (x !== "history" && x !== "currentHistoryState") {
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
        
        let state = JSON.stringify(this, null, 0);

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
        if (Array.isArray(abilities)) {

            this.abilities = [];

            abilities.forEach(element => {
                this.abilities.push(new Ability(element));
            });
        }

        document.getElementById("json-container").value = json;
        this.updateEverything();
    }

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
        
        const oldname = nameInputElement.oldname || "";
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
            if (ability.archetype = oldarchetype)
                ability.archetype = newarchetype;
        }
        
        this.renderAbilities();
    }
    /*
    getAbilityByID(abilityId = -1) {
        if (abilityId < 0)
            return new Ability();

        let result = new Ability();

        for (let ability in this.abilities) {

            if (ability.id != abilityId)
                continue;

            result.name = ability.name;
            result.description = ability.description;
            result.archetype = ability.archetype;
            result.pointsRequired = ability.pointsRequired;
            result.archetypePointsRequired = ability.archetypePointsRequired;
            result.type = ability.type;
            break;
        }

        return result;
    }
    */
    renderAbilityTypeSelector(selected = "skill", containerId = "abilityTypeInput") {

        const container = document.getElementById(containerId);
        if (!container)
            return;

        container.innerHTML = "";
        container.value = selected;

        Object.keys(abilityIconDictionary).forEach( (type) => {
            const div = document.createElement('div');
            div.classList.add("ability-icon");
            div.innerHTML += generateIconHTML(type, null, this.properties.classs, type == selected);
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
        const index = this.abilities.findIndex( (a) => {return a.id == id} );
        
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
        
        if (index != null && index >= 0)
            container.innerHTML += `<span style="color:#A8A8A8">Required Ability:&nbsp&nbsp</span>${minecraftToHTML(this.abilities[index].name, true)}`;
    }

    renderHoverAbilityTooltip(abilityId = -1, containerId = "cursorTooltip") {

        const container = document.getElementById(containerId);
        const ability = this.abilities.find( (a) => {return a.id == abilityId} );

        if (!container || !ability)
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
        
        let requiredAbility = this.abilities.find( (a) => {return a.id == ability.requires} )
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

    editAbility(id = -1,
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
        
        if (id < 0) {

            archetypeInputElement.innerHTML = `<option selected value="">Archetype (none)</option>`;
            for (let archetype of this.archetypes) {

                archetypeInputElement.innerHTML += `<option value="${archetype}">${minecraftToHTML(archetype)}</option>`;

            }

            prerequisiteInputElement.innerHTML = `<option selected value="-1">Prerequisite (none)</option>`;
            for (let ability of this.abilities) {

                prerequisiteInputElement.innerHTML += `<option value="${ability.id}">${minecraftToHTML(ability.name)}</option>`;

            }

            nameInputElement.abilityId = "";
            nameInputElement.value = "";
            descriptionInputElement.value = "";
            pointsRequiredInputElement.value = 1;
            archetypePointsRequiredInputElement.value = 0;
            prerequisiteInputElement.value = -1;
            this.renderAbilityTypeSelector();

        } else {

            const index = this.abilities.findIndex( (a) => {return a.id == id} );

            if (index == null || index < 0)
                return;

            archetypeInputElement.innerHTML = `<option value="">(none)</option>`;
            for (let archetype of this.archetypes) {

                archetypeInputElement.innerHTML += `<option${archetype == this.abilities[index].archetype ? " selected" : ""} value="${archetype}">${minecraftToHTML(archetype)}</option>`;
            
            }

            prerequisiteInputElement.innerHTML = `<option value="-1">(none)</option>`;
            for (let ability of this.abilities) {

                if (ability.id == id)
                    continue;

                prerequisiteInputElement.innerHTML += `<option value="${ability.id}"${ability.id == this.abilities[index].requires ? " selected" : ""}>${minecraftToHTML(ability.name)}</option>`;

            }

            nameInputElement.abilityId = id;
            nameInputElement.value = this.abilities[index].name;
            descriptionInputElement.value = this.abilities[index].description;
            pointsRequiredInputElement.value = this.abilities[index].pointsRequired;
            archetypePointsRequiredInputElement.value = this.abilities[index].archetypePointsRequired;
            this.renderAbilityTypeSelector(this.abilities[index].type);
            
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
        
        const id = nameInputElement.abilityId;
        const index = this.abilities.findIndex( (a) => {return a.id == id} );
        
        if (index == null || index < 0) {

            let maxId = 0;
            for (let ability of this.abilities) {
                maxId = Math.max(maxId, ability.id);
            }

            const newAbility = new Ability({
                id : maxId + 1,
                name : nameInputElement.value,
                description : descriptionInputElement.value,
                archetype : archetypeInputElement.value,
                pointsRequired : pointsRequiredInputElement.value,
                archetypePointsRequired : archetypePointsRequiredInputElement.value,
                type : typeInputElement.value,
                requires : pointsRequiredInputElement.value
            });

            this.abilities.push(newAbility);
            nameInputElement.abilityId = newAbility.id;

            this.saveState(`Added ability: ${minecraftToHTML(nameInputElement.value)}`);

        } else {

            const oldName = this.abilities[index].name;

            this.abilities[index].name = nameInputElement.value;
            this.abilities[index].description = descriptionInputElement.value;
            this.abilities[index].archetype = archetypeInputElement.value;
            this.abilities[index].pointsRequired = pointsRequiredInputElement.value;
            this.abilities[index].archetypePointsRequired = archetypePointsRequiredInputElement.value;
            this.abilities[index].type = typeInputElement.value;
            this.abilities[index].requires = prerequisiteInputElement.value;

            this.saveState(`Edited ability: ${minecraftToHTML(oldName)} -> ${minecraftToHTML(nameInputElement.value)}`);
        }

        this.renderAbilities();
    }

    deleteAbility(id = -1) {

        if (id == null || id < 0)
            return;

        const index = this.abilities.findIndex( (a) => {return a.id == id} );
        
        if (index > -1)
            this.saveState(`Deleted ability: ${minecraftToHTML( this.abilities.splice(index, 1)[0].name )}`);
 
        this.renderAbilities();
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

        this.abilities.sort((a, b) => {
            
            if (a.type == null)
                return 1;
            if (b.type == null)
                return -1;

            return priorityMap[a.type] - priorityMap[b.type];
        })
        
        for (let ability of this.abilities) {

            const div = document.createElement("div");
            div.classList.add('d-inline-flex', 'align-items-center', 'minecraftTooltip', 'w-100', 'mb-1');

            const imgholder = document.createElement("div");
            imgholder.style = "width: 56px; text-align: center;";
            div.appendChild(imgholder);
            imgholder.innerHTML = generateIconHTML(ability.type, null, this.properties.classs, true);

            imgholder.addEventListener('mouseover', (e) => { this.renderHoverAbilityTooltip(ability.id); });
            imgholder.addEventListener('mouseout', (e) => { this.hideHoverAbilityTooltip(); });

            const text = document.createElement("div");
            text.classList.add('flex-fill', 'align-items-center', 'overflow-hidden', 'ms-2');
            text.innerHTML = minecraftToHTML(ability.name);
            div.appendChild(text);
            
            const editbtn = document.createElement("button");
            editbtn.classList.add('small-btn', 'me-1', 'ms-2');
            editbtn.type = "button";
            editbtn.style = "background-color: transparent;";
            editbtn.title = "Edit";
            editbtn.innerHTML = "✒️";
            editbtn.setAttribute('data-bs-toggle', 'modal');
            editbtn.setAttribute('data-bs-target', '#abilityModal');
            editbtn.addEventListener('click', (e) => this.editAbility(ability.id));
            div.appendChild(editbtn);
            
            const delbtn = document.createElement("button");
            delbtn.classList.add('small-btn');
            delbtn.type = "button";
            delbtn.style = "background-color: transparent;";
            delbtn.title = "Delete";
            delbtn.innerHTML = "💀";
            delbtn.addEventListener('click', (e) => this.deleteAbility(ability.id));
            div.appendChild(delbtn);
            
            container.appendChild(div);

        }
    }
    
}