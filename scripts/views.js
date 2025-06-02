import { addSkillActions } from "./actionsCreator.js";

/**
 * Function that renders an action subsection for skill actions
 * @param {PF2EActor} actor
 * @param {*} html
 */
export function renderActionSubsection(actor, html) {
  let freeActionsSection = html
    .find("header:has(button[data-action-type='free'])")
    .next("ol.actions-list");

  if (!freeActionsSection.length) return;
  // Create a new section for Skill Actions
  let header = $(`
            <header class="action-header">
                Skill Actions
            </header>
    `);

  let skillActionsList = $(
    `<ol class="actions-list item-list directory-list"></ol>`
  );

  actor.items
    .filter((item) => item.flags["pf2e-skill-actions"])
    .filter(
      (item) =>
        !item.system.traits.value.includes("downtime") &&
        !item.system.traits.value.includes("exploration")
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((action) => {
      // Find the corresponding <li> in the sheet
      let actionElement = html.find(`li[data-item-id="${action.id}"]`).detach();
      if (actionElement.length) {
        skillActionsList.append(actionElement);
      }
    });

  if (!skillActionsList.children().length) return;

  // Insert the Skill Actions section before the Reactions section
  freeActionsSection.after(skillActionsList);
  freeActionsSection.after(header);
}

/**
 * Renders a button on the proficiencies tab to add all skill actions
 * @param {*} html
 * @param {PF2EActor} actor
 */
export function renderCreateActionButton(html, actor) {
  let header = html.find("section[data-tab='proficiencies'] > header");

  if (header.length) {
    header.append(
      '<button type="button" class="automatic-action-creator"><span class="action-glyph">1</span></button>'
    );
    header.find(".automatic-action-creator").on("click", () => {
      addSkillActions(actor);
    });
  }
}
