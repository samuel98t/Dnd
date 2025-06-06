// Server imports
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();
const DM_USERNAME = 'dm';
const app = express();
const server = http.createServer(app) // Creates HTTP server with Express app.
const io = socketIO(server) // Attaches Socket.IO to the HTTP server
// CONSTS
const LEN = 50 // Chat history max len
const SALT_ROUNDS = 10;
// Global server state
let chatHistory = [];
let activeUsers={};
// ENV Stuff
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_room_db';
const spellSlotLevelSchema = new mongoose.Schema({
    total: { type: Number, default: 0, min: 0 },
    expended: { type: Number, default: 0, min: 0 }
}, { _id: false });
// Serve the static files from 'public'
app.use(express.static(path.join(__dirname,'public')));
app.get('/ping-http', (req, res) => {
    console.log('HTTP Ping received.');
    res.status(200).send('HTTP Pong from server');
});

// Connect to Mongoose
mongoose.connect(MONGODB_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>console.log('MongoDB connected sucessfully.')).catch(err=>console.error('MongoDB connection error:',err));

// Mongoose User Schema
const userSchema = new mongoose.Schema({
    username:{type:String,required: true,unique:true,trim:true,lowercase:true},
    passwordHash:{type:String,required:true},
    createdAt:{type:Date,default:Date.now}
});
const User = mongoose.model('User',userSchema);

// Mongoose Sheet Schema
const characterSheetSchema = new mongoose.Schema({
    userId : {type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,unique: true},// Link to User
    playerName:{type:String,required: true}, // the useername
    characterName:{type:String},
    characterClass:{type:String},
    characterLevel:{type:Number,default:1},
    characterBackground:{type:String},
    characterSubClass:{type:String},
    characterAlignment:{type:String},
    HpMax:{type:Number},
    hpCurr:{type:Number},
    characterRace:{type:String},
    characterArmor:{type:Number},
    ProficiencyBonus:{type:Number,default: 2},
    Initiative:{type:Number},
    characterSpeed:{type:Number},
    hitDice:{type:String},
    inspiration:{type:Number},
    strength:{type:Number},
    dexterity:{type:Number},
    constitution:{type:Number},
    intelligence:{type:Number},
    wisdom:{type:Number},
    charisma:{type:Number},

    // Saving Throws Proficiencies 
    savingStrengthProficient: {type: Boolean, default: false},
    savingDexterityProficient: {type: Boolean, default: false},
    savingConstitutionProficient: {type: Boolean, default: false},
    savingIntelligenceProficient: {type: Boolean, default: false},
    savingWisdomProficient: {type: Boolean, default: false},
    savingCharismaProficient: {type: Boolean, default: false},
    // Skill Proficiencies (NEW)
    skillAcrobaticsProficient: {type: Boolean, default: false},    // Dex
    skillAnimalHandlingProficient: {type: Boolean, default: false},// Wis
    skillArcanaProficient: {type: Boolean, default: false},        // Int
    skillAthleticsProficient: {type: Boolean, default: false},     // Str
    skillDeceptionProficient: {type: Boolean, default: false},     // Cha
    skillHistoryProficient: {type: Boolean, default: false},       // Int
    skillInsightProficient: {type: Boolean, default: false},       // Wis
    skillIntimidationProficient: {type: Boolean, default: false},  // Cha
    skillInvestigationProficient: {type: Boolean, default: false}, // Int
    skillMedicineProficient: {type: Boolean, default: false},      // Wis
    skillNatureProficient: {type: Boolean, default: false},        // Int
    skillPerceptionProficient: {type: Boolean, default: false},    // Wis
    skillPerformanceProficient: {type: Boolean, default: false},   // Cha
    skillPersuasionProficient: {type: Boolean, default: false},    // Cha
    skillReligionProficient: {type: Boolean, default: false},      // Int
    skillSleightOfHandProficient: {type: Boolean, default: false}, // Dex
    skillStealthProficient: {type: Boolean, default: false},       // Dex
    skillSurvivalProficient: {type: Boolean, default: false},      // Wis
    cp: { type: Number, default: 0 }, // Copper Pieces
    sp: { type: Number, default: 0 }, // Silver Pieces
    ep: { type: Number, default: 0 }, // Electrum Pieces
    gp: { type: Number, default: 0 }, // Gold Pieces
    pp: { type: Number, default: 0 }, // Platinum Pieces

        inventory: { 
        type: [{
            name: { type: String, required: true, trim: true },
            quantity: { type: Number, default: 1, min: 0 },
            description: { type: String, default: '', trim: true }
        }],
        default: []
    },
        // *** NEW: Feats & Traits ***
    featsAndTraits: {
        type: [{
            name: { type: String, required: true, trim: true },
            description: { type: String, default: '', trim: true }
        }],
        default: []
    },
    // *** NEW: Attacks ***
    attacks: {
        type: [{
            name: { type: String, default: '', trim: true },
            attackBonus: { type: String, default: '+0', trim: true }, // Store as string like "+5" or "+Str+Prof"
            damage: { type: String, default: '', trim: true },      // Store as string like "1d8+3"
            damageType: { type: String, default: '', trim: true }   // e.g., "Slashing"
        }],
        default: []
    },
        // *** NEW: Spellcasting Info ***
    spellcastingClass: { type: String, default: '', trim: true },
    spellcastingAbility: { type: String, default: '', trim: true }, // e.g., 'intelligence', 'wisdom', 'charisma'
    spellSaveDC: { type: Number, default: 8 },
    spellAttackBonus: { type: Number, default: 0 },

    // *** NEW: Spell Slots (Object containing levels 0-9) ***
    spellSlots: {
        level0: spellSlotLevelSchema, // Cantrips technically don't use slots, but good for structure
        level1: spellSlotLevelSchema,
        level2: spellSlotLevelSchema,
        level3: spellSlotLevelSchema,
        level4: spellSlotLevelSchema,
        level5: spellSlotLevelSchema,
        level6: spellSlotLevelSchema,
        level7: spellSlotLevelSchema,
        level8: spellSlotLevelSchema,
        level9: spellSlotLevelSchema,
    },

    // *** NEW: Spells List ***
    spells: {
        type: [{
            name: { type: String, default: '', trim: true },
            prepared: { type: Boolean, default: false },
            level: { type: Number, default: 0, min: 0, max: 9 },
            school: { type: String, default: '', trim: true },
            castingTime: { type: String, default: '', trim: true },
            range: { type: String, default: '', trim: true },
            components: { type: String, default: '', trim: true }, // V, S, M (details)
            duration: { type: String, default: '', trim: true },
            description: { type: String, default: '', trim: true },
            damageEffect: { type: String, default: '', trim: true } // e.g., "3d6 Fire", "Save: Dex", "Heals 1d4"
        }],
        default: []
    },
    
    lastUpdated:{type:Date,default:Date.now}

});
characterSheetSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});
const CharacterSheet = mongoose.model('CharacterSheet',characterSheetSchema);

// Helper to format sheets for client (key by playerName)
function formatSheetsForClient(sheetsArray) {
    const formatted = {};
    sheetsArray.forEach(sheet => {
        formatted[sheet.playerName] = sheet; // Assuming playerName is unique like username
    });
    return formatted;
    }

// Dice roller helper func
function rollDice(diceString) {
    const match = diceString.match(/(\d+)[dD](\d+)(?:([+-])(\d+))?/);
    if (!match) return null;

    const numDice = parseInt(match[1]);
    const diceSides = parseInt(match[2]);
    const modifierSign = match[3];
    const modifierValue = parseInt(match[4]) || 0;

    let individualRolls = [];
    let sumOfDice = 0;
    for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * diceSides) + 1;
        individualRolls.push(roll);
        sumOfDice += roll;
    }

    let total = sumOfDice;
    if (modifierSign === '+') {
        total += modifierValue;
    } else if (modifierSign === '-') {
        total -= modifierValue;
    }

    return {
        total: total,                 // Final result after modifiers
        rolls: individualRolls,       // Array of individual dice results, e.g., [15, 7]
        sumOfDice: sumOfDice,         // Sum of dice before modifiers
        modifier: (modifierSign && modifierValue) ? (modifierSign + modifierValue) : "" // e.g. "+5", "-2", or ""
    };
}
// When a client connects
io.on('connection',(socket)=>{
    const checkAndEmitHttpPingState = () => {
        const activeUserCount = Object.keys(activeUsers).length;
        if (activeUserCount > 0) {
            io.emit('http-ping-should-be-active', true);
        } else {
            io.emit('http-ping-should-be-active', false);
        }
        console.log(`Server: Active users: ${activeUserCount}. HTTP ping state emitted.`);
    };
    console.log('A user connected (pre-auth):', socket.id);
    socket.emit('update user list', Object.values(activeUsers));
    // Register
    socket.on('register',async(credentials)=>{
        const { username, password } = credentials;
        if (!username || !password) {
            return socket.emit('auth error', { message: 'Username and password are required.' });
        }
        const normalizedUsername = username.trim().toLowerCase();
        try{
            const existingUser = await User.findOne({username:normalizedUsername});
            // if theres already a user with that username 
            if(existingUser){
                return socket.emit('auth error',{message:'Username already exists'});
            }
            // if username is avaliable , make new user
            const passwordHash = await bcrypt.hash(password,SALT_ROUNDS);
            const newUser = new User({username:normalizedUsername,passwordHash});
            await newUser.save();
            // make sheet for new user
            let newSheet = new CharacterSheet({userId:newUser._id,playerName:normalizedUsername});
            await newSheet.save(); // Save
            // Add user to active users
            activeUsers[socket.id] = normalizedUsername;
            socket.isHttpPinger = false;
            const isDM = normalizedUsername.toLowerCase() === DM_USERNAME.toLowerCase();
            socket.emit('auth success',{username:normalizedUsername,sheet: newSheet.toObject(),isDM:isDM});
            socket.emit('chat history', chatHistory);
            io.emit('server message', { text: `${normalizedUsername} has registered and joined.`, type: 'system' });
            // Send all sheets after user joins
            const allSheets = await CharacterSheet.find().lean();
            io.emit('all character sheets',formatSheetsForClient(allSheets));
            console.log(`User ${normalizedUsername} registered and logged in.`);
            // Broadcast updated user list to ALL clients
            const usernamesArray = Object.values(activeUsers);
            io.emit('update user list', usernamesArray);
            checkAndEmitHttpPingState();
        } catch (err) {
            console.error("Registration error:", err);
            socket.emit('auth error', { message: 'Registration failed. Please try again.' });
        }
    });
        // --- NEW: Handle Client Pings ---
    socket.on('client-ping', (data) => {
        console.log(`Server: Received ping from ${activeUsers[socket.id] || socket.id}. Timestamp: ${data.timestamp}`);
        // Send a pong back to this specific client
        socket.emit('server-pong', { serverTimestamp: new Date().toISOString(), clientTimestamp: data.timestamp });
    });
    // Login 
    socket.on('login',async(credentials)=>{
        const{username,password}= credentials;
        if(!username || !password){
            return socket.emit('auth error',{message:'Username and password are required'});
        }
        const normalizedUsername = username.trim().toLowerCase();
        try{
            // Try to find user
            const user = await User.findOne({username: normalizedUsername});
            if(!user){
                return socket.emit('auth error',{message:'invalid username.'});
            }
            if(Object.values(activeUsers).includes(normalizedUsername)){
                return socket.emit('auth error',{message:`User ${normalizedUsername} is already logged in!`});
            }
            // Check if password matches
            const match = await bcrypt.compare(password,user.passwordHash);
            if(match){
                activeUsers[socket.id]=normalizedUsername;
                socket.isHttpPinger = false;
                let sheet = await CharacterSheet.findOne({userId:user._id}).lean();
                const isDM = normalizedUsername.toLowerCase() === DM_USERNAME.toLowerCase(); // Check if this user is the DM
                // Realistically should never happen but just incase
                if(!sheet){
                    sheet = new CharacterSheet({userId:user._id,playerName:normalizedUsername});
                    await sheet.save();
                    sheet = sheet.toObject();
                }
                socket.emit('auth success',{username:normalizedUsername,sheet:sheet,isDM:isDM});
                socket.emit('chat history',chatHistory);
                io.emit('server message',{text:`${normalizedUsername} has logged in `,type:'system'});
                const allSheets = await CharacterSheet.find().lean();
                io.emit('all character sheets',formatSheetsForClient(allSheets));
                io.emit('update user list',Object.values(activeUsers));
                checkAndEmitHttpPingState();
                console.log(`User ${normalizedUsername} logged in.`);
           } else {
                socket.emit('auth error', { message: 'Invalid username or password.' });
            }
            } catch(err){
                console.error("Login error:",err);
                socket.emit('auth error',{message: 'Login failed. Please try again.'})
            }
    });
    // Send current chat history to new user
    socket.emit('chat history', chatHistory);
    socket.emit('server message', { text: 'Welcome! You are connected.' }); // Send welcome msg 
    // Update character sheet
  socket.on('update character sheet', async (data) => {
        const username = activeUsers[socket.id];
        if (!username) {
            return socket.emit('sheet update error', { message: 'User not authenticated.' });
        }

        if (!data || !data.sheetUpdates || typeof data.sheetUpdates !== 'object') {
            return socket.emit('sheet update error', { message: 'Invalid or no sheet update data provided.' });
        }

        try {
            const user = await User.findOne({ username: username });
            if (!user) {
                return socket.emit('sheet update error', { message: 'User not found.' });
            }

            const sheet = await CharacterSheet.findOne({ userId: user._id });
            if (!sheet) {
                return socket.emit('sheet update error', { message: 'Character sheet not found.' });
            }

            console.log(`[Update Sheet - ${username}] Received updates for keys:`, Object.keys(data.sheetUpdates));
                        let oldHp = undefined;
            let newHp = undefined;
            let hpChanged = false;
            if (data.sheetUpdates.hasOwnProperty('hpCurr')) {
                 oldHp = typeof sheet.hpCurr === 'number' ? sheet.hpCurr : undefined;
                const incomingHp = parseFloat(data.sheetUpdates.hpCurr);
                 newHp = !isNaN(incomingHp) ? incomingHp : undefined;
                 if (typeof oldHp === 'number' && typeof newHp === 'number' && oldHp !== newHp) {
                    hpChanged = true;
                 }
            }
            // --- FINAL REVISED UPDATE LOGIC ---
            for (const key in data.sheetUpdates) {
                // --- ADDED LOG: Show key and value ---
                console.log(`[Update Sheet - ${username}] Processing key: '${key}' with value:`, data.sheetUpdates[key]);

                // Skip protected fields
                if (key === '_id' || key === 'userId' || key === 'playerName') {
                    console.warn(`[Update Sheet - ${username}] Attempted to update protected field: ${key}. Skipping.`);
                    continue;
                }

                // Check 1: Does schema.path() recognize it? (Preferred method)
                const pathInfo = CharacterSheet.schema.path(key);
                let isValidPath = !!pathInfo; // Convert pathInfo to boolean

                // Check 2: If schema.path() failed, does the key exist on the document instance? (Fallback)
                if (!isValidPath && (key in sheet)) {
                    console.warn(`[Update Sheet - ${username}] Key '${key}' not found by schema.path(), but exists on document. Allowing update.`);
                    isValidPath = true; // Treat as valid based on fallback check
                }

                if (isValidPath) {
                    // Path is considered valid either by schema.path() or by existing on the document
                    if(pathInfo) { // Log type only if pathInfo was found
                        console.log(`[Update Sheet - ${username}] Key '${key}' is a valid schema path. Type: ${pathInfo.instance}. Assigning value.`);
                    } else {
                        console.log(`[Update Sheet - ${username}] Key '${key}' allowed via fallback check. Assigning value.`);
                    }
                    try {
                        // --- ADDED LOG: Show assignment ---
                        console.log(`[Update Sheet - ${username}] Assigning sheet['${key}'] =`, data.sheetUpdates[key]);

                        // Direct assignment using Mongoose setter logic
                        sheet[key] = data.sheetUpdates[key];

                        // --- ADDED LOG: Check value immediately after assignment ---
                        // Note: Mongoose setters might not update the value synchronously here for complex types,
                        // but it's useful for simple types like Numbers.
                        console.log(`[Update Sheet - ${username}] Value after assignment (may not reflect immediately for complex types):`, sheet[key]);

                        // --- ADDED: Manually mark modified if necessary (especially for mixed types or arrays/objects if auto-detection fails) ---
                        // For simple Number types like cp, gp, etc., this *shouldn't* be needed, but it's a good fallback.
                        // It checks if Mongoose didn't detect the modification AND if the values actually differ.
                        if (!sheet.isModified(key) && sheet[key] !== data.sheetUpdates[key]) {
                            console.warn(`[Update Sheet - ${username}] Manually marking path '${key}' as modified.`);
                            sheet.markModified(key);
                        }

                    } catch(assignError) {
                        console.error(`[Update Sheet - ${username}] Error assigning value for key '${key}':`, assignError);
                    }

                } else {
                    // If BOTH checks failed, then it's truly an unknown field.
                    console.warn(`[Update Sheet - ${username}] Field '${key}' is not a valid schema path AND not found on document. Update disallowed.`);
                }
            }
            // --- END FINAL REVISED UPDATE LOGIC ---

            // --- ADDED LOG: Log the sheet object right before saving ---
            console.log(`[Update Sheet - ${username}] Sheet object BEFORE save:`, sheet.toObject()); // Use toObject() for cleaner log

            await sheet.save(); // Mongoose performs validation here
                        // --- ADD: Emit HP Change Message AFTER Save ---
            if (hpChanged && typeof oldHp === 'number' && typeof newHp === 'number') {
                let chatMessageText = "";
                const difference = Math.abs(newHp - oldHp); // Calculate absolute difference

                if (newHp < oldHp) {
                    chatMessageText = `${username} took ${difference} damage (now ${newHp} HP).`;
                } else { // newHp > oldHp
                    chatMessageText = `${username} healed for ${difference} HP (now ${newHp} HP).`;
                }

                 if (chatMessageText) {
                    const messagePayload = {
                         sender: 'System', // Or username? Decide who announces it.
                         text: chatMessageText,
                         timestamp: new Date().toLocaleTimeString(),
                         // type: 'system' // Keep as system or specific type?
                    };
                    io.emit('server message', messagePayload); // Broadcast to everyone
                    chatHistory.push({ type: 'chat', ...messagePayload }); // Use 'chat' type for history
                    if (chatHistory.length > 50) chatHistory.shift();
                    console.log(`[HP Change] Emitted: ${chatMessageText}`);
                 }
            }

            console.log(`[Update Sheet - ${username}] Sheet saved successfully.`);

            // --- ADDED LOG: Log the sheet object right after saving ---
            console.log(`[Update Sheet - ${username}] Sheet object AFTER save:`, sheet.toObject()); // Use toObject()

            // Emit the full updated sheet
            io.emit('character sheet updated', {
                playerName: username,
                updatedSheet: sheet.toObject() // Send the saved, updated object
            });

        } catch (err) {
            console.error(`[Update Sheet - ${username}] Error during sheet update process:`, err);
            // (Keep existing validation error logging)
            if (err.name === 'ValidationError') {
                let validationMessages = [];
                for (let field in err.errors) {
                    validationMessages.push(err.errors[field].message);
                }
                console.error(`[Update Sheet - ${username}] Validation Errors:`, validationMessages.join('; '));
                socket.emit('sheet update error', { message: `Validation failed: ${validationMessages.join('; ')}` });
            } else {
                socket.emit('sheet update error', { message: 'Server error while saving sheet.' });
            }
        }
    }); // End of 'update character sheet' handler


    // Disconnect event
    socket.on('disconnect',async()=>{
        const username = activeUsers[socket.id];
        if(username){
            console.log(`User ${username} (${socket.id}) disconnected.`)
            delete activeUsers[socket.id];
            io.emit('server message', { text: `${username} has disconnected.`, type: 'system' });
            io.emit('update user list', Object.values(activeUsers));
            io.emit('player disconnected', username);
            checkAndEmitHttpPingState();
        }else{
            console.log('A pre-auth user disconnected:', socket.id);
        }
    });
    // Client message
    socket.on('client message',(msgData)=>{
        const username = activeUsers[socket.id];
        if(!username) return;

        const messageToBroadcast = {
            sender: username,
            text: msgData.text,
            timestamp: new Date().toLocaleTimeString()
        };
        io.emit('server message',messageToBroadcast);
        // Add to chat history
        chatHistory.push({ type: 'chat', ...messageToBroadcast });
        if (chatHistory.length > 50) chatHistory.shift();
    })
    // Dice rolls
    socket.on('dice roll', (data) => {
        // Check if this is a DM trying to make a public roll but accidentally using old UI
        // Or if this socket is not the DM, proceed as normal.
        // For now, this handler remains for public rolls.

        const username = activeUsers[socket.id];
        if (!username) return;

        const rollOutcome = rollDice(data.rollString);

        if (rollOutcome === null) {
            socket.emit('roll error', { message: `Invalid dice format or calculation error for: ${data.rollString}` });
            return;
        }

        const rollDataToBroadcast = {
            rollerName: username,
            rollString: data.rollString,
            description: data.description,
            rolls: rollOutcome.rolls,
            sumOfDice: rollOutcome.sumOfDice,
            modifier: rollOutcome.modifier,
            result: rollOutcome.total,
            timestamp: new Date().toLocaleTimeString(),
            isSecret: false // Explicitly mark public rolls
        };
        io.emit('roll result', (rollDataToBroadcast)); // Broadcast to everyone

        let chatMessageText = `${username} rolled ${data.description || data.rollString}`;
        chatMessageText += ` => Rolls: [${rollOutcome.rolls.join(', ')}]`;
        if (rollOutcome.modifier) {
            chatMessageText += ` ${rollOutcome.modifier}`;
        }
        chatMessageText += ` = ${rollOutcome.total}`;

        chatHistory.push({ type: 'roll', text: chatMessageText, timestamp: rollDataToBroadcast.timestamp });
        if (chatHistory.length > LEN) chatHistory.shift();
    });
        // New Handler for DM's secret roll
    socket.on('dm secret roll', (data) => {
        if (!isSocketDM(socket)) {
            // Optionally send an error back or just ignore
            console.warn(`Non-DM user ${activeUsers[socket.id]} attempted a secret roll.`);
            return socket.emit('roll error', { message: 'Only DMs can make secret rolls.' });
        }

        const username = activeUsers[socket.id]; // Should be the DM
        const rollOutcome = rollDice(data.rollString);

        if (rollOutcome === null) {
            return socket.emit('roll error', { message: `Invalid dice format: ${data.rollString}` });
        }

        // Prepare data to send ONLY to the DM
        const secretRollData = {
            rollerName: username, // "DM" or DM's actual username
            rollString: data.rollString,
            description: data.description || data.rollString, // Use provided description or fallback
            rolls: rollOutcome.rolls,
            sumOfDice: rollOutcome.sumOfDice,
            modifier: rollOutcome.modifier,
            result: rollOutcome.total,
            timestamp: new Date().toLocaleTimeString(),
            isSecret: true // Flag to indicate it's a secret roll for client-side handling
        };

        // Emit only to the calling socket (the DM)
        socket.emit('roll result', secretRollData);

        // Optionally log this roll on the server console for the DM's record
        console.log(`DM SECRET ROLL by ${username}: ${data.rollString} -> ${JSON.stringify(rollOutcome.rolls)} ${rollOutcome.modifier} = ${rollOutcome.total}`);
        
        // Add to a special DM chat history or a general server log not sent to players
        // For now, we'll just log it to the server console.
        // You could add it to a separate `dmChatHistory` array and send that to the DM.
        // Or, the client-side can just add it to its local chat display.
    });

    });
// Helper function to check if a socket belongs to the DM
function isSocketDM(socket) {
    const username = activeUsers[socket.id];
    return username && username.toLowerCase() === DM_USERNAME.toLowerCase();
}


// Start the server.
server.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});
