export default function ConfirmModal({ show, message, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#1c1c1e",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 360,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 16, lineHeight: 1.5, margin: "0 0 24px", color: "#f5f5f7" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "transparent",
              color: "#f5f5f7",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 9999,
              padding: "11px 22px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "#fa243c",
              color: "#ffffff",
              border: "none",
              borderRadius: 9999,
              padding: "11px 22px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
