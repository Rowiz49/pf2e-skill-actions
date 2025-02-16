import { renderActionSubsection, renderCreateActionButton } from "../scripts/views.js";

Hooks.on("renderCreatureSheetPF2e", (sheet, html, sheetData) => {
    const actor = sheet.actor;
    const isPC = actor.type != "character";
    if (!actor || isPC ) return;

    renderCreateActionButton(html, actor);
    renderActionSubsection(actor, html);
});

