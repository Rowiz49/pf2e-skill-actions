/**
 * List of all skill actions
 */
const actions = {
    "untrained": [
        "long term rest",
        "retraining",
        "avoid notice",
        "follow the expert",
        "hustle",
        "investigate",
        "scout",
        "search",
        "defend",
        "detect magic",
        "repeat a spell",
        "balance",
        "tumble through",
        "recall knowledge",
        "climb",
        "force open",
        "grapple",
        "high jump",
        "long jump",
        "reposition",
        "shove",
        "swim",
        "trip",
        "repair",
        "create a diversion",
        "impersonate",
        "gather information",
        "make an impression",
        "request",
        "coerce",
        "demoralize",
        "administer first aid",
        "command an animal",
        "perform",
        "subsist",
        "conceal an object",
        "hide",
        "sneak",
        "sense direction",
        "palm an object",
        "steal",
        "earn income" //Every character has at least 1 lore skill
    ],
    "acrobatics": [
        "maneuver in flight",
        "squeeze"
    ],
    "arcana": [
        "borrow an arcane spell",
        "decipher writing",
        "identify magic",
        "learn a spell",
        "tap ley line"
    ],
    "athletics": [
        "disarm"
    ],
    "crafting": [
        "craft",
        "identify alchemy"
    ],
    "deception": [
        "feint"
    ],
    "medicine": [
        "treat disease",
        "treat poison",
        "treat wounds"
    ],
    "nature": [
        "identify magic",
        "learn a spell",
        "tap ley line"
    ],
    "occultism": [
        "decipher writing",
        "identify magic",
        "learn a spell",
        "tap ley line"
    ],
    "religion": [
        "decipher writing",
        "identify magic",
        "learn a spell",
        "tap ley line"
    ],
    "society": [
        "create forgery",
        "decipher writing"
    ],
    "survival": [
        "cover tracks",
        "track"
    ],
    "thievery": [
        "disable a device",
        "pick a lock"
    ]
};

/**
 * A function that adds missing skill actions to a PF2e character
 * @param {PF2EActor} actor 
 * @returns nothing
 */
export async function addSkillActions(actor) {
    const skills = actor.system.skills;

    // Filter skills where rank is 1 (Trained) or higher
    const trainedSkills = Object.entries(skills)
        .filter(([key, skill]) => skill.rank >= 1)
        .map(([key, skill]) => `${skill.label}`);
    
    if (trainedSkills.length == 0) return;

    const compendium = game.packs.get("pf2e.actionspf2e");

    ui.notifications.info(`Creating actions for trained Skills: ${trainedSkills.join(", ")}`);
    let skillActions = new Set(actions.untrained);
    trainedSkills.forEach(skill => {
        skill = skill.toLowerCase();
        if (actions[skill]) {
            actions[skill].forEach(action => {
                skillActions.add(action)
            });
        }
    });

    const existingActions = actor.items.filter(item => skillActions.has(item.name.toLowerCase()));
    // Get only the missing actions (not already on actor)
    const missingActions = [...skillActions].filter(slug =>
        !existingActions.some(item => item.name.toLowerCase() === slug)
    );

    if (missingActions.length === 0) {
        ui.notifications.info("All skill actions are already added.");
        return;
    }

    // Find matching actions from the compendium
    const index = await compendium.getIndex();
    const actionsToAdd = await Promise.all(missingActions.map(async (slug) => {
        const entry = index.find(e => e.name.toLowerCase() === slug);
        if (!entry) return null;

        // Get full action data
        const action = await compendium.getDocument(entry._id);
        if (!action) return null;

        // Clone the action
        const newAction = action.toObject();
        newAction.flags["pf2e-skill-actions"] = { added: true };


        return newAction;
    }));

    // Remove null values
    const validActions = actionsToAdd.filter(action => action !== null);
    if (validActions.length > 0) {
        await actor.createEmbeddedDocuments("Item", validActions);
        ui.notifications.info(`Added ${validActions.length} skill actions.`);
    }
}
