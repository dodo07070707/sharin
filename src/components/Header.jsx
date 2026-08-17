export default function Header({
  user,
  onGoHome,
  onLoginClick,
  onLogoutClick,
}) {
  return (
    <div
      style={{
        background: "#000000",
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <div
        onClick={onGoHome}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 40 40">
          <polygon
            points="20,6 33.31,15.67 28.23,31.33 11.77,31.33 6.69,15.67"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            cx="20"
            cy="6"
            r="3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            cx="33.31"
            cy="15.67"
            r="3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            cx="28.23"
            cy="31.33"
            r="3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            cx="11.77"
            cy="31.33"
            r="3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            cx="6.69"
            cy="15.67"
            r="3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </svg>
        <span
          style={{
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.12px",
          }}
        >
          SHARIN
        </span>
      </div>
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#cccccc", fontSize: 12 }}>
            {user.id}
            {user.isAdmin && (
              <span style={{ marginLeft: 6, color: "#fa243c" }}>관리자</span>
            )}
            {!user.isAdmin && !user.approved && (
              <span style={{ marginLeft: 6, color: "#98989d" }}>승인 대기</span>
            )}
          </span>
          <button
            onClick={onLogoutClick}
            style={{
              background: "#2c2c2e",
              color: "#ffffff",
              fontSize: 12,
              border: "none",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button
          onClick={onLoginClick}
          style={{
            background: "#2c2c2e",
            color: "#ffffff",
            fontSize: 12,
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          로그인
        </button>
      )}
    </div>
  );
}
