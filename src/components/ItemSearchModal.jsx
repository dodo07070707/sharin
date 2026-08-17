import CoverThumb from "./CoverThumb";

export default function ItemSearchModal({
  show,
  entityType,
  onEntityChange,
  query,
  onQueryChange,
  results,
  loading,
  error,
  onAdd,
  onClose,
}) {
  if (!show) return null;
  const toggles = [
    { key: "song", label: "곡" },
    { key: "album", label: "앨범" },
  ];
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#1c1c1e",
          borderRadius: 10,
          padding: 32,
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ fontSize: 21, fontWeight: 600, margin: "0 0 20px" }}>
          iTunes에서 검색해 추가
        </h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {toggles.map((tg) => (
            <button
              key={tg.key}
              onClick={() => onEntityChange(tg.key)}
              style={{
                background:
                  entityType === tg.key ? "#ffffff" : "rgba(255,255,255,0.08)",
                color: entityType === tg.key ? "#1d1d1f" : "#f5f5f7",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 9999,
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tg.label}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="곡 제목 또는 아티스트로 검색"
          autoFocus
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 9999,
            fontSize: 15,
            marginBottom: 16,
            color: "#f5f5f7",
            background: "transparent",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 16,
            minHeight: 80,
          }}
        >
          {loading && (
            <p style={{ color: "#98989d", fontSize: 14 }}>검색 중...</p>
          )}
          {!loading && error && (
            <p style={{ color: "#ff453a", fontSize: 14 }}>{error}</p>
          )}
          {!loading && !error && query.trim() && results.length === 0 && (
            <p style={{ color: "#98989d", fontSize: 14 }}>
              검색 결과가 없어요.
            </p>
          )}
          {!loading &&
            results.map((r) => (
              <div
                key={r.itunesId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                }}
              >
                <CoverThumb
                  size={44}
                  radius={8}
                  fontSize={6}
                  label={entityType === "song" ? "SONG COVER" : "ALBUM COVER"}
                  imageUrl={r.artworkUrl}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#f5f5f7",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#98989d",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.artist} · {r.releaseDate}
                  </div>
                </div>
                <button
                  onClick={() => onAdd(r)}
                  style={{
                    flex: "none",
                    background: "#fa243c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 9999,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  추가
                </button>
              </div>
            ))}
        </div>

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
          뒤로가기
        </button>
      </div>
    </div>
  );
}
