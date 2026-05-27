import { actions } from "./actionsCreator.js";

const MODULE = "pf2e-skill-actions";
const { ApplicationV2 } = foundry.applications.api;

export function getAllActions() {
  return [...new Set(Object.values(actions).flat())].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getSelectedActions() {
  const stored = game.settings.get(MODULE, "selectedActions");

  // First run: nothing stored yet → enable everything
  if (stored === null || stored === undefined) {
    return getAllActions();
  }

  // User choice (even empty) → respect it
  return stored;
}

export function registerSettings() {
  game.settings.registerMenu(MODULE, "actionSelection", {
    name: game.i18n.localize("PF2ESKILLACTIONS.ConfigureActions"),
    label: game.i18n.localize("PF2ESKILLACTIONS.ConfigureActionsLabel"),
    hint: game.i18n.localize("PF2ESKILLACTIONS.ConfigureActionsHint"),
    icon: "fas fa-tasks",
    type: ActionSelectionForm,
    restricted: false,
  });

  game.settings.register(MODULE, "selectedActions", {
    scope: "client",
    config: false,
    type: Object,
    default: null, // <-- important to distinguish between no selection and first time setup});
  });
}

class ActionSelectionForm extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "pf2e-skill-actions-settings",
    window: {
      title: "PF2ESKILLACTIONS.ConfigureActions",
    },
    position: {
      width: 480,
      height: "auto",
    },
    actions: {
      selectAll: ActionSelectionForm._onSelectAll,
      deselectAll: ActionSelectionForm._onDeselectAll,
      save: ActionSelectionForm._onSave,
    },
  };

  // Localise the title at render-time, not at class-definition time
  get title() {
    return game.i18n.localize("PF2ESKILLACTIONS.ConfigureActions");
  }

  // --- action handlers: static, receive (event, target) ---

  static _onSelectAll(event, target) {
    this.element
      .querySelectorAll("input[type=checkbox]")
      .forEach((el) => (el.checked = true));
  }

  static _onDeselectAll(event, target) {
    this.element
      .querySelectorAll("input[type=checkbox]")
      .forEach((el) => (el.checked = false));
  }

  static async _onSave(event, target) {
    const selected = [
      ...this.element.querySelectorAll("input[type=checkbox]:checked"),
    ].map((el) => el.name);

    await game.settings.set(MODULE, "selectedActions", selected);
    ui.notifications.info(
      game.i18n.localize("PF2ESKILLACTIONS.PreferencesSaved"),
    );
    this.close();
  }

  // --- lifecycle ---

  async _prepareContext(_options) {
    return { selected: getSelectedActions() };
  }

  async _renderHTML(context, _options) {
    const { selected } = context;

    const groups = Object.entries(actions)
      .map(([skill, skillActions]) => {
        const rows = [...skillActions]
          .sort((a, b) => a.localeCompare(b))
          .map(
            (action) => `
              <div class="form-group slim" style="display:flex;align-items:center;justify-content:space-between;">
                <label style="margin:0;">${capitalizeFirstLetterAndReplaceHyphens(action)}</label>
                <input type="checkbox" name="${action}" ${selected.includes(action) ? "checked" : ""}>
              </div>`,
          )
          .join("");

        return `<fieldset><legend>${capitalizeFirstLetterAndReplaceHyphens(skill)}</legend>${rows}</fieldset>`;
      })
      .join("");

    const div = document.createElement("div");
    div.innerHTML = `
      <div style="max-height:60vh;overflow-y:auto;padding:4px 8px;">
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:8px;">
          <button type="button" data-action="selectAll">Select All</button>
          <button type="button" data-action="deselectAll">Deselect All</button>
        </div>
        ${groups}
      </div>
      <footer class="sheet-footer flexrow" style="margin-top:8px;padding:8px;">
        <button type="button" data-action="save">
          <i class="fas fa-save"></i> ${game.i18n.localize("PF2ESKILLACTIONS.Save")}
        </button>
      </footer>`;

    return div;
  }

  _replaceHTML(result, content, _options) {
    content.replaceChildren(result);
  }
}
function capitalizeFirstLetterAndReplaceHyphens(string) {
  string = string.replace(/-/g, " ");
  return string.charAt(0).toUpperCase() + string.slice(1);
}
