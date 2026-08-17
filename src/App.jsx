import { useState } from 'react';
import Header from './components/Header';
import NavBar from './components/NavBar';
import HomeView from './components/HomeView';
import ChartView from './components/ChartView';
import ReviewsView from './components/ReviewsView';
import BoardView from './components/BoardView';
import BackofficeView from './components/BackofficeView';
import Footer from './components/Footer';
import DetailOverlay from './components/DetailOverlay';
import LoginModal from './components/LoginModal';
import ReviewFormModal from './components/ReviewFormModal';
import PostFormModal from './components/PostFormModal';
import { avg, starsStr, typeBadge, ratingBadge, coverLabelFor, artworkFor, todayStr } from './utils';
import { useIsMobile, useArtworkMap, useItunesSearch, useAuthUser } from './hooks';
import { useItemsCollection, usePostsCollection, usePendingUsers } from './firestoreHooks';
import { logIn, signUp, logOut, authErrorMessage } from './auth';

export default function App() {
  const [view, setViewState] = useState('home');
  const [chartType, setChartType] = useState('song');
  const [reviewType, setReviewType] = useState('song');
  const [boardFilter, setBoardFilter] = useState('전체');
  const [detailId, setDetailId] = useState(null);
  const [boardDetailId, setBoardDetailId] = useState(null);
  const user = useAuthUser();

  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginPwInput, setLoginPwInput] = useState('');
  const [signupNicknameInput, setSignupNicknameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormTargetId, setReviewFormTargetId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewRatingInput, setReviewRatingInput] = useState(5);
  const [reviewRatingText, setReviewRatingText] = useState('5.0');
  const [reviewTextInput, setReviewTextInput] = useState('');
  const [reviewSelectId, setReviewSelectId] = useState('');
  const [reviewSearchType, setReviewSearchType] = useState('song');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewSearchSelected, setReviewSearchSelected] = useState(null);

  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postTitleInput, setPostTitleInput] = useState('');
  const [postCategoryInput, setPostCategoryInput] = useState('월간결산');
  const [postContentInput, setPostContentInput] = useState('');

  const { items, addItem, addReview, replaceReviews } = useItemsCollection();
  const { posts, addPost, updatePost, removePost } = usePostsCollection();

  const { users: allUsers, approveUser } = usePendingUsers(!!(user && user.isAdmin));
  const pendingUsers = allUsers.filter((u) => !u.approved);

  const isMobile = useIsMobile();
  const artworkMap = useArtworkMap(items);
  const { results: reviewSearchResults, loading: reviewSearchLoading, error: reviewSearchError } = useItunesSearch(
    reviewSearchQuery,
    reviewSearchType,
    showReviewForm && !reviewFormTargetId && !editingReviewId
  );

  const setView = (v) => setViewState(v);
  const resetDetails = () => { setDetailId(null); setBoardDetailId(null); };
  const goHome = () => { setView('home'); resetDetails(); };
  const goChart = () => { setView('chart'); resetDetails(); };
  const goReviews = () => { setView('reviews'); resetDetails(); };
  const goBoard = () => { setView('board'); resetDetails(); };
  const onNavigate = (key) => { setView(key); resetDetails(); };

  const openDetail = (id) => setDetailId(id);
  const onCloseDetail = () => setDetailId(null);

  const resetAuthForm = () => {
    setAuthMode('login');
    setLoginEmailInput('');
    setLoginPwInput('');
    setSignupNicknameInput('');
    setAuthError('');
  };
  const onLoginClick = () => { resetAuthForm(); setShowLogin(true); };
  const onCloseLogin = () => { setShowLogin(false); resetAuthForm(); };
  const onSwitchAuthMode = (mode) => { setAuthMode(mode); setAuthError(''); };
  const onSubmitAuth = () => {
    if (!loginEmailInput.trim() || !loginPwInput) return;
    if (authMode === 'signup' && !signupNicknameInput.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    const task =
      authMode === 'signup'
        ? signUp(loginEmailInput.trim(), loginPwInput, signupNicknameInput.trim())
        : logIn(loginEmailInput.trim(), loginPwInput);
    task
      .then(() => {
        setShowLogin(false);
        resetAuthForm();
      })
      .catch((err) => setAuthError(authErrorMessage(err)))
      .finally(() => setAuthLoading(false));
  };
  const onLogoutClick = () => { logOut(); setView('home'); resetDetails(); };

  const requireApproved = () => {
    if (!user) { onLoginClick(); return false; }
    return user.approved;
  };

  const setRating = (n) => {
    setReviewRatingInput(n);
    setReviewRatingText(n.toFixed(1));
  };
  const openReviewFormNew = () => {
    if (!requireApproved()) return;
    setShowReviewForm(true);
    setReviewFormTargetId(null);
    setEditingReviewId(null);
    setRating(5);
    setReviewTextInput('');
    setReviewSelectId('');
    setReviewSearchType('song');
    setReviewSearchQuery('');
    setReviewSearchSelected(null);
  };
  const openDetailReviewForm = (itemId) => {
    if (!requireApproved()) return;
    setShowReviewForm(true);
    setReviewFormTargetId(itemId);
    setEditingReviewId(null);
    setRating(5);
    setReviewTextInput('');
    setReviewSelectId(itemId);
    setReviewSearchQuery('');
    setReviewSearchSelected(null);
  };
  const openEditReview = (itemId, review) => {
    setShowReviewForm(true);
    setReviewFormTargetId(itemId);
    setEditingReviewId(review.id);
    setRating(review.rating);
    setReviewTextInput(review.text);
    setReviewSelectId(itemId);
    setReviewSearchQuery('');
    setReviewSearchSelected(null);
  };
  const onCloseReviewForm = () => setShowReviewForm(false);
  // Accepts partial input while typing ("4", "4.", "4.3") so the field doesn't fight the user;
  // only fully-parsed values in [1,5] get committed to the numeric rating used by the star picker.
  const RATING_TEXT_RE = /^$|^[1-5]$|^[1-5]\.[0-9]?$/;
  const onRatingTextChange = (e) => {
    const raw = e.target.value;
    if (!RATING_TEXT_RE.test(raw)) return;
    setReviewRatingText(raw);
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 5) {
      setReviewRatingInput(parsed);
    }
  };
  const onRatingTextBlur = () => setReviewRatingText(reviewRatingInput.toFixed(1));
  const deleteReview = (itemId, reviewId) => {
    const target = items.find((it) => it.id === itemId);
    if (!target) return;
    replaceReviews(itemId, target.reviews.filter((r) => r.id !== reviewId));
  };
  const onSubmitReview = () => {
    if (!reviewTextInput.trim() || !user || !user.approved) return;

    let targetId = reviewSelectId;
    let target = items.find((it) => it.id === targetId);

    // A new review can create its song/album at the same time.
    let isNewItem = false;
    if (!editingReviewId && !target && reviewSearchSelected) {
      targetId = 'itunes' + reviewSearchSelected.itunesId;
      target = {
        id: targetId,
        itunesId: reviewSearchSelected.itunesId,
        type: reviewSearchSelected.type,
        title: reviewSearchSelected.title,
        artist: reviewSearchSelected.artist,
        releaseDate: reviewSearchSelected.releaseDate,
        artworkUrl: reviewSearchSelected.artworkUrl,
        reviews: [],
      };
      isNewItem = true;
    }

    if (!targetId || !target) return;

    if (editingReviewId) {
      replaceReviews(
        targetId,
        target.reviews.map((r) =>
          r.id === editingReviewId
            ? { ...r, rating: reviewRatingInput, text: reviewTextInput.trim() }
            : r
        )
      );
    } else {
      const nr = {
        id: 'r' + crypto.randomUUID(),
        userId: user.id,
        rating: reviewRatingInput,
        text: reviewTextInput.trim(),
        date: todayStr(),
      };

      if (isNewItem) {
        // Create the catalog item and its first review in one Firestore write.
        addItem({ ...target, reviews: [nr] });
      } else {
        addReview(targetId, nr);
      }
    }

    setShowReviewForm(false);
    setReviewSearchQuery('');
    setReviewSearchSelected(null);
  };

  const openPostFormNew = () => {
    if (!requireApproved()) return;
    setShowPostForm(true);
    setEditingPostId(null);
    setPostTitleInput('');
    setPostCategoryInput('월간결산');
    setPostContentInput('');
  };
  const openEditPost = (post) => {
    setShowPostForm(true);
    setEditingPostId(post.id);
    setPostTitleInput(post.title);
    setPostCategoryInput(post.category);
    setPostContentInput(post.content);
  };
  const onClosePostForm = () => setShowPostForm(false);
  const deletePost = (id) => {
    removePost(id);
    setBoardDetailId((prev) => (prev === id ? null : prev));
  };
  const onSubmitPost = () => {
    if (!postTitleInput.trim() || !postContentInput.trim() || !user || !user.approved) return;
    if (editingPostId) {
      updatePost(editingPostId, { title: postTitleInput.trim(), category: postCategoryInput, content: postContentInput.trim() });
    } else {
      addPost({ title: postTitleInput.trim(), category: postCategoryInput, content: postContentInput.trim(), author: user.id, date: todayStr() });
    }
    setShowPostForm(false);
  };
  const openBoardDetail = (id) => { setBoardDetailId(id); setView('board'); };
  const onBoardBack = () => setBoardDetailId(null);



  // ---- derived values (mirrors the original renderVals) ----
  const sectionPadV = isMobile ? '48px' : '80px';
  const sectionPadH = isMobile ? '20px' : '80px';
  const displayFont = isMobile ? '28px' : '40px';
  const homeColGrid = isMobile ? '1fr' : '1fr 1fr';

  const buildChartRows = (type) =>
    items
      .filter((i) => i.type === type)
      .map((i) => ({ ...i, avgVal: avg(i) }))
      .sort((a, b) => b.avgVal - a.avgVal)
      .map((i, idx) => ({
        id: i.id,
        rank: idx + 1,
        title: i.title,
        artist: i.artist,
        avgFixed: i.avgVal.toFixed(1),
        starsStr: starsStr(i.avgVal),
        reviewCount: i.reviews.length,
        coverLabel: i.type === 'song' ? 'SONG COVER' : 'ALBUM COVER',
        imageUrl: artworkFor(items, artworkMap, i.id),
        ...ratingBadge(i.avgVal),
        ...typeBadge(i.type),
        onOpen: () => openDetail(i.id),
      }));

  const chartList = buildChartRows(chartType);
  const homeChartSongs = buildChartRows('song').slice(0, 6);
  const homeChartAlbums = buildChartRows('album').slice(0, 6);

  const reviewFlat = items
    .filter((i) => i.type === reviewType)
    .flatMap((i) =>
      i.reviews.map((r) => ({
        ...r,
        itemTitle: i.title,
        itemArtist: i.artist,
        coverLabel: i.type === 'song' ? 'SONG COVER' : 'ALBUM COVER',
        imageUrl: artworkFor(items, artworkMap, i.id),
        ...ratingBadge(r.rating),
        ...typeBadge(i.type),
        starsStr: starsStr(r.rating),
        onOpenItem: () => openDetail(i.id),
      }))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const homeRecentReviews = items
    .flatMap((i) =>
      i.reviews.map((r) => ({
        ...r,
        itemTitle: i.title,
        itemArtist: i.artist,
        coverLabel: i.type === 'song' ? 'SONG COVER' : 'ALBUM COVER',
        imageUrl: artworkFor(items, artworkMap, i.id),
        ...ratingBadge(r.rating),
        ...typeBadge(i.type),
        starsStr: starsStr(r.rating),
        onOpenItem: () => openDetail(i.id),
      }))
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const homeRecentPosts = [...posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map((p) => ({ id: p.id, title: p.title, category: p.category, author: p.author, date: p.date, coverLabel: coverLabelFor(items, p.relatedItemId), imageUrl: artworkFor(items, artworkMap, p.relatedItemId), onOpen: () => openBoardDetail(p.id) }));

  const boardFiltered = boardFilter === '전체' ? posts : posts.filter((p) => p.category === boardFilter);
  const boardList = [...boardFiltered]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => ({ id: p.id, title: p.title, category: p.category, author: p.author, date: p.date, coverLabel: coverLabelFor(items, p.relatedItemId), imageUrl: artworkFor(items, artworkMap, p.relatedItemId), onOpen: () => openBoardDetail(p.id) }));

  const boardDetailObj = boardDetailId ? posts.find((p) => p.id === boardDetailId) : null;
  const boardDetail = boardDetailObj
    ? {
        title: boardDetailObj.title,
        category: boardDetailObj.category,
        author: boardDetailObj.author,
        date: boardDetailObj.date,
        content: boardDetailObj.content,
        coverLabel: coverLabelFor(items, boardDetailObj.relatedItemId),
        imageUrl: artworkFor(items, artworkMap, boardDetailObj.relatedItemId),
        canEdit: !!(user && boardDetailObj.author === user.id),
      }
    : null;

  const detailItemObj = detailId ? items.find((i) => i.id === detailId) : null;
  const detailAvgVal = detailItemObj ? avg(detailItemObj) : 0;
  const detail = detailItemObj
    ? {
        coverLabel: detailItemObj.type === 'song' ? 'SONG COVER' : 'ALBUM COVER',
        imageUrl: artworkFor(items, artworkMap, detailItemObj.id),
        typeLabel: detailItemObj.type === 'song' ? '곡' : '앨범',
        title: detailItemObj.title,
        artist: detailItemObj.artist,
        stars: starsStr(detailAvgVal),
        avgFixed: detailAvgVal.toFixed(1),
        releaseDate: detailItemObj.releaseDate,
        reviewCount: detailItemObj.reviews.length,
        reviews: [...detailItemObj.reviews]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((r) => ({ id: r.id, starsStr: starsStr(r.rating), text: r.text, userId: r.userId, date: r.date })),
      }
    : null;

  const myReviews = user
    ? items
        .flatMap((i) =>
          i.reviews
            .filter((r) => r.userId === user.id)
            .map((r) => ({
              id: r.id,
              itemTitle: i.title,
              itemArtist: i.artist,
              starsStr: starsStr(r.rating),
              text: r.text,
              date: r.date,
              onEdit: () => openEditReview(i.id, r),
              onDelete: () => deleteReview(i.id, r.id),
            }))
        )
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const myPosts = user
    ? posts
        .filter((p) => p.author === user.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((p) => ({ id: p.id, title: p.title, category: p.category, date: p.date, onEdit: () => openEditPost(p), onDelete: () => deletePost(p.id) }))
    : [];

  const pendingUsersRows = pendingUsers.map((u) => ({ uid: u.uid, nickname: u.nickname, email: u.email, onApprove: () => approveUser(u.uid) }));

  const reviewFormFixedItem = reviewFormTargetId ? items.find((i) => i.id === reviewFormTargetId) : null;
  const starPicker = [1, 2, 3, 4, 5].map((n) => ({ n, char: n <= reviewRatingInput ? '★' : '☆', onClick: () => setRating(n) }));

  return (
    <div style={{ minHeight: '100vh', background: '#000000', fontFamily: "'Pretendard',system-ui,-apple-system,BlinkMacSystemFont,sans-serif", color: '#f5f5f7', WebkitFontSmoothing: 'antialiased' }}>
      <Header user={user} onGoHome={goHome} onLoginClick={onLoginClick} onLogoutClick={onLogoutClick} />
      <NavBar view={view} onNavigate={onNavigate} />

      {user && !user.approved && (
        <div style={{ background: 'rgba(250,36,60,0.15)', borderBottom: '1px solid rgba(250,36,60,0.4)', color: '#ff8a94', fontSize: 13, padding: '10px 20px', textAlign: 'center' }}>
          가입 승인 대기 중이에요. 관리자가 승인하면 한줄평·게시글 작성이 가능해요.
        </div>
      )}

      {view === 'home' && (
        <HomeView
          sectionPadV={sectionPadV}
          sectionPadH={sectionPadH}
          displayFont={displayFont}
          homeColGrid={homeColGrid}
          homeChartSongs={homeChartSongs}
          homeChartAlbums={homeChartAlbums}
          homeRecentReviews={homeRecentReviews}
          homeRecentPosts={homeRecentPosts}
          onGoChart={goChart}
          onGoReviews={goReviews}
          onGoBoard={goBoard}
        />
      )}

      {view === 'chart' && (
        <ChartView
          sectionPadV={sectionPadV}
          sectionPadH={sectionPadH}
          displayFont={displayFont}
          chartType={chartType}
          onSetChartType={setChartType}
          chartList={chartList}
        />
      )}

      {view === 'reviews' && (
        <ReviewsView
          sectionPadV={sectionPadV}
          sectionPadH={sectionPadH}
          displayFont={displayFont}
          reviewType={reviewType}
          onSetReviewType={setReviewType}
          reviewFlat={reviewFlat}
          onOpenReviewFormNew={openReviewFormNew}
        />
      )}

      {view === 'board' && (
        <BoardView
          sectionPadV={sectionPadV}
          sectionPadH={sectionPadH}
          displayFont={displayFont}
          boardDetail={boardDetail}
          onBoardBack={onBoardBack}
          onEditBoardDetail={() => boardDetailObj && openEditPost(boardDetailObj)}
          onDeleteBoardDetail={() => boardDetailObj && deletePost(boardDetailObj.id)}
          boardFilter={boardFilter}
          onSetBoardFilter={setBoardFilter}
          boardList={boardList}
          onOpenPostFormNew={openPostFormNew}
        />
      )}

      {view === 'backoffice' && (
        <BackofficeView
          sectionPadV={sectionPadV}
          sectionPadH={sectionPadH}
          displayFont={displayFont}
          user={user}
          onLoginClick={onLoginClick}
          myReviews={myReviews}
          myPosts={myPosts}
          isAdmin={!!(user && user.isAdmin)}
          pendingUsers={pendingUsersRows}
        />
      )}

      <Footer />

      <DetailOverlay sectionPadV={sectionPadV} sectionPadH={sectionPadH} displayFont={displayFont} detail={detail} onClose={onCloseDetail} onWriteReview={() => openDetailReviewForm(detailId)} />

      <LoginModal
        show={showLogin}
        mode={authMode}
        onModeChange={onSwitchAuthMode}
        emailInput={loginEmailInput}
        onEmailChange={(e) => setLoginEmailInput(e.target.value)}
        pwInput={loginPwInput}
        onPwChange={(e) => setLoginPwInput(e.target.value)}
        nicknameInput={signupNicknameInput}
        onNicknameChange={(e) => setSignupNicknameInput(e.target.value)}
        error={authError}
        loading={authLoading}
        onSubmit={onSubmitAuth}
        onClose={onCloseLogin}
      />

      <ReviewFormModal
        show={showReviewForm}
        title={editingReviewId ? '한줄평 수정' : '한줄평 작성'}
        showSearch={!reviewFormTargetId && !editingReviewId}
        searchType={reviewSearchType}
        onSearchTypeChange={(type) => {
          setReviewSearchType(type);
          setReviewSearchSelected(null);
          setReviewSelectId('');
        }}
        searchQuery={reviewSearchQuery}
        onSearchQueryChange={(e) => {
          setReviewSearchQuery(e.target.value);
          setReviewSearchSelected(null);
          setReviewSelectId('');
        }}
        searchResults={reviewSearchResults}
        searchLoading={reviewSearchLoading}
        searchError={reviewSearchError}
        selectedSearchResult={reviewSearchSelected}
        onSelectSearchResult={(result) => {
          setReviewSearchSelected(result);
          const existing = items.find((i) => i.itunesId === result.itunesId);
          setReviewSelectId(existing ? existing.id : '');
        }}
        hasFixed={!!reviewFormTargetId}
        fixedLabel={reviewFormFixedItem ? reviewFormFixedItem.title + ' · ' + reviewFormFixedItem.artist : ''}
        starPicker={starPicker}
        ratingValue={reviewRatingText}
        onRatingChange={onRatingTextChange}
        onRatingBlur={onRatingTextBlur}
        textInput={reviewTextInput}
        onTextChange={(e) => setReviewTextInput(e.target.value)}
        onSubmit={onSubmitReview}
        onClose={onCloseReviewForm}
      />

      <PostFormModal
        show={showPostForm}
        title={editingPostId ? '게시글 수정' : '게시글 작성'}
        categoryInput={postCategoryInput}
        onCategoryChange={(e) => setPostCategoryInput(e.target.value)}
        titleInput={postTitleInput}
        onTitleChange={(e) => setPostTitleInput(e.target.value)}
        contentInput={postContentInput}
        onContentChange={(e) => setPostContentInput(e.target.value)}
        onSubmit={onSubmitPost}
        onClose={onClosePostForm}
      />

    </div>
  );
}
