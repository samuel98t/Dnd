// Connect to server , socket will be our individual connection
const socket = io();
let currentUserIsDM = false;
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
const rollResultDisplay = document.getElementById('rollResult');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInput = document.getElementById('chatInput');
const sendChatButton = document.getElementById('sendChat');
const appContainer = document.getElementById('app-container');
// NEW DM Tool Elements
const dmToolsSection = document.getElementById('dm-tools-section');
const dmSecretDiceInput = document.getElementById('dmSecretDiceInput');
const dmSecretDescriptionInput = document.getElementById('dmSecretDescriptionInput');
const dmSecretRollButton = document.getElementById('dmSecretRollButton');
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
// Get Feats & Traits Modal Elements
const openFeatsButton = document.getElementById('openFeatsButton');
const featsModal = document.getElementById('featsModal');
const closeFeatsModalButton = document.getElementById('closeFeatsModal');
const modalFeatsContent = document.getElementById('modalFeatsContent');
const saveFeatsButton = document.getElementById('saveFeatsButton');

// Dice Roller Elements
const customDiceInput = document.getElementById('customDiceInput');
const customRollButton = document.getElementById('customRollButton');
const abilityChecksSection = document.getElementById('ability-checks-section');
const savingThrowsSection = document.getElementById('saving-throws-section');
const skillCheckSelect = document.getElementById('skillCheckSelect');
const rollSkillCheckButton = document.getElementById('rollSkillCheckButton');
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
function addMessageToChat(message, className = "") {
    const msgElement = document.createElement('p');
    msgElement.textContent = message;
    if (className) {
        msgElement.classList.add(className);
    }
    chatMessagesDiv.appendChild(msgElement);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
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


// Listen to roll results from the server
socket.on('roll result', (data) => { // data may now include .isSecret
    console.log(`Received 'roll result' event`, data);

    let detailedRollString = "";
    if (data.rolls.length > 1) {
        detailedRollString = `[${data.rolls.join(', ')}]`;
    } else {
        detailedRollString = `${data.rolls[0]}`;
    }

    let fullCalculation = detailedRollString;
    if (data.modifier) {
        fullCalculation += ` ${data.modifier}`;
    }
    if (data.modifier || data.rolls.length > 1 || (data.rolls.length === 1 && data.rolls[0] !== data.result)) {
        fullCalculation += ` = ${data.result}`;
    } else if (data.rolls.length === 1 && data.rolls[0] === data.result && !data.modifier) {
         // If 1d20, no mod, and roll is the result, just show result or roll.
         // The fullCalculation is already just the roll, which is the result.
         // Let's ensure the result is shown if different from single roll due to complex server logic later
         // For now, this branch means fullCalculation is just data.rolls[0]
    }


    let messagePrefix = data.rollerName;
    if (data.isSecret && currentUserIsDM) { // Check currentUserIsDM to be sure
        messagePrefix = `(Secret Roll by DM)`;
    }

    const chatMessageText = `${messagePrefix} rolled ${data.description || data.rollString}: ${fullCalculation}`;
    
    // Add to chat with specific styling for DM secret rolls
    if (data.isSecret) {
        if (currentUserIsDM) { // Only DM sees their secret roll in chat
            addMessageToChat(chatMessageText, "dm-roll-secret");
        }
        // Non-DMs do not see this message as it's only sent to the DM socket.
    } else {
        addMessageToChat(chatMessageText); // Public roll
    }

    // Update the "Last Roll" display. For secret rolls, only DM sees it.
    if (!data.isSecret || (data.isSecret && currentUserIsDM)) {
        const displayDescription = data.description ? data.description.split(" (")[0] : data.rollString;
        let lastRollPrefix = data.rollerName;
        if (data.isSecret) lastRollPrefix = "(DM Secret)";
        
        rollResultDisplay.textContent = `Last roll: ${lastRollPrefix} - ${displayDescription}: ${data.result} (Rolls: ${data.rolls.join(', ')})`;
    } else if (data.isSecret && !currentUserIsDM) {
        // If it's a secret roll and this client is not the DM,
        // don't update their "Last Roll" display with it.
        // (This case shouldn't happen if server logic is correct, as event isn't sent)
    }
});



function handleSpecificRoll(rollTitle, baseAbilityKey, proficiencyFieldKey = null, rollType = "1d20") { // Added rollType
    if (!currentCharacterSheet) {
        addMessageToChat("Error: Character sheet not loaded. Cannot perform roll.");
        return;
    }
    const rollerName = getPlayerName();

    const abilityScore = parseInt(currentCharacterSheet[baseAbilityKey], 10);
    if (isNaN(abilityScore)) {
        addMessageToChat(`Error: ${baseAbilityKey} score not found or invalid.`);
        return;
    }
    const abilityModifierValue = parseInt(calculateModifier(abilityScore)); // numeric value

    let totalModifierValue = abilityModifierValue;
    let proficiencyBonusAdded = false;
    let pbValue = 0;

    if (proficiencyFieldKey) {
        const isProficient = currentCharacterSheet[proficiencyFieldKey];
        if (isProficient) {
            pbValue = getProficiencyBonusValue();
            totalModifierValue += pbValue;
            proficiencyBonusAdded = true;
        }
    }

    const modifierString = totalModifierValue !== 0 ? `${totalModifierValue >= 0 ? '+' : ''}${totalModifierValue}` : "";
    const diceStringForServer = `${rollType}${modifierString}`; // e.g., "1d20+5" or "2d20+5"

    // Construct a more detailed description for the client
    let description = `${rollTitle} (${rollType}`;
    if (abilityModifierValue !== 0) {
        description += ` ${abilityModifierValue >= 0 ? '+' : ''}${abilityModifierValue}`;
    }
    if (proficiencyBonusAdded && pbValue !== 0) {
        description += ` ${pbValue >= 0 ? '+' : ''}${pbValue}`;
    }
    description += `)`; // The server will append the actual calculation


    socket.emit('dice roll', {
        rollerName: rollerName,
        rollString: diceStringForServer,
        description: description
    });
}



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
    currentUserIsDM = authData.isDM || false; // Store DM status

    if (authArea) authArea.style.display = 'none';
    if (appContainer) appContainer.style.display = '';

    if (playerNameInput) {
        playerNameInput.value = currentAuthenticatedUsername;
    }
    addMessageToChat(`Logged in as ${currentAuthenticatedUsername}. Welcome!`);
    authErrorDisplay.textContent = '';

    populateDiceRollerControls();

    // Show DM tools if user is DM
    if (currentUserIsDM && dmToolsSection) {
        dmToolsSection.style.display = 'block';
        addMessageToChat("DM Tools Unlocked.", "dm-message"); // Special class for DM messages
    } else if (dmToolsSection) {
        dmToolsSection.style.display = 'none';
    }
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
    if (event.target === featsModal) {
        featsModal.style.display = 'none';
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

        // If the main sheet modal is open, refresh it
        if (sheetModal.style.display === 'block') {
            populateSheetModal(currentCharacterSheet);
        }
        // If the inventory modal is open and inventory was updated, refresh it
        if (inventoryModal.style.display === 'block' && data.updatedSheet.inventory) {
             populateInventoryModal(currentCharacterSheet.inventory || []);
        }
        // *** ADD THIS CHECK ***
        // If the feats modal is open and feats/traits were updated, refresh it
        if (featsModal.style.display === 'block' && data.updatedSheet.featsAndTraits) {
            populateFeatsModal(currentCharacterSheet.featsAndTraits || []);
        }

    } else {
        // If you store all sheets locally for some reason, update that specific sheet.
        console.log(`Sheet updated for ${data.playerName} (another user).`);
        // Potentially update a global sheet store if you implement one later
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
function populateDiceRollerControls() {
    // Ability Checks
    abilityChecksSection.innerHTML = '<h4>Ability Checks (1d20 + Mod)</h4>'; // Clear and re-add header
    ABILITIES_KEYS.forEach(abilityKey => {
        const btn = document.createElement('button');
        btn.textContent = `${abilityKey.charAt(0).toUpperCase() + abilityKey.slice(1)} Check`;
        btn.dataset.ability = abilityKey;
        btn.addEventListener('click', () => handleSpecificRoll(
            `${abilityKey.charAt(0).toUpperCase() + abilityKey.slice(1)} Check`,
            abilityKey
        ));
        abilityChecksSection.appendChild(btn);
    });

    // Saving Throws
    savingThrowsSection.innerHTML = '<h4>Saving Throws (1d20 + Mod [+ PB if proficient])</h4>';
    for (const stFieldKey in SAVING_THROW_ABILITY_MAP) {
        const abilityKey = SAVING_THROW_ABILITY_MAP[stFieldKey];
        const btn = document.createElement('button');
        btn.textContent = `${abilityKey.charAt(0).toUpperCase() + abilityKey.slice(1)} Save`;
        btn.dataset.ability = abilityKey;
        btn.dataset.stField = stFieldKey;
        btn.addEventListener('click', () => handleSpecificRoll(
            `${abilityKey.charAt(0).toUpperCase() + abilityKey.slice(1)} Saving Throw`,
            abilityKey,
            stFieldKey // This is the proficiency field key, e.g., 'savingStrengthProficient'
        ));
        savingThrowsSection.appendChild(btn);
    }

    // Skill Checks
    skillCheckSelect.innerHTML = '<option value="">-- Select Skill --</option>'; // Clear and re-add default
    SKILLS.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill.key; // e.g., 'skillAthleticsProficient'
        option.textContent = `${skill.label} (${skill.ability.substring(0,3).toUpperCase()})`;
        skillCheckSelect.appendChild(option);
    });
}


// --- Roll Handling ---
function handleSpecificRoll(rollTitle, baseAbilityKey, proficiencyFieldKey = null, rollType = "1d20") {
    if (!currentCharacterSheet) {
        addMessageToChat("Error: Character sheet not loaded. Cannot perform roll.");
        return;
    }
    const rollerName = getPlayerName();

    const abilityScore = parseInt(currentCharacterSheet[baseAbilityKey], 10);
    if (isNaN(abilityScore)) {
        addMessageToChat(`Error: ${baseAbilityKey} score not found or invalid.`);
        return;
    }
    const abilityModifierValue = parseInt(calculateModifier(abilityScore));

    let totalModifierValue = abilityModifierValue;
    let proficiencyBonusAdded = false;
    let pbValue = 0;

    if (proficiencyFieldKey) {
        const isProficient = currentCharacterSheet[proficiencyFieldKey];
        if (isProficient) {
            pbValue = getProficiencyBonusValue();
            totalModifierValue += pbValue;
            proficiencyBonusAdded = true;
        }
    }

    const modifierStringForServer = totalModifierValue !== 0 ? `${totalModifierValue >= 0 ? '+' : ''}${totalModifierValue}` : "";
    const diceStringForServer = `${rollType}${modifierStringForServer}`;

    // Refined Description: Focus on the "why"
    let description = `${rollTitle} (Base: ${rollType}`; // e.g. "Strength Check (Base: 1d20"
    if (abilityModifierValue !== 0) {
        description += ` ${abilityModifierValue >= 0 ? '+' : ''}${abilityModifierValue}[${baseAbilityKey.substring(0,3)}]`;
    }
    if (proficiencyBonusAdded && pbValue !== 0) {
        description += ` ${pbValue >= 0 ? '+' : ''}${pbValue}[PB]`;
    }
    description += `)`; // e.g., "Strength Check (Base: 1d20 -5[Str])"
                       // or "Initiative (Base: 1d20 +2[Dex] +3[PB])"

    socket.emit('dice roll', {
        rollerName: rollerName,
        rollString: diceStringForServer, // This is what server actually rolls, e.g., "1d20-5"
        description: description         // This explains the components
    });
}

// Event Listener for Custom Roll Button
if (customRollButton) {
    customRollButton.addEventListener('click', () => {
        const customString = customDiceInput.value.trim();
        if (customString) {
            const rollerName = getPlayerName();
            socket.emit('dice roll', {
                rollerName: rollerName,
                rollString: customString,
                description: customString // For custom rolls, description is same as roll string
            });
            customDiceInput.value = ''; // Clear input
        } else {
            addMessageToChat("Please enter a dice string (e.g., 2d6+3).");
        }
    });
}
// Add enter to send custom roll
if(customDiceInput) {
    customDiceInput.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            customRollButton.click(); // Trigger the button's click handler
        }
    });
}


// Event Listener for Skill Check Button
if (rollSkillCheckButton) {
    rollSkillCheckButton.addEventListener('click', () => {
        const selectedSkillKey = skillCheckSelect.value; // This is the proficiency field key like 'skillAthleticsProficient'
        if (!selectedSkillKey) {
            addMessageToChat("Please select a skill to roll.");
            return;
        }
        const skillInfo = SKILLS.find(s => s.key === selectedSkillKey);
        if (skillInfo) {
            handleSpecificRoll(
                `${skillInfo.label} (${skillInfo.ability.substring(0,3).toUpperCase()}) Check`,
                skillInfo.ability,
                selectedSkillKey // Proficiency field key
            );
        }
    });
}

// --- DM Secret Roll Button Listener ---
if (dmSecretRollButton) {
    dmSecretRollButton.addEventListener('click', () => {
        if (!currentUserIsDM) return; // Should not happen if UI is hidden, but good check

        const diceString = dmSecretDiceInput.value.trim();
        const description = dmSecretDescriptionInput.value.trim();

        if (diceString) {
            socket.emit('dm secret roll', {
                rollString: diceString,
                description: description || diceString // Use description or fallback to roll string
            });
            dmSecretDiceInput.value = '';
            dmSecretDescriptionInput.value = '';
        } else {
            addMessageToChat("Please enter a dice string for the secret roll.", "dm-error");
        }
    });
}
if (dmSecretDiceInput) {
    dmSecretDiceInput.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            dmSecretRollButton.click();
        }
    });
}
if (dmSecretDescriptionInput) {
     dmSecretDescriptionInput.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            dmSecretRollButton.click();
        }
    });
}
const darkModeToggleButton = document.getElementById('darkModeToggle');

// Function to apply dark mode
function applyDarkMode(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Dark Mode Toggle Button Listener
if (darkModeToggleButton) {
    darkModeToggleButton.addEventListener('click', () => {
        const isCurrentlyDark = document.body.classList.contains('dark-mode');
        applyDarkMode(!isCurrentlyDark);
        // Save preference to localStorage
        try {
            localStorage.setItem('darkMode', !isCurrentlyDark);
        } catch (e) {
            console.warn("Could not save dark mode preference to localStorage:", e);
        }
    });
}

// Check for saved dark mode preference on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
            applyDarkMode(savedDarkMode === 'true');
        } else {
            // Optional: Check system preference if no saved preference
            // This is more advanced and requires matchMedia
            // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            //     applyDarkMode(true);
            // }
        }
    } catch (e) {
        console.warn("Could not load dark mode preference from localStorage:", e);
    }
    // Ensure populateDiceRollerControls is called if needed here,
    // or ensure it's called after auth success which is likely fine.
});
// Feats Modal Control
if (openFeatsButton) {
    openFeatsButton.addEventListener('click', () => {
        if (currentCharacterSheet) {
            // Ensure featsAndTraits exists, default to empty array if not
            populateFeatsModal(currentCharacterSheet.featsAndTraits || []);
            featsModal.style.display = 'block';
        } else {
            addMessageToChat("Please log in to manage Feats & Traits.");
            console.warn("Cannot open Feats & Traits: currentCharacterSheet is not available.");
        }
    });
}

if (closeFeatsModalButton) {
    closeFeatsModalButton.addEventListener('click', () => {
        featsModal.style.display = 'none';
    });
}
function createFeatTraitRowElement(featTrait = {}) {
    const itemRowDiv = document.createElement('div');
    itemRowDiv.className = 'feat-trait-row'; // Use the new class

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = featTrait.name || '';
    nameInput.placeholder = "Feat/Trait Name";
    nameInput.className = 'feat-trait-name'; // Specific class for name

    const descTextarea = document.createElement('textarea'); // Use textarea
    descTextarea.value = featTrait.description || '';
    descTextarea.placeholder = 'Description';
    descTextarea.className = 'feat-trait-desc'; // Specific class for description
    descTextarea.rows = 3; // Start with 3 rows, adjustable via CSS resize

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-item-btn'; // Reuse inventory remove button style
    removeButton.type = 'button';
    removeButton.onclick = () => {
        itemRowDiv.remove(); // Remove this specific row
    };

    itemRowDiv.appendChild(nameInput);
    itemRowDiv.appendChild(descTextarea);
    itemRowDiv.appendChild(removeButton);

    return itemRowDiv;
}


// Function to populate the Feats & Traits modal content
function populateFeatsModal(featsAndTraitsArray) {
    if (!modalFeatsContent) {
        console.error("Feats modal content element not found!");
        return;
    }
    modalFeatsContent.innerHTML = ''; // Clear previous content

    const listContainerDiv = document.createElement('div');
    listContainerDiv.id = 'feats-list-display'; // Use the new ID for the scrollable list

    if (featsAndTraitsArray && Array.isArray(featsAndTraitsArray) && featsAndTraitsArray.length > 0) {
        featsAndTraitsArray.forEach((item) => {
            listContainerDiv.appendChild(createFeatTraitRowElement(item));
        });
    } else {
        const noItemsMsg = document.createElement('p');
        noItemsMsg.textContent = "No feats or traits defined. Click 'Add New' to start.";
        listContainerDiv.appendChild(noItemsMsg);
    }
    modalFeatsContent.appendChild(listContainerDiv);

    // "Add New Feat/Trait" button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add New Feat/Trait';
    addButton.type = 'button';
    addButton.id = 'add-feat-trait-btn'; // Use the new ID for the add button
    addButton.onclick = () => {
        const noItemsMessageElement = listContainerDiv.querySelector('p');
        if (noItemsMessageElement && noItemsMessageElement.textContent.startsWith("No feats")) {
            noItemsMessageElement.remove(); // Remove the 'No items' message
        }

        const newItemRow = createFeatTraitRowElement(); // Creates a blank item row
        listContainerDiv.appendChild(newItemRow);
        const newNameInput = newItemRow.querySelector('.feat-trait-name');
        if (newNameInput) {
            newNameInput.focus(); // Focus the name field of the new row
        }
    };
    modalFeatsContent.appendChild(addButton); // Add button after the list

    if (saveFeatsButton) saveFeatsButton.style.display = 'inline-block'; // Ensure save button is visible
}
// Save Feats & Traits Button Listener
if (saveFeatsButton) {
    saveFeatsButton.addEventListener('click', () => {
        if (!currentCharacterSheet || !currentAuthenticatedUsername) {
            console.error("Cannot save Feats & Traits: User not authenticated or sheet data missing.");
            addMessageToChat("Error: Cannot save Feats & Traits. Please log in again.");
            return;
        }

        const newFeatsAndTraits = [];
        // Select all DOM rows representing feat/trait items from the modal
        const featTraitRows = modalFeatsContent.querySelectorAll('#feats-list-display .feat-trait-row');

        featTraitRows.forEach(row => {
            const nameInput = row.querySelector('.feat-trait-name');
            const descTextarea = row.querySelector('.feat-trait-desc'); // Get textarea

            const name = nameInput ? nameInput.value.trim() : '';
            const description = descTextarea ? descTextarea.value.trim() : '';

            if (name) { // Only save if it has a name
                newFeatsAndTraits.push({
                    name: name,
                    description: description
                });
            }
        });

        console.log("Emitting 'update character sheet' (Feats & Traits only) with data:", newFeatsAndTraits);
        socket.emit('update character sheet', {
            sheetUpdates: { featsAndTraits: newFeatsAndTraits } // Send ONLY the featsAndTraits array
        });

        addMessageToChat("Saving Feats & Traits changes...");
        // Optional: Close modal after save?
        // featsModal.style.display = 'none';
    });
}