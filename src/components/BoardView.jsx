import CoverThumb from "./CoverThumb";
import { BOARD_CATEGORIES } from "../data";

export default function BoardView({
  sectionPadV,
  sectionPadH,
  displayFont,
  boardDetail,
  onBoardBack,
  onEditBoardDetail,
  onDeleteBoardDetail,
  boardFilter,
  onSetBoardFilter,
  boardList,
  onOpenPostFormNew,
}) {
  if (boardDetail) {
    return (
      <div
        data-screen-label="게시글"
        style={{ padding: `${sectionPadV} ${sectionPadH}` }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <span
            onClick={onBoardBack}
            style={{ cursor: "pointer", color: "#fa243c", fontSize: 14 }}
          >
            ← 목록으로
          </span>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CoverThumb
                size={40}
                radius={30}
                fontSize={5}
                label={boardDetail.coverLabel}
                imageUrl={boardDetail.imageUrl}
              />
              <span
                style={{
                  background: "#1c1c1e",
                  color: "#c7c7cc",
                  fontSize: 12,
                  borderRadius: 9999,
                  padding: "4px 10px",
                }}
              >
                {boardDetail.category}
              </span>
            </div>
            <h1
              style={{
                fontSize: displayFont,
                fontWeight: 600,
                margin: "16px 0 8px",
              }}
            >
              {boardDetail.title}
            </h1>
            <div style={{ fontSize: 12, color: "#98989d", marginBottom: 24 }}>
              {boardDetail.author} · {boardDetail.date}
            </div>
            <p
              style={{ fontSize: 17, lineHeight: 1.47, whiteSpace: "pre-wrap" }}
            >
              {boardDetail.content}
            </p>
            {boardDetail.canEdit && (
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  onClick={onEditBoardDetail}
                  style={{
                    background: "#2c2c2e",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 15px",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  수정
                </button>
                <button
                  onClick={onDeleteBoardDetail}
                  style={{
                    background: "transparent",
                    color: "#98989d",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    padding: "8px 15px",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-screen-label="게시글"
      style={{ padding: `${sectionPadV} ${sectionPadH}` }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h1 style={{ fontSize: displayFont, fontWeight: 600, margin: 0 }}>
          게시글
        </h1>
        <button
          onClick={onOpenPostFormNew}
          style={{
            background: "#fa243c",
            color: "#ffffff",
            border: "none",
            borderRadius: 9999,
            padding: "11px 22px",
            fontSize: 17,
            cursor: "pointer",
          }}
        >
          글쓰기
        </button>
      </div>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {["전체", ...BOARD_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => onSetBoardFilter(c)}
            style={{
              background:
                boardFilter === c ? "#ffffff" : "rgba(255,255,255,0.08)",
              color: boardFilter === c ? "#1d1d1f" : "#f5f5f7",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 9999,
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {boardList.map((pt) => (
          <div
            key={pt.id}
            onClick={pt.onOpen}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 0",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <CoverThumb
              size={44}
              radius={30}
              fontSize={6}
              label={pt.coverLabel}
              imageUrl={pt.imageUrl}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
                minWidth: 150,
              }}
            >
              <span
                style={{
                  background: "#1c1c1e",
                  color: "#c7c7cc",
                  fontSize: 12,
                  borderRadius: 9999,
                  padding: "4px 10px",
                }}
              >
                {pt.category}
              </span>
              <span style={{ fontSize: 17, fontWeight: 600 }}>{pt.title}</span>
            </div>
            <span style={{ color: "#98989d", fontSize: 12 }}>
              {pt.author} · {pt.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
