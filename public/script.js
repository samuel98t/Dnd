// Connect to server , socket will be our individual connection
const socket = io();

let currentAuthenticatedUsername = null;
let currentCharacterSheet = null; // To store the user's sheet
// --- GET AUTH ELEMENTS ---
const authArea = document.getElementById('auth-area');
const loginUsernameInput = document.getElementById('loginUsername');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const registerUsernameInput = document.getElementById('registerUsername');
const registerPasswordInput = document.getElementById('registerPassword');
const registerButton = document.getElementById('registerButton');
const authErrorDisplay = document.getElementById('authError');
// Get App Elements
const playerNameInput = document.getElementById('playerName');
const RollD20Button = document.getElementById('rollD20');
const rollResultDisplay = document.getElementById('rollResult');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInput = document.getElementById('chatInput');
const sendChatButton = document.getElementById('sendChat');
const appContainer = document.getElementById('app-container')
// Get MODAL ELEMENTS 
const sheetModal = document.getElementById('sheetModal');
const openSheetButton = document.getElementById('openSheetButton');
const closeSheetModalButton = document.getElementById('closeSheetModal');
const modalSheetContent = document.getElementById('modalSheetContent');
const saveSheetButton = document.getElementById('saveSheetButton');
// Get Inventory Modal Elements
const openInventoryButton = document.getElementById('openInventoryButton');
const inventoryModal = document.getElementById('inventoryModal');
const closeInventoryModalButton = document.getElementById('closeInventoryModal');
const modalInventoryContent = document.getElementById('modalInventoryContent');
const saveInventoryButton = document.getElementById('saveInventoryButton');
// CONSTANTS for Character Sheet ---
const ABILITIES_KEYS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
const SAVING_THROW_ABILITY_MAP = {
    savingStrengthProficient: 'strength',
    savingDexterityProficient: 'dexterity',
    savingConstitutionProficient: 'constitution',
    savingIntelligenceProficient: 'intelligence',
    savingWisdomProficient: 'wisdom',
    savingCharismaProficient: 'charisma',
};
// Skills
const SKILLS = [
    { key: 'skillAthleticsProficient', label: 'Athletics', ability: 'strength' },
    { key: 'skillAcrobaticsProficient', label: 'Acrobatics', ability: 'dexterity' },
    { key: 'skillSleightOfHandProficient', label: 'Sleight of Hand', ability: 'dexterity' },
    { key: 'skillStealthProficient', label: 'Stealth', ability: 'dexterity' },
    { key: 'skillArcanaProficient', label: 'Arcana', ability: 'intelligence' },
    { key: 'skillHistoryProficient', label: 'History', ability: 'intelligence' },
    { key: 'skillInvestigationProficient', label: 'Investigation', ability: 'intelligence' },
    { key: 'skillNatureProficient', label: 'Nature', ability: 'intelligence' },
    { key: 'skillReligionProficient', label: 'Religion', ability: 'intelligence' },
    { key: 'skillAnimalHandlingProficient', label: 'Animal Handling', ability: 'wisdom' },
    { key: 'skillInsightProficient', label: 'Insight', ability: 'wisdom' },
    { key: 'skillMedicineProficient', label: 'Medicine', ability: 'wisdom' },
    { key: 'skillPerceptionProficient', label: 'Perception', ability: 'wisdom' },
    { key: 'skillSurvivalProficient', label: 'Survival', ability: 'wisdom' },
    { key: 'skillDeceptionProficient', label: 'Deception', ability: 'charisma' },
    { key: 'skillIntimidationProficient', label: 'Intimidation', ability: 'charisma' },
    { key: 'skillPerformanceProficient', label: 'Performance', ability: 'charisma' },
    { key: 'skillPersuasionProficient', label: 'Persuasion', ability: 'charisma' },
];
// Get sidebar
const userListUL = document.getElementById('user-list');
// Connection Test
console.log("Socket.IO script loaded, trying to connect...");
// Listen for connect
socket.on('connect',()=>{
    console.log(`Connected to server! Socket ID:`, socket.id);

});
// Listen for disconnect
socket.on('disconnect',()=>{
    console.log('Disconnected from server!');
});
// Listen for roll error
socket.on('roll error', (errorData) => {
    console.error('Roll Error:', errorData.message);
    addMessageToChat(`Error: ${errorData.message}`); // Display error in chat
    // Show error on display
    rollResultDisplay.textContent = `Error: ${errorData.message}`;
});
// Give chat history to new user
socket.on('chat history',(history)=>{
    chatMessagesDiv.innerHTML=''; // Clear current messages
    history.forEach(msg=>{
        if (msg.type === 'roll') {
            addMessageToChat(msg.text); // msg.text already formatted for rolls
        } else if (msg.type === 'chat' && msg.sender && msg.text) {
            addMessageToChat(`${msg.sender}: ${msg.text}`);
        } else if (msg.text) { // For simple system messages
             addMessageToChat(msg.text);
        }
    });
});

// Basic chat implement.
function addMessageToChat(message){
    const msgElement = document.createElement('p');
    msgElement.textContent = message;
    chatMessagesDiv.appendChild(msgElement);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Autoscroll
}

sendChatButton.addEventListener('click',()=>{
    const message = chatInput.value.trim();
    const senderName = getPlayerName();
    if(message){
        // Send the message to server.
        socket.emit('client message',{sender:senderName,text:message});
        chatInput.value = ''; // Clear input
    }
});

// Add enter to send chat
chatInput.addEventListener('keydown',(event)=>{
    if(event.key === "Enter"){
        console.log("Enter key was pressed!");
        const senderName = getPlayerName();
        const message = chatInput.value.trim();
        if(message){
            socket.emit('client message',{sender:senderName,text:message});
            chatInput.value='' // Clear input
        }
    }
});

// Listen to messages from server
socket.on('server message',(msgData)=>{
    // Check msgData type
    if(typeof(msgData)==='string'){
        addMessageToChat(msgData);
    }
    else if(msgData && msgData.sender && msgData.text){
        addMessageToChat(`${msgData.sender}: ${msgData.text}`);
    }
    else if (msgData && msgData.text){
        addMessageToChat(msgData.text);
    }
});

// Func to get player name
function getPlayerName(){
    return currentAuthenticatedUsername || playerNameInput.value.trim() || `Player ${socket.id.substring(0,5)}`;
}

// Dice Roll 
RollD20Button.addEventListener('click',() =>{
    const rollerName = getPlayerName();
    const rollType = "1d20" // ill make it more dynamic later
    // Send to server
    console.log(`Emitting 'dice roll' event :${rollerName} rolls ${rollType}`);
    // Roll data
    socket.emit('dice roll',{
        rollerName: rollerName,
        rollString: rollType,
    });
});

// Listen to roll results from the server
socket.on('roll result',(data)=>{
    console.log(`Recieved 'roll result' event`,data);
    const message = `${data.rollerName} rolled ${data.rollString}: ${data.result}`;
    addMessageToChat(message);// Display in chat
    rollResultDisplay.textContent = `Last roll: ${data.rollerName} got ${data.result}`; // Update general display
});

// Placeholder for Character Sheet
// Add listeners to emit changes to server later

// Inital message
addMessageToChat('Welcome! Connecting to server...');

// Auth Handling
if(loginButton){
    loginButton.addEventListener('click',()=>{
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        if(username&&password){
            socket.emit('login',{username,password});
            authErrorDisplay.textContent='';
        }else{
            authErrorDisplay.textContent='Username and password are required for login';
        }
    });
}

if(registerButton){
    registerButton.addEventListener('click',()=>{
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value.trim();
        if (username && password){
            socket.emit('register',{username,password});
            authErrorDisplay.textContent='';
        }else{
            authErrorDisplay.textContent="Username and password are required for registeration";
        }
    });
}
// Listen for auth success 
socket.on('auth success', (authData) => {
    console.log('Auth Success:', authData);
    currentAuthenticatedUsername = authData.username;
    currentCharacterSheet = authData.sheet;

    // Update UI
    if (authArea) authArea.style.display = 'none';
    if (appContainer) appContainer.style.display = ''; 

    if (playerNameInput) {
        playerNameInput.value = currentAuthenticatedUsername;
    }

    addMessageToChat(`Logged in as ${currentAuthenticatedUsername}. Welcome!`);
    authErrorDisplay.textContent = ''; // Clear any auth errors
});

// Listen for auth error
socket.on('auth error', (errorData) => {
    console.error('Auth Error:', errorData.message);
    if (authErrorDisplay) {
        authErrorDisplay.textContent = `Error: ${errorData.message}`;
    }
    
});

//Modal Control
if(openSheetButton){
    openSheetButton.addEventListener('click',()=>{
        if(currentCharacterSheet){
            populateSheetModal(currentCharacterSheet);
            sheetModal.style.display='block';
        }else{
            console.error("Error opening char sheet");
        }
    });
}
if(closeSheetModalButton){
    closeSheetModalButton.addEventListener('click',()=>{
        sheetModal.style.display='none';
    });
}
// Close if user clicks outside it too
window.addEventListener('click',(event)=>{
    if(event.target===sheetModal){
        sheetModal.style.display='none';
    }
    if (event.target ===inventoryModal){
        inventoryModal.style.display='none';
    }
});

function calculateModifier(score) {
    const numericScore = parseInt(score, 10);
    if (isNaN(numericScore)) {
        return 'N/A'; 
    }
    const modifier = Math.floor((numericScore - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`; // Prepends '+' for positive/zero
}

function populateSheetModal(sheetData) {
    if (!sheetData) {
        modalSheetContent.innerHTML = '<p>Error: No sheet data available.</p>';
        return;
    }

    modalSheetContent.innerHTML = ''; // Clear previous content

    const createDetailElement = (label, value, isEditable = false, fieldKey = null, inputTypeOverride = null, changeListener = null) => {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        p.appendChild(strong);

        if (isEditable && fieldKey) {
            const input = document.createElement('input');
            if (inputTypeOverride) {
                input.type = inputTypeOverride;
            } else if (typeof value === 'number' || ['hpCurr', 'HpMax', 'characterLevel', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'inspiration', 'characterArmor', 'Initiative', /* ProficiencyBonus handled below */ 'characterSpeed'].includes(fieldKey) || fieldKey === 'ProficiencyBonus') {
                input.type = 'number';
            } else {
                input.type = 'text';
            }
            input.value = value !== undefined && value !== null ? value : (input.type === 'number' ? 0 : '');
            input.dataset.field = fieldKey;
            input.id = `sheetInput-${fieldKey}`;
            p.appendChild(input);

            if (changeListener) {
                input.addEventListener('input', changeListener);
            }

            const abilityScores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            if (abilityScores.includes(fieldKey)) {
                const modSpan = document.createElement('span');
                modSpan.id = `sheetMod-${fieldKey}`;
                modSpan.textContent = ` (Mod: ${calculateModifier(input.value)})`;
                modSpan.style.marginLeft = '10px';
                p.appendChild(modSpan);
                input.addEventListener('input', (event) => { // Listener for ability score input
                    modSpan.textContent = ` (Mod: ${calculateModifier(event.target.value)})`;
                    updateAllModalBonuses(); // Recalculate dependent bonuses
                });
            }
        } else {
            p.appendChild(document.createTextNode(value || 'N/A'));
        }
        return p;
    };

    const createProficiencyElement = (labelText, fieldKey, baseAbilityKey, initialValue, proficiencyBonus, changeListener) => {
        const p = document.createElement('p');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = initialValue || false;
        checkbox.dataset.field = fieldKey;
        checkbox.id = `sheetInput-${fieldKey}`;
        if (changeListener) {
            checkbox.addEventListener('change', changeListener);
        }
        p.appendChild(checkbox);

        const label = document.createElement('label');
        label.htmlFor = `sheetInput-${fieldKey}`;
        label.textContent = ` ${labelText} `;
        label.style.cursor = 'pointer';
        p.appendChild(label);

        const bonusSpan = document.createElement('span');
        bonusSpan.id = `sheetBonus-${fieldKey}`;
        bonusSpan.style.marginLeft = '5px';
        // Initial calculation will be done by updateAllModalBonuses later
        p.appendChild(bonusSpan);
        
        const baseAbilitySpan = document.createElement('span');
        baseAbilitySpan.textContent = ` (${baseAbilityKey.substring(0,3).toUpperCase()})`;
        baseAbilitySpan.style.fontSize = '0.8em';
        baseAbilitySpan.style.color = '#555';
        p.appendChild(baseAbilitySpan);

        return p;
    };

    // Basic Info
    const basicInfoDiv = document.createElement('div');
    basicInfoDiv.innerHTML = '<h3>Basic Information</h3>';
    basicInfoDiv.appendChild(createDetailElement('Player Name', sheetData.playerName));
    basicInfoDiv.appendChild(createDetailElement('Character Name', sheetData.characterName, true, 'characterName'));
    basicInfoDiv.appendChild(createDetailElement('Class', sheetData.characterClass, true, 'characterClass'));
    basicInfoDiv.appendChild(createDetailElement('Subclass', sheetData.characterSubClass, true, 'characterSubClass'));
    basicInfoDiv.appendChild(createDetailElement('Level', sheetData.characterLevel, true, 'characterLevel', 'number'));
    basicInfoDiv.appendChild(createDetailElement('Race', sheetData.characterRace, true, 'characterRace'));
    basicInfoDiv.appendChild(createDetailElement('Background', sheetData.characterBackground, true, 'characterBackground'));
    basicInfoDiv.appendChild(createDetailElement('Alignment', sheetData.characterAlignment, true, 'characterAlignment'));
    modalSheetContent.appendChild(basicInfoDiv);
    modalSheetContent.appendChild(document.createElement('hr'));

    // Combat Stats
    const combatStatsDiv = document.createElement('div');
    combatStatsDiv.innerHTML = '<h3>Combat Stats</h3>';
    combatStatsDiv.appendChild(createDetailElement('Current HP', sheetData.hpCurr, true, 'hpCurr', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Max HP', sheetData.HpMax, true, 'HpMax', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Armor Class', sheetData.characterArmor, true, 'characterArmor', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Initiative', sheetData.Initiative, true, 'Initiative', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Speed', sheetData.characterSpeed, true, 'characterSpeed', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Hit Dice', sheetData.hitDice, true, 'hitDice'));
    combatStatsDiv.appendChild(createDetailElement('Inspiration', sheetData.inspiration, true, 'inspiration', 'number'));
    // Proficiency Bonus
    combatStatsDiv.appendChild(createDetailElement('Proficiency Bonus', sheetData.ProficiencyBonus, true, 'ProficiencyBonus', 'number', updateAllModalBonuses));
    modalSheetContent.appendChild(combatStatsDiv);
    modalSheetContent.appendChild(document.createElement('hr'));

    // Abilities
    const abilitiesDiv = document.createElement('div');
    abilitiesDiv.innerHTML = '<h3>Abilities</h3>';
    const abilitiesGrid = document.createElement('div');
    abilitiesGrid.className = 'sheet-grid';
    ABILITIES_KEYS.forEach(key => {
        abilitiesGrid.appendChild(createDetailElement(key.charAt(0).toUpperCase() + key.slice(1), sheetData[key], true, key, 'number'));
    });
    abilitiesDiv.appendChild(abilitiesGrid);
    modalSheetContent.appendChild(abilitiesDiv);
    modalSheetContent.appendChild(document.createElement('hr'));

    // Saving Throws
    const savingThrowsDiv = document.createElement('div');
    savingThrowsDiv.innerHTML = '<h3>Saving Throws</h3>';
    const stGrid = document.createElement('div');
    stGrid.className = 'sheet-grid three-columns'; // Add a class for styling if needed
    for (const fieldKey in SAVING_THROW_ABILITY_MAP) {
        const abilityKey = SAVING_THROW_ABILITY_MAP[fieldKey];
        const label = abilityKey.charAt(0).toUpperCase() + abilityKey.slice(1);
        stGrid.appendChild(
            createProficiencyElement(label, fieldKey, abilityKey, sheetData[fieldKey], sheetData.ProficiencyBonus, updateAllModalBonuses)
        );
    }
    savingThrowsDiv.appendChild(stGrid);
    modalSheetContent.appendChild(savingThrowsDiv);
    modalSheetContent.appendChild(document.createElement('hr'));
    
    // Skills
    const skillsDiv = document.createElement('div');
    skillsDiv.innerHTML = '<h3>Skills</h3>';
    const skillsGrid = document.createElement('div'); // Using a grid for skills
    skillsGrid.className = 'sheet-grid three-columns'; // Can style this for 2 or 3 columns
    SKILLS.forEach(skill => {
        skillsGrid.appendChild(
            createProficiencyElement(skill.label, skill.key, skill.ability, sheetData[skill.key], sheetData.ProficiencyBonus, updateAllModalBonuses)
        );
    });
    skillsDiv.appendChild(skillsGrid);
    modalSheetContent.appendChild(skillsDiv);

    // Call to set initial calculated bonus values
    setTimeout(updateAllModalBonuses, 0); // setTimeout to ensure DOM is updated

    if (saveSheetButton) saveSheetButton.style.display = 'inline-block';
}


// Update Save Sheet Button logic
if (saveSheetButton) {
    saveSheetButton.addEventListener('click', () => {
        if (!currentCharacterSheet || !currentAuthenticatedUsername) {
            // ... (error handling) ...
            return;
        }

        const updatedSheetData = {};
        // Text, number inputs
        const inputs = modalSheetContent.querySelectorAll('input[data-field][type="text"], input[data-field][type="number"]');
        inputs.forEach(currentInput => {
            const fieldKey = currentInput.dataset.field;
            let value = currentInput.value;
            const originalValue = currentCharacterSheet[fieldKey];

            if (currentInput.type === 'number' || (typeof originalValue === 'number' && value.trim() !== '')) {
                value = parseFloat(value);
                if (isNaN(value)) {
                    value = (typeof originalValue === 'number' && !isNaN(originalValue)) ? originalValue : 0;
                }
            }
            updatedSheetData[fieldKey] = value;
        });

        // Checkbox inputs (for proficiencies)
        const checkboxes = modalSheetContent.querySelectorAll('input[data-field][type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const fieldKey = checkbox.dataset.field;
            updatedSheetData[fieldKey] = checkbox.checked; // Booleans
        });

        console.log("Emitting 'update character sheet' with data:", updatedSheetData);
        socket.emit('update character sheet', {
            sheetUpdates: updatedSheetData
        });
        addMessageToChat("Saving character sheet changes...");
    });
}

        
    socket.on('sheet update error', (errorData) => {
    console.error('Sheet Update Error:', errorData.message);
    addMessageToChat(`Error saving sheet: ${errorData.message}`);
});
// Listen for updated
socket.on('character sheet updated', (data) => {
    console.log('Received "character sheet updated":', data);

    if (data.playerName === currentAuthenticatedUsername) {
        if (!currentCharacterSheet) currentCharacterSheet = {};
        // Deep merge might be better if sheet structure is complex, but for flat fields this is fine
        Object.assign(currentCharacterSheet, data.updatedSheet);
        
        addMessageToChat(`Your sheet data has been updated.`);

        if (sheetModal.style.display === 'block') {
            populateSheetModal(currentCharacterSheet); // This will re-render and re-attach listeners
        }
        if (inventoryModal.style.display === 'block' && data.updatedSheet.inventory) {
             populateInventoryModal(currentCharacterSheet.inventory || []);
        }
    } else {
        // If you store all sheets locally for some reason, update that specific sheet.
        console.log(`Sheet updated for ${data.playerName} (another user).`);
    }
});

// sidebar helper func
function updateUserList(users) {
    if (!userListUL) return; 

    userListUL.innerHTML = ''; // Clear the current list )

    if (users && users.length > 0) {
        users.forEach(username => {
            const li = document.createElement('li');
            li.textContent = username;
            if (username === currentAuthenticatedUsername) {
                li.innerHTML += ' <strong>(You)</strong>'; // Highlight the current user
            }
            userListUL.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No active users.';
        userListUL.appendChild(li);
    }
}
// listen for user list updates from server
socket.on('update user list', (userArray) => { // userArray is expected to be an array of usernames
    console.log('Received "update user list":', userArray);
    updateUserList(userArray);
});

// Populate inventory modal
function populateInventoryModal(inventoryDataArray) {
    if (!modalInventoryContent) {
        console.error("element not found");
        return;
    }
    modalInventoryContent.innerHTML = '';

    const inventoryListContainerDiv = document.createElement('div');
    inventoryListContainerDiv.id = 'inventory-list-display';

    // Fixing syntax errors here
    const createInventoryItemRowElement = (item = {}, index) => {
        const itemRowDiv = document.createElement('div'); // Declare the itemRowDiv
        itemRowDiv.className = 'inventory-item-row';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = item.name || '';
        nameInput.placeholder = "Item Name";
        nameInput.className = 'inventory-item-name';

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.value = item.quantity === undefined ? 1 : item.quantity; // Fixing assignment with `=`
        qtyInput.min = '0';
        qtyInput.placeholder = 'Quantity';
        qtyInput.className = "inventory-item-qty";

        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.value = item.description || '';
        descInput.placeholder = 'Description (optional)';
        descInput.className = 'inventory-item-desc';

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-item-btn';
        removeButton.type = 'button';
        removeButton.onclick = () => {
            itemRowDiv.remove();
        };

        itemRowDiv.appendChild(nameInput);
        itemRowDiv.appendChild(qtyInput);
        itemRowDiv.appendChild(descInput);
        itemRowDiv.appendChild(removeButton);

        return itemRowDiv;
    };

    if (inventoryDataArray && Array.isArray(inventoryDataArray)) {
        inventoryDataArray.forEach((item, index) => {
            inventoryListContainerDiv.appendChild(createInventoryItemRowElement(item, index));
        });
    }else{
        const noItemsMsg = document.createElement('p');
        noItemsMsg.textContent = "No items in inventory. Click 'Add New Item' to start.";
        inventoryListContainerDiv.appendChild(noItemsMsg);
    }
    modalInventoryContent.appendChild(inventoryListContainerDiv);
    // "Add New Item" button for the inventory modal
    const addItemButton = document.createElement('button');
    addItemButton.textContent = 'Add New Item';
    addItemButton.type = 'button';
    addItemButton.id = 'add-inventory-item-btn'; // For CSS styling
    addItemButton.onclick = () => {
        const noItemsMessageElement = inventoryListContainerDiv.querySelector('p');
        if (noItemsMessageElement && noItemsMessageElement.textContent.startsWith("No items")) {
            noItemsMessageElement.remove();
        }
        
        const newItemRow = createInventoryItemRowElement(); // Creates a blank item row
        inventoryListContainerDiv.appendChild(newItemRow);
        const newNameInput = newItemRow.querySelector('.inventory-item-name');
        if (newNameInput) {
            newNameInput.focus(); 
        }
    };
    modalInventoryContent.appendChild(addItemButton);

    if (saveInventoryButton) saveInventoryButton.style.display = 'inline-block';
}
// Open inventory
if (openInventoryButton) {
    openInventoryButton.addEventListener('click', () => {
        if (currentCharacterSheet) {
            // currentCharacterSheet.inventory should exist (even as [])
            // due to server-side schema default and auth success data
            populateInventoryModal(currentCharacterSheet.inventory || []);
            inventoryModal.style.display = 'block';
        } else {
            addMessageToChat("Please log in to manage inventory.");
            console.warn("Cannot open inventory: currentCharacterSheet is not available.");
        }
    });
}
// Close inventory
if (closeInventoryModalButton) {
    closeInventoryModalButton.addEventListener('click', () => {
        inventoryModal.style.display = 'none';
    });
}

// Save inventory 
if (saveInventoryButton) {
    saveInventoryButton.addEventListener('click', () => {
        if (!currentCharacterSheet || !currentAuthenticatedUsername) {
            console.error("Cannot save inventory: User not authenticated or sheet data missing.");
            addMessageToChat("Error: Cannot save inventory. Please log in again.");
            return;
        }

        const newInventory = [];
        // Select all DOM rows representing inventory items from the inventory modal
        const inventoryItemRows = modalInventoryContent.querySelectorAll('#inventory-list-display .inventory-item-row');

        inventoryItemRows.forEach(row => {
            const nameInput = row.querySelector('.inventory-item-name');
            const qtyInput = row.querySelector('.inventory-item-qty');
            const descInput = row.querySelector('.inventory-item-desc');

            const name = nameInput ? nameInput.value.trim() : '';
            const quantity = qtyInput ? parseInt(qtyInput.value, 10) : 1; // Default to 1 if not parsable
            const description = descInput ? descInput.value.trim() : '';

            if (name) { // Only add/save the item if it has a name
                newInventory.push({
                    name: name,
                    quantity: isNaN(quantity) || quantity < 0 ? 0 : quantity, // Ensure quantity is valid
                    description: description
                });
            }
        });

        console.log("Emitting 'update character sheet' (inventory only) with data:", newInventory);
        socket.emit('update character sheet', {
            sheetUpdates: { inventory: newInventory } // Send ONLY the inventory array
        });

        addMessageToChat("Saving inventory changes...");
    });
}
// Helper to get proficiency bonus value 
function getProficiencyBonusValue(sheetDataOrInput) {
    let pbVal = 0;
    if (typeof sheetDataOrInput === 'number') { // If direct value passed
        pbVal = sheetDataOrInput;
    } else if (sheetDataOrInput && typeof sheetDataOrInput.value === 'string') { // If it's an input element
         pbVal = parseInt(sheetDataOrInput.value, 10);
    } else if (currentCharacterSheet) { // Fallback to currentCharacterSheet
        pbVal = parseInt(currentCharacterSheet.ProficiencyBonus, 10);
    }
    return isNaN(pbVal) ? 0 : pbVal;
}
// Helper to get proficiency bonus value (now a number)
function getProficiencyBonusValue(sheetDataOrInput) {
    let pbVal = 0;
    if (typeof sheetDataOrInput === 'number') { // If direct value passed
        pbVal = sheetDataOrInput;
    } else if (sheetDataOrInput && typeof sheetDataOrInput.value === 'string') { // If it's an input element
         pbVal = parseInt(sheetDataOrInput.value, 10);
    } else if (currentCharacterSheet) { // Fallback to currentCharacterSheet
        pbVal = parseInt(currentCharacterSheet.ProficiencyBonus, 10);
    }
    return isNaN(pbVal) ? 0 : pbVal;
}


// Centralized function to update all calculated bonuses in the modal
function updateAllModalBonuses() {
    if (sheetModal.style.display !== 'block') return; // Only run if modal is visible

    const pbInput = document.getElementById('sheetInput-ProficiencyBonus');
    const currentPB = pbInput ? getProficiencyBonusValue(pbInput) : getProficiencyBonusValue(currentCharacterSheet?.ProficiencyBonus || 2);

    const abilityScoreValues = {};
    ABILITIES_KEYS.forEach(abilityKey => {
        const inputEl = document.getElementById(`sheetInput-${abilityKey}`);
        abilityScoreValues[abilityKey] = inputEl ? parseInt(inputEl.value, 10) : (currentCharacterSheet?.[abilityKey] || 10);
    });

    // Update Saving Throw Bonuses
    for (const fieldKey in SAVING_THROW_ABILITY_MAP) {
        const abilityKey = SAVING_THROW_ABILITY_MAP[fieldKey];
        const abilityScore = abilityScoreValues[abilityKey];
        const modifier = calculateModifier(abilityScore);

        const checkbox = document.getElementById(`sheetInput-${fieldKey}`);
        const isProficient = checkbox ? checkbox.checked : (currentCharacterSheet?.[fieldKey] || false);
        
        const bonus = parseInt(modifier) + (isProficient ? currentPB : 0);
        const bonusDisplay = document.getElementById(`sheetBonus-${fieldKey}`);
        if (bonusDisplay) {
            bonusDisplay.textContent = `${bonus >= 0 ? '+' : ''}${bonus}`;
        }
    }

    // Update Skill Bonuses
    SKILLS.forEach(skill => {
        const abilityKey = skill.ability;
        const abilityScore = abilityScoreValues[abilityKey];
        const modifier = calculateModifier(abilityScore);

        const checkbox = document.getElementById(`sheetInput-${skill.key}`);
        const isProficient = checkbox ? checkbox.checked : (currentCharacterSheet?.[skill.key] || false);

        const bonus = parseInt(modifier) + (isProficient ? currentPB : 0);
        const bonusDisplay = document.getElementById(`sheetBonus-${skill.key}`);
        if (bonusDisplay) {
            bonusDisplay.textContent = `${bonus >= 0 ? '+' : ''}${bonus}`;
        }
    });
     // Update ability modifiers themselves
    ABILITIES_KEYS.forEach(abilityKey => {
        const inputEl = document.getElementById(`sheetInput-${abilityKey}`);
        if (inputEl) {
            const modSpan = document.getElementById(`sheetMod-${abilityKey}`);
            if (modSpan) {
                modSpan.textContent = ` (Mod: ${calculateModifier(inputEl.value)})`;
            }
        }
    });
}
