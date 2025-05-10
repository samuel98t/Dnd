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
socket.on('auth success', (authData) => { 
    console.log('Auth Success:', authData);
    currentAuthenticatedUsername = authData.username;
    currentCharacterSheet = authData.sheet; // Store the sheet
    // Update UI and disable editing
    if (playerNameInput) {
        playerNameInput.value = currentAuthenticatedUsername;
        playerNameInput.disabled = true; 
    }
    
    addMessageToChat(`Logged in as ${currentAuthenticatedUsername}. Welcome!`);
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
    if (appContainer) appContainer.style.display = 'block'; 

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

    const createDetailElement = (label, value, isEditable = false, fieldKey = null, inputTypeOverride = null) => {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        p.appendChild(strong);

        if (isEditable && fieldKey) {
            const input = document.createElement('input');
            if (inputTypeOverride) {
                input.type = inputTypeOverride;
            } else if (typeof value === 'number' || ['hpCurr', 'HpMax', 'characterLevel', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'inspiration', 'characterArmor', 'Initative', 'characterSpeed'].includes(fieldKey)) {
                input.type = 'number';
            } else {
                input.type = 'text';
            }
            input.value = value || (input.type === 'number' ? 0 : ''); // Default to 0 for numbers
            input.dataset.field = fieldKey;
            input.id = `sheetInput-${fieldKey}`;
            p.appendChild(input);

            // If it's an ability score, add a span for its dynamic modifier
            const abilityScores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            if (abilityScores.includes(fieldKey)) {
                const modSpan = document.createElement('span');
                modSpan.id = `sheetMod-${fieldKey}`;
                modSpan.textContent = ` (Mod: ${calculateModifier(input.value)})`;
                modSpan.style.marginLeft = '10px'; // Some spacing
                p.appendChild(modSpan);

                // Add event listener to update modifier dynamically
                input.addEventListener('input', (event) => {
                    modSpan.textContent = ` (Mod: ${calculateModifier(event.target.value)})`;
                });
            }
        } else {
            p.appendChild(document.createTextNode(value || 'N/A'));
        }
        return p;
    };

    //  Basic Info Section 
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

    // --- Combat Stats Section ---
    const combatStatsDiv = document.createElement('div');
    combatStatsDiv.innerHTML = '<h3>Combat Stats</h3>';
    combatStatsDiv.appendChild(createDetailElement('Current HP', sheetData.hpCurr, true, 'hpCurr', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Max HP', sheetData.HpMax, true, 'HpMax', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Armor Class', sheetData.characterArmor, true, 'characterArmor', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Initiative', sheetData.Initative, true, 'Initative', 'number')); // Note: Initiative is often DEX mod + prof (if applicable) + other bonuses. For now, a direct input.
    combatStatsDiv.appendChild(createDetailElement('Speed', sheetData.characterSpeed, true, 'characterSpeed', 'number'));
    combatStatsDiv.appendChild(createDetailElement('Hit Dice', sheetData.hitDice, true, 'hitDice'));
    combatStatsDiv.appendChild(createDetailElement('Inspiration', sheetData.inspiration, true, 'inspiration', 'number'));
    modalSheetContent.appendChild(combatStatsDiv);

    modalSheetContent.appendChild(document.createElement('hr'));

    // Abilities Section 
    const abilitiesDiv = document.createElement('div');
    abilitiesDiv.innerHTML = '<h3>Abilities</h3>';
    const abilitiesGrid = document.createElement('div');
    abilitiesGrid.className = 'sheet-grid';

    // For each ability, createDetailElement will  handle adding the dynamic modifier span
    abilitiesGrid.appendChild(createDetailElement('Strength', sheetData.strength, true, 'strength', 'number'));
    abilitiesGrid.appendChild(createDetailElement('Dexterity', sheetData.dexterity, true, 'dexterity', 'number'));
    abilitiesGrid.appendChild(createDetailElement('Constitution', sheetData.constitution, true, 'constitution', 'number'));
    abilitiesGrid.appendChild(createDetailElement('Intelligence', sheetData.intelligence, true, 'intelligence', 'number'));
    abilitiesGrid.appendChild(createDetailElement('Wisdom', sheetData.wisdom, true, 'wisdom', 'number'));
    abilitiesGrid.appendChild(createDetailElement('Charisma', sheetData.charisma, true, 'charisma', 'number'));

    abilitiesDiv.appendChild(abilitiesGrid);
    modalSheetContent.appendChild(abilitiesDiv);

    modalSheetContent.appendChild(document.createElement('hr'));

    if (saveSheetButton) saveSheetButton.style.display = 'inline-block';
}

// Save sheet button
if (saveSheetButton) {
    saveSheetButton.addEventListener('click', () => {
        if (!currentCharacterSheet || !currentAuthenticatedUsername) {
            console.error("Cannot save sheet: User not authenticated or sheet data missing.");
            addMessageToChat("Error: Cannot save sheet. Please try logging in again.");
            return;
        }

        const updatedSheetData = {};
        const inputs = modalSheetContent.querySelectorAll('input[data-field]');

        inputs.forEach(currentInput => { 
            const fieldKey = currentInput.dataset.field;
            let value = currentInput.value;

            // Get the original value from the currentCharacterSheet for type comparison
            const originalValue = currentCharacterSheet[fieldKey];
            if (currentInput.type === 'number' || (typeof originalValue === 'number' && value.trim() !== '')) {
                value = parseFloat(value);
                if (isNaN(value)) {
                    console.warn(`Invalid number for ${fieldKey}: '${currentInput.value}'. Reverting or defaulting.`);
                    value = (typeof originalValue === 'number' && !isNaN(originalValue)) ? originalValue : 0;
                }
            }
            updatedSheetData[fieldKey] = value;
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
        currentCharacterSheet = data.updatedSheet; //Update the local copy
        if (sheetModal.style.display === 'block') {
            populateSheetModal(currentCharacterSheet);
        }

    } else {
        console.log(`Sheet updated for ${data.playerName} (another user).`);
    }
});
