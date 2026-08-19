import { useEffect, useState } from 'react';
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
import ItemSearchModal from './components/ItemSearchModal';
import ConfirmModal from './components/ConfirmModal';
import { avg, starsStr, typeBadge, ratingBadge, artworkFor, todayStr, itemHref, boardHref, normalizePostContent, boardCoverFor } from './utils';
import { useIsMobile, useArtworkMap, useItunesSearch, useAuthUser, useAlbumTracklist } from './hooks';
import { useItemsCollection, usePostsCollection, usePendingUsers } from './firestoreHooks';
import { logIn, signUp, logOut, authErrorMessage } from './auth';

export default function App() {
  const [view, setViewState] = useState('home');
  const [chartType, setChartType] = useState('song');
  const [reviewType, setReviewType] = useState('song');
  const [boardFilter, setBoardFilter] = useState('전체');
  const [detailId, setDetailId] = useState(null);
  const [boardDetailId, setBoardDetailId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [myPageUserId, setMyPageUserId] = useState(null);
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

  const [postFormReturnView, setPostFormReturnView] = useState('board');
  const [editingPostId, setEditingPostId] = useState(null);
  const [postTitleInput, setPostTitleInput] = useState('');
  const [postCategoryInput, setPostCategoryInput] = useState('월간결산');
  const [postBlocks, setPostBlocks] = useState([{ id: 'b0', type: 'text', text: '' }]);
  const [showPostItemSearch, setShowPostItemSearch] = useState(false);
  const [postItemSearchType, setPostItemSearchType] = useState('song');
  const [postItemSearchQuery, setPostItemSearchQuery] = useState('');
  const [postItemInsertIndex, setPostItemInsertIndex] = useState(null);

  const { items, addItem, addReview, replaceReviews } = useItemsCollection();
  const { posts, addPost, updatePost, removePost } = usePostsCollection();

  // Reviews written before `createdAt` existed only have a day-precision `date`, so
  // several same-day reviews can't be told apart for "newest first" sorting — they'd
  // just keep whatever order they happened to load in. This backfills a synthetic
  // createdAt (day + position within the item's reviews array, which arrayUnion always
  // appends to in write order) so those ties resolve consistently.
  //
  // A non-admin can only do this for their own reviews (the same write this app already
  // lets them make when editing their own review), which leaves everyone else's legacy
  // reviews untouched — on a shared list mixing every author, that means most entries
  // still tie on date-only comparison and keep looking unsorted. The admin is trusted
  // with broader Firestore writes already (approving signups), so backfills every
  // review missing createdAt, fixing the shared lists in one pass.
  useEffect(() => {
    if (!user || !user.approved) return;
    const needsBackfill = (r) => !r.createdAt && (user.isAdmin || r.userId === user.id);
    items.forEach((item) => {
      if (!item.reviews.some(needsBackfill)) return;
      const backfilled = item.reviews.map((r, idx) =>
        needsBackfill(r) ? { ...r, createdAt: Date.parse(r.date) + idx, createdAtApprox: true } : r
      );
      replaceReviews(item.id, backfilled);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, user]);

  const { users: allUsers, approveUser } = usePendingUsers(!!(user && user.isAdmin));
  const pendingUsers = allUsers.filter((u) => !u.approved);

  const isMobile = useIsMobile();
  const artworkMap = useArtworkMap(items);
  const { results: reviewSearchResults, loading: reviewSearchLoading, error: reviewSearchError } = useItunesSearch(
    reviewSearchQuery,
    reviewSearchType,
    showReviewForm && !reviewFormTargetId && !editingReviewId
  );
  const { results: postItemSearchResults, loading: postItemSearchLoading, error: postItemSearchError } = useItunesSearch(
    postItemSearchQuery,
    postItemSearchType,
    showPostItemSearch
  );

  const setView = (v) => setViewState(v);
  const resetDetails = () => {
    if (detailId || boardDetailId) window.history.replaceState({}, '', '/');
    setDetailId(null);
    setBoardDetailId(null);
  };
  const goHome = () => { setView('home'); resetDetails(); };
  const goChart = () => { setView('chart'); resetDetails(); };
  const goReviews = () => { setView('reviews'); resetDetails(); };
  const goBoard = () => { setView('board'); resetDetails(); };
  const onNavigate = (key) => {
    setView(key);
    resetDetails();
    if (key === 'backoffice') setMyPageUserId(null);
  };
  const openUserProfile = (userId) => {
    setMyPageUserId(userId);
    setView('backoffice');
    resetDetails();
  };

  // Gives each song/album detail and board post a real, shareable URL (/item/:id,
  // /board/:id) and keeps it in sync with browser back/forward, including deep
  // links opened directly (e.g. a shared link landing on first load).
  useEffect(() => {
    const applyRoute = () => {
      const path = window.location.pathname;
      const itemMatch = path.match(/^\/item\/([^/]+)$/);
      const boardMatch = path.match(/^\/board\/([^/]+)$/);
      if (itemMatch) {
        setDetailId(decodeURIComponent(itemMatch[1]));
        setBoardDetailId(null);
      } else if (boardMatch) {
        setBoardDetailId(decodeURIComponent(boardMatch[1]));
        setViewState('board');
        setDetailId(null);
      } else {
        setDetailId(null);
        setBoardDetailId(null);
      }
    };
    applyRoute();
    window.addEventListener('popstate', applyRoute);
    return () => window.removeEventListener('popstate', applyRoute);
  }, []);

  const openDetail = (id) => {
    window.history.pushState({}, '', itemHref(id));
    setDetailId(id);
  };
  const onCloseDetail = () => {
    if (detailId) window.history.back();
  };

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
  const requestDeleteReview = (itemId, reviewId, text) => {
    setPendingDelete({
      message: `"${text}" 리뷰를 삭제할까요?`,
      onConfirm: () => { deleteReview(itemId, reviewId); setPendingDelete(null); },
    });
  };
  const requestDeletePost = (id, title) => {
    setPendingDelete({
      message: `"${title}" 게시글을 삭제할까요?`,
      onConfirm: () => { deletePost(id); setPendingDelete(null); },
    });
  };
  const cancelPendingDelete = () => setPendingDelete(null);
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
        genre: reviewSearchSelected.genre || null,
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
        createdAt: Date.now(),
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

  const newBlockId = () => 'b' + crypto.randomUUID();
  const openPostFormNew = () => {
    if (!requireApproved()) return;
    setPostFormReturnView(view);
    setView('postForm');
    setEditingPostId(null);
    setPostTitleInput('');
    setPostCategoryInput('월간결산');
    setPostBlocks([{ id: newBlockId(), type: 'text', text: '' }]);
  };
  const openEditPost = (post) => {
    setPostFormReturnView(view);
    setView('postForm');
    setEditingPostId(post.id);
    setPostTitleInput(post.title);
    setPostCategoryInput(post.category);
    // A post that ends on a song/album embed needs a trailing text block, otherwise
    // there's nowhere to type after it (onSubmitPost strips trailing-empty ones on save,
    // so a post genuinely ending on an item arrives here with none).
    const loadedBlocks = normalizePostContent(post.content).map((b) => ({ id: newBlockId(), ...b }));
    if (loadedBlocks.length === 0 || loadedBlocks[loadedBlocks.length - 1].type === 'item') {
      loadedBlocks.push({ id: newBlockId(), type: 'text', text: '' });
    }
    setPostBlocks(loadedBlocks);
  };
  const onClosePostForm = () => { setView(postFormReturnView); setShowPostItemSearch(false); };
  const deletePost = (id) => {
    removePost(id);
    setBoardDetailId((prev) => (prev === id ? null : prev));
  };
  const updatePostBlockText = (id, text) => setPostBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, text } : b)));
  const removePostBlock = (id) => setPostBlocks((bs) => {
    const next = bs.filter((b) => b.id !== id);
    return next.length ? next : [{ id: newBlockId(), type: 'text', text: '' }];
  });
  const insertPostTextBlock = (insertIndex) => {
    setPostBlocks((bs) => {
      const next = [...bs];
      next.splice(insertIndex, 0, { id: newBlockId(), type: 'text', text: '' });
      return next;
    });
  };
  const openPostItemSearch = (insertIndex) => {
    setPostItemInsertIndex(insertIndex);
    setPostItemSearchType('song');
    setPostItemSearchQuery('');
    setShowPostItemSearch(true);
  };
  const onPickPostItem = (result) => {
    setPostBlocks((bs) => {
      const insertAt = postItemInsertIndex ?? bs.length;
      const itemBlock = {
        id: newBlockId(),
        type: 'item',
        itemType: result.type,
        itemId: result.itunesId,
        title: result.title,
        artist: result.artist,
        artworkUrl: result.artworkUrl || null,
      };
      const textBlock = { id: newBlockId(), type: 'text', text: '' };
      const next = [...bs];
      next.splice(insertAt, 0, itemBlock, textBlock);
      return next;
    });
    setShowPostItemSearch(false);
  };
  const onSubmitPost = () => {
    const hasText = postBlocks.some((b) => b.type === 'text' && b.text.trim());
    if (!postTitleInput.trim() || !hasText || !user || !user.approved) return;
    const content = postBlocks
      .filter((b) => (b.type === 'text' ? b.text.trim() : true))
      .map((b) =>
        b.type === 'text'
          ? { type: 'text', text: b.text.trim() }
          : { type: 'item', itemType: b.itemType, itemId: b.itemId, title: b.title, artist: b.artist, artworkUrl: b.artworkUrl || null }
      );
    if (editingPostId) {
      updatePost(editingPostId, { title: postTitleInput.trim(), category: postCategoryInput, content });
    } else {
      addPost({ title: postTitleInput.trim(), category: postCategoryInput, content, author: user.id, date: todayStr() });
    }
    setView(postFormReturnView);
  };
  const openBoardDetail = (id) => {
    window.history.pushState({}, '', boardHref(id));
    setBoardDetailId(id);
    setView('board');
  };
  const onBoardBack = () => {
    if (boardDetailId) window.history.back();
  };



  // ---- derived values (mirrors the original renderVals) ----
  const sectionPadV = isMobile ? '48px' : '80px';
  const sectionPadH = isMobile ? '20px' : '80px';
  // Non-home pages read as a narrower, more centered column — wider side margins
  // than the home page, which keeps its own tighter padding for the chart strips.
  // A flat 400px broke narrower viewports (padding alone could exceed the viewport
  // width, collapsing content to ~0 and wrapping text one character per line), so
  // this scales with viewport width instead of jumping between two fixed values.
  const sectionPadHWide = 'clamp(27px, 20vw, 533px)';
  const displayFont = isMobile ? '28px' : '40px';
  const homeColGrid = isMobile ? '1fr' : '1fr 1fr';

  // Reviews only carry a day-precision `date` string, so same-day reviews used to sort
  // in whatever order they happened to land in the array (not actual submission order).
  // `createdAt` (added going forward) breaks that tie precisely; older reviews written
  // before it existed fall back to the date-only comparison as before.
  const byNewestReview = (a, b) => {
    if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
    return b.date.localeCompare(a.date);
  };

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
  const homeChartSongs = buildChartRows('song').slice(0, 8);
  const homeChartAlbums = buildChartRows('album').slice(0, 8);

  const reviewFlat = items
    .filter((i) => i.type === reviewType)
    .flatMap((i) =>
      i.reviews.map((r) => ({
        ...r,
        itemId: i.id,
        itemTitle: i.title,
        itemArtist: i.artist,
        coverLabel: i.type === 'song' ? 'SONG COVER' : 'ALBUM COVER',
        imageUrl: artworkFor(items, artworkMap, i.id),
        ...ratingBadge(r.rating),
        ...typeBadge(i.type),
        starsStr: starsStr(r.rating),
        onOpenItem: () => openDetail(i.id),
        onClickAuthor: () => openUserProfile(r.userId),
      }))
    )
    .sort(byNewestReview);

  const homeRecentReviews = items
    .flatMap((i) =>
      i.reviews.map((r) => ({
        ...r,
        itemId: i.id,
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
    .sort(byNewestReview)
    .slice(0, 4);

  const homeRecentPosts = [...posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map((p) => ({ id: p.id, title: p.title, category: p.category, author: p.author, date: p.date, ...boardCoverFor(p.content), onOpen: () => openBoardDetail(p.id), onClickAuthor: () => openUserProfile(p.author) }));

  const boardFiltered = boardFilter === '전체' ? posts : posts.filter((p) => p.category === boardFilter);
  const boardList = [...boardFiltered]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => ({ id: p.id, title: p.title, category: p.category, author: p.author, date: p.date, ...boardCoverFor(p.content), onOpen: () => openBoardDetail(p.id), onClickAuthor: () => openUserProfile(p.author) }));

  const boardDetailObj = boardDetailId ? posts.find((p) => p.id === boardDetailId) : null;
  const boardDetail = boardDetailObj
    ? {
        title: boardDetailObj.title,
        category: boardDetailObj.category,
        author: boardDetailObj.author,
        date: boardDetailObj.date,
        content: normalizePostContent(boardDetailObj.content),
        ...boardCoverFor(boardDetailObj.content),
        canEdit: !!(user && boardDetailObj.author === user.id),
        onClickAuthor: () => openUserProfile(boardDetailObj.author),
      }
    : null;

  const detailItemObj = detailId ? items.find((i) => i.id === detailId) : null;
  const detailAvgVal = detailItemObj ? avg(detailItemObj) : 0;
  const detailTracklist = useAlbumTracklist(detailItemObj?.itunesId, detailItemObj?.type);
  const detailRank = detailItemObj
    ? buildChartRows(detailItemObj.type).find((r) => r.id === detailItemObj.id)?.rank || null
    : null;
  const detail = detailItemObj
    ? {
        coverLabel: detailItemObj.type === 'song' ? 'SONG COVER' : 'ALBUM COVER',
        imageUrl: artworkFor(items, artworkMap, detailItemObj.id),
        typeLabel: detailItemObj.type === 'song' ? '곡' : '앨범',
        rank: detailRank,
        title: detailItemObj.title,
        artist: detailItemObj.artist,
        stars: starsStr(detailAvgVal),
        avgFixed: detailAvgVal.toFixed(1),
        ...ratingBadge(detailAvgVal),
        releaseDate: detailItemObj.releaseDate,
        genre: detailItemObj.genre || null,
        reviewCount: detailItemObj.reviews.length,
        tracklist: detailTracklist,
        reviews: [...detailItemObj.reviews]
          .sort(byNewestReview)
          .map((r) => ({
            id: r.id,
            rating: r.rating,
            starsStr: starsStr(r.rating),
            ...ratingBadge(r.rating),
            text: r.text,
            userId: r.userId,
            date: r.date,
            canEdit: !!(user && r.userId === user.id),
            onEdit: () => openEditReview(detailItemObj.id, r),
            onDelete: () => requestDeleteReview(detailItemObj.id, r.id, r.text),
            onClickAuthor: () => openUserProfile(r.userId),
          })),
      }
    : null;

  // 마이페이지 shows either the signed-in user's own page (myPageUserId unset) or
  // another author's public page (clicked from a review/post byline) — same layout,
  // but edit/delete and the admin approval panel only apply to your own page.
  const profileUserId = myPageUserId || (user ? user.id : null);
  const isOwnProfile = !!user && profileUserId === user.id;

  const myReviews = profileUserId
    ? items
        .flatMap((i) =>
          i.reviews
            .filter((r) => r.userId === profileUserId)
            .map((r) => ({
              id: r.id,
              itemId: i.id,
              itemType: i.type,
              itemTitle: i.title,
              itemArtist: i.artist,
              coverLabel: i.type === 'song' ? 'SONG COVER' : 'ALBUM COVER',
              imageUrl: artworkFor(items, artworkMap, i.id),
              ...typeBadge(i.type),
              rating: r.rating,
              starsStr: starsStr(r.rating),
              ...ratingBadge(r.rating),
              text: r.text,
              date: r.date,
              createdAt: r.createdAt,
              onOpenItem: () => openDetail(i.id),
              onEdit: isOwnProfile ? () => openEditReview(i.id, r) : null,
              onDelete: isOwnProfile ? () => requestDeleteReview(i.id, r.id, r.text) : null,
            }))
        )
        .sort((a, b) => b.rating - a.rating)
    : [];

  const myPosts = profileUserId
    ? posts
        .filter((p) => p.author === profileUserId)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          date: p.date,
          onEdit: isOwnProfile ? () => openEditPost(p) : null,
          onDelete: isOwnProfile ? () => requestDeletePost(p.id, p.title) : null,
        }))
    : [];

  const myGenreStats = profileUserId
    ? Object.entries(
        items.reduce((map, i) => {
          const genre = i.genre || '기타';
          i.reviews
            .filter((r) => r.userId === profileUserId)
            .forEach((r) => {
              if (!map[genre]) map[genre] = { count: 0, sum: 0 };
              map[genre].count += 1;
              map[genre].sum += r.rating;
            });
          return map;
        }, {})
      )
        .map(([genre, { count, sum }]) => ({ genre, count, avgFixed: (sum / count).toFixed(1) }))
        .sort((a, b) => b.count - a.count)
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
          가입 승인 대기 중이에요. 관리자가 승인하면 리뷰·게시글 작성이 가능해요.
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
          sectionPadH={sectionPadHWide}
          displayFont={displayFont}
          chartType={chartType}
          onSetChartType={setChartType}
          chartList={chartList}
        />
      )}

      {view === 'reviews' && (
        <ReviewsView
          sectionPadV={sectionPadV}
          sectionPadH={sectionPadHWide}
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
          sectionPadH={sectionPadHWide}
          displayFont={displayFont}
          boardDetail={boardDetail}
          onBoardBack={onBoardBack}
          onEditBoardDetail={() => boardDetailObj && openEditPost(boardDetailObj)}
          onDeleteBoardDetail={() => boardDetailObj && requestDeletePost(boardDetailObj.id, boardDetailObj.title)}
          boardFilter={boardFilter}
          onSetBoardFilter={setBoardFilter}
          boardList={boardList}
          onOpenPostFormNew={openPostFormNew}
          onOpenItem={openDetail}
        />
      )}

      {view === 'backoffice' && (
        <BackofficeView
          sectionPadV={sectionPadV}
          sectionPadH={sectionPadHWide}
          displayFont={displayFont}
          homeColGrid={homeColGrid}
          profileNickname={profileUserId}
          isOwnProfile={isOwnProfile}
          onLoginClick={onLoginClick}
          myReviews={myReviews}
          myPosts={myPosts}
          myGenreStats={myGenreStats}
          isAdmin={isOwnProfile && !!(user && user.isAdmin)}
          pendingUsers={pendingUsersRows}
        />
      )}

      {view === 'postForm' && (
        <PostFormModal
          sectionPadV={sectionPadV}
          sectionPadH={sectionPadHWide}
          displayFont={displayFont}
          title={editingPostId ? '게시글 수정' : '게시글 작성'}
          categoryInput={postCategoryInput}
          onCategoryChange={(e) => setPostCategoryInput(e.target.value)}
          titleInput={postTitleInput}
          onTitleChange={(e) => setPostTitleInput(e.target.value)}
          blocks={postBlocks}
          onBlockTextChange={updatePostBlockText}
          onRemoveBlock={removePostBlock}
          onAddItem={openPostItemSearch}
          onAddText={insertPostTextBlock}
          onSubmit={onSubmitPost}
          onClose={onClosePostForm}
        />
      )}

      <Footer />

      <DetailOverlay sectionPadV={sectionPadV} sectionPadH={sectionPadHWide} displayFont={displayFont} detail={detail} onClose={onCloseDetail} onWriteReview={() => openDetailReviewForm(detailId)} />

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
        title={editingReviewId ? '리뷰 수정' : '리뷰 작성'}
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

      <ItemSearchModal
        show={showPostItemSearch}
        entityType={postItemSearchType}
        onEntityChange={setPostItemSearchType}
        query={postItemSearchQuery}
        onQueryChange={setPostItemSearchQuery}
        results={postItemSearchResults}
        loading={postItemSearchLoading}
        error={postItemSearchError}
        onAdd={onPickPostItem}
        onClose={() => setShowPostItemSearch(false)}
      />

      <ConfirmModal
        show={!!pendingDelete}
        message={pendingDelete?.message}
        onConfirm={pendingDelete?.onConfirm}
        onCancel={cancelPendingDelete}
      />

    </div>
  );
}
