import React from "react";
import { Container } from "react-bootstrap";
import { Editor } from "draft-js";
import 'draft-js/dist/Draft.css';

export default function DraftEditor({editorState, onChange, handleKeyCommand, keyBindingFn}) {

    const styleMap = {
        CODE: {
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
          fontSize: 16,
          padding: 2,
        },
      };

  return (
    <Container className="border border-1 border-success rounded className" style={{minHeight: '70vh'}}>
      <Editor editorState={editorState} 
       handleKeyCommand={handleKeyCommand}
       keyBindingFn={keyBindingFn}
       onChange={onChange}
       placeholder="Start typing..."
       customStyleMap={styleMap}

      />
    </Container>
  );
}
