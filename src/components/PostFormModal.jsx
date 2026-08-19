import { useRef } from "react";
import { BOARD_CATEGORIES } from "../data";
import PostItemCard from "./PostItemCard";

function InsertRow({ onAddText, onAddItem }) {
  const circleStyle = {
    flex: "none",
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    color: "#f5f5f7",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }}
      />
      <button
        type="button"
        onClick={onAddText}
        title="텍스트 추가"
        style={circleStyle}
      >
        T
      </button>
      <button
        type="button"
        onClick={onAddItem}
        title="곡·앨범 추가"
        style={{ ...circleStyle, fontSize: 15 }}
      >
        +
      </button>
      <div
        style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }}
      />
    </div>
  );
}

export default function PostFormModal({
  sectionPadV,
  sectionPadH,
  displayFont,
  title,
  categoryInput,
  onCategoryChange,
  titleInput,
  onTitleChange,
  blocks,
  onBlockTextChange,
  onRemoveBlock,
  onAddItem,
  onAddText,
  onSubmit,
  onClose,
}) {
  const textareaRefs = useRef({});

  // Wraps the currently selected text in a block's textarea with [[...]] — BoardView
  // renders that as larger text. A no-op if nothing is selected.
  const makeSelectionBig = (blockId) => {
    const el = textareaRefs.current[blockId];
    if (!el || el.selectionStart === el.selectionEnd) return;
    const { selectionStart, selectionEnd, value } = el;
    const next = `${value.slice(0, selectionStart)}[[${value.slice(
      selectionStart,
      selectionEnd
    )}]]${value.slice(selectionEnd)}`;
    onBlockTextChange(blockId, next);
  };

  return (
    <div
      data-screen-label="게시글 작성"
      style={{ padding: `${sectionPadV} ${sectionPadH}` }}
    >
      <style>{`
      .post-textarea-scroll::-webkit-scrollbar {
        width: 5px;
      }

      .post-textarea-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .post-textarea-scroll::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.18);
        border-radius: 999px;
      }

      .post-textarea-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .post-textarea-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
      }
    `}</style>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <span
          onClick={onClose}
          style={{ cursor: "pointer", color: "#fa243c", fontSize: 14 }}
        >
          ← 뒤로가기
        </span>
        <h1
          style={{
            fontSize: displayFont,
            fontWeight: 600,
            margin: "16px 0 24px",
          }}
        >
          {title}
        </h1>
        <select
          value={categoryInput}
          onChange={onCategoryChange}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 9999,
            fontSize: 14,
            marginBottom: 12,
            color: "#f5f5f7",
            background: "#1c1c1e",
          }}
        >
          {BOARD_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={titleInput}
          onChange={onTitleChange}
          placeholder="제목"
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 9999,
            fontSize: 17,
            marginBottom: 20,
            outline: "none",
            color: "#f5f5f7",
            background: "transparent",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {blocks.map((block, i) => (
            <div
              key={block.id}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <InsertRow
                onAddText={() => onAddText(i)}
                onAddItem={() => onAddItem(i)}
              />
              {block.type === "item" ? (
                <PostItemCard
                  block={block}
                  onRemove={() => onRemoveBlock(block.id)}
                />
              ) : (
                <div>
                  <textarea
                    ref={(el) => {
                      textareaRefs.current[block.id] = el;
                    }}
                    className="post-textarea-scroll"
                    value={block.text}
                    onChange={(e) =>
                      onBlockTextChange(block.id, e.target.value)
                    }
                    placeholder="내용을 입력하세요"
                    style={{
                      width: "100%",
                      minHeight: 120,
                      padding: "14px 16px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 10,
                      fontSize: 17,
                      lineHeight: 1.6,
                      outline: "none",
                      resize: "vertical",
                      color: "#f5f5f7",
                      background: "transparent",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => makeSelectionBig(block.id)}
                      title="글자를 선택하고 눌러보세요"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "#f5f5f7",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 9999,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      제목
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveBlock(block.id)}
                      style={{
                        background: "transparent",
                        color: "#98989d",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 9999,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <InsertRow
            onAddText={() => onAddText(blocks.length)}
            onAddItem={() => onAddItem(blocks.length)}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onSubmit}
            style={{
              flex: 1,
              background: "#fa243c",
              color: "#ffffff",
              border: "none",
              borderRadius: 9999,
              padding: "11px 22px",
              fontSize: 17,
              cursor: "pointer",
            }}
          >
            등록
          </button>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#fa243c",
              border: "1px solid #fa243c",
              borderRadius: 9999,
              padding: "11px 22px",
              fontSize: 17,
              cursor: "pointer",
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
