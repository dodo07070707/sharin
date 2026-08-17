export default function LoginModal({
  show,
  mode,
  onModeChange,
  emailInput,
  onEmailChange,
  pwInput,
  onPwChange,
  nicknameInput,
  onNicknameChange,
  error,
  loading,
  onSubmit,
  onClose,
}) {
  if (!show) return null;
  const isSignup = mode === "signup";
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
          maxWidth: 360,
        }}
      >
        <h2 style={{ fontSize: 21, fontWeight: 600, margin: "0 0 6px" }}>
          {isSignup ? "회원가입" : "로그인"}
        </h2>
        <p style={{ fontSize: 14, color: "#98989d", margin: "0 0 20px" }}>
          친구들만 한줄평과 게시글을 남길 수 있어요.
        </p>

        {isSignup && (
          <input
            value={nicknameInput}
            onChange={onNicknameChange}
            placeholder="닉네임"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 9999,
              fontSize: 17,
              marginBottom: 10,
              outline: "none",
              color: "#f5f5f7",
              background: "transparent",
              boxSizing: "border-box",
            }}
          />
        )}
        <input
          type="email"
          value={emailInput}
          onChange={onEmailChange}
          placeholder="이메일"
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 9999,
            fontSize: 17,
            marginBottom: 10,
            outline: "none",
            color: "#f5f5f7",
            background: "transparent",
            boxSizing: "border-box",
          }}
        />
        <input
          type="password"
          value={pwInput}
          onChange={onPwChange}
          placeholder={isSignup ? "비밀번호 (6자 이상)" : "비밀번호"}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 9999,
            fontSize: 17,
            marginBottom: 16,
            outline: "none",
            color: "#f5f5f7",
            background: "transparent",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ fontSize: 13, color: "#ff453a", margin: "-8px 0 16px" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onSubmit}
            disabled={loading}
            style={{
              flex: 1,
              background: "#fa243c",
              color: "#ffffff",
              border: "none",
              borderRadius: 9999,
              padding: "11px 22px",
              fontSize: 17,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "처리 중..." : isSignup ? "가입하기" : "로그인"}
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

        <p
          style={{
            fontSize: 13,
            color: "#98989d",
            margin: "16px 0 0",
            textAlign: "center",
          }}
        >
          {isSignup ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}{" "}
          <span
            onClick={() => onModeChange(isSignup ? "login" : "signup")}
            style={{ color: "#fa243c", cursor: "pointer" }}
          >
            {isSignup ? "로그인" : "회원가입"}
          </span>
        </p>
      </div>
    </div>
  );
}
