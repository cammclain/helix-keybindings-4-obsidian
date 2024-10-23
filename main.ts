import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Plugin settings interface and defaults
interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default',
};

export default class HelixKeybindingPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();

        // Register the commands for Helix-like actions
        this.addCommand({
            id: 'select-word',
            name: 'Select word under cursor',
            editorCallback: this.selectWordUnderCursor,
        });

        this.addCommand({
            id: 'delete-selection',
            name: 'Delete selected text',
            editorCallback: this.deleteSelection,
        });

        // Register keybindings to trigger the above commands
        this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
            if (evt.altKey && evt.key === 'w') {
                this.app.commands.executeCommandById('helix-keybindings-plugin.select-word');
            }
            if (evt.key === 'd') {
                this.app.commands.executeCommandById('helix-keybindings-plugin.delete-selection');
            }
        });

        // Add a settings tab for user configurations
        this.addSettingTab(new HelixSettingTab(this.app, this));
    }

    onunload() {
        console.log('Unloading Helix Keybindings Plugin...');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // Function to select a word under the cursor
    selectWordUnderCursor(editor: Editor) {
        const cursor = editor.getCursor();
        const word = editor.getWordAt(cursor);
        if (word) {
            editor.setSelection(word.from, word.to);
            new Notice(`Selected: ${editor.getSelection()}`);
        } else {
            new Notice('No word found under the cursor.');
        }
    }

    // Function to delete the current selection
    deleteSelection(editor: Editor) {
        const selection = editor.getSelection();
        if (selection) {
            editor.replaceSelection('');
            new Notice('Deleted selection.');
        } else {
            new Notice('No selection to delete.');
        }
    }
}

// Settings tab for user configurations
class HelixSettingTab extends PluginSettingTab {
    plugin: HelixKeybindingPlugin;

    constructor(app: App, plugin: HelixKeybindingPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Custom Setting')
            .setDesc('Example setting description.')
            .addText((text) =>
                text
                    .setPlaceholder('Enter a value')
                    .setValue(this.plugin.settings.mySetting)
                    .onChange(async (value) => {
                        this.plugin.settings.mySetting = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
