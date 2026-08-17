export default function BackofficeView({
  sectionPadV,
  sectionPadH,
  displayFont,
  profileNickname,
  isOwnProfile,
  onLoginClick,
  myReviews,
  myPosts,
  myGenreStats,
  isAdmin,
  pendingUsers,
}) {
  const reviewsLabel = isOwnProfile ? "내가 쓴 리뷰" : `${profileNickname}님이 쓴 리뷰`;
  const postsLabel = isOwnProfile ? "내가 쓴 게시글" : `${profileNickname}님이 쓴 게시글`;
  return (
    <div
      data-screen-label="마이페이지"
      style={{ padding: `${sectionPadV} ${sectionPadH}` }}
    >
      <h1
        style={{ fontSize: displayFont, fontWeight: 600, margin: "0 0 32px" }}
      >
        {isOwnProfile ? "마이페이지" : `${profileNickname}님의 마이페이지`}
      </h1>
      {!profileNickname ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#1c1c1e",
            borderRadius: 10,
          }}
        >
          <p style={{ fontSize: 17, color: "#c7c7cc", margin: "0 0 20px" }}>
            로그인 후 내가 쓴 글을 관리할 수 있어요.
          </p>
          <button
            onClick={onLoginClick}
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
            로그인
          </button>
        </div>
      ) : (
        <div>
          {isAdmin && (
            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 21, fontWeight: 600, margin: "0 0 16px" }}>
                가입 승인 대기 ({pendingUsers.length})
              </h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {pendingUsers.map((pu) => (
                  <div
                    key={pu.uid}
                    style={{
                      background: "#1c1c1e",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 10,
                      padding: "16px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600 }}>
                        {pu.nickname}
                      </div>
                      <div
                        style={{ color: "#98989d", fontSize: 12, marginTop: 4 }}
                      >
                        {pu.email}
                      </div>
                    </div>
                    <button
                      onClick={pu.onApprove}
                      style={{
                        background: "#fa243c",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 15px",
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      승인
                    </button>
                  </div>
                ))}
                {pendingUsers.length === 0 && (
                  <p style={{ color: "#98989d", fontSize: 14 }}>
                    승인 대기 중인 가입 신청이 없어요.
                  </p>
                )}
              </div>
            </div>
          )}
          {myGenreStats.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 21, fontWeight: 600, margin: "0 0 16px" }}>
                장르별 통계
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {myGenreStats.map((g) => (
                  <div
                    key={g.genre}
                    style={{
                      background: "#1c1c1e",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 10,
                      padding: "14px 20px",
                      minWidth: 140,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                      {g.genre}
                    </div>
                    <div style={{ fontSize: 12, color: "#98989d" }}>
                      {g.count}개 · ★ {g.avgFixed}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <h2 style={{ fontSize: 21, fontWeight: 600, margin: "0 0 16px" }}>
            {reviewsLabel}
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 48,
            }}
          >
            {myReviews.map((rv) => (
              <div
                key={rv.id}
                style={{
                  background: "#1c1c1e",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{ fontSize: 12, color: "#98989d", marginBottom: 6 }}
                  >
                    {rv.itemTitle} · {rv.itemArtist}
                  </div>
                  <div
                    style={{ color: rv.ratingColor, fontSize: 14, marginBottom: 8 }}
                  >
                    {rv.starsStr}
                  </div>
                  <div style={{ fontSize: 17 }}>{rv.text}</div>
                </div>
                {rv.onEdit && (
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                  >
                    <button
                      onClick={rv.onEdit}
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
                      onClick={rv.onDelete}
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
            ))}
            {myReviews.length === 0 && (
              <p style={{ color: "#98989d", fontSize: 14 }}>
                아직 작성한 리뷰가 없어요.
              </p>
            )}
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 600, margin: "0 0 16px" }}>
            {postsLabel}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myPosts.map((pt) => (
              <div
                key={pt.id}
                style={{
                  background: "#1c1c1e",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      background: "#1c1c1e",
                      color: "#c7c7cc",
                      fontSize: 12,
                      borderRadius: 9999,
                      padding: "4px 10px",
                      marginRight: 10,
                    }}
                  >
                    {pt.category}
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>
                    {pt.title}
                  </span>
                  <div style={{ color: "#98989d", fontSize: 12, marginTop: 6 }}>
                    {pt.date}
                  </div>
                </div>
                {pt.onEdit && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={pt.onEdit}
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
                      onClick={pt.onDelete}
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
            ))}
            {myPosts.length === 0 && (
              <p style={{ color: "#98989d", fontSize: 14 }}>
                아직 작성한 게시글이 없어요.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
