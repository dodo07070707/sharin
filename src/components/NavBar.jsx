const NAV_DEFS = [
  { key: "home", label: "홈" },
  { key: "chart", label: "차트" },
  { key: "reviews", label: "리뷰" },
  { key: "board", label: "게시글" },
  { key: "backoffice", label: "마이페이지" },
];

export default function NavBar({ view, onNavigate }) {
  return (
    <div
      style={{
        background: "rgba(28,28,30,0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        display: "flex",
        gap: 8,
        padding: "10px 16px",
        overflowX: "auto",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {NAV_DEFS.map((n) => (
        <button
          key={n.key}
          onClick={() => onNavigate(n.key)}
          style={{
            background: view === n.key ? "#ffffff" : "transparent",
            color: view === n.key ? "#1d1d1f" : "#f5f5f7",
            border: "none",
            borderRadius: 9999,
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
            flex: "none",
          }}
        >
          {n.label}
        </button>
      ))}
    </div>
  );
}
