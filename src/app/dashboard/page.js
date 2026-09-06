"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useRouter
} from "next/navigation";

import {
  Cloud,
  FolderPlus,
  Upload,
  Search,
  Star,
  Clock3,
  Trash2,
  Share2,
  LogOut,
  Grid2X2,
  List,
  MoreVertical,
  Menu,
  Pencil,
  Download,
  RotateCcw,
  X,
  Folder,
  File,
  HardDrive,
  ChevronRight,
  Home,
  Users,
  Link2,
  Trash,
  ArrowUpDown,
  UserCircle,
  FileText,
  Eye,
  ImageIcon,
  Video,
  Music
} from "lucide-react";

import {
  useAuth
} from "../../context/AuthContext";

import UploadDropzone from "../../components/UploadDropzone";

import FileIcon from "../../components/FileIcon";

import {
  createFolder,
  deleteFile,
  deleteFolder,
  downloadFile,
  getDashboardSummary,
  getFile,
  getFolder,
  getReceivedShares,
  getRootChildren,
  getStarredFiles,
  getRecentFiles,
  getTrash,
  getTrashFolders,
  getUsage,
  permanentlyDeleteFile,
  permanentlyDeleteFolder,
  restoreFile,
  restoreFolder,
  searchFiles,
  starFile,
  unstarFile,
  starFolder,
unstarFolder,
getStarred,
  updateFile,
  updateFolder
} from "../../lib/api";


/* =========================================================
   HELPERS
========================================================= */

const formatBytes = (bytes) => {
  const value = Number(bytes || 0);

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(
      value /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    value /
    (1024 * 1024 * 1024)
  ).toFixed(2)} GB`;
};


const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );
};


const getSize = (file) => {
  return Number(
    file?.size_bytes ??
      file?.sizeBytes ??
      file?.size ??
      0
  );
};


const isDeleted = (file) => {
  return (
    file?.is_deleted === true ||
    file?.isDeleted === true
  );
};


const getInitials = (name) => {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0).toUpperCase()
    )
    .join("");
};


/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const router = useRouter();

  const {
    user,
    loading,
    logout
  } = useAuth();


  const [
    section,
    setSection
  ] = useState("drive");


  const [
    currentFolder,
    setCurrentFolder
  ] = useState(null);


  const [
    data,
    setData
  ] = useState({
    folders: [],
    files: [],
    path: []
  });


  const [
    usage,
    setUsage
  ] = useState(null);


  const [
    summary,
    setSummary
  ] = useState(null);


  const [
    search,
    setSearch
  ] = useState("");


  const [
    sort,
    setSort
  ] = useState("updated-desc");


  const [
    view,
    setView
  ] = useState("grid");


  const [
    loadingData,
    setLoadingData
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  const [
    modal,
    setModal
  ] = useState(null);


  const [
    selected,
    setSelected
  ] = useState(null);


  const [
    previewFile,
    setPreviewFile
  ] = useState(null);


  const [
    actionLoading,
    setActionLoading
  ] = useState(false);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen
  ] = useState(false);


  /* =======================================================
     AUTH REDIRECT
  ======================================================= */

  useEffect(() => {
    if (
      !loading &&
      !user
    ) {
      router.push("/login");
    }
  }, [
    loading,
    user,
    router
  ]);


  /* =======================================================
     LOAD DRIVE
  ======================================================= */

  const loadDrive = async () => {
    setLoadingData(true);
    setError("");

    try {
      if (currentFolder) {
        const result =
          await getFolder(
            currentFolder.id
          );

        setData({
          folders:
            result?.children?.folders ||
            [],
          files:
            result?.children?.files ||
            [],
          path:
            result?.path ||
            []
        });
      } else {
        const result =
          await getRootChildren();

        setData({
          folders:
            result?.folders ||
            [],
          files:
            result?.files ||
            [],
          path: []
        });
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to load files."
      );
    } finally {
      setLoadingData(false);
    }
  };


  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async () => {
    try {
      const [
        usageResult,
        summaryResult
      ] = await Promise.all([
        getUsage(),
        getDashboardSummary()
      ]);

      setUsage(
        usageResult
      );

      setSummary(
        summaryResult
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load dashboard."
      );
    }
  };


  useEffect(() => {
    if (
      user &&
      section === "drive"
    ) {
      loadDrive();
    }
  }, [
    user,
    currentFolder,
    section
  ]);


  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);


  /* =======================================================
     FOLDER NAVIGATION
  ======================================================= */

  const openFolder = (folder) => {
    setCurrentFolder(folder);
    setSection("drive");
  };


  const goHome = () => {
    setCurrentFolder(null);
    setSection("drive");
  };


  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshCurrent = async () => {
    if (section === "drive") {
      await loadDrive();
    }

    await loadDashboard();
  };


  /* =======================================================
     CREATE FOLDER
  ======================================================= */

  const handleCreateFolder = async () => {
    const name =
      window.prompt(
        "Enter folder name"
      );

    if (!name?.trim()) {
      return;
    }

    try {
      await createFolder(
        name.trim(),
        currentFolder?.id ||
          null
      );

      await refreshCurrent();
    } catch (err) {
      setError(
        err.message ||
          "Unable to create folder."
      );
    }
  };


  /* =======================================================
     RENAME
  ======================================================= */

  const handleRename = async (item) => {
    const name =
      window.prompt(
        "Enter new name",
        item.name
      );

    if (
      !name?.trim() ||
      name.trim() === item.name
    ) {
      return;
    }

    try {
      if (
        item.kind === "folder"
      ) {
        await updateFolder(
          item.id,
          {
            name: name.trim()
          }
        );
      } else {
        await updateFile(
          item.id,
          {
            name: name.trim()
          }
        );
      }

      await refreshCurrent();
    } catch (err) {
      setError(
        err.message ||
          "Unable to rename item."
      );
    }
  };


  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Move "${item.name}" to trash?`
      )
    ) {
      return;
    }

    try {
      if (
        item.kind === "folder"
      ) {
        await deleteFolder(
          item.id
        );
      } else {
        await deleteFile(
          item.id
        );
      }

      await refreshCurrent();
    } catch (err) {
      setError(
        err.message ||
          "Unable to move item to trash."
      );
    }
  };


  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const handleDownload = async (file) => {
    try {
      const result =
        await downloadFile(
          file.id
        );

      if (
        result?.downloadUrl
      ) {
        window.open(
          result.downloadUrl,
          "_blank"
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to download file."
      );
    }
  };


  /* =======================================================
     OPEN / PREVIEW FILE
  ======================================================= */

  const handleOpenFile = async (file) => {
    try {
      const result =
        await getFile(
          file.id
        );

      if (
        result?.signedUrl
      ) {
        setPreviewFile({
          ...file,
          ...(result.file || {}),
          signedUrl:
            result.signedUrl
        });
      } else {
        setError(
          "Preview URL was not available."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to open file."
      );
    }
  };


  const closePreview = () => {
    setPreviewFile(null);
  };


  /* =======================================================
     STAR / UNSTAR
  ======================================================= */

const handleStar = async (item) => {
  if (actionLoading) {
    return;
  }

  setActionLoading(true);

  const currentlyStarred =
    Boolean(item.starred);

  const isFolder =
    item.kind === "folder";

  try {
    if (currentlyStarred) {
      if (isFolder) {
        await unstarFolder(item.id);
      } else {
        await unstarFile(item.id);
      }

      if (section === "starred") {
        setData((current) => ({
          ...current,

          folders:
            current.folders.filter(
              (folder) =>
                folder.id !== item.id
            ),

          files:
            current.files.filter(
              (file) =>
                file.id !== item.id
            )
        }));
      } else {
        setData((current) => ({
          ...current,

          folders:
            current.folders.map(
              (folder) =>
                folder.id === item.id
                  ? {
                      ...folder,
                      starred: false
                    }
                  : folder
            ),

          files:
            current.files.map(
              (file) =>
                file.id === item.id
                  ? {
                      ...file,
                      starred: false
                    }
                  : file
            )
        }));
      }
    } else {
      if (isFolder) {
        await starFolder(item.id);
      } else {
        await starFile(item.id);
      }

      setData((current) => ({
        ...current,

        folders:
          current.folders.map(
            (folder) =>
              folder.id === item.id
                ? {
                    ...folder,
                    starred: true
                  }
                : folder
          ),

        files:
          current.files.map(
            (file) =>
              file.id === item.id
                ? {
                    ...file,
                    starred: true
                  }
                : file
          )
      }));
    }

    await loadDashboard();
  } catch (err) {
    setError(
      err.message ||
        "Unable to update star."
    );
  } finally {
    setActionLoading(false);
  }
};


  /* =======================================================
     SECTION LOADING
  ======================================================= */

  const showSection = async (name) => {
    setMobileSidebarOpen(false);
    setSection(name);
    setCurrentFolder(null);
    setError("");
    setLoadingData(true);

    try {
      /* ---------------------------------------------------
         MY DRIVE
      --------------------------------------------------- */

      if (
        name === "drive"
      ) {
        const result =
          await getRootChildren();

        setData({
          folders:
            result?.folders ||
            [],
          files:
            result?.files ||
            [],
          path: []
        });

        return;
      }


      /* ---------------------------------------------------
         TRASH
      --------------------------------------------------- */

      if (
  name === "trash"
) {
  const [
    fileTrashResult,
    folderTrashResult
  ] = await Promise.all([
    getTrash(),
    getTrashFolders()
  ]);

  const deletedFiles =
    (
      fileTrashResult?.files ||
      []
    ).filter(
      (file) =>
        isDeleted(file)
    );

  const deletedFolders =
    (
      folderTrashResult?.folders ||
      []
    ).filter(
      (folder) =>
        isDeleted(folder)
    );

  setData({
    folders:
      deletedFolders.map(
        (folder) => ({
          ...folder,
          kind: "folder"
        })
      ),

    files:
      deletedFiles.map(
        (file) => ({
          ...file,
          kind: "file",
          starred: false
        })
      ),

    path: []
  });

  return;
}


      /* ---------------------------------------------------
         STARRED
      --------------------------------------------------- */

      if (name === "starred") {
  const result =
    await getStarred();

  const starredFolders =
    (
      result?.folders ||
      []
    )
      .filter(
        (folder) =>
          !isDeleted(folder)
      )
      .map(
        (folder) => ({
          ...folder,
          kind: "folder",
          starred: true
        })
      );

  const starredFiles =
    (
      result?.files ||
      []
    )
      .filter(
        (file) =>
          !isDeleted(file)
      )
      .map(
        (file) => ({
          ...file,
          kind: "file",
          starred: true
        })
      );

  setData({
    folders: starredFolders,
    files: starredFiles,
    path: []
  });

  return;
}


      /* ---------------------------------------------------
         RECENT
      --------------------------------------------------- */

      if (
        name === "recent"
      ) {
        const result =
          await getRecentFiles();

        setData({
          folders: [],
          files:
            (
              result?.files ||
              []
            )
              .filter(
                (file) =>
                  !isDeleted(file)
              )
              .map(
                (file) => ({
                  ...file,
                  kind: "file"
                })
              ),
          path: []
        });

        return;
      }


      /* ---------------------------------------------------
         SHARED
      --------------------------------------------------- */

      if (
        name === "shared"
      ) {
        const result =
          await getReceivedShares();

        setData({
          folders: [],
          files:
            (
              result?.shares ||
              []
            ).map(
              (share) => ({
                ...share,
                id:
                  share.resource_id,
                name:
                  share.resource_name,
                kind:
                  share.resource_type,
                role:
                  share.role
              })
            ),
          path: []
        });

        return;
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to load section."
      );
    } finally {
      setLoadingData(false);
    }
  };


  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = async () => {
    const query =
      search.trim();

    if (!query) {
      await showSection(
        "drive"
      );

      return;
    }

    setLoadingData(true);
    setError("");

    try {
      const result =
        await searchFiles(
          query
        );

      setSection("search");
      setCurrentFolder(null);

      setData({
        folders:
          (
            result?.folders ||
            []
          ).map(
            (folder) => ({
              ...folder,
              kind: "folder"
            })
          ),

        files:
          (
            result?.files ||
            []
          )
            .filter(
              (file) =>
                !isDeleted(file)
            )
            .map(
              (file) => ({
                ...file,
                kind: "file"
              })
            ),

        path: []
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to search."
      );
    } finally {
      setLoadingData(false);
    }
  };


  /* =======================================================
     RESTORE
  ======================================================= */

  const handleRestore = async (item) => {
  try {
    if (item.kind === "folder") {
      await restoreFolder(
        item.id
      );
    } else {
      await restoreFile(
        item.id
      );
    }

    await showSection(
      "trash"
    );

    await loadDashboard();
  } catch (err) {
    setError(
      err.message ||
        "Unable to restore item."
    );
  }
};


  /* =======================================================
     PERMANENT DELETE
  ======================================================= */

  const handlePermanentDelete =
    async (file) => {
      if (
        !window.confirm(
          `Permanently delete "${file.name}"? This cannot be undone.`
        )
      ) {
        return;
      }

      try {
        await permanentlyDeleteFile(
          file.id
        );

        await showSection(
          "trash"
        );

        await loadDashboard();
      } catch (err) {
        setError(
          err.message ||
            "Unable to permanently delete file."
        );
      }
    };
    const handlePermanentDeleteFolder =
  async (folder) => {
    if (
      !window.confirm(
        `Permanently delete "${folder.name}" and everything inside it? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await permanentlyDeleteFolder(
        folder.id
      );

      await showSection(
        "trash"
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err.message ||
          "Unable to permanently delete folder."
      );
    }
  };

  /* =======================================================
     SORT
  ======================================================= */

  const sortedFolders =
    useMemo(() => {
      const folders =
        [
          ...(data?.folders || [])
        ];

      folders.sort(
        (a, b) => {
          if (
            sort === "name-asc"
          ) {
            return a.name.localeCompare(
              b.name
            );
          }

          if (
            sort === "name-desc"
          ) {
            return b.name.localeCompare(
              a.name
            );
          }

          const aDate =
            new Date(
              a.updated_at ||
                a.created_at ||
                0
            ).getTime();

          const bDate =
            new Date(
              b.updated_at ||
                b.created_at ||
                0
            ).getTime();

          if (
            sort === "updated-asc"
          ) {
            return aDate - bDate;
          }

          return bDate - aDate;
        }
      );

      return folders;
    }, [
      data.folders,
      sort
    ]);


  const sortedFiles =
    useMemo(() => {
      const files =
        [
          ...(data?.files || [])
        ];

      files.sort(
        (a, b) => {
          if (
            sort === "name-asc"
          ) {
            return a.name.localeCompare(
              b.name
            );
          }

          if (
            sort === "name-desc"
          ) {
            return b.name.localeCompare(
              a.name
            );
          }

          if (
            sort === "size-asc"
          ) {
            return (
              getSize(a) -
              getSize(b)
            );
          }

          if (
            sort === "size-desc"
          ) {
            return (
              getSize(b) -
              getSize(a)
            );
          }

          const aDate =
            new Date(
              a.updated_at ||
                a.created_at ||
                0
            ).getTime();

          const bDate =
            new Date(
              b.updated_at ||
                b.created_at ||
                0
            ).getTime();

          if (
            sort === "updated-asc"
          ) {
            return aDate - bDate;
          }

          return bDate - aDate;
        }
      );

      return files;
    }, [
      data.files,
      sort
    ]);


  /* =======================================================
     SECTION TITLE
  ======================================================= */

  const sectionTitle =
    section === "drive"
      ? currentFolder?.name ||
        "My Drive"
      : section === "shared"
        ? "Shared with me"
        : section === "starred"
          ? "Starred"
          : section === "recent"
            ? "Recent"
            : section === "trash"
              ? "Trash"
              : "Search";


  /* =======================================================
     USER DISPLAY
  ======================================================= */

  const userName =
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "CloudNest User";


  const usageBytes =
    Number(
      usage?.usedBytes ??
        usage?.used_bytes ??
        usage?.used ??
        0
    );


  const limitBytes =
    Number(
      usage?.limitBytes ??
        usage?.limit_bytes ??
        usage?.limit ??
        5 *
          1024 *
          1024 *
          1024
    );


  const usagePercentage =
    limitBytes > 0
      ? Math.min(
          100,
          Math.round(
            (usageBytes /
              limitBytes) *
              100
          )
        )
      : 0;


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await logout();
      router.push(
        "/login"
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to sign out."
      );
    }
  };


  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (
    loading ||
    !user
  ) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Cloud
              size={24}
              className="animate-pulse"
            />
          </div>

          <p className="text-sm text-slate-500">
            Loading CloudNest...
          </p>
        </div>
      </main>
    );
  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="flex min-h-screen">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-white border-r border-slate-200 p-5 transform transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >

          <div className="flex items-center justify-between gap-3 mb-8">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Cloud size={21} />
              </div>

              <div>
                <h1 className="font-bold text-lg">
                  CloudNest
                </h1>

                <p className="text-xs text-slate-500">
                  Cloud storage
                </p>
              </div>

            </div>


            <button
              onClick={() =>
                setMobileSidebarOpen(false)
              }
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>

          </div>


          <nav className="space-y-1">

            <SidebarButton
              active={
                section === "drive"
              }
              icon={
                <Home size={18} />
              }
              label="My Drive"
              onClick={() =>
                showSection(
                  "drive"
                )
              }
            />

            <SidebarButton
              active={
                section === "shared"
              }
              icon={
                <Users size={18} />
              }
              label="Shared with me"
              onClick={() =>
                showSection(
                  "shared"
                )
              }
            />

            <SidebarButton
              active={
                section === "starred"
              }
              icon={
                <Star size={18} />
              }
              label="Starred"
              onClick={() =>
                showSection(
                  "starred"
                )
              }
            />

            <SidebarButton
              active={
                section === "recent"
              }
              icon={
                <Clock3 size={18} />
              }
              label="Recent"
              onClick={() =>
                showSection(
                  "recent"
                )
              }
            />

            <SidebarButton
              active={
                section === "trash"
              }
              icon={
                <Trash2 size={18} />
              }
              label="Trash"
              onClick={() =>
                showSection(
                  "trash"
                )
              }
            />

          </nav>


          <div className="mt-auto">

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-4">

              <div className="flex items-center gap-3 mb-3">

                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                  {getInitials(
                    userName
                  )}
                </div>

                <div className="min-w-0">

                  <p className="font-medium truncate">
                    {userName}
                  </p>

                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>

                </div>

              </div>


              <div className="flex items-center justify-between text-xs mb-2">

                <span className="text-slate-500">
                  Storage
                </span>

                <span className="font-medium">
                  {usagePercentage}%
                </span>

              </div>

              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                <div
                  className="h-full bg-slate-900 rounded-full transition-all"
                  style={{
                    width:
                      `${usagePercentage}%`
                  }}
                />

              </div>

              <p className="text-xs text-slate-500 mt-2">
                {formatBytes(
                  usageBytes
                )}{" "}
                of{" "}
                {formatBytes(
                  limitBytes
                )}
              </p>

            </div>


            <button
              onClick={
                handleLogout
              }
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              <LogOut size={17} />
              Sign out
            </button>

          </div>

        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}

        {mobileSidebarOpen && (
          <button
            onClick={() =>
              setMobileSidebarOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close sidebar"
          />
        )}


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section className="flex-1 min-w-0">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">

            <button
              onClick={() =>
                setMobileSidebarOpen(true)
              }
              className="lg:hidden mb-3 w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">

                <div className="md:hidden w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Cloud
                    size={20}
                    className="text-white"
                  />
                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Welcome back
                  </p>

                  <h2 className="text-xl font-bold">
                    {user.name ||
                      "CloudNest User"}
                  </h2>

                </div>

              </div>


              <div className="flex items-center gap-2">

                <div className="flex-1 lg:w-96 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 shadow-sm">

                  <Search
                    size={18}
                    className="text-slate-400 flex-shrink-0"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleSearch();
                      }
                    }}
                    placeholder="Search files and folders..."
                    className="w-full py-2.5 outline-none text-sm"
                  />

                </div>

                <button
                  onClick={
                    handleSearch
                  }
                  className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
                >
                  Search
                </button>

              </div>

            </div>

          </header>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">

                <span>
                  {error}
                </span>

                <button
                  onClick={() =>
                    setError("")
                  }
                  className="p-1 rounded-lg hover:bg-red-100"
                >
                  <X size={17} />
                </button>

              </div>
            )}


            {/* HEADING */}

            <div className="mb-6">

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                <div>

                  <h1 className="text-2xl font-bold">
                    {sectionTitle}
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    {section === "trash"
                      ? "Files and Folders you have deleted"
                      : section === "starred"
                        ? "Your starred files"
                        : section === "recent"
                          ? "Your recently updated files"
                          : section === "shared"
                            ? "Files shared with you"
                            : section === "search"
                              ? "Matching files and folders"
                              : "Manage your files and folders"}
                  </p>

                </div>


                <div className="flex items-center gap-2 flex-wrap">

                  {/* SORT */}

                  <div className="relative">

                    <ArrowUpDown
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />

                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(
                          event.target.value
                        )
                      }
                      className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none hover:bg-slate-50 cursor-pointer"
                    >

                      <option value="updated-desc">
                        Newest
                      </option>

                      <option value="updated-asc">
                        Oldest
                      </option>

                      <option value="name-asc">
                        Name: A → Z
                      </option>

                      <option value="name-desc">
                        Name: Z → A
                      </option>

                      <option value="size-asc">
                        Size: Small → Large
                      </option>

                      <option value="size-desc">
                        Size: Large → Small
                      </option>

                    </select>

                  </div>


                  {/* NEW FOLDER */}

                  {section === "drive" && (
                    <button
                      onClick={
                        handleCreateFolder
                      }
                      className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
                    >
                      <FolderPlus
                        size={17}
                      />
                      New
                    </button>
                  )}


                  {/* VIEW */}

                  <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden">

                    <button
                      onClick={() =>
                        setView(
                          "grid"
                        )
                      }
                      className={`p-2.5 ${
                        view === "grid"
                          ? "bg-slate-900 text-white"
                          : "hover:bg-slate-50"
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid2X2
                        size={18}
                      />
                    </button>


                    <button
                      onClick={() =>
                        setView(
                          "list"
                        )
                      }
                      className={`p-2.5 ${
                        view === "list"
                          ? "bg-slate-900 text-white"
                          : "hover:bg-slate-50"
                      }`}
                      aria-label="List view"
                    >
                      <List
                        size={18}
                      />
                    </button>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                BREADCRUMBS
            ================================================= */}

            {section === "drive" && (
              <div className="mb-5 flex items-center gap-2 text-sm text-slate-500 overflow-x-auto">

                <button
                  onClick={
                    goHome
                  }
                  className="font-medium hover:text-slate-900 whitespace-nowrap"
                >
                  My Drive
                </button>

                {data.path.map(
                  (item) => (
                    <span
                      key={
                        item.id
                      }
                      className="flex items-center gap-2 whitespace-nowrap"
                    >

                      <ChevronRight
                        size={15}
                      />

                      <button
                        onClick={() =>
                          setCurrentFolder(
                            item
                          )
                        }
                        className="hover:text-slate-900"
                      >
                        {item.name}
                      </button>

                    </span>
                  )
                )}

              </div>
            )}


            {/* =================================================
                UPLOAD
            ================================================= */}

            {section === "drive" && (
              <div className="mb-8">

                <UploadDropzone
                  folderId={
                    currentFolder?.id ||
                    null
                  }
                  onUploaded={
                    refreshCurrent
                  }
                />

              </div>
            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loadingData ? (
              <div className="py-20 text-center">

                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                  <Cloud
                    size={20}
                    className="animate-pulse"
                  />
                </div>

                <p className="text-slate-500">
                  Loading files...
                </p>

              </div>
            ) : (
              <>

                {/* =================================================
                    FOLDERS
                ================================================= */}

                {sortedFolders.length > 0 && (
                  <section className="mb-8">

                    <div className="flex items-center justify-between mb-3">

                      <h3 className="font-semibold text-lg">
                        Folders
                      </h3>

                      <span className="text-xs text-slate-500">
                        {sortedFolders.length}{" "}
                        {sortedFolders.length === 1
                          ? "folder"
                          : "folders"}
                      </span>

                    </div>


                    {/* ===============================
                        GRID FOLDERS
                    =============================== */}

                    {view === "grid" ? (

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                        {sortedFolders.map(
                          (folder) => (
                            <div
                              key={
                                folder.id
                              }
                              className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 hover:shadow-sm transition"
                            >

                              <button
  onClick={() => {
    if (section !== "trash") {
      openFolder(
        folder
      );
    }
  }}
  className="w-full text-left"
>

                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                                  <Folder
                                    size={25}
                                  />
                                </div>

                                <p className="font-semibold truncate">
                                  {
                                    folder.name
                                  }
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                  Updated{" "}
                                  {formatDate(
                                    folder.updated_at ||
                                      folder.created_at
                                  )}
                                </p>

                              </button>


                              <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-slate-100">

  {section === "trash" ? (

    <>
      <button
        onClick={() =>
          handleRestore({
            ...folder,
            kind: "folder"
          })
        }
        className="p-2 rounded-lg hover:bg-slate-100"
        title="Restore"
      >
        <RotateCcw size={16} />
      </button>

      <button
        onClick={() =>
          handlePermanentDeleteFolder(
            folder
          )
        }
        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
        title="Delete permanently"
      >
        <Trash size={16} />
      </button>
    </>

  ) : (

    <>
      <button
  onClick={() =>
    handleStar({
      ...folder,
      kind: "folder"
    })
  }
  className="p-2 rounded-lg hover:bg-slate-100"
  title={
    folder.starred
      ? "Unstar"
      : "Star"
  }
>
  <Star
    size={16}
    fill={
      folder.starred
        ? "currentColor"
        : "none"
    }
  />
</button>
      <button
        onClick={() =>
          handleRename({
            ...folder,
            kind: "folder"
          })
        }
        className="p-2 rounded-lg hover:bg-slate-100"
        title="Rename"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={() =>
          handleDelete({
            ...folder,
            kind: "folder"
          })
        }
        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
        title="Move to trash"
      >
        <Trash size={16} />
      </button>
    </>

  )}

</div>

                            </div>
                          )
                        )}

                      </div>

                    ) : (

                      /* ===============================
                         LIST FOLDERS
                      =============================== */

                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                        <div className="hidden sm:grid grid-cols-[minmax(220px,1fr)_130px_160px_48px] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">

                          <span>
                            Name
                          </span>

                          <span>
                            Type
                          </span>

                          <span>
                            Modified
                          </span>

                          <span />

                        </div>


                        {sortedFolders.map(
                          (folder) => (
                            <div
                              key={
                                folder.id
                              }
                              className="grid grid-cols-[minmax(0,1fr)_48px] sm:grid-cols-[minmax(220px,1fr)_130px_160px_48px] gap-4 items-center px-4 sm:px-5 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
                            >

                              <button
  onClick={() => {
    if (section !== "trash") {
      openFolder(
        folder
      );
    }
  }}
  className="flex items-center gap-3 min-w-0 text-left"
>

                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">

                                  <Folder
                                    size={19}
                                  />

                                </div>

                                <span className="font-medium truncate">
                                  {
                                    folder.name
                                  }
                                </span>

                              </button>


                              <span className="hidden sm:block text-sm text-slate-500">
                                Folder
                              </span>


                              <span className="hidden sm:block text-sm text-slate-500">
                                {formatDate(
                                  folder.updated_at ||
                                    folder.created_at
                                )}
                              </span>


                              <button
                                onClick={() =>
                                  setSelected({
                                    ...folder,
                                    kind: "folder"
                                  })
                                }
                                className="justify-self-end p-2 rounded-lg hover:bg-slate-100"
                                title="More options"
                                aria-label={`More options for ${folder.name}`}
                              >
                                <MoreVertical
                                  size={18}
                                />
                              </button>

                            </div>
                          )
                        )}

                      </div>

                    )}

                  </section>
                )}


                {/* =================================================
                    FILES
                ================================================= */}

                {sortedFiles.length > 0 && (
                  <section>

                    <div className="flex items-center justify-between mb-3">

                      <h3 className="font-semibold text-lg">
                        {section === "trash"
                          ? "Deleted files"
                          : "Files"}
                      </h3>

                      <span className="text-xs text-slate-500">
                        {sortedFiles.length}{" "}
                        {sortedFiles.length === 1
                          ? "file"
                          : "files"}
                      </span>

                    </div>


                    {/* =================================================
                        GRID FILES
                    ================================================= */}

                    {view === "grid" ? (

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                        {sortedFiles.map(
                          (file) => (
                            <div
                              key={
                                file.id
                              }
                              className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 hover:shadow-sm transition"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <button
                                  onClick={() =>
                                    section === "trash"
                                      ? null
                                      : handleOpenFile(
                                          file
                                        )
                                  }
                                  className="flex items-center gap-3 min-w-0 text-left flex-1"
                                >

                                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">

                                    <FileIcon
                                      type={
                                        file.mime_type
                                      }
                                    />

                                  </div>


                                  <div className="min-w-0">

                                    <p className="font-semibold truncate">
                                      {
                                        file.name
                                      }
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                      {formatBytes(
                                        getSize(
                                          file
                                        )
                                      )}
                                    </p>

                                  </div>

                                </button>


                                <button
                                  onClick={() =>
                                    setSelected({
                                      ...file,
                                      kind: "file"
                                    })
                                  }
                                  className="p-2 rounded-lg hover:bg-slate-100 flex-shrink-0"
                                  title="More options"
                                >
                                  <MoreVertical
                                    size={17}
                                  />
                                </button>

                              </div>


                              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">

                                <span className="text-xs text-slate-500">
                                  {formatDate(
                                    file.updated_at ||
                                      file.created_at
                                  )}
                                </span>


                                <div className="flex items-center gap-1">

                                  {section !== "trash" && (
                                    <button
                                      onClick={() =>
                                        handleStar(
                                          file
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                      className={`p-2 rounded-lg hover:bg-slate-100 ${
                                        file.starred
                                          ? "text-slate-900"
                                          : "text-slate-400"
                                      }`}
                                      title={
                                        file.starred
                                          ? "Unstar"
                                          : "Star"
                                      }
                                    >
                                      <Star
                                        size={17}
                                        fill={
                                          file.starred
                                            ? "currentColor"
                                            : "none"
                                        }
                                      />
                                    </button>
                                  )}


                                  {section === "trash" ? (

                                    <>
                                      <button
                                        onClick={() =>
                                          handleRestore(
                                            file
                                          )
                                        }
                                        className="p-2 rounded-lg hover:bg-slate-100"
                                        title="Restore"
                                      >
                                        <RotateCcw
                                          size={17}
                                        />
                                      </button>

                                      <button
                                        onClick={() =>
                                          handlePermanentDelete(
                                            file
                                          )
                                        }
                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                        title="Delete permanently"
                                      >
                                        <Trash
                                          size={17}
                                        />
                                      </button>
                                    </>

                                  ) : (

                                    <>
                                      <button
                                        onClick={() =>
                                          handleOpenFile(
                                            file
                                          )
                                        }
                                        className="p-2 rounded-lg hover:bg-slate-100"
                                        title="Open"
                                      >
                                        <Eye
                                          size={17}
                                        />
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDownload(
                                            file
                                          )
                                        }
                                        className="p-2 rounded-lg hover:bg-slate-100"
                                        title="Download"
                                      >
                                        <Download
                                          size={17}
                                        />
                                      </button>

                                    </>

                                  )}

                                </div>

                              </div>

                            </div>
                          )
                        )}

                      </div>

                    ) : (

                      /* =================================================
                          LIST FILES
                      ================================================= */

                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                        {/* HEADER */}

                        <div className="hidden sm:grid grid-cols-[minmax(220px,1fr)_120px_120px_160px_48px] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">

                          <span>
                            Name
                          </span>

                          <span>
                            Type
                          </span>

                          <span>
                            Size
                          </span>

                          <span>
                            Modified
                          </span>

                          <span />

                        </div>


                        {/* ROWS */}

                        {sortedFiles.map(
                          (file) => (
                            <div
                              key={
                                file.id
                              }
                              className="grid grid-cols-[minmax(0,1fr)_48px] sm:grid-cols-[minmax(220px,1fr)_120px_120px_160px_48px] gap-4 items-center px-4 sm:px-5 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
                            >

                              {/* NAME */}

                              <button
                                onClick={() =>
                                  section === "trash"
                                    ? null
                                    : handleOpenFile(
                                        file
                                      )
                                }
                                className="flex items-center gap-3 min-w-0 text-left"
                              >

                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">

                                  <FileIcon
                                    type={
                                      file.mime_type
                                    }
                                    size={19}
                                  />

                                </div>


                                <div className="min-w-0">

                                  <p className="font-medium truncate">
                                    {
                                      file.name
                                    }
                                  </p>

                                  <p className="sm:hidden text-xs text-slate-500 mt-0.5">
                                    {formatBytes(
                                      getSize(
                                        file
                                      )
                                    )}
                                  </p>

                                </div>

                              </button>


                              {/* TYPE */}

                              <span className="hidden sm:block text-sm text-slate-500 truncate">
                                {file.mime_type ||
                                  "File"}
                              </span>


                              {/* SIZE */}

                              <span className="hidden sm:block text-sm text-slate-500">
                                {formatBytes(
                                  getSize(
                                    file
                                  )
                                )}
                              </span>


                              {/* MODIFIED */}

                              <span className="hidden sm:block text-sm text-slate-500">
                                {formatDate(
                                  file.updated_at ||
                                    file.created_at
                                )}
                              </span>


                              {/* ONLY ACTION IN LIST */}

                              <button
                                onClick={() =>
                                  setSelected({
                                    ...file,
                                    kind: "file"
                                  })
                                }
                                className="justify-self-end p-2 rounded-lg hover:bg-slate-100"
                                title="More options"
                                aria-label={`More options for ${file.name}`}
                              >

                                <MoreVertical
                                  size={18}
                                />

                              </button>

                            </div>
                          )
                        )}

                      </div>

                    )}

                  </section>
                )}


                {/* =================================================
                    EMPTY
                ================================================= */}

                {sortedFolders.length === 0 &&
                  sortedFiles.length === 0 && (
                    <div className="py-20 text-center">

                      <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-5">

                        {section === "trash" ? (
                          <Trash2
                            size={28}
                            className="text-slate-400"
                          />
                        ) : section === "starred" ? (
                          <Star
                            size={28}
                            className="text-slate-400"
                          />
                        ) : section === "recent" ? (
                          <Clock3
                            size={28}
                            className="text-slate-400"
                          />
                        ) : section === "search" ? (
                          <Search
                            size={28}
                            className="text-slate-400"
                          />
                        ) : (
                          <FileText
                            size={28}
                            className="text-slate-400"
                          />
                        )}

                      </div>


                      <h3 className="font-semibold text-lg">

                        {section === "trash"
                          ? "Trash is empty"
                          : section === "starred"
                            ? "No starred files"
                            : section === "recent"
                              ? "No recent files"
                              : section === "search"
                                ? "No matching files or folders"
                                : "Nothing here yet"}

                      </h3>


                      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">

                        {section === "trash"
                          ? "Files you delete will appear here."
                          : section === "starred"
                            ? "Star important files to find them quickly."
                            : section === "recent"
                              ? "Recently updated files will appear here."
                              : section === "search"
                                ? "Try another search term."
                                : "Upload a file or create a folder to get started."}

                      </p>

                    </div>
                  )}

              </>
            )}

          </div>

        </section>

      </div>


      {/* =====================================================
          ITEM ACTION MODAL
      ===================================================== */}

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() =>
            setSelected(null)
          }
        >

          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-center justify-between mb-5">

              <div>

                <p className="text-xs text-slate-500">
                  {selected.kind === "folder"
                    ? "Folder actions"
                    : section === "trash"
                      ? "Trash actions"
                      : "File actions"}
                </p>

                <h3 className="font-semibold text-lg mt-1">
                  {selected.kind === "folder"
                    ? "Manage folder"
                    : section === "trash"
                      ? "Manage deleted file"
                      : "Manage file"}
                </h3>

              </div>


              <button
                onClick={() =>
                  setSelected(null)
                }
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>


            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">

                  {selected.kind === "folder" ? (
                    <Folder size={20} />
                  ) : (
                    <FileIcon
                      type={
                        selected.mime_type
                      }
                      size={20}
                    />
                  )}

                </div>


                <div className="min-w-0">

                  <p className="font-semibold break-all">
                    {selected.name}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {selected.kind === "folder"
                      ? "Folder"
                      : formatBytes(
                          getSize(
                            selected
                          )
                        )}
                  </p>

                </div>

              </div>

            </div>


            <div className="space-y-1 mt-5">

              {/* ===========================
                  TRASH ACTIONS
              =========================== */}

              {section === "trash" &&
              selected.kind !== "folder" ? (

                <>

                  <ModalAction
                    icon={
                      <RotateCcw
                        size={18}
                      />
                    }
                    label="Restore"
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      handleRestore(
                        file
                      );
                    }}
                  />


                  <ModalAction
                    icon={
                      <Trash2
                        size={18}
                      />
                    }
                    label="Delete permanently"
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      handlePermanentDelete(
                        file
                      );
                    }}
                    danger
                  />

                </>

              ) : selected.kind === "folder" ? (

                /* ===========================
     FOLDER ACTIONS
  =========================== */

  section === "trash" ? (

    <>

      <ModalAction
        icon={
          <RotateCcw
            size={18}
          />
        }
        label="Restore"
        onClick={async () => {
          const folder =
            selected;

          setSelected(null);

          try {
            await restoreFolder(
              folder.id
            );

            await showSection(
              "trash"
            );

            await loadDashboard();
          } catch (err) {
            setError(
              err.message ||
                "Unable to restore folder."
            );
          }
        }}
      />
      

      <ModalAction
  icon={
    <Trash2
      size={18}
    />
  }
  label="Delete permanently"
  onClick={() => {
    const folder =
      selected;

    setSelected(null);

    handlePermanentDeleteFolder(
      folder
    );
  }}
  danger
/>

    </>

  ) : (

    <>

      <ModalAction
        icon={
          <Folder
            size={18}
          />
        }
        label="Open folder"
        onClick={() => {
          const folder =
            selected;

          setSelected(null);

          openFolder(
            folder
          );
        }}
      />
<ModalAction
  icon={
    <Star
      size={18}
    />
  }
  label={
    selected.starred
      ? "Unstar"
      : "Star"
  }
  onClick={() => {
    const folder =
      selected;

    setSelected(null);

    handleStar({
      ...folder,
      kind: "folder"
    });
  }}
/>
      <ModalAction
        icon={
          <Pencil
            size={18}
          />
        }
        label="Rename"
        onClick={() => {
          const folder =
            selected;

          setSelected(null);

          handleRename({
            ...folder,
            kind: "folder"
          });
        }}
      />
      <ModalAction
  icon={
    <Share2
      size={18}
    />
  }
  label="Share with user"
  onClick={() => {
    const folder =
      selected;

    setSelected(null);

    setModal({
      type: "share",
      resource: {
        ...folder,
        kind: "folder"
      }
    });
  }}
/>

<ModalAction
  icon={
    <Link2
      size={18}
    />
  }
  label="Create share link"
  onClick={() => {
    const folder =
      selected;

    setSelected(null);

    setModal({
      type: "link",
      resource: {
        ...folder,
        kind: "folder"
      }
    });
  }}
/>

      <ModalAction
        icon={
          <Trash2
            size={18}
          />
        }
        label="Move to trash"
        onClick={() => {
          const folder =
            selected;

          setSelected(null);

          handleDelete({
            ...folder,
            kind: "folder"
          });
        }}
        danger
      />

    </>

  )

) : (

                /* ===========================
                   NORMAL FILE ACTIONS
                =========================== */

                <>

                  <ModalAction
                    icon={
                      <Eye size={18} />
                    }
                    label="Open / Preview"
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      handleOpenFile(
                        file
                      );
                    }}
                  />


                  <ModalAction
                    icon={
                      <Download
                        size={18}
                      />
                    }
                    label="Download"
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      handleDownload(
                        file
                      );
                    }}
                  />


                  <ModalAction
                    icon={
                      <Star
                        size={18}
                      />
                    }
                    label={
                      selected.starred
                        ? "Unstar"
                        : "Star"
                    }
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      handleStar(
                        file
                      );
                    }}
                  />


                  <ModalAction
                    icon={
                      <Pencil
                        size={18}
                      />
                    }
                    label="Rename"
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      handleRename({
                        ...file,
                        kind: "file"
                      });
                    }}
                  />


                  <ModalAction
                    icon={
                      <Share2
                        size={18}
                      />
                    }
                    label="Share with user"
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      setModal({
                        type: "share",
                        resource:
                          file
                      });
                    }}
                  />


                  <ModalAction
                    icon={
                      <Link2
                        size={18}
                      />
                    }
                    label="Create share link"
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      setModal({
                        type: "link",
                        resource:
                          file
                      });
                    }}
                  />


                  <ModalAction
                    icon={
                      <Trash2
                        size={18}
                      />
                    }
                    label="Move to trash"
                    onClick={() => {
                      const file =
                        selected;

                      setSelected(null);

                      handleDelete({
                        ...file,
                        kind: "file"
                      });
                    }}
                    danger
                  />

                </>

              )}

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          SHARE MODAL
      ===================================================== */}

      {modal && (
        <ShareModal
          modal={
            modal
          }
          onClose={() =>
            setModal(
              null
            )
          }
        />
      )}


      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {previewFile && (
        <FilePreviewModal
          file={
            previewFile
          }
          onClose={
            closePreview
          }
          onDownload={() =>
            handleDownload(
              previewFile
            )
          }
        />
      )}

    </main>
  );
}


/* =========================================================
   SIDEBAR BUTTON
========================================================= */

function SidebarButton({
  active,
  icon,
  label,
  onClick
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >

      {icon}

      <span>
        {label}
      </span>

    </button>
  );
}


/* =========================================================
   MODAL ACTION
========================================================= */

function ModalAction({
  icon,
  label,
  onClick,
  danger = false
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "hover:bg-slate-100"
      }`}
    >

      {icon}

      {label}

    </button>
  );
}


/* =========================================================
   SHARE MODAL
========================================================= */

function ShareModal({
  modal,
  onClose
}) {
  const [
    email,
    setEmail
  ] = useState("");


  const [
    role,
    setRole
  ] = useState("viewer");


  const [
    password,
    setPassword
  ] = useState("");


  const [
    expiresAt,
    setExpiresAt
  ] = useState("");


  const [
    result,
    setResult
  ] = useState("");


  const [
    error,
    setError
  ] = useState("");


  const [
    submitting,
    setSubmitting
  ] = useState(false);


  const handleShare = async () => {
    try {
      setError("");
      setResult("");
      setSubmitting(true);


      if (
        modal.type === "link"
      ) {
        const {
          createLinkShare
        } = await import(
          "../../lib/api"
        );

        const data =
          await createLinkShare({
            resourceType:
  modal.resource.kind === "folder"
    ? "folder"
    : "file",
            resourceId:
              modal.resource.id,
            expiresAt:
              expiresAt ||
              null,
            password:
              password ||
              null
          });


        const fullUrl =
          `${window.location.origin}${data.url}`;


        setResult(
          fullUrl
        );

        return;
      }


      if (
        !email.trim()
      ) {
        setError(
          "Enter a user email address."
        );

        return;
      }


      const {
        createShare,
        findUser
      } = await import(
        "../../lib/api"
      );


      const found =
        await findUser(
          email.trim()
        );


      if (
        !found?.user
      ) {
        setError(
          "User not found."
        );

        return;
      }


      await createShare({
  resourceType:
    modal.resource.kind === "folder"
      ? "folder"
      : "file",
  resourceId:
    modal.resource.id,
  granteeUserId:
    found.user.id,
  role
});


      setResult(
        "Resource shared successfully."
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to share file."
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >

      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="flex items-center justify-between mb-5">

          <div>

            <p className="text-xs text-slate-500">
              {modal.type === "link"
  ? "Sharing"
  : modal.resource?.kind === "folder"
    ? "Folder sharing"
    : "File sharing"}
            </p>

            <h3 className="font-semibold text-lg mt-1">
              {modal.type === "link"
  ? "Create share link"
  : modal.resource?.kind === "folder"
    ? "Share folder"
    : "Share file"}
            </h3>

          </div>


          <button
            onClick={
              onClose
            }
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={19} />
          </button>

        </div>


        {modal.type === "share" ? (
          <>

            <label className="block text-sm font-medium mb-2">
              User email
            </label>

            <input
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="user@example.com"
              type="email"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />


            <label className="block text-sm font-medium mt-4 mb-2">
              Permission
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value
                )
              }
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
            >

              <option value="viewer">
                Viewer
              </option>

              <option value="editor">
                Editor
              </option>

            </select>

          </>
        ) : (
          <>

            <label className="block text-sm font-medium mb-2">
              Optional password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Leave empty for no password"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />


            <label className="block text-sm font-medium mt-4 mb-2">
              Optional expiry
            </label>

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(event) =>
                setExpiresAt(
                  event.target.value
                )
              }
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
            />

          </>
        )}


        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-3">
            {error}
          </div>
        )}


        {result && (
          <div className="mt-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-3 break-all">

            <p className="font-medium mb-2">
              {result.includes("http")
                ? "Share link created:"
                : "Success"}
            </p>

            <p>
              {result}
            </p>


            {result.includes(
              "http"
            ) && (
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    result
                  );

                  setResult(
                    `${result}\n\nCopied to clipboard.`
                  );
                }}
                className="mt-3 px-3 py-2 rounded-lg bg-white border border-green-200 text-green-700 text-xs font-medium"
              >
                Copy link
              </button>
            )}

          </div>
        )}


        <button
          onClick={
            handleShare
          }
          disabled={
            submitting
          }
          className="w-full mt-5 rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {submitting
            ? "Working..."
            : modal.type === "link"
  ? "Create link"
  : modal.resource?.kind === "folder"
    ? "Share folder"
    : "Share file"}
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   FILE PREVIEW MODAL
========================================================= */

function FilePreviewModal({
  file,
  onClose,
  onDownload
}) {
  const mime =
    file?.mime_type ||
    file?.mimeType ||
    "";


  const url =
    file?.signedUrl;


  const isImage =
    mime.startsWith(
      "image/"
    );


  const isVideo =
    mime.startsWith(
      "video/"
    );


  const isAudio =
    mime.startsWith(
      "audio/"
    );


  const isPdf =
    mime ===
    "application/pdf";


  const isText =
    mime.startsWith(
      "text/"
    ) ||
    mime ===
      "application/json" ||
    mime ===
      "application/javascript";


  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >

      <div
        className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">

              {isImage ? (
                <ImageIcon size={19} />
              ) : isVideo ? (
                <Video size={19} />
              ) : isAudio ? (
                <Music size={19} />
              ) : isPdf ? (
                <FileText size={19} />
              ) : (
                <File size={19} />
              )}

            </div>


            <div className="min-w-0">

              <h3 className="font-semibold truncate">
                {file.name}
              </h3>

              <p className="text-xs text-slate-500">
                {formatBytes(
                  getSize(file)
                )}
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2 flex-shrink-0">

            <button
              onClick={
                onDownload
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
            >
              <Download
                size={16}
              />

              Download
            </button>


            <button
              onClick={
                onClose
              }
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>

          </div>

        </div>


        {/* CONTENT */}

        <div className="flex-1 overflow-auto bg-slate-100 min-h-[400px] flex items-center justify-center p-4">

          {!url ? (
            <PreviewUnavailable
              onDownload={
                onDownload
              }
            />
          ) : isImage ? (
            <img
              src={url}
              alt={file.name}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
          ) : isVideo ? (
            <video
              src={url}
              controls
              className="max-w-full max-h-[75vh] rounded-lg"
            />
          ) : isAudio ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200">

              <Music
                size={50}
                className="mx-auto mb-5"
              />

              <p className="font-semibold text-center mb-5">
                {file.name}
              </p>

              <audio
                src={url}
                controls
              />

            </div>
          ) : isPdf ? (
            <iframe
              src={url}
              title={file.name}
              className="w-full h-[75vh] rounded-lg bg-white"
            />
          ) : isText ? (
            <iframe
              src={url}
              title={file.name}
              className="w-full h-[75vh] rounded-lg bg-white"
            />
          ) : (
            <PreviewUnavailable
              onDownload={
                onDownload
              }
            />
          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PREVIEW UNAVAILABLE
========================================================= */

function PreviewUnavailable({
  onDownload
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md">

      <File
        size={42}
        className="mx-auto mb-4 text-slate-400"
      />

      <h3 className="font-semibold text-lg">
        Preview not available
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        This file type cannot be previewed directly in CloudNest.
      </p>


      {onDownload && (
        <button
          onClick={
            onDownload
          }
          className="mt-5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          Download file
        </button>
      )}

    </div>
  );
}