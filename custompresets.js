import * as utils from './utils.js';
import * as main from './main.js';

let sortedPresets = [];
let treeCache = {};
const MAXCACHEDTREES = 15;
const TOUCHPROCESSOR = new utils.TouchProcessor();

async function initializePresets() {
    if (sortedPresets.length > 0)
        return false;

    let unsortedPresets = await getPresets();
    if (unsortedPresets == null)
        return false;

    sortedPresets = sortPresets(unsortedPresets);
    return true;
}

async function getPresets() {

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('Fetch request timed out');
        }, 5000);

    return await fetch(`presets.json`, {

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

        return JSON.parse(text);

    }).catch( (e) => {
        console.log(e.stack);
        utils.showSmallToast("Load Failed: couldn't reach the server");
        return null;
    }).finally(() => {
        clearTimeout(timeoutId);
    });
}

function sortPresets(presetArray) {
    return presetArray.sort((a, b) => {
        const dif = b["completeness"] - a["completeness"];
        if (dif > 0)
            return 1;
        if (dif < 0)
            return -1;
        
        return a["title"].localeCompare(b["title"]);
    })
}

function filterResults(searchID = "customSearch", classSelectID = "customClassSelect") {
    let filterSubstring = String(document.getElementById(searchID).value).toLowerCase();
    let classs = document.getElementById(classSelectID).value;
    let filteredArray;

    if (classs == 'all')
        filteredArray = sortedPresets;
    else
        filteredArray = sortedPresets.filter( (preset) => {return preset['class'] == classs});

    if (filterSubstring != '')
        filteredArray = filteredArray.filter( (preset) => {
                return preset['credit'].toLowerCase().includes(filterSubstring) || preset['title'].toLowerCase().includes(filterSubstring);
            });
    
    return filteredArray;
}

function cacheTree(filename, tree) {
    if (treeCache[filename] != null) {
        treeCache[filename] = tree;
        return;
    }
    const keys = Object.keys(treeCache);
    if (keys.length >= MAXCACHEDTREES)
        delete treeCache[keys[0]];

    treeCache[filename] = tree;
}

const DELAYBEFOREFETCH = 1000;
async function getPreset(filename) {
    if (treeCache[filename] != null)
        return treeCache[filename];

    await new Promise(r => setTimeout(r, DELAYBEFOREFETCH));

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('Fetch request timed out');
        }, 5000);

    return fetch(`presets/custom/${filename}.json`, {

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

        let tree = new main.BaseTree(false);
        tree.loadFromJSON(text, false, false);
        cacheTree(filename, tree);
        return tree;

    }).catch( (e) => {
        console.log(e);
    }).finally(() => {
        clearTimeout(timeoutId);
    });
}

async function getRandomNodeOfType(filename, type = "red") {

    let tree = await getPreset(filename);
    
    let filteredAbilities = [];
    for(let id of Object.keys(tree.abilities)) {
        if (tree.abilities[id].type == type)
            filteredAbilities.push(id);
    }

    return filteredAbilities[Math.floor(Math.random() * filteredAbilities.length)] ?? -1;
}

async function renderRandomAbilityTooltip(filename, type = "red", signal = {cancel : false}, containerId = "cursorTooltip") {

    const container = document.getElementById(containerId);
    container.hidden = false;
    container.innerHTML = "Loading random ability...";

    (async ()=>{
        const randomAbilityID = await getRandomNodeOfType(filename, type);
        const tree = await getPreset(filename);
        if (!signal.cancel) {
            tree.renderHoverAbilityTooltip(randomAbilityID);
            utils.adjustTooltipSize();
        }    
    })();
}

function generateIconUrl(type, classs = "custom", allocationStatus = 0) {
    
    let iconDictionary = main.abilityIconDictionary;
    
    if (type == 'skill')
        switch (allocationStatus) {
            case 0:
                return iconDictionary[type] + classs + '/skill_dark.png';
            case 1:
                return iconDictionary[type] + classs + '/skill.png';
            case 2:
                return iconDictionary[type] + classs + '/skill_a.png';
            default:
                break;
        }

    else if (type in iconDictionary)
        switch (allocationStatus) {
            case -1:
                return iconDictionary[type] + '_blocked.png';
            case 0:
                return iconDictionary[type] + '_dark.png';
            case 1:
                return iconDictionary[type] + '.png';
            case 2:
                return iconDictionary[type] + '_a.png';
            default:
                break;
        }
    
    return null;
}

export async function renderSearchResults(containerID = "customPresetContainer") {
    await initializePresets();

    const container = document.getElementById(containerID);
    container.innerHTML = "";

    const filteredArray = filterResults();

    if (filteredArray.length == 0) {
        container.innerHTML = "<span style='font-style: italic;'>*crickets*</span>";
        return;
    }

    for (let preset of filteredArray) {
        const div = document.createElement("div");
        div.classList.add('minecraftTooltip', 'w-100', 'mb-3', 'overflow-hidden');

        div.addEventListener('dblclick', async (e) => {
            if (e.pointerType !== "touch") {
                const tree = await getPreset(preset['filename']);
                window.tree.loadFromJSON(JSON.stringify(tree, null, 0));
                window.tree.saveState("Loaded a custom tree");
                window.loadModal.hide();
            }
        });
        div.addEventListener('touchstart', (e) => {
            if (e.target.tagName == "IMG")
                return;
            TOUCHPROCESSOR.processTouch(
                e, 
                async () => {
                    const tree = await getPreset(preset['filename']);
                    window.tree.loadFromJSON(JSON.stringify(tree, null, 0));
                    window.tree.saveState("Loaded a custom tree");
                    window.loadModal.hide();
                }
            );
        }, {passive: false});

        const upper = document.createElement("div");
        upper.classList.add('d-inline-flex', 'w-100', "mb-2");
        div.appendChild(upper);

        const left = document.createElement("div");
        left.classList.add("flex-fill");
        upper.appendChild(left);

        const title = document.createElement("div");
        title.innerHTML = utils.minecraftToHTML(preset['title']);
        left.appendChild(title);

        const credit = document.createElement("div");
        credit.classList.add("customCredit");
        credit.innerHTML = utils.minecraftToHTML('§7by ' + preset['credit']);
        left.appendChild(credit);

        const imgholder = document.createElement("div");
        imgholder.classList.add("d-flex", "align-items-center");
        upper.appendChild(imgholder);

        const description = document.createElement("div");
        description.classList.add("customDescription");
        description.innerHTML = utils.sanitizeHTML(preset['description']);
        div.appendChild(description);
        
        let icons;
        if (preset['class'] == 'custom')
            icons = ['yellow', 'purple', 'blue', 'red', 'skill'];
        else
            icons = ['yellow', 'purple', 'blue', 'red'];
        
        imgholder.id = "customAbilityPreview";
        icons.forEach( (type) => {
            const div = document.createElement("div");
            div.classList.add('ability-type-selector', 'ms-1', 'centered-element-container');

            const img = document.createElement('img');
            img.src = generateIconUrl(type, preset['baseclass'], 1);
            img.style.zIndex = 11;
            div.appendChild(img);

            const cancelRender = {cancel : false};
            div.addEventListener('pointerover', (e) => {
                if (e.pointerType !== "touch") {
                    cancelRender.cancel = false;
                    renderRandomAbilityTooltip(preset['filename'], type, cancelRender);
                    img.src = generateIconUrl(type, preset['baseclass'], 2);
                }
            });
            div.addEventListener('pointerout', (e) => {
                if (e.pointerType !== "touch") {
                    cancelRender.cancel = true;
                    utils.hideHoverAbilityTooltip();
                    img.src = generateIconUrl(type, preset['baseclass'], 1);
                }
            });
            div.addEventListener('touchstart', (e) => {
                
                cancelRender.cancel = false;

                TOUCHPROCESSOR.processTouch(
                    e, 
                    () => {
                        img.src = generateIconUrl(type, preset['baseclass'], 2);
                        document.body.style.overflow = 'hidden';
                        renderRandomAbilityTooltip(preset['filename'], type, cancelRender);
                        utils.movetooltip(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                        
                        document.addEventListener( 'touchstart', (event) => {
                            if (e.target != event.target)
                                cancelRender.cancel = true; img.src = generateIconUrl(type, preset['baseclass'], 1);
                        }, {once: true});
                    }
                );
            }, {passive: false});
            imgholder.appendChild(div);
        });

        container.appendChild(div);
    }
}