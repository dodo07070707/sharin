import CoverThumb from "./CoverThumb";

export default function PostItemCard({ block, onRemove, href, onOpen }) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      href={href}
      onClick={
        href
          ? (e) => {
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              onOpen();
            }
          : undefined
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 16,
        borderRadius: 14,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        textDecoration: "none",
        color: "inherit",
        cursor: href ? "pointer" : "default",
      }}
    >
      <CoverThumb
        size={64}
        radius={10}
        fontSize={6}
        label={block.itemType === "song" ? "SONG COVER" : "ALBUM COVER"}
        imageUrl={block.artworkUrl}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "inline-block",
            background: "rgba(139,92,246,0.18)",
            color: "#c4b5fd",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 6,
            padding: "3px 10px",
            marginBottom: 8,
          }}
        >
          {block.itemType === "song" ? "Song" : "Album"}
        </span>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#f5f5f7",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {block.title}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#98989d",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {block.artist}
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            flex: "none",
            background: "transparent",
            color: "#98989d",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          삭제
        </button>
      )}
    </Tag>
  );
}
