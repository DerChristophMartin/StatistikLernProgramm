<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EditorState, type Extension } from '@codemirror/state';
  import { EditorView, keymap, highlightActiveLine, lineNumbers, drawSelection, rectangularSelection, highlightActiveLineGutter } from '@codemirror/view';
  import { python } from '@codemirror/lang-python';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
  import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
  import { bracketMatching, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
  import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
  import { settingsStore } from '$lib/stores/settings.store';

  const dispatch = createEventDispatcher<{
    change: string;
    run: string;
  }>();

  export let code = '';
  export let editable = true;

  let editorContainer: HTMLElement;
  let view: EditorView;

  // Custom Theme
  const statistikLabTheme = EditorView.theme({
    '&': {
      fontSize: 'var(--font-size-base, 14px)',
      height: 'auto',
      maxHeight: '500px',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-secondary, #f5f5f5)',
      color: 'var(--text-tertiary, #999)',
      border: 'none',
      borderRight: '1px solid var(--border-color, #e0e0e0)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--bg-hover, #e8e8e8)',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--bg-hover, #f0f4ff)',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--accent-color, #4f46e5)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'var(--accent-light, #c8d2e8)',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
  });

  // Ctrl+Enter / Cmd+Enter → Code ausführen
  const runKeymap = keymap.of([
    {
      key: 'Mod-Enter',
      run: () => {
        dispatch('run', view.state.doc.toString());
        return true;
      },
    },
    {
      key: 'Shift-Enter',
      run: () => {
        dispatch('run', view.state.doc.toString());
        return true;
      },
    },
  ]);

  function getExtensions(): Extension[] {
    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      drawSelection(),
      rectangularSelection(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      foldGutter(),
      highlightSelectionMatches(),
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...closeBracketsKeymap,
        ...foldKeymap,
        ...searchKeymap,
        indentWithTab,
      ]),
      runKeymap,
      python(),
      autocompletion(),
      statistikLabTheme,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          dispatch('change', update.state.doc.toString());
        }
      }),
      EditorView.editable.of(editable),
      EditorState.readOnly.of(!editable),
    ];

    if ($settingsStore.theme === 'dark') {
      extensions.push(oneDark);
    } else {
      extensions.push(syntaxHighlighting(defaultHighlightStyle));
    }

    return extensions;
  }

  onMount(() => {
    const state = EditorState.create({
      doc: code,
      extensions: getExtensions(),
    });

    view = new EditorView({
      state,
      parent: editorContainer,
    });
  });

  onDestroy(() => {
    view?.destroy();
  });

  export function setCode(newCode: string) {
    if (view && newCode !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: newCode,
        },
      });
    }
  }

  export function getCode(): string {
    return view?.state.doc.toString() ?? code;
  }
</script>

<div class="python-editor" bind:this={editorContainer}></div>

<style>
  .python-editor {
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    overflow: hidden;
    background: var(--bg-primary);
  }

  .python-editor :global(.cm-editor) {
    outline: none;
  }

  .python-editor :global(.cm-editor.cm-focused) {
    outline: 1px solid var(--accent-color, #4f46e5);
    outline-offset: -1px;
  }
</style>
