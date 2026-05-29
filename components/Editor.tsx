"use client";
// components/Editor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import styles from "./Editor.module.css";

interface EditorProps {
  onUpdate?: (html: string) => void;
  initialContent?: string;
}

export interface EditorHandle {
  getHTML: () => string;
  applyHeading: (level: 1 | 2 | 3) => void;
  applyParagraph: () => void;
  applyBlockquote: () => void;
  getWordCount: () => number;
  getCharCount: () => number;
}

const Editor = forwardRef<EditorHandle, EditorProps>(
  ({ onUpdate, initialContent }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
          defaultAlignment: "justify",
        }),
        Underline,
        Placeholder.configure({
          placeholder:
            "Comece a digitar seu TCC aqui…  Use a barra de estilos para aplicar formatação ABNT.",
        }),
        CharacterCount,
      ],
      content: initialContent || "<p></p>",
      onUpdate: ({ editor }) => {
        onUpdate?.(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: styles.editorContent,
          spellcheck: "true",
        },
      },
    });

    useEffect(() => {
      if (editor && initialContent) {
        editor.commands.setContent(initialContent, { emitUpdate: false });
      }
    }, [initialContent]);

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? "",
      applyHeading: (level) =>
        editor?.chain().focus().toggleHeading({ level }).run(),
      applyParagraph: () =>
        editor?.chain().focus().setParagraph().run(),
      applyBlockquote: () =>
        editor?.chain().focus().toggleBlockquote().run(),
      getWordCount: () =>
        editor?.storage.characterCount.words() ?? 0,
      getCharCount: () =>
        editor?.storage.characterCount.characters() ?? 0,
    }));

    return (
      <div className={styles.a4Page}>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

Editor.displayName = "Editor";
export default Editor;
