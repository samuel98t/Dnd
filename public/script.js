// Connect to server , socket will be our individual connection
const socket = io();
let currentUserIsDM = false;
let currentAuthenticatedUsername = null;
let currentCharacterSheet = null; // To store the user's sheet
let allCharacterSheets = {}; // Store sheets keyed by playerName
// Get the new Save Character Data button
const saveCharacterDataButton = document.getElementById('saveCharacterDataButton');
// Get Attacks Modal Elements
const openAttacksButton = document.getElementById('openAttacksButton');
const attacksModal = document.getElementById('attacksModal');
const closeAttacksModalButton = document.getElementById('closeAttacksModal');
const modalAttacksContent = document.getElementById('modalAttacksContent');
const saveAttacksButton = document.getElementById('saveAttacksButton');
//  Quick  Action Buttons 
const quickDamageButton = document.getElementById('quickDamageButton');
const quickAttackButton = document.getElementById('quickAttackButton');
const quickSpellAttackButton = document.getElementById('quickSpellAttackButton')
const quickHpCurrentInput = document.getElementById('quickHpCurrent');
const quickHpMaxInput = document.getElementById('quickHpMax');
// MONEY
const moneyCPInput = document.getElementById('moneyCP');
const moneySPInput = document.getElementById('moneySP');
const moneyEPInput = document.getElementById('moneyEP');
const moneyGPInput = document.getElementById('moneyGP');
const moneyPPInput = document.getElementById('moneyPP');
// Get Spellcasting Elements 
const spellClassInput = document.getElementById('spellClass');
const spellAbilitySelect = document.getElementById('spellAbility');
const spellSaveDCInput = document.getElementById('spellSaveDC');
const spellAttackBonusInput = document.getElementById('spellAttackBonus');
const spellSlotsGrid = document.querySelector('#spell-slots-section .spell-slots-grid'); // Container for slots
const spellTabsContainer = document.getElementById('spell-tabs');
const spellTabContentContainer = document.getElementById('spell-tab-content');
const addSpellButton = document.getElementById('add-spell-btn');
// Get Spellcasting Modal Elements (for open/close)
const openSpellsButton = document.getElementById('openSpellsButton');
const spellsModal = document.getElementById('spellsModal');
const closeSpellsModalButton = document.getElementById('closeSpellsModal');
const modalSpellsContent = document.getElementById('modalSpellsContent');
const saveSpellsButton = document.getElementById('saveSpellsButton');
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

socket.on('all character sheets', (sheetsData) => {
    console.log("Received all character sheets:", sheetsData);
    allCharacterSheets = sheetsData;
    // Re-render the user list now that we have sheet data (for HP display)
    updateUserList(Object.keys(allCharacterSheets)); // Assuming keys are usernames
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

    // --- ADDED: Populate Quick HP ---
    if (quickHpCurrentInput && quickHpMaxInput && currentCharacterSheet) {
        quickHpCurrentInput.value = currentCharacterSheet.hpCurr ?? 0; // Default to 0 if null/undefined
        quickHpMaxInput.value = currentCharacterSheet.HpMax ?? 0;
    }
    // --- END ADDED ---

    addMessageToChat(`Logged in as ${currentAuthenticatedUsername}. Welcome!`);
    authErrorDisplay.textContent = '';

    populateDiceRollerControls();

    if (currentUserIsDM && dmToolsSection) {
        dmToolsSection.style.display = 'block';
        addMessageToChat("DM Tools Unlocked.", "dm-message");
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


function calculateModifier(score) {
    const numericScore = parseInt(score, 10);
    if (isNaN(numericScore)) {
        return 'N/A'; 
    }
    const modifier = Math.floor((numericScore - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`; // Prepends '+' for positive/zero
}

// Add isReadOnly parameter with default false
function populateSheetModal(sheetData, isReadOnly = false) { // Ensure parameter is present
    if (!sheetData) {
        modalSheetContent.innerHTML = '<p>Error: No sheet data available.</p>';
        return;
    }

    modalSheetContent.innerHTML = ''; // Clear previous content

    // --- Add Title indication ---
    const titleH2 = document.createElement('h2'); // Create title within the function
    titleH2.textContent = isReadOnly ? `Viewing ${sheetData.playerName}'s Sheet (Read-Only)` : "Character Sheet";
    modalSheetContent.appendChild(titleH2);
    // --- End Title ---

    // --- createDetailElement (checks !isReadOnly) ---
    const createDetailElement = (label, value, isEditable = false, fieldKey = null, inputTypeOverride = null, changeListener = null) => {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        p.appendChild(strong);

        // Check BOTH isEditable AND !isReadOnly before creating input
        if (isEditable && fieldKey && !isReadOnly) {
            const input = document.createElement('input');
            if (inputTypeOverride) {
                input.type = inputTypeOverride;
            } else if (typeof value === 'number' || ['hpCurr', 'HpMax', 'characterLevel', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'inspiration', 'characterArmor', 'Initiative', 'ProficiencyBonus', 'characterSpeed'].includes(fieldKey)) {
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
                input.addEventListener('input', (event) => {
                    modSpan.textContent = ` (Mod: ${calculateModifier(event.target.value)})`;
                    updateAllModalBonuses();
                });
            }
        } else {
            // Display as plain text if not editable OR if in read-only mode
            p.appendChild(document.createTextNode(value || 'N/A'));
        }
        return p;
    };

    // --- createProficiencyElement (checks isReadOnly) ---
    const createProficiencyElement = (labelText, fieldKey, baseAbilityKey, initialValue, proficiencyBonus, changeListener) => {
        const p = document.createElement('p');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = initialValue || false;
        checkbox.dataset.field = fieldKey;
        checkbox.id = `sheetInput-${fieldKey}`;

        // Disable checkbox and prevent listener if read-only
        if (isReadOnly) {
             checkbox.disabled = true;
        } else if (changeListener) {
             checkbox.addEventListener('change', changeListener); // Only add listener if editable
        }
        p.appendChild(checkbox);

        const label = document.createElement('label');
        label.htmlFor = `sheetInput-${fieldKey}`;
        label.textContent = ` ${labelText} `;
        label.style.cursor = isReadOnly ? 'default' : 'pointer'; // Adjust cursor
        p.appendChild(label);

        const bonusSpan = document.createElement('span');
        bonusSpan.id = `sheetBonus-${fieldKey}`;
        bonusSpan.style.marginLeft = '5px';
        p.appendChild(bonusSpan); // Bonus calculated later regardless of read-only

        const baseAbilitySpan = document.createElement('span');
        baseAbilitySpan.textContent = ` (${baseAbilityKey.substring(0,3).toUpperCase()})`;
        baseAbilitySpan.style.fontSize = '0.8em';
        baseAbilitySpan.style.color = '#555'; // Consider using CSS var (--text-color-light)
        p.appendChild(baseAbilitySpan);

        return p;
    };

    // --- Populate sections using the CORRECTED create functions ---
    // Basic Info
    const basicInfoDiv = document.createElement('div');
    basicInfoDiv.innerHTML = '<h3>Basic Information</h3>';
    basicInfoDiv.appendChild(createDetailElement('Player Name', sheetData.playerName)); // Not editable
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
    stGrid.className = 'sheet-grid three-columns';
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
    const skillsGrid = document.createElement('div');
    skillsGrid.className = 'sheet-grid three-columns';
    SKILLS.forEach(skill => {
        skillsGrid.appendChild(
            createProficiencyElement(skill.label, skill.key, skill.ability, sheetData[skill.key], sheetData.ProficiencyBonus, updateAllModalBonuses)
        );
    });
    skillsDiv.appendChild(skillsGrid);
    modalSheetContent.appendChild(skillsDiv);
    // --- END Populate sections ---


    // --- CORRECTED: Hide Save Button in Read-Only Mode ---
    if (saveSheetButton) {
        console.log(`[populateSheetModal] Setting save button display for ${sheetData.playerName}. isReadOnly: ${isReadOnly}. Current display: ${saveSheetButton.style.display}`);
        saveSheetButton.style.display = isReadOnly ? 'none' : 'inline-block'; // Use the isReadOnly flag
        console.log(`[populateSheetModal] Save button display *after* setting: ${saveSheetButton.style.display}`);
    } else {
         console.error("[populateSheetModal] saveSheetButton element not found!");
    }
    // --- END Save Button Logic ---

    // Call to set initial calculated bonus values (runs after DOM is populated)
    // Run this regardless of read-only status to display correct bonuses
    setTimeout(updateAllModalBonuses, 0);
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

    // Update the global store REGARDLESS of who it is
    if (data.playerName && data.updatedSheet) {
        allCharacterSheets[data.playerName] = data.updatedSheet;
        console.log(`Updated allCharacterSheets for ${data.playerName}`);

        // Update HP in the sidebar list IF it's already rendered
        if (userListUL) {
            const nameSpan = userListUL.querySelector(`span[data-username="${data.playerName}"]`);
            const userLi = nameSpan?.closest('li');
            if (userLi) {
                 const hpSpan = userLi.querySelector('.hp-info');
                 if (hpSpan) {
                     const hpCurr = data.updatedSheet?.hpCurr ?? '?';
                     const hpMax = data.updatedSheet?.HpMax ?? '?';
                     hpSpan.textContent = ` (HP: ${hpCurr}/${hpMax})`;
                 }
            }
        }
    }


    if (data.playerName === currentAuthenticatedUsername) {
        // Update the user's own sheet reference
        if (!currentCharacterSheet) currentCharacterSheet = {};
        // Store the old HP *before* updating the sheet object
        const oldHpForCheck = currentCharacterSheet.hpCurr; // Use this for comparison in quick save only
        Object.assign(currentCharacterSheet, data.updatedSheet);
        addMessageToChat(`Your sheet data has been updated.`);

        // --- ADDED: Update Quick HP display ---
        if (quickHpCurrentInput && quickHpMaxInput && currentCharacterSheet) {
            // Update only if the current input value doesn't already match the new sheet value
            // (prevents overwriting while user might be typing, though 'change' event handles this better)
             if (parseInt(quickHpCurrentInput.value, 10) !== currentCharacterSheet.hpCurr) {
                 quickHpCurrentInput.value = currentCharacterSheet.hpCurr ?? 0;
             }
             if (parseInt(quickHpMaxInput.value, 10) !== currentCharacterSheet.HpMax) {
                 quickHpMaxInput.value = currentCharacterSheet.HpMax ?? 0;
             }
        }
        // --- END ADDED ---

        // Refresh relevant open modals for the current user (as before)
        if (sheetModal.style.display === 'block') { populateSheetModal(currentCharacterSheet); }
        if (inventoryModal.style.display === 'block') { populateInventoryModal(currentCharacterSheet.inventory || [], currentCharacterSheet); }
        if (featsModal.style.display === 'block') { populateFeatsModal(currentCharacterSheet.featsAndTraits || []); }
        if (attacksModal.style.display === 'block') { populateAttacksModal(currentCharacterSheet.attacks || []); }
        if (spellsModal.style.display === 'block') { populateSpellsModal(currentCharacterSheet); }

    } else {
        console.log(`Sheet updated for ${data.playerName} (another user).`);
    }

    // No full list update here
});
// sidebar helper func
// Modify updateUserList function in script.js to add a class to the HP span
function updateUserList(activeUsernames) { // Parameter is explicitly active usernames
    if (!userListUL) return;

    userListUL.innerHTML = ''; // Clear the current list

    if (activeUsernames && activeUsernames.length > 0) {
        // Sort users alphabetically, current user first (optional)
        activeUsernames.sort((a, b) => {
            if (a === currentAuthenticatedUsername) return -1;
            if (b === currentAuthenticatedUsername) return 1;
            return a.localeCompare(b);
        });

        activeUsernames.forEach(username => {
            const li = document.createElement('li');
            // Get sheet data ONLY for the currently active user
            const userSheet = allCharacterSheets[username];
            const hpCurr = userSheet?.hpCurr ?? '?';
            const hpMax = userSheet?.HpMax ?? '?';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = username;
            nameSpan.style.cursor = 'pointer';
            nameSpan.style.textDecoration = 'underline';
            nameSpan.style.color = 'var(--link-color)';
            nameSpan.dataset.username = username;

            const hpInfo = document.createElement('span');
            hpInfo.textContent = ` (HP: ${hpCurr}/${hpMax})`;
            hpInfo.style.fontSize = '0.9em';
            hpInfo.style.color = 'var(--text-color-light)';
            hpInfo.classList.add('hp-info'); // <<< ADD CLASS HERE

            li.appendChild(nameSpan);
            li.appendChild(hpInfo);

            if (username === currentAuthenticatedUsername) {
                const youSpan = document.createElement('strong');
                youSpan.textContent = ' (You)';
                youSpan.style.color = 'var(--user-list-highlight)';
                li.appendChild(youSpan);
            }
            userListUL.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No active users.';
        userListUL.appendChild(li);
    }
}

if (userListUL) {
    userListUL.addEventListener('click', (event) => {
        let targetElement = event.target;
        // Traverse up to find the element with data-username, stopping at the list container
        while (targetElement != null && targetElement !== userListUL && !targetElement.dataset.username) {
            targetElement = targetElement.parentElement;
        }

        // Ensure we found an element with username and it's not the list itself
        if (targetElement && targetElement !== userListUL && targetElement.dataset.username) {
            const usernameToView = targetElement.dataset.username;

            // Prevent default if it was an <a> tag (though we use <span> now)
            event.preventDefault();
            event.stopPropagation(); // Stop click from bubbling up to the document listener immediately

            console.log(`Clicked name: ${usernameToView}. Creating options menu.`);
            // Call the function to create the menu
            createViewOptionsMenu(usernameToView, event); // Pass the event for positioning

        } else {
            // If the click was not on a name span (e.g., whitespace, HP info),
            // remove any existing menu explicitly. The document listener might also catch this.
            const existingMenu = document.getElementById('viewOptionsMenu');
            if (existingMenu) {
                 console.log("Clicked in list but not on name, removing menu.");
                 existingMenu.remove();
            }
        }
    });
}
// listen for user list updates from server
socket.on('update user list', (userArray) => { // userArray is expected to be an array of usernames
    console.log('Received "update user list":', userArray);
    updateUserList(userArray);
});

// --- populateInventoryModal (Ensure previous modifications + Read-Only) ---
// Add isReadOnly parameter
function populateInventoryModal(inventoryDataArray, sheetData = null, isReadOnly = false) {
    if (!modalInventoryContent) {
        console.error("Inventory modal content element not found!");
        return;
    }
    modalInventoryContent.innerHTML = ''; // Clear

    // --- Add Title indication ---
    const titleH2 = inventoryModal.querySelector('h2'); // Find the h2 in the modal
    if(titleH2) {
        titleH2.textContent = isReadOnly ? `Viewing ${sheetData?.playerName || 'User'}'s Inventory (Read-Only)` : "Inventory";
    }
    // --- End Title ---


    // --- POPULATE MONEY INPUTS (and disable if read-only) ---
    const moneyCPInput = document.getElementById('moneyCP');
    const moneySPInput = document.getElementById('moneySP');
    const moneyEPInput = document.getElementById('moneyEP');
    const moneyGPInput = document.getElementById('moneyGP');
    const moneyPPInput = document.getElementById('moneyPP');

    if (sheetData && moneyCPInput && moneySPInput && moneyEPInput && moneyGPInput && moneyPPInput) {
        moneyCPInput.value = sheetData.cp || 0;
        moneySPInput.value = sheetData.sp || 0;
        moneyEPInput.value = sheetData.ep || 0;
        moneyGPInput.value = sheetData.gp || 0;
        moneyPPInput.value = sheetData.pp || 0;

        // Disable if read-only
        moneyCPInput.disabled = isReadOnly;
        moneySPInput.disabled = isReadOnly;
        moneyEPInput.disabled = isReadOnly;
        moneyGPInput.disabled = isReadOnly;
        moneyPPInput.disabled = isReadOnly;

    } else { // Covers sheetData === null or missing inputs
         // Clear fields if no sheet data
         if(moneyCPInput) moneyCPInput.value = 0;
         if(moneySPInput) moneySPInput.value = 0;
         if(moneyEPInput) moneyEPInput.value = 0;
         if(moneyGPInput) moneyGPInput.value = 0;
         if(moneyPPInput) moneyPPInput.value = 0;
         // Also disable if no sheet data or if explicitly read-only
         if(moneyCPInput) moneyCPInput.disabled = true;
         if(moneySPInput) moneySPInput.disabled = true;
         if(moneyEPInput) moneyEPInput.disabled = true;
         if(moneyGPInput) moneyGPInput.disabled = true;
         if(moneyPPInput) moneyPPInput.disabled = true;
    }
    // --- END POPULATE MONEY ---

    const inventoryListContainerDiv = document.createElement('div');
    inventoryListContainerDiv.id = 'inventory-list-display';

    // Modified row creation function (internal to populateInventoryModal)
    const createInventoryItemRowElement = (item = {}) => { // isReadOnly is available via closure
        const itemRowDiv = document.createElement('div');
        itemRowDiv.className = 'inventory-item-row';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = item.name || '';
        nameInput.placeholder = "Item Name";
        nameInput.className = 'inventory-item-name';
        nameInput.disabled = isReadOnly; // <<< Disable

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.value = item.quantity === undefined ? 1 : item.quantity;
        qtyInput.min = '0';
        qtyInput.placeholder = 'Quantity';
        qtyInput.className = "inventory-item-qty";
        qtyInput.disabled = isReadOnly; // <<< Disable

        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.value = item.description || '';
        descInput.placeholder = 'Description (optional)';
        descInput.className = 'inventory-item-desc';
        descInput.disabled = isReadOnly; // <<< Disable

        itemRowDiv.appendChild(nameInput);
        itemRowDiv.appendChild(qtyInput);
        itemRowDiv.appendChild(descInput);

        // Only add remove button if NOT read-only
        if (!isReadOnly) {
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-item-btn';
            removeButton.type = 'button';
            removeButton.onclick = () => {
                itemRowDiv.remove();
            };
            itemRowDiv.appendChild(removeButton);
        }

        return itemRowDiv;
    };

    // Populate list using the modified row creation
    if (inventoryDataArray && Array.isArray(inventoryDataArray) && inventoryDataArray.length > 0) {
        inventoryDataArray.forEach((item, index) => {
            inventoryListContainerDiv.appendChild(createInventoryItemRowElement(item, index));
        });
    } else {
        const noItemsMsg = document.createElement('p');
        noItemsMsg.textContent = isReadOnly ? "Inventory is empty." : "No items in inventory. Click 'Add New Item' to start.";
        inventoryListContainerDiv.appendChild(noItemsMsg);
    }
    modalInventoryContent.appendChild(inventoryListContainerDiv);

    // Only show "Add New Item" button if NOT read-only
    const existingAddButton = document.getElementById('add-inventory-item-btn');
    if (existingAddButton) existingAddButton.remove(); // Remove old one if exists

    if (!isReadOnly) {
        const addItemButton = document.createElement('button');
        addItemButton.textContent = 'Add New Item';
        addItemButton.type = 'button';
        addItemButton.id = 'add-inventory-item-btn';
        addItemButton.onclick = () => {
             const noItemsMessageElement = inventoryListContainerDiv.querySelector('p');
             if (noItemsMessageElement && noItemsMessageElement.textContent.startsWith("No items")) {
                 noItemsMessageElement.remove();
             }
             const newItemRow = createInventoryItemRowElement(); // Uses isReadOnly from outer scope (false here)
             inventoryListContainerDiv.appendChild(newItemRow);
             newItemRow.querySelector('.inventory-item-name')?.focus();
        };
        modalInventoryContent.appendChild(addItemButton);
    }

    // Hide Save Button in Read-Only Mode
    if (saveInventoryButton) {
        saveInventoryButton.style.display = isReadOnly ? 'none' : 'inline-block';
    }
}
// Open inventory
if (openInventoryButton) {
    openInventoryButton.addEventListener('click', () => {
        if (currentCharacterSheet) {
            // currentCharacterSheet.inventory should exist (even as [])
            // due to server-side schema default and auth success data
            populateInventoryModal(currentCharacterSheet.inventory || [],currentCharacterSheet);
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
// Save inventory Button Listener - CORRECTED TO INCLUDE MONEY
if (saveInventoryButton) {
    saveInventoryButton.addEventListener('click', () => {
        if (!currentCharacterSheet || !currentAuthenticatedUsername) {
            console.error("Cannot save inventory: User not authenticated or sheet data missing.");
            addMessageToChat("Error: Cannot save inventory. Please log in again.");
            return;
        }

        const newInventory = [];
        // Select all DOM rows representing inventory items from the inventory modal's specific list container
        const inventoryItemRows = modalInventoryContent.querySelectorAll('#inventory-list-display .inventory-item-row');

        inventoryItemRows.forEach(row => { // Loop starts here
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
                    description: description || '' // Ensure description is at least empty string
                });
            }
        }); // <<<< Loop ENDS here

        // *** GET MONEY VALUES ***
        const moneyUpdates = {};
        const cp = parseInt(document.getElementById('moneyCP')?.value, 10);
        const sp = parseInt(document.getElementById('moneySP')?.value, 10);
        const ep = parseInt(document.getElementById('moneyEP')?.value, 10);
        const gp = parseInt(document.getElementById('moneyGP')?.value, 10);
        const pp = parseInt(document.getElementById('moneyPP')?.value, 10);

        // Use optional chaining and nullish coalescing for safety when getting elements
        moneyUpdates.cp = isNaN(cp) ? (currentCharacterSheet?.cp ?? 0) : cp; // Default to current sheet value or 0
        moneyUpdates.sp = isNaN(sp) ? (currentCharacterSheet?.sp ?? 0) : sp;
        moneyUpdates.ep = isNaN(ep) ? (currentCharacterSheet?.ep ?? 0) : ep;
        moneyUpdates.gp = isNaN(gp) ? (currentCharacterSheet?.gp ?? 0) : gp;
        moneyUpdates.pp = isNaN(pp) ? (currentCharacterSheet?.pp ?? 0) : pp;
        // *** END GET MONEY VALUES ***

        // *** COMBINE UPDATES ***
        const combinedUpdates = {
            inventory: newInventory, // The updated inventory array
            ...moneyUpdates          // Spread the money fields (cp, sp, ep, gp, pp) into the object
        };

        console.log("Emitting 'update character sheet' (Inventory & Money) with data:", combinedUpdates); // Log the actual combined data
        socket.emit('update character sheet', {
            sheetUpdates: combinedUpdates // Send the combined object containing BOTH inventory and money
        });

        addMessageToChat("Saving Inventory & Currency changes..."); // Message is now accurate
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


// --- populateFeatsModal (Ensure previous modifications + Read-Only) ---
// Add isReadOnly parameter
function populateFeatsModal(featsAndTraitsArray, isReadOnly = false) {
    if (!modalFeatsContent) {
        console.error("Feats modal content element not found!");
        return;
    }
    modalFeatsContent.innerHTML = ''; // Clear

    // --- Add Title indication ---
    const titleH2 = featsModal.querySelector('h2');
    if(titleH2) {
        // Fetching player name for title might require passing sheetData if desired
        titleH2.textContent = isReadOnly ? `Viewing Feats & Traits (Read-Only)` : "Feats & Traits";
    }
    // --- End Title ---

    const listContainerDiv = document.createElement('div');
    listContainerDiv.id = 'feats-list-display';

    // Modified row creation function (internal)
    const createFeatTraitRowElement = (featTrait = {}) => { // isReadOnly available via closure
        const itemRowDiv = document.createElement('div');
        itemRowDiv.className = 'feat-trait-row';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = featTrait.name || '';
        nameInput.placeholder = "Feat/Trait Name";
        nameInput.className = 'feat-trait-name';
        nameInput.disabled = isReadOnly; // <<< Disable

        const descTextarea = document.createElement('textarea');
        descTextarea.value = featTrait.description || '';
        descTextarea.placeholder = 'Description';
        descTextarea.className = 'feat-trait-desc';
        descTextarea.rows = 3;
        descTextarea.disabled = isReadOnly; // <<< Disable
        descTextarea.readOnly = isReadOnly; // Also set readOnly for textareas

        itemRowDiv.appendChild(nameInput);
        itemRowDiv.appendChild(descTextarea);

        // Only add remove button if NOT read-only
        if (!isReadOnly) {
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-item-btn';
            removeButton.type = 'button';
            removeButton.onclick = () => {
                itemRowDiv.remove();
            };
            itemRowDiv.appendChild(removeButton);
        }

        return itemRowDiv;
    };

    // Populate list
    if (featsAndTraitsArray && Array.isArray(featsAndTraitsArray) && featsAndTraitsArray.length > 0) {
        featsAndTraitsArray.forEach((item) => {
            listContainerDiv.appendChild(createFeatTraitRowElement(item));
        });
    } else {
        const noItemsMsg = document.createElement('p');
        noItemsMsg.textContent = isReadOnly ? "No feats or traits defined." : "No feats or traits defined. Click 'Add New' to start.";
        listContainerDiv.appendChild(noItemsMsg);
    }
    modalFeatsContent.appendChild(listContainerDiv);

    // Only show "Add New" button if NOT read-only
    const existingAddButton = document.getElementById('add-feat-trait-btn');
    if(existingAddButton) existingAddButton.remove(); // Remove old one

    if (!isReadOnly) {
        const addButton = document.createElement('button');
        addButton.textContent = 'Add New Feat/Trait';
        addButton.type = 'button';
        addButton.id = 'add-feat-trait-btn';
        addButton.onclick = () => {
            const noItemsMessageElement = listContainerDiv.querySelector('p');
            if (noItemsMessageElement) noItemsMessageElement.remove();
            const newItemRow = createFeatTraitRowElement(); // isReadOnly will be false here
            listContainerDiv.appendChild(newItemRow);
            newItemRow.querySelector('.feat-trait-name')?.focus();
        };
        modalFeatsContent.appendChild(addButton);
    }

    // Hide Save Button in Read-Only Mode
    if (saveFeatsButton) {
        saveFeatsButton.style.display = isReadOnly ? 'none' : 'inline-block';
    }
}
// --- populateSpellsModal (Ensure previous modifications + Read-Only) ---
// Add isReadOnly parameter
function populateSpellsModal(sheetData, isReadOnly = false) {
    if (!sheetData || !modalSpellsContent) return;

    // --- Add Title indication ---
    const titleH2 = spellsModal.querySelector('h2');
    if(titleH2) {
        titleH2.textContent = isReadOnly ? `Viewing ${sheetData.playerName}'s Spellcasting (Read-Only)` : "Spellcasting";
    }
    // --- End Title ---

    // --- Populate Core Info (and disable) ---
    if (spellClassInput) {
        spellClassInput.value = sheetData.spellcastingClass || '';
        spellClassInput.disabled = isReadOnly;
    }
    if (spellAbilitySelect) {
        spellAbilitySelect.value = sheetData.spellcastingAbility || '';
        spellAbilitySelect.disabled = isReadOnly;
    }
    if (spellSaveDCInput) {
        spellSaveDCInput.value = sheetData.spellSaveDC || 8;
        spellSaveDCInput.disabled = isReadOnly;
    }
    if (spellAttackBonusInput) {
        spellAttackBonusInput.value = sheetData.spellAttackBonus || 0;
        spellAttackBonusInput.disabled = isReadOnly;
    }

    // Populate Spell Slots (and disable inputs)
    populateSpellSlots(sheetData.spellSlots, isReadOnly); // Pass flag

    // Populate Spells List with Tabs (and disable controls within)
    populateSpellTabsAndLists(sheetData.spells || [], isReadOnly); // Pass flag

    // Activate the first tab (Cantrips) by default
    activateSpellTab(0); // Show level 0 initially

    // Hide Save Button in Read-Only Mode
    if (saveSpellsButton) {
        saveSpellsButton.style.display = isReadOnly ? 'none' : 'inline-block';
    }
}

// Modify populateSpellSlots to accept isReadOnly
function populateSpellSlots(spellSlotsData = {}, isReadOnly = false) {
    if (!spellSlotsGrid) return;
    // Clear previous slots but keep headers
    spellSlotsGrid.innerHTML = `
        <div class="slot-header">Level</div>
        <div class="slot-header">Total</div>
        <div class="slot-header">Expended</div>
    `;

    for (let level = 1; level <= 9; level++) { // Only show slots for 1-9
        const levelData = spellSlotsData[`level${level}`] || { total: 0, expended: 0 };

        const levelLabel = document.createElement('div');
        levelLabel.className = 'slot-level-label';
        levelLabel.textContent = `Level ${level}`;

        const totalInput = document.createElement('input');
        totalInput.type = 'number';
        totalInput.id = `spellSlotsTotal-${level}`;
        totalInput.min = '0';
        totalInput.value = levelData.total || 0;
        totalInput.dataset.level = level;
        totalInput.dataset.type = 'total';
        totalInput.disabled = isReadOnly; // <<< Disable

        const expendedInput = document.createElement('input');
        expendedInput.type = 'number';
        expendedInput.id = `spellSlotsExpended-${level}`;
        expendedInput.min = '0';
        expendedInput.value = levelData.expended || 0;
        expendedInput.dataset.level = level;
        expendedInput.dataset.type = 'expended';
        expendedInput.disabled = isReadOnly; // <<< Disable

        // Keep listeners if not read-only
        if (!isReadOnly) {
            expendedInput.addEventListener('input', (e) => {
                 const currentTotal = parseInt(document.getElementById(`spellSlotsTotal-${level}`)?.value || '0', 10);
                 if (!isNaN(currentTotal) && parseInt(e.target.value, 10) > currentTotal) {
                     e.target.value = currentTotal;
                 }
                 if (parseInt(e.target.value, 10) < 0) {
                      e.target.value = 0;
                 }
            });
             totalInput.addEventListener('input', (e)=>{
                 const currentExpendedInput = document.getElementById(`spellSlotsExpended-${level}`);
                 const currentExpended = parseInt(currentExpendedInput?.value || '0', 10);
                 const newTotal = parseInt(e.target.value, 10);
                  if (!isNaN(currentExpended) && !isNaN(newTotal) && currentExpended > newTotal) {
                     currentExpendedInput.value = newTotal >= 0 ? newTotal : 0;
                 }
                  if (!isNaN(newTotal) && newTotal < 0) {
                      e.target.value = 0;
                  }
             });
         }

        spellSlotsGrid.appendChild(levelLabel);
        spellSlotsGrid.appendChild(totalInput);
        spellSlotsGrid.appendChild(expendedInput);
    }
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
// Attacks Modal Control
if (openAttacksButton) {
    openAttacksButton.addEventListener('click', () => {
        if (currentCharacterSheet) {
            populateAttacksModal(currentCharacterSheet.attacks || []);
            attacksModal.style.display = 'block';
        } else {
            addMessageToChat("Please log in to manage Attacks.");
        }
    });
}
if (closeAttacksModalButton) {
    closeAttacksModalButton.addEventListener('click', () => {
        attacksModal.style.display = 'none';
    });
}

// Spellcasting Modal Control (basic open/close for now)
if (openSpellsButton) {
    openSpellsButton.addEventListener('click', () => {
        if (currentCharacterSheet) {
            populateSpellsModal(currentCharacterSheet); // Pass the full sheet
            spellsModal.style.display = 'block';
        } else {
            addMessageToChat("Please log in to manage Spellcasting.");
        }
    });
}
if (closeSpellsModalButton) {
    closeSpellsModalButton.addEventListener('click', () => {
        spellsModal.style.display = 'none';
    });
}
// Helper function to create a DOM row for a single attack
function createAttackRowElement(attack = {}, isReadOnly = false) {
    const itemRowDiv = document.createElement('div');
    itemRowDiv.className = 'attack-row';

    // --- Input Fields ---
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = attack.name || '';
    nameInput.placeholder = "Attack Name";
    nameInput.className = 'attack-name';
    nameInput.disabled = isReadOnly;

    const bonusInput = document.createElement('input');
    bonusInput.type = 'text';
    bonusInput.value = attack.attackBonus || '+0';
    bonusInput.placeholder = "Atk Bonus";
    bonusInput.className = 'attack-bonus';
    bonusInput.disabled = isReadOnly;

    const damageDiceInput = document.createElement('input'); // Renamed for clarity
    damageDiceInput.type = 'text';
    damageDiceInput.value = attack.damage || ''; // This field stores "1d8+3"
    damageDiceInput.placeholder = "Damage (e.g., 1d8+3)";
    damageDiceInput.className = 'attack-damage'; // Keep class for CSS targeting
    damageDiceInput.disabled = isReadOnly;

    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.value = attack.damageType || '';
    typeInput.placeholder = "Type";
    typeInput.className = 'attack-type';
    typeInput.disabled = isReadOnly;

    itemRowDiv.appendChild(nameInput);
    itemRowDiv.appendChild(bonusInput);
    itemRowDiv.appendChild(damageDiceInput); // This is the damage dice string
    itemRowDiv.appendChild(typeInput);

    // --- Buttons Area ---
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'attack-buttons-container'; // For styling the group of buttons

    if (!isReadOnly) {
        // 1. Attack Roll Button
        const attackRollButton = document.createElement('button');
        attackRollButton.textContent = 'Attack';
        attackRollButton.className = 'attack-roll-btn modal-action-button'; // Added common class
        attackRollButton.type = 'button';
        attackRollButton.title = "Roll Attack";
        attackRollButton.onclick = () => {
            console.log("Modal Attack Roll button clicked for:", nameInput.value);
            // Call your existing handleAttackRoll or a modified one
            // Pass only what's needed for the attack roll itself
            handleAttackRoll(nameInput.value, bonusInput.value);
        };
        buttonsDiv.appendChild(attackRollButton);

        // 2. Damage Roll Button (NEW)
        const damageRollButton = document.createElement('button');
        damageRollButton.textContent = 'Damage';
        damageRollButton.className = 'damage-roll-btn modal-action-button'; // Added common class
        damageRollButton.type = 'button';
        damageRollButton.title = "Roll Damage";
        damageRollButton.onclick = () => {
            console.log("Modal Damage Roll button clicked for:", nameInput.value);
            // Pass the attack name and the content of the damageDiceInput
            handleDamageRoll(nameInput.value, damageDiceInput.value);
        };
        buttonsDiv.appendChild(damageRollButton);

        // 3. Remove Button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-item-btn';
        removeButton.type = 'button';
        removeButton.onclick = () => {
            itemRowDiv.remove();
        };
        buttonsDiv.appendChild(removeButton);
    } else {
        // Optional: Add placeholders for layout consistency in read-only mode
        const placeholder = document.createElement('div');
        placeholder.style.minWidth = '60px'; // Adjust if buttons are wider
        placeholder.style.display = 'inline-block';
        placeholder.style.height = '1em'; // Give it some height
        buttonsDiv.appendChild(placeholder.cloneNode(true)); // For Attack
        buttonsDiv.appendChild(placeholder.cloneNode(true)); // For Damage
        buttonsDiv.appendChild(placeholder.cloneNode(true)); // For Remove
    }
    itemRowDiv.appendChild(buttonsDiv); // Append the container of buttons

    return itemRowDiv;
}




const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Function to populate the Attacks modal content
function populateAttacksModal(attacksArray, isReadOnly = false) {
    if (!modalAttacksContent) {
        console.error("Attacks modal content element not found!");
        return;
    }
    modalAttacksContent.innerHTML = ''; // Clear previous content

    const titleH2 = attacksModal.querySelector('h2');
    if (titleH2) {
        titleH2.textContent = isReadOnly ? `Viewing Attacks (Read-Only)` : "Attacks & Spellcasting Actions";
    }

    const listContainerDiv = document.createElement('div');
    listContainerDiv.id = 'attacks-list-display';

    // Correct population of the list using the global createAttackRowElement
    if (attacksArray && Array.isArray(attacksArray) && attacksArray.length > 0) {
        attacksArray.forEach((item) => {
            // Call the GLOBAL createAttackRowElement and pass isReadOnly
            listContainerDiv.appendChild(createAttackRowElement(item, isReadOnly));
        });
    } else {
        // Display "No attacks defined" message if the array is empty
        listContainerDiv.innerHTML = `<p>${isReadOnly ? 'No attacks defined.' : "No attacks defined. Click 'Add New Attack' to start."}</p>`;
    }
    modalAttacksContent.appendChild(listContainerDiv); // Append the populated list container ONCE

    // Correct handling of the "Add New Attack" button
    const existingAddButton = document.getElementById('add-attack-btn');
    if (existingAddButton) existingAddButton.remove(); // Remove old one if it exists

    if (!isReadOnly) { // Only show "Add New Attack" button if not in read-only mode
        const addButton = document.createElement('button');
        addButton.textContent = 'Add New Attack';
        addButton.type = 'button';
        addButton.id = 'add-attack-btn'; // Ensure this ID is unique or handled well if multiple modals use it
        addButton.onclick = () => {
            const noItemsMsg = listContainerDiv.querySelector('p');
            if (noItemsMsg && noItemsMsg.parentNode === listContainerDiv) { // Ensure it's the direct placeholder
                 noItemsMsg.remove();
            }
            // Call the GLOBAL createAttackRowElement, passing isReadOnly as false for new items
            const newItemRow = createAttackRowElement({}, false);
            listContainerDiv.appendChild(newItemRow);
            newItemRow.querySelector('.attack-name')?.focus();
        };
        modalAttacksContent.appendChild(addButton); // Append the "Add New Attack" button
    }

    // Correct handling of the "Save Attacks" button visibility
    if (saveAttacksButton) {
        saveAttacksButton.style.display = isReadOnly ? 'none' : 'inline-block';
    }
} // <<< END OF populateAttacksModal function


// The saveAttacksButton event listener should be defined OUTSIDE and only ONCE globally
if (saveAttacksButton) {
    saveAttacksButton.addEventListener('click', () => {
        if (!currentCharacterSheet || !currentAuthenticatedUsername) {
            addMessageToChat("Error: Cannot save Attacks. Log in again.");
            return;
        }

        const newAttacks = [];
        // Query from the correct, uniquely populated list
        const attackRows = modalAttacksContent.querySelectorAll('#attacks-list-display .attack-row');

        attackRows.forEach(row => {
            const name = row.querySelector('.attack-name')?.value.trim() || '';
            if (name) {
                newAttacks.push({
                    name: name,
                    attackBonus: row.querySelector('.attack-bonus')?.value.trim() || '+0',
                    damage: row.querySelector('.attack-damage')?.value.trim() || '',
                    damageType: row.querySelector('.attack-type')?.value.trim() || ''
                });
            }
        });

        console.log("Emitting 'update character sheet' (Attacks only) with data:", newAttacks);
        socket.emit('update character sheet', {
            sheetUpdates: { attacks: newAttacks }
        });

        addMessageToChat("Saving Attacks changes...");
    });
}
// Modify populateSpellSlots to accept isReadOnly
function populateSpellSlots(spellSlotsData = {}, isReadOnly = false) {
    if (!spellSlotsGrid) return;
    // Clear previous slots but keep headers
    spellSlotsGrid.innerHTML = `
        <div class="slot-header">Level</div>
        <div class="slot-header">Total</div>
        <div class="slot-header">Expended</div>
    `;

    for (let level = 1; level <= 9; level++) { // Only show slots for 1-9
        const levelData = spellSlotsData[`level${level}`] || { total: 0, expended: 0 };

        const levelLabel = document.createElement('div');
        levelLabel.className = 'slot-level-label';
        levelLabel.textContent = `Level ${level}`;

        const totalInput = document.createElement('input');
        totalInput.type = 'number';
        totalInput.id = `spellSlotsTotal-${level}`;
        totalInput.min = '0';
        totalInput.value = levelData.total || 0;
        totalInput.dataset.level = level;
        totalInput.dataset.type = 'total';
        totalInput.disabled = isReadOnly; // <<< Disable

        const expendedInput = document.createElement('input');
        expendedInput.type = 'number';
        expendedInput.id = `spellSlotsExpended-${level}`;
        expendedInput.min = '0';
        expendedInput.value = levelData.expended || 0;
        expendedInput.dataset.level = level;
        expendedInput.dataset.type = 'expended';
        expendedInput.disabled = isReadOnly; // <<< Disable

        // Keep listeners if not read-only
        if (!isReadOnly) {
            expendedInput.addEventListener('input', (e) => {
                 const currentTotal = parseInt(document.getElementById(`spellSlotsTotal-${level}`)?.value || '0', 10);
                 if (!isNaN(currentTotal) && parseInt(e.target.value, 10) > currentTotal) {
                     e.target.value = currentTotal;
                 }
                 if (parseInt(e.target.value, 10) < 0) {
                      e.target.value = 0;
                 }
            });
             totalInput.addEventListener('input', (e)=>{
                 const currentExpendedInput = document.getElementById(`spellSlotsExpended-${level}`);
                 const currentExpended = parseInt(currentExpendedInput?.value || '0', 10);
                 const newTotal = parseInt(e.target.value, 10);
                  if (!isNaN(currentExpended) && !isNaN(newTotal) && currentExpended > newTotal) {
                     currentExpendedInput.value = newTotal >= 0 ? newTotal : 0;
                 }
                  if (!isNaN(newTotal) && newTotal < 0) {
                      e.target.value = 0;
                  }
             });
         }

        spellSlotsGrid.appendChild(levelLabel);
        spellSlotsGrid.appendChild(totalInput);
        spellSlotsGrid.appendChild(expendedInput);
    }
}

// Modify populateSpellTabsAndLists to pass isReadOnly down
function populateSpellTabsAndLists(spellsArray = [], isReadOnly = false) {
    if (!spellTabsContainer || !spellTabContentContainer) return;

    spellTabsContainer.innerHTML = '';
    spellTabContentContainer.innerHTML = '';

    SPELL_LEVELS.forEach(level => {
        // Create Tab Button (no changes needed)
        const tabButton = document.createElement('button');
        tabButton.className = 'spell-tab-button';
        tabButton.textContent = level === 0 ? 'Cantrips' : `Level ${level}`;
        tabButton.dataset.level = level;
        tabButton.onclick = () => activateSpellTab(level);
        spellTabsContainer.appendChild(tabButton);

        // Create Tab Content Pane (no changes needed)
        const tabPane = document.createElement('div');
        tabPane.className = 'spell-tab-pane';
        tabPane.id = `spell-tab-pane-${level}`;
        tabPane.dataset.level = level;

        // Create List Container inside Pane (no changes needed)
        const listContainer = document.createElement('div');
        listContainer.className = 'spells-list-level';
        listContainer.id = `spells-list-level-${level}`;
        listContainer.innerHTML = `<p>${isReadOnly ? 'No spells known/prepared for this level.' : 'No spells defined for this level.'}</p>`; // Adjusted placeholder
        tabPane.appendChild(listContainer);

        spellTabContentContainer.appendChild(tabPane);
    });

    // Distribute existing spells into the correct lists using the modified row creator
    spellsArray.forEach(spell => {
        const listContainer = document.getElementById(`spells-list-level-${spell.level}`);
        if (listContainer) {
            const noSpellsMsg = listContainer.querySelector('p');
            if (noSpellsMsg && !listContainer.querySelector('.spell-row')) { // Only remove if it's the only thing there
                noSpellsMsg.remove();
            }
            listContainer.appendChild(createSpellRowElement(spell, isReadOnly)); // <<< Pass flag
        }
    });

    // Ensure Add Spell button listener is attached AND button is hidden if read-only
    setupAddSpellButton(isReadOnly); // Pass flag
}


// Helper to activate a specific spell tab
function activateSpellTab(levelToShow) {
    // Deactivate all buttons and panes
    document.querySelectorAll('.spell-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.spell-tab-pane').forEach(pane => pane.classList.remove('active'));

    // Activate the target button and pane
    const targetButton = spellTabsContainer.querySelector(`.spell-tab-button[data-level="${levelToShow}"]`);
    const targetPane = spellTabContentContainer.querySelector(`.spell-tab-pane[data-level="${levelToShow}"]`);

    if (targetButton) targetButton.classList.add('active');
    if (targetPane) targetPane.classList.add('active');
}


// Modify createSpellRowElement to accept isReadOnly
function createSpellRowElement(spell = {}, isReadOnly = false) {
    const spellRowDiv = document.createElement('div');
    spellRowDiv.className = 'spell-row';
    spellRowDiv.dataset.level = spell.level === undefined ? 0 : spell.level;

    // --- Structure using grid areas ---
    const prepArea = document.createElement('div');
    prepArea.className = 'spell-prep';
    const prepCheckbox = document.createElement('input');
    prepCheckbox.type = 'checkbox';
    prepCheckbox.checked = spell.prepared || false;
    prepCheckbox.title = "Prepared";
    prepCheckbox.disabled = isReadOnly; // <<< Disable
    prepArea.appendChild(prepCheckbox);

    const nameArea = document.createElement('div');
    nameArea.className = 'spell-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = spell.name || '';
    nameInput.placeholder = "Spell Name";
    nameInput.disabled = isReadOnly; // <<< Disable
    nameArea.appendChild(nameInput);

    const detailsArea = document.createElement('div');
    detailsArea.className = 'spell-details-grid';

    // Modified helper to create detail inputs (and disable)
    const createDetailInput = (label, type, value, placeholder, className = '', options = null) => {
        const wrap = document.createElement('div');
        const lbl = document.createElement('label');
        lbl.textContent = label + ':';
        wrap.appendChild(lbl);
        let input;
        if (type === 'select' && options) {
            input = document.createElement('select');
            options.forEach(opt => {
                const optionEl = document.createElement('option');
                optionEl.value = opt.value;
                optionEl.textContent = opt.text;
                // Use == for comparing value from sheet (might be number) and option value (string)
                if (opt.value == value) optionEl.selected = true;
                input.appendChild(optionEl);
            });
            input.disabled = isReadOnly; // <<< Disable Select
        } else if (type === 'textarea') {
             input = document.createElement('textarea');
             input.rows = 3;
             input.value = value || '';
             input.disabled = isReadOnly; // <<< Disable Textarea
             input.readOnly = isReadOnly; // Set readOnly too
        } else {
            input = document.createElement('input');
            input.type = type;
            input.value = value || (type === 'number' ? 0 : '');
            if (type === 'number') input.min = 0;
            input.disabled = isReadOnly; // <<< Disable Input
        }
        input.placeholder = placeholder;
        if (className) input.classList.add(className);
        wrap.appendChild(input);
        return wrap;
    };

    // Add detail fields using the modified creator
    const levelOptions = SPELL_LEVELS.map(l => ({ value: l, text: l === 0 ? 'Cantrip' : `Level ${l}` }));
    detailsArea.appendChild(createDetailInput('Level', 'select', spell.level, 'Lvl', 'spell-level', levelOptions));
    detailsArea.appendChild(createDetailInput('School', 'text', spell.school, 'e.g., Evocation', 'spell-school'));
    detailsArea.appendChild(createDetailInput('Cast Time', 'text', spell.castingTime, 'e.g., 1 Action', 'spell-castingTime'));
    detailsArea.appendChild(createDetailInput('Range', 'text', spell.range, 'e.g., 60 feet', 'spell-range'));
    detailsArea.appendChild(createDetailInput('Components', 'text', spell.components, 'V, S, M (cost)', 'spell-components'));
    detailsArea.appendChild(createDetailInput('Duration', 'text', spell.duration, 'e.g., Instantaneous', 'spell-duration'));
    detailsArea.appendChild(createDetailInput('Damage/Effect', 'text', spell.damageEffect, 'e.g., 3d6 Fire / Save DC', 'spell-damageEffect'));
    detailsArea.appendChild(createDetailInput('Description', 'textarea', spell.description, 'Spell details...', 'spell-description'));

    // Only add Cast and Remove buttons if NOT read-only
    const castButtonArea = document.createElement('div');
    castButtonArea.className = 'spell-cast-button-area';
    if (!isReadOnly) {
        const castButton = document.createElement('button');
        castButton.textContent = 'Cast';
        castButton.className = 'cast-spell-btn';
        castButton.type = 'button';
        castButton.onclick = () => {
            handleCastSpell(
                nameInput.value,
                detailsArea.querySelector('.spell-level')?.value || 0,
                detailsArea.querySelector('.spell-damageEffect')?.value || ''
            );
        };
        castButtonArea.appendChild(castButton);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-item-btn';
        removeButton.type = 'button';
        removeButton.onclick = () => { spellRowDiv.remove(); };
        castButtonArea.appendChild(removeButton);
    } else {
        // Add placeholder text or leave empty in read-only mode
         castButtonArea.innerHTML = ' '; // Maintain layout somewhat
    }

    // Append areas to main div
    spellRowDiv.appendChild(prepArea);
    spellRowDiv.appendChild(nameArea);
    spellRowDiv.appendChild(detailsArea);
    spellRowDiv.appendChild(castButtonArea);

    return spellRowDiv;
}

// Modify setupAddSpellButton to accept isReadOnly and hide button
function setupAddSpellButton(isReadOnly = false) {
    const currentAddButton = document.getElementById('add-spell-btn'); // Find existing button
    if (currentAddButton) {
        // Always remove previous listener by cloning if not read-only
        const newAddSpellButton = currentAddButton.cloneNode(true);
        currentAddButton.parentNode.replaceChild(newAddSpellButton, currentAddButton);

        if (isReadOnly) {
            newAddSpellButton.style.display = 'none'; // Hide if read-only
        } else {
            newAddSpellButton.style.display = 'inline-block'; // Ensure visible otherwise
            newAddSpellButton.onclick = () => {
                 const activePane = spellTabContentContainer.querySelector('.spell-tab-pane.active');
                 let targetPane = activePane;
                 if (!activePane) {
                     console.warn("No active spell tab found to add spell to.");
                     activateSpellTab(0);
                     targetPane = spellTabContentContainer.querySelector('#spell-tab-pane-0');
                 }

                 if(targetPane) {
                    const listContainer = targetPane.querySelector('.spells-list-level');
                    if(listContainer){
                        const noSpellsMsg = listContainer.querySelector('p');
                        if (noSpellsMsg && !listContainer.querySelector('.spell-row')) noSpellsMsg.remove(); // Remove placeholder only if list is empty
                        const currentLevel = parseInt(targetPane.dataset.level || '0', 10);
                        // Create row using the modified function (passing false for isReadOnly here)
                        const newSpellRow = createSpellRowElement({ level: currentLevel }, false);
                        listContainer.appendChild(newSpellRow);
                        newSpellRow.querySelector('.spell-name input')?.focus();
                    }
                 }
            };
        }
    }
}

// Handle "Cast" button click
function handleCastSpell(spellName, spellLevel, damageEffectStr) {
     if (!currentCharacterSheet) return;
    const rollerName = getPlayerName();
    spellName = spellName || "Unnamed Spell";
    spellLevel = parseInt(spellLevel, 10);

    // Announce the cast
     let castMessage = `${rollerName} casts ${spellName}`;
     if (!isNaN(spellLevel) && spellLevel > 0) {
         castMessage += ` (Level ${spellLevel})`;
         // Optional: Check/decrement spell slots here or on server
     } else if (spellLevel === 0) {
          castMessage += ` (Cantrip)`;
     }
     castMessage += `!`;
     // Send as a chat message (could be a specific event type later)
     socket.emit('client message', { sender: "System", text: castMessage });


    // Roll damage/effect if applicable
    if (damageEffectStr && damageEffectStr.trim() !== '') {
        // Simple check: does it contain 'd' or 'D'?
         const diceRegex = /\d+[dD]\d+/;
        if (diceRegex.test(damageEffectStr)) {
            // Attempt to extract only the dice part if mixed with text
             let rollString = damageEffectStr.match(/(\d+[dD]\d+(?:[+-]\d+)?)/)?.[0] || damageEffectStr.trim(); // Get first dice pattern or whole string
             socket.emit('dice roll', {
                rollerName: rollerName,
                rollString: rollString,
                description: `${spellName}: Effect/Damage (${damageEffectStr})` // Show original string in desc
            });
        } else {
            // If no dice detected, just add the effect description to chat
             addMessageToChat(` > Effect: ${damageEffectStr}`);
        }
    }
}
// Save Spells Button Listener
if (saveSpellsButton) {
    saveSpellsButton.addEventListener('click', () => {
        if (!currentCharacterSheet || !currentAuthenticatedUsername) {
            addMessageToChat("Error: Cannot save Spells. Log in again.");
            return;
        }

        const sheetUpdates = {};

        // 1. Save Core Spellcasting Info
        sheetUpdates.spellcastingClass = document.getElementById('spellClass')?.value.trim() || '';
        sheetUpdates.spellcastingAbility = document.getElementById('spellAbility')?.value || '';
        sheetUpdates.spellSaveDC = parseInt(document.getElementById('spellSaveDC')?.value, 10) || 8;
        sheetUpdates.spellAttackBonus = parseInt(document.getElementById('spellAttackBonus')?.value, 10) || 0;

        // 2. Save Spell Slots
        sheetUpdates.spellSlots = {};
        for (let level = 1; level <= 9; level++) {
            const total = parseInt(document.getElementById(`spellSlotsTotal-${level}`)?.value, 10);
            const expended = parseInt(document.getElementById(`spellSlotsExpended-${level}`)?.value, 10);
            sheetUpdates.spellSlots[`level${level}`] = {
                total: isNaN(total) ? 0 : total,
                expended: isNaN(expended) ? 0 : expended
            };
        }
         // Add level 0 structure if needed by schema default (usually empty)
         sheetUpdates.spellSlots.level0 = { total: 0, expended: 0 };


        // 3. Save Spells List (Collect from ALL tabs)
        sheetUpdates.spells = [];
        const spellRows = modalSpellsContent.querySelectorAll('.spell-row'); // Get all spell rows
        spellRows.forEach(row => {
            const nameInput = row.querySelector('.spell-name input');
            const name = nameInput?.value.trim();
            if (name) { // Only save if name exists
                const spellData = {
                    name: name,
                    prepared: row.querySelector('.spell-prep input[type="checkbox"]')?.checked || false,
                    level: parseInt(row.querySelector('.spell-level')?.value, 10) || 0,
                    school: row.querySelector('.spell-school')?.value.trim() || '',
                    castingTime: row.querySelector('.spell-castingTime')?.value.trim() || '',
                    range: row.querySelector('.spell-range')?.value.trim() || '',
                    components: row.querySelector('.spell-components')?.value.trim() || '',
                    duration: row.querySelector('.spell-duration')?.value.trim() || '',
                    description: row.querySelector('.spell-description')?.value.trim() || '',
                    damageEffect: row.querySelector('.spell-damageEffect')?.value.trim() || ''
                };
                sheetUpdates.spells.push(spellData);
            }
        });

        console.log("Emitting 'update character sheet' (Spellcasting) with data:", sheetUpdates);
        socket.emit('update character sheet', { sheetUpdates: sheetUpdates });

        addMessageToChat("Saving Spellcasting changes...");
        // spellsModal.style.display = 'none'; // Optional close
    });
}
function formatBonusString(bonus) {
    const numBonus = parseInt(bonus, 10); // Try parsing even if it's like "+5"
    if (isNaN(numBonus) || numBonus === 0) return "";
    return numBonus > 0 ? `+${numBonus}` : `${numBonus}`; // Handles positive and negative
}
// *** NEW: Quick Roll Action Handlers ***
function handleQuickAttack() {
    if (!currentCharacterSheet) {
        addMessageToChat("Error: Character sheet not loaded.");
        return;
    }
    if (!currentCharacterSheet.attacks || currentCharacterSheet.attacks.length === 0) {
        addMessageToChat("Error: No attacks defined in your character sheet.");
        return;
    }

    const firstAttack = currentCharacterSheet.attacks[0];
    const attackName = firstAttack.name || "First Weapon Attack";
    const attackBonusStr = firstAttack.attackBonus || '+0';
    const rollerName = getPlayerName();

    console.log(`Quick Attack: Using "${attackName}", Bonus: "${attackBonusStr}"`);

    // --- Attack Roll ONLY ---
    let atkBonusValue = 0;
    const bonusMatch = attackBonusStr.match(/[+-]?\d+/);
    if (bonusMatch) {
        atkBonusValue = parseInt(bonusMatch[0], 10);
    } else {
        console.warn(`Could not parse attack bonus "${attackBonusStr}" for ${attackName}. Using 0.`);
    }

    const atkBonusStringForRoll = formatBonusString(atkBonusValue);
    const attackRollString = `1d20${atkBonusStringForRoll}`;

    socket.emit('dice roll', {
        rollerName: rollerName,
        rollString: attackRollString,
        description: `${attackName}: Attack Roll (${attackRollString})`
    });
}

// *** NEW: Handler for Quick Damage Roll ***
function handleQuickDamage() {
    if (!currentCharacterSheet) {
        addMessageToChat("Error: Character sheet not loaded.");
        return;
    }
    if (!currentCharacterSheet.attacks || currentCharacterSheet.attacks.length === 0) {
        addMessageToChat("Error: No attacks defined in your character sheet.");
        return;
    }

    const firstAttack = currentCharacterSheet.attacks[0];
    const attackName = firstAttack.name || "First Weapon";
    const damageStr = firstAttack.damage || '';
    const rollerName = getPlayerName();

    console.log(`Quick Damage: Using "${attackName}", Damage String: "${damageStr}"`);

    // --- Damage Roll ---
    if (damageStr && damageStr.trim() !== '') {
        if (damageStr.includes('d') || damageStr.includes('D')) {
             socket.emit('dice roll', {
                rollerName: rollerName,
                rollString: damageStr.trim(),
                description: `${attackName}: Damage Roll (${damageStr.trim()})`
            });
        } else {
            addMessageToChat(`${rollerName} deals ${damageStr} damage with ${attackName}.`);
        }
    } else {
        addMessageToChat(`${attackName} doesn't specify damage.`);
    }
}

function handleQuickSpellAttack() {
    if (!currentCharacterSheet) {
        addMessageToChat("Error: Character sheet not loaded.");
        return;
    }

    // spellAttackBonus should be a number according to the schema
    const bonusValue = currentCharacterSheet.spellAttackBonus || 0;
    const bonusStringForRoll = formatBonusString(bonusValue); // Use helper
    const rollString = `1d20${bonusStringForRoll}`;
    const rollerName = getPlayerName();

    console.log(`Quick Spell Attack: Using Bonus: ${bonusValue} (${bonusStringForRoll}), Roll: ${rollString}`);

    socket.emit('dice roll', {
        rollerName: rollerName,
        rollString: rollString,
        description: `Spell Attack Roll (${rollString})` // Simple description
    });
}
if (quickAttackButton) {
    quickAttackButton.addEventListener('click', handleQuickAttack);
}

if (quickSpellAttackButton) {
    quickSpellAttackButton.addEventListener('click', handleQuickSpellAttack);
}
if (quickDamageButton) {
    quickDamageButton.addEventListener('click', handleQuickDamage);
}
function openSheetForViewing(username) {
    const sheetToView = allCharacterSheets[username];
    if (!sheetToView) {
        addMessageToChat(`Error: Could not find sheet data for ${username}.`);
        return;
    }

    // --- Open Modals Using Populate Functions with Read-Only Flag ---

    // 1. Character Sheet Modal
    populateSheetModal(sheetToView, true);
    sheetModal.style.display = 'block';

    // 2. Inventory Modal
    populateInventoryModal(sheetToView.inventory || [], sheetToView, true);
    inventoryModal.style.display = 'block'; // Open inventory modal too

    // 3. Feats & Traits Modal
    populateFeatsModal(sheetToView.featsAndTraits || [], true);
    featsModal.style.display = 'block'; // Open feats modal too

    // 4. Attacks Modal
    populateAttacksModal(sheetToView.attacks || [], true);
    attacksModal.style.display = 'block'; // Open attacks modal too

    // 5. Spellcasting Modal
    populateSpellsModal(sheetToView, true);
    spellsModal.style.display = 'block'; // Open spells modal too
}
// --- NEW: Function to create and show the view options menu ---
function createViewOptionsMenu(username, event) {
    const sheetToView = allCharacterSheets[username];
    if (!sheetToView) {
        addMessageToChat(`Error: Could not find sheet data for ${username}.`);
        return;
    }

    // Remove any existing menu first
    const existingMenu = document.getElementById('viewOptionsMenu');
    if (existingMenu) {
        existingMenu.remove();
    }

    // Create the menu container
    const menuDiv = document.createElement('div');
    menuDiv.id = 'viewOptionsMenu';
    menuDiv.className = 'view-options-menu';

    // Define the options
    const options = [
        { label: "Sheet", modalId: "sheetModal", populateFn: populateSheetModal, needsFullSheet: true },
        { label: "Inventory", modalId: "inventoryModal", populateFn: populateInventoryModal, needsFullSheet: true }, // needs full sheet for money
        { label: "Feats & Traits", modalId: "featsModal", populateFn: populateFeatsModal, needsFeatsArray: true },
        { label: "Attacks", modalId: "attacksModal", populateFn: populateAttacksModal, needsAttacksArray: true },
        { label: "Spells", modalId: "spellsModal", populateFn: populateSpellsModal, needsFullSheet: true }
    ];

    // Create buttons for each option
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = `View ${option.label}`;
        button.type = 'button';

        button.addEventListener('click', () => {
            console.log(`Selected view '${option.label}' for ${username}`);
            // Determine what data to pass based on the option definition
            let dataToPass;
            if (option.needsFullSheet) {
                dataToPass = sheetToView;
            } else if (option.needsInventoryArray) {
                dataToPass = sheetToView.inventory || [];
            } else if (option.needsFeatsArray) {
                 dataToPass = sheetToView.featsAndTraits || [];
            } else if (option.needsAttacksArray) {
                 dataToPass = sheetToView.attacks || [];
            }
             // Add other specific data needs if required

            // Call the appropriate populate function with data and read-only flag
            if (option.label === "Inventory") { // Inventory needs special handling for sheetData
                 option.populateFn(sheetToView.inventory || [], sheetToView, true);
            } else {
                 option.populateFn(dataToPass, true);
            }


            // Show the corresponding modal
            const modalElement = document.getElementById(option.modalId);
            if (modalElement) {
                modalElement.style.display = 'block';
            } else {
                console.error(`Modal element with ID ${option.modalId} not found!`);
            }

            // Close the menu
            menuDiv.remove();
        });

        menuDiv.appendChild(button);
    });

    // Position the menu near the click event
    // Append to body first to calculate dimensions if needed, then position
    document.body.appendChild(menuDiv);

    // Basic positioning - adjust as needed
    const menuRect = menuDiv.getBoundingClientRect();
    let top = event.pageY;
    let left = event.pageX;

    // Prevent menu going off-screen (simple example)
    if (left + menuRect.width > window.innerWidth) {
        left = window.innerWidth - menuRect.width - 10; // Add some padding
    }
    if (top + menuRect.height > window.innerHeight) {
        top = window.innerHeight - menuRect.height - 10;
    }
     if (left < 0) left = 5;
     if (top < 0) top = 5;


    menuDiv.style.top = `${top}px`;
    menuDiv.style.left = `${left}px`;

    // Add listener to close menu if clicking elsewhere
    // Use setTimeout to prevent immediate closing by the same click that opened it
    setTimeout(() => {
        document.addEventListener('click', closeMenuOnClickOutside, { capture: true, once: true });
    }, 0);
}

// --- NEW: Helper function to close the menu ---
function closeMenuOnClickOutside(event) {
    const menu = document.getElementById('viewOptionsMenu');
    // Check if the click was outside the menu and not on a user list name span
    if (menu && !menu.contains(event.target)) {
         // Also check if the click was on a name span itself, in which case the main handler will remove the old menu anyway
         let targetElement = event.target;
         let clickedOnName = false;
         while (targetElement != null && targetElement !== document.body) {
             if (targetElement.dataset && targetElement.dataset.username) {
                 clickedOnName = true;
                 break;
             }
             // Stop if we hit the user list itself without finding a name span
             if (targetElement === userListUL) break;
             targetElement = targetElement.parentElement;
         }

         if (!clickedOnName) {
             console.log("Clicked outside menu, removing.");
             menu.remove();
         } else {
              console.log("Clicked on a name, main handler will manage menu.");
         }

    } else if (menu && menu.contains(event.target)) {
        // Click was inside the menu, need to re-add the listener if the menu wasn't closed by a button click
        // Check if the menu *still* exists (it might have been removed by a button click)
         const menuStillExists = document.getElementById('viewOptionsMenu');
         if(menuStillExists) {
             console.log("Clicked inside menu, re-adding close listener.");
             document.addEventListener('click', closeMenuOnClickOutside, { capture: true, once: true });
         }
    }
    // Note: The 'capture: true' helps catch the click before it might be stopped by other elements.
    // 'once: true' automatically removes the listener after it fires once.
}
// --- ADDED: Listener for Quick HP Input Changes ---
if (quickHpCurrentInput) {
    quickHpCurrentInput.addEventListener('change', (event) => { // Use 'change' event
        if (!currentCharacterSheet || !currentAuthenticatedUsername) {
            console.warn("Cannot save quick HP: User/Sheet not ready.");
            return; // Not logged in or sheet not loaded
        }

        const newValueStr = event.target.value;
        const newHpValue = parseInt(newValueStr, 10);

        // Validate the input
        if (isNaN(newHpValue) || newHpValue < 0) {
            console.warn("Invalid HP value entered:", newValueStr);
            // Optionally revert to the stored value
            event.target.value = currentCharacterSheet.hpCurr ?? 0;
            addMessageToChat("Error: Invalid HP value entered.", "error"); // Add error class if you have one
            return;
        }

        // Compare with the *current* value in our character sheet object
        const oldHpValue = currentCharacterSheet.hpCurr;

        // Only save if the value actually changed
        if (newHpValue !== oldHpValue) {
            console.log(`Quick HP changed from ${oldHpValue} to ${newHpValue}. Saving...`);
            const updatePayload = {
                sheetUpdates: {
                    hpCurr: newHpValue // Send only the HP update
                }
            };
            socket.emit('update character sheet', updatePayload);
            // Do NOT update currentCharacterSheet here. Wait for server confirmation.
            // The server will send back 'character sheet updated', which updates the display.
        } else {
             console.log("Quick HP value submitted but not changed from stored value. No save needed.");
             // Ensure the input reflects the stored value if they typed something invalid then blurred
              event.target.value = oldHpValue ?? 0;
        }
    });

     // Optional: Prevent non-numeric characters (more aggressive)
     quickHpCurrentInput.addEventListener('input', (event) => {
         event.target.value = event.target.value.replace(/[^0-9]/g, '');
     });
}
// MODIFIED handleAttackRoll - It now ONLY handles the attack roll.
function handleAttackRoll(attackName, attackBonusStr) {
    if (!currentCharacterSheet || !currentAuthenticatedUsername) {
        addMessageToChat("Error: Character sheet not loaded or user not authenticated.");
        console.error("Attack roll attempted without sheet/auth.");
        return;
    }

    const rollerName = getPlayerName();
    attackName = attackName || "Unnamed Attack";

    console.log(`Handling Modal Attack Roll: Name='${attackName}', Bonus='${attackBonusStr}'`);

    let atkBonusValue = 0;
    const bonusMatch = attackBonusStr.match(/[+-]?\d+/); // Parses "+5", "-2", "3"
    if (bonusMatch) {
        atkBonusValue = parseInt(bonusMatch[0], 10);
    } else {
        // If you need to parse "Str+Prof" etc., you'll need more complex logic here.
        // For now, it assumes a numerical bonus or defaults to 0 if unparsable.
        console.warn(`Could not directly parse attack bonus "${attackBonusStr}" for ${attackName} as a simple number. Using 0 for now.`);
    }

    const atkBonusStringForRoll = formatBonusString(atkBonusValue);
    const attackRollStringToServer = `1d20${atkBonusStringForRoll}`;

    console.log(`Emitting 'dice roll' for Attack: ${rollerName}, ${attackRollStringToServer}, Desc: ${attackName} (Attack: ${attackBonusStr})`);
    socket.emit('dice roll', {
        rollerName: rollerName,
        rollString: attackRollStringToServer,
        description: `${attackName}: Attack Roll (${attackBonusStr})`
    });
}

// NEW function specifically for rolling damage from the modal
function handleDamageRoll(attackName, damageDiceStr) {
    if (!currentCharacterSheet || !currentAuthenticatedUsername) {
        addMessageToChat("Error: Character sheet not loaded or user not authenticated.");
        console.error("Damage roll attempted without sheet/auth.");
        return;
    }

    const rollerName = getPlayerName();
    attackName = attackName || "Unnamed Attack";
    damageDiceStr = damageDiceStr.trim(); // Get the value from the damage input field

    console.log(`Handling Modal Damage Roll: Name='${attackName}', Damage Dice='${damageDiceStr}'`);

    if (!damageDiceStr) {
        addMessageToChat(`No damage dice string provided for ${attackName}.`);
        return;
    }

    // Basic check if it looks like a dice string (e.g., "1d8", "2d6+3")
    // You might want a more robust regex for validation
    if (damageDiceStr.match(/\d+[dD]\d+/)) {
        console.log(`Emitting 'dice roll' for Damage: ${rollerName}, ${damageDiceStr}, Desc: ${attackName} (Damage)`);
        socket.emit('dice roll', {
            rollerName: rollerName,
            rollString: damageDiceStr,
            description: `${attackName}: Damage (${damageDiceStr})`
        });
    } else {
        // If it's not a standard dice string (e.g., "5", "special"), you might just display it
        // or show an error if you only expect dice.
        addMessageToChat(`Cannot roll damage for "${damageDiceStr}" for ${attackName}. Not a recognized dice format. Displaying as text.`);
        // Or, to simply display the text as a chat message if it's not a roll:
        // socket.emit('client message', { sender: "System", text: `${rollerName}'s ${attackName} causes: ${damageDiceStr}` });
    }
}
async function saveAllCharacterData() {
    if (!currentCharacterSheet || !currentAuthenticatedUsername) {
        addMessageToChat("Error: Character sheet not loaded. Cannot save data.", "error");
        console.error("Save All Data: currentCharacterSheet or currentAuthenticatedUsername is not available.");
        return;
    }

    if (typeof JSZip === 'undefined') {
        addMessageToChat("Error: JSZip library is not loaded. Cannot create zip file.", "error");
        console.error("Save All Data: JSZip is not defined.");
        return;
    }

    try {
        addMessageToChat("Preparing your data for download...", "system");

        // 1. Prepare Core Character Sheet Data
        const coreSheetData = {};
        const excludedCoreKeys = [
            '_id', 'userId', 'inventory', 'featsAndTraits', 'attacks', 
            'spellSlots', 'spells', 'cp', 'sp', 'ep', 'gp', 'pp', 
            'lastUpdated', '__v', 'spellcastingClass', 'spellcastingAbility', 
            'spellSaveDC', 'spellAttackBonus' // These go into spellcasting.json
        ];
        for (const key in currentCharacterSheet) {
            if (currentCharacterSheet.hasOwnProperty(key) && !excludedCoreKeys.includes(key)) {
                coreSheetData[key] = currentCharacterSheet[key];
            }
        }

        // 2. Prepare Inventory Data (Items + Currency)
        const inventoryData = {
            items: currentCharacterSheet.inventory || [],
            currency: {
                cp: currentCharacterSheet.cp || 0,
                sp: currentCharacterSheet.sp || 0,
                ep: currentCharacterSheet.ep || 0,
                gp: currentCharacterSheet.gp || 0,
                pp: currentCharacterSheet.pp || 0,
            }
        };

        // 3. Prepare Feats & Traits Data
        const featsAndTraitsData = currentCharacterSheet.featsAndTraits || [];

        // 4. Prepare Attacks Data
        const attacksData = currentCharacterSheet.attacks || [];

        // 5. Prepare Spellcasting Data
        const spellcastingData = {
            spellcastingClass: currentCharacterSheet.spellcastingClass || '',
            spellcastingAbility: currentCharacterSheet.spellcastingAbility || '',
            spellSaveDC: currentCharacterSheet.spellSaveDC || 8,
            spellAttackBonus: currentCharacterSheet.spellAttackBonus || 0,
            spellSlots: currentCharacterSheet.spellSlots || {},
            spells: currentCharacterSheet.spells || []
        };

        // Create a new JSZip instance
        const zip = new JSZip();

        // Add JSON files to the zip
        zip.file("character_sheet_core.json", JSON.stringify(coreSheetData, null, 2));
        zip.file("inventory.json", JSON.stringify(inventoryData, null, 2));
        zip.file("feats_and_traits.json", JSON.stringify(featsAndTraitsData, null, 2));
        zip.file("attacks.json", JSON.stringify(attacksData, null, 2));
        zip.file("spellcasting.json", JSON.stringify(spellcastingData, null, 2));

        // Generate the zip file as a blob
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Create a download link and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        const filename = `${currentAuthenticatedUsername.replace(/\s+/g, '_') || 'character'}_dnd_data.zip`;
        link.download = filename;
        
        document.body.appendChild(link); // Append to body to make it clickable
        link.click();
        document.body.removeChild(link); // Clean up
        URL.revokeObjectURL(link.href); // Release object URL

        addMessageToChat(`Character data downloaded as ${filename}.`, "system");

    } catch (error) {
        console.error("Error saving character data:", error);
        addMessageToChat("Error: Could not save character data. " + error.message, "error");
    }
}

// Add event listener to the save data button
if (saveCharacterDataButton) {
    saveCharacterDataButton.addEventListener('click', saveAllCharacterData);
}
