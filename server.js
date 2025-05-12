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
        } catch (err) {
            console.error("Registration error:", err);
            socket.emit('auth error', { message: 'Registration failed. Please try again.' });
        }
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

        if (!data || !data.sheetUpdates) {
            return socket.emit('sheet update error', { message: 'No sheet update data provided.' });
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

            // --- MODIFIED UPDATE LOGIC ---
            for (const key in data.sheetUpdates) {
                // Check if the key exists directly in the schema's paths
                // Mongoose's schema.path(key) returns the schema type info if the path exists
                if (CharacterSheet.schema.path(key) && key !== '_id' && key !== 'userId' && key !== 'playerName') {

                    // Direct assignment is often sufficient for Mongoose to handle validation
                    // and type coercion based on the schema, including nested objects/arrays.
                    sheet[key] = data.sheetUpdates[key];

                    // Optional: Add specific parsing ONLY if needed (e.g., ensuring numbers from strings)
                    // Example (keep if you had issues with numbers previously):
                    /*
                    if (CharacterSheet.schema.path(key).instance === 'Number' && typeof data.sheetUpdates[key] !== 'number') {
                        const numValue = parseFloat(data.sheetUpdates[key]);
                        // Assign parsed number if valid, otherwise let Mongoose handle/validate potentially incorrect type
                        // Or assign existing value: sheet[key] = isNaN(numValue) ? sheet[key] : numValue;
                        sheet[key] = isNaN(numValue) ? data.sheetUpdates[key] : numValue; // Assign potentially invalid if NaN for Mongoose validation
                    } else {
                        sheet[key] = data.sheetUpdates[key]; // Assign other types directly
                    }
                    */

                } else {
                    // This warning is now more likely to catch genuinely incorrect field names
                    console.warn(`Attempted to update disallowed or non-existent field: ${key}`);
                }
            }
            // --- END MODIFIED UPDATE LOGIC ---

            await sheet.save(); // Mongoose performs validation here

            console.log(`Character sheet for ${username} updated successfully. Updated fields: ${Object.keys(data.sheetUpdates).join(', ')}`);

            // Emit the full updated sheet
            io.emit('character sheet updated', {
                playerName: username,
                updatedSheet: sheet.toObject() // Send the full, updated sheet as a plain object
            });

        } catch (err) {
            console.error(`Error updating character sheet for ${username}:`, err);
            // Check for validation errors specifically
            if (err.name === 'ValidationError') {
                socket.emit('sheet update error', { message: `Validation failed: ${err.message}` });
            } else {
                socket.emit('sheet update error', { message: 'Server error while saving sheet.' });
            }
        }
    });
    // Disconnect event
    socket.on('disconnect',async()=>{
        const username = activeUsers[socket.id];
        if(username){
            console.log(`User ${username} (${socket.id}) disconnected.`)
            delete activeUsers[socket.id];
            io.emit('server message', { text: `${username} has disconnected.`, type: 'system' });
            io.emit('update user list', Object.values(activeUsers));
            io.emit('player disconnected', username);
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
