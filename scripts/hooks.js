import { addSkillActions } from "./actionsCreator.js";

Hooks.on("renderCreatureSheetPF2e", (sheet, html, sheetData) => {
    const actor = sheet.actor;
    const isPC = actor.type != "character";
    if (!actor || isPC ) return;

    let header = html.find("header:contains('Core Skills')");
    
    if (header.length) {
        // Append a button next to it
        header.append('<button class="automatic-action-creator"><span class="action-glyph">1</span></button>');

        // Optional: Add an event listener to the button
        header.find(".automatic-action-creator").on("click", () => {
            addSkillActions(actor);
        });
    }
});

