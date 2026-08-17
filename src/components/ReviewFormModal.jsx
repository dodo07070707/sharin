import CoverThumb from "./CoverThumb";

export default function ReviewFormModal({
  show,
  title,
  showSearch,
  searchType,
  onSearchTypeChange,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searchLoading,
  searchError,
  selectedSearchResult,
  onSelectSearchResult,
  hasFixed,
  fixedLabel,
  starPicker,
  ratingValue,
  onRatingChange,
  onRatingBlur,
  textInput,
  onTextChange,
  onSubmit,
  onClose,
}) {
  if (!show) return null;

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
      <style>{`
      .review-modal-scroll::-webkit-scrollbar {
        width: 5px;
      }

      .review-modal-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .review-modal-scroll::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.18);
        border-radius: 999px;
      }

      .review-modal-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .review-modal-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
      }
    `}</style>
      <div
        className="review-modal-scroll"
        style={{
          background: "#1c1c1e",
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 620,
          maxHeight: "90vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: "0 0 20px",
            color: "#f5f5f7",
          }}
        >
          {title}
        </h2>

        {showSearch && (
          <>
            {/* 검색 타입 */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {[
                { key: "song", label: "곡" },
                { key: "album", label: "앨범" },
              ].map((tg) => (
                <button
                  key={tg.key}
                  type="button"
                  onClick={() => onSearchTypeChange(tg.key)}
                  style={{
                    background:
                      searchType === tg.key
                        ? "#ffffff"
                        : "rgba(255,255,255,0.08)",
                    color: searchType === tg.key ? "#1d1d1f" : "#f5f5f7",
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

            {/* 검색창 */}
            <input
              value={searchQuery}
              onChange={onSearchQueryChange}
              placeholder="곡 제목 또는 아티스트로 검색"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 9999,
                fontSize: 15,
                marginBottom: 12,
                color: "#f5f5f7",
                background: "transparent",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {/* 검색 결과 */}
            <div
              style={{
                maxHeight: 220,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {searchLoading && (
                <p
                  style={{
                    color: "#98989d",
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  검색 중...
                </p>
              )}

              {!searchLoading && searchError && (
                <p
                  style={{
                    color: "#ff453a",
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  {searchError}
                </p>
              )}

              {!searchLoading &&
                !searchError &&
                searchQuery.trim() &&
                searchResults.length === 0 && (
                  <p
                    style={{
                      color: "#98989d",
                      fontSize: 13,
                      margin: 0,
                    }}
                  >
                    검색 결과가 없어요.
                  </p>
                )}

              {!searchLoading &&
                searchResults.map((result) => {
                  const selected =
                    selectedSearchResult?.itunesId === result.itunesId;

                  return (
                    <button
                      key={result.itunesId}
                      type="button"
                      onClick={() => onSelectSearchResult(result)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        padding: 10,
                        textAlign: "left",
                        border: selected
                          ? "1px solid #fa243c"
                          : "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 10,
                        background: selected
                          ? "rgba(250,36,60,0.12)"
                          : "transparent",
                        color: "#f5f5f7",
                        cursor: "pointer",
                      }}
                    >
                      <CoverThumb
                        size={48}
                        radius={8}
                        fontSize={5}
                        label={
                          searchType === "song" ? "SONG COVER" : "ALBUM COVER"
                        }
                        imageUrl={result.artworkUrl}
                      />

                      <span style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {result.title}
                        </span>

                        <span
                          style={{
                            display: "block",
                            fontSize: 12,
                            color: "#98989d",
                            marginTop: 3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {result.artist} · {result.releaseDate}
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* 선택된 앨범/곡 */}
            {selectedSearchResult && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: 18,
                  marginBottom: 22,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* 큰 커버 */}
                <CoverThumb
                  size={128}
                  radius={10}
                  fontSize={8}
                  label={searchType === "song" ? "SONG COVER" : "ALBUM COVER"}
                  imageUrl={selectedSearchResult.artworkUrl}
                />

                {/* 곡 정보 */}
                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#98989d",
                      marginBottom: 7,
                    }}
                  >
                    {searchType === "song" ? "SONG" : "ALBUM"}
                  </div>

                  <div
                    style={{
                      fontSize: 23,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#f5f5f7",
                      wordBreak: "keep-all",
                      marginBottom: 8,
                    }}
                  >
                    {selectedSearchResult.title}
                  </div>

                  <div
                    style={{
                      fontSize: 16,
                      color: "#d1d1d6",
                      marginBottom: 6,
                      wordBreak: "keep-all",
                    }}
                  >
                    {selectedSearchResult.artist}
                  </div>

                  {selectedSearchResult.releaseDate && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#98989d",
                      }}
                    >
                      {selectedSearchResult.releaseDate}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {hasFixed && (
          <div
            style={{
              fontSize: 14,
              color: "#c7c7cc",
              marginBottom: 16,
            }}
          >
            {fixedLabel}
          </div>
        )}

        {/* 별점 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
            }}
          >
            {starPicker.map((st) => (
              <span
                key={st.n}
                onClick={st.onClick}
                style={{
                  fontSize: 28,
                  color: "#fa243c",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                {st.char}
              </span>
            ))}
          </div>

          <input
            type="text"
            inputMode="decimal"
            placeholder="n.n"
            value={ratingValue}
            onChange={onRatingChange}
            onBlur={onRatingBlur}
            style={{
              width: 56,
              padding: "8px 10px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              fontSize: 15,
              color: "#f5f5f7",
              background: "transparent",
              outline: "none",
              textAlign: "center",
            }}
          />
        </div>

        {/* 한줄평 */}
        <textarea
          value={textInput}
          onChange={onTextChange}
          maxLength={80}
          placeholder="한 줄로 남겨보세요 (최대 80자)"
          style={{
            width: "100%",
            minHeight: 80,
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            fontSize: 17,
            marginBottom: 16,
            outline: "none",
            resize: "none",
            color: "#f5f5f7",
            background: "transparent",
            boxSizing: "border-box",
          }}
        />

        {/* 버튼 */}
        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
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
