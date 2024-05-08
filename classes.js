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

function minecraftToHTML(text = "", delimiter = minecraftDelimiter)
{
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
        result += '</span>';
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

        result += span;
    }

    result += '</span>';

    return result;
}

function insertStringBeforeSelected(insertString) {

    const activeElement = document.activeElement;
    
    if ( !activeElement instanceof HTMLTextAreaElement || !( activeElement instanceof HTMLInputElement && activeElement.type == 'text') ) {
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
}

class Ability
{
    /**
     * ID
     * @var int
     */
    id;
    
    /**
     * Top-most text
     * @var string
     */
    name;

    /**
     * Description
     * @var string
     */
    description;

    /**
     * Archetype
     * @var Archetype
     */
    archetype;

    /**
     * Ability point requirement
     * @var int
     */
    pointsRequired;

    /**
     * Min archetype points required
     * @var int
     */
    archeotypePointsRequired;
}

class Cell
{
    /**
     * Returns a table column element
     * @param  Map
     * @param  Map
     * @return element
     */
    renderCellContents(neighborMap, connectionsMap = new Map())
    {
        const cell = document.createElement('td');
        return cell;
    }
}

class AbilityCell extends Cell
{
    /**
     * Ability occupying the spot (nullable)
     * @var Ability
     */
    ability;

    renderCellContents(neighborMap, connectionsMap = new Map())
    {
        const cell = super.renderCellContents(neighborMap, connectionsMap);
        
        return cell;
    }

    renderHover()
    {
        
    }
}

class TravelCell extends Cell
{
    /**
     * Whether the cell is connected to the one above
     * @var bool
     */
    bConnectedUp;

    /**
     * Whether the cell is connected to the one below
     * @var bool
     */
    bConnectedDown;

    /**
     * Whether the cell is connected to the one on the left
     * @var bool
     */
    bConnectedLeft;

    /**
     * Whether the cell is connected to the one on the right
     * @var bool
     */
    bConnectedRight;
}

class Properties {
    /**
     * Class
     * @var string
     */
    class;

    /**
     * Maximum ability points unsigned
     * @var int
     */
    maxAbilityPoints;

    /**
     * Whether the tree can loop along the left and right edge
     * @var bool
     */
    loopTree;

    /**
     * Number of ability tree pages unsigned
     * @var int
     */
    pages;

    /**
     * How many cells per page
     * @var int
     */
    rowsPerPage;

    /**
     * How many pages are drawn
     * @var int
     */
    pagesDisplayed;

    /**
     * Current page
     * @var int
     */
    currentPage;
    
    /**
     * Whether or not you can go up the tree
     * @var bool
     */
    bTravesableUp;
}

class BaseTree
{
    /**
     * Generic properties of the editor
     * @var Properties
     */
    properties;

    /**
     * archetype : [ability1, ability2]
     * @var Map
     */
    abilities = {'' : []};

    /**
     * A map of cells, keys are cell number if counted left to right, up to down, starting at 1
     * @var Map
     */
    cellMap;

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
        if (nameInputElement == null || nameInputElement.value == "")
            return;

        const oldname = nameInputElement.oldname || "";

        if (oldname == "") {

            this.abilities[nameInputElement.value] = [];

        } else {

            this.abilities[nameInputElement.value] = nameInputElement[nameInputElement.oldname] || [];
            nameInputElement[nameInputElement.oldname] = null;

        }
    }

    /**
     * Returns the html ready string for populating a cell with a clickable (optional)
     * and hoverable picture
     * If bInEditMode is set to true
     * @param  bool  bInEditMode
     * @return strinf
     */
    createTable(bInEditMode)
    {
        const table = document.getElementById('skill-tree');
        if (table == null)
            return;
        table.innerHTML = '';

        for (let page = 1; page <= pages; page++)
        {
            //Row showcasing page number
            const pageDisplay = document.createElement('tr');
            pageDisplay.innerHTML = `<td colspan=${treeWidth}>Page ${page}</td>`;
            table.appendChild(pageDisplay);

            //Actual skill tree
            for (let row = 1; row <= rowsPerPage; row++)
            {
                const rowElement = document.createElement('tr');

                //Adjust cell number to include previous rows
                const adj = (row - 1) * treeWidth + 1;
                for (let cell = $adj; cell < adj + treeWidth; cell++)
                {
                    const bNotEmpty = this.cellMap.has(cell);
                    const bAbilityCell = bNotEmpty && cellMap[cell] instanceof AbilityCell;

                    //Create the cell and assign it an id based on its number reading left to right top to bottom (excluding page # displays)
                    if (bNotEmpty && cellMap[cell] instanceof Cell)
                    {
                        const cellElement = this.cellMap[cell].renderCellContents();
                    } else
                    {
                        const cellElement = document.createElement('td');
                    }
                    cellElement.id = cell;

                    //If the cell contains an ability, give it a hover event displaying said ability's description
                    if (bAbilityCell)
                        cellElement.onhover = this.cellMap[cell].renderHover();

                    //Differantiate between tree editing and testing modes
                    if (bInEditMode)
                        cellElement.onclick = this.editOnClick(cell);
                    else if (bAbilityCell)
                        cellElement.onclick = this.allocateOnClick(cell);
                    
                    
                    

                    table.appendChild(pageDisplay);
                }
                table.appendChild(rowElement);
            }
        }
    }

    /**
     * Takes in a cell mapping and a cell ID; using treeWidth checks whether there are cells ajacent to it
     * returns a map of corresponding booleans
     * @param  bool  bInEditMode
     * @return strinf
     */
    checkAjacent(map, cell)
    {
        const result = new Map(
            'up', map.has(cell - this.treeWidth),
            'down', map.has(cell + this.treeWidth),
            'left', map.has(cell - 1),
            'right', map.has(cell + 1)
        );
        return result;
    }
}