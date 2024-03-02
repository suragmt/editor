import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Row,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import DraftEditor from "./DraftEditor";
import {
  EditorState,
  RichUtils,
  Modifier,
  getDefaultKeyBinding,
  convertToRaw,
  convertFromRaw,
} from "draft-js";

function EditorFrom() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    const data = localStorage.getItem("draft");

    const content = convertFromRaw(JSON.parse(data));
    const editorst = EditorState.createWithContent(content);
    setEditorState(editorst);
  }, []);

  const [keyCombination, setKeyCombination] = useState("");
  const [showToast, setToast] = useState(false);
  const [startOfline, setStartOfline] = useState(false);

  const styleMap = {
    "#": { style: "header-one", block: true },
    "*": { style: "BOLD", block: false },
    "**": { style: "red", block: false },
    "***": { style: "UNDERLINE", block: false },
    "```": { style: "code-block", block: true },
  };

  function handleSubmit() {
    localStorage.setItem(
      "draft",
      JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    );
    setToast(true);
  }

  function onChange(editorState) {
    setEditorState(editorState);
  }

  const clearInlineStyles = (editorState) => {
    const styles = ["BOLD", "UNDERLINE", "CODE"];

    const contentWithoutStyles = styles.reduce(
      (newContentState, style) =>
        Modifier.removeInlineStyle(
          newContentState,
          editorState.getSelection(),
          style
        ),
      editorState.getCurrentContent()
    );

    return EditorState.push(
      editorState,
      contentWithoutStyles,
      "change-inline-style"
    );
  };

  function handleInlineStyle(unstyledstate) {
    const contentState = unstyledstate.getCurrentContent();
    const selectionState = unstyledstate.getSelection();
    const block = contentState.getBlockForKey(selectionState.getAnchorKey());
    if (block.getText().indexOf(keyCombination) !== -1) {
      const currentSelectionState = unstyledstate.getSelection();

      const newContentState = Modifier.replaceText(
        contentState,
        selectionState.merge({
          anchorOffset:
            currentSelectionState.getEndOffset() - keyCombination.length,
          focusOffset: currentSelectionState.getEndOffset(),
        }),
        ""
      );

      const replaced = EditorState.push(
        unstyledstate,
        newContentState,
        "replace-text"
      );
      if (styleMap[keyCombination].block) {
        const updatedText = RichUtils.toggleBlockType(
          replaced,
          styleMap[keyCombination].style
        );
        setEditorState(updatedText);
      } else {
        let updatedText = RichUtils.toggleInlineStyle(
          replaced,
          styleMap[keyCombination].style
        );
        setEditorState(updatedText);
      }
    }
  }

  function handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return true;
    }
    return false;
  }

  function mapKeyToEditorCommand(e) {
    const selectionState = editorState.getSelection();
    const sol = selectionState.getAnchorOffset() == 0;
    if (startOfline) {
      setStartOfline(sol);
    }
    switch (e.key) {
      case "#":
        if (sol) {
          setKeyCombination("#");
        }
        break;
      case "*":
        if (keyCombination === "*") {
          if (selectionState.getAnchorOffset() === 1) {
            setKeyCombination("**");
          }
        } else if (keyCombination === "**") {
          if (selectionState.getAnchorOffset() === 2) {
            setKeyCombination("***");
          }
        } else {
          if (selectionState.getAnchorOffset() === 0) {
            setKeyCombination("*");
          }
        }
        break;
      case "`":
        if (keyCombination === "`") {
          setKeyCombination("``");
        } else if (keyCombination === "``") {
          setKeyCombination("```");
        } else {
          setKeyCombination("`");
        }
        break;
      default:
        setKeyCombination("");
    }
    if (e.keyCode === 32 && keyCombination !== "") {
      const cleared = clearInlineStyles(editorState);
      handleInlineStyle(cleared);

      return;
    }
    return getDefaultKeyBinding(e);
  }

  return (
    <Container className="m-5">
      <Row className="justify-content-between">
        <Col className="d-flex justify-content-center" md={10} sm={12}>
          <h2 className="text-muted fw-bold font-monospace">
            Demo editor by Surag
          </h2>
        </Col>
        <Col
          md={2}
          sm={12}
          className="d-grid justify-content-xs-center justify-content-md-end align-content-center"
        >
          <Button className="" variant="success" onClick={handleSubmit}>
            Save
          </Button>
        </Col>
      </Row>
      <Row className="my-2">
        <Col>
          <DraftEditor
            editorState={editorState}
            setEditorState={setEditorState}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={mapKeyToEditorCommand}
            onChange={onChange}
            placeholder="Tell a story..."
            spellCheck={true}
          />
        </Col>
      </Row>
      <ToastContainer
        className="p-3"
        position={"top-end"}
        style={{ zIndex: 1 }}
      >
        <Toast
          bg="success"
          autohide
          show={showToast}
          onClose={() => setToast(false)}
        >
          <Toast.Header>
            <strong className="me-auto">Saved!</strong>
          </Toast.Header>
          <Toast.Body>Your draft has been saved!</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

export default EditorFrom;
