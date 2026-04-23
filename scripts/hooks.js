import { renderActionSubsection, renderCreateActionButton } from "./views.js";
import { registerSettings } from "./settings.js";

Hooks.once("init", () => {
  registerSettings();
});

Hooks.on("renderCreatureSheetPF2e", (sheet, html, sheetData) => {
  const actor = sheet.actor;
  const isPC = actor.type != "character";
  if (!actor || isPC) return;

  renderCreateActionButton(html, actor);
  renderActionSubsection(actor, html);
});

Hooks.on("renderItemSheetPF2e", (sheet, html, sheetData) => {
  const item = sheet.item;

  // Only show on ability/action type items
  if (item.type !== "action") return;

  const detailsTab = html.find("section.tab.details");
  if (!detailsTab.length) return;

  const isChecked = !!item.flags?.["pf2e-skill-actions"]?.added;

  const checkboxHtml = $(`
    <div class="form-group">
      <label for="pf2e-skill-actions-flag">
        ${game.i18n.localize("PF2ESKILLACTIONS.ShowInSkillActions") ?? "Show in Skill Actions"}
      </label>
      <div class="form-fields">
        <input 
          type="checkbox" 
          id="pf2e-skill-actions-flag"
          ${isChecked ? "checked" : ""}
        />
      </div>
    </div>
  `);

  // Insert before the Death Note group, or at the top of details as fallback
  const deathNoteGroup = detailsTab.find(
    "div.form-group:has(input[name='system.deathNote'])",
  );
  if (deathNoteGroup.length) {
    deathNoteGroup.before(checkboxHtml);
  } else {
    detailsTab.prepend(checkboxHtml);
  }

  // Handle toggle
  checkboxHtml.find("input").on("change", async (event) => {
    const enabled = event.target.checked;
    if (enabled) {
      await item.setFlag("pf2e-skill-actions", "added", true);
    } else {
      await item.unsetFlag("pf2e-skill-actions", "added");
    }
  });
});
