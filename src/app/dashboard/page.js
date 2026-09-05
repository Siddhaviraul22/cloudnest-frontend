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
  ArrowUpDown
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
  getUsage,
  permanentlyDeleteFile,
  restoreFile,
  restoreFolder,
  searchFiles,
  starFile,
  unstarFile,
  updateFile,
  updateFolder
} from "../../lib/api";

const formatBytes = (
  bytes
) => {
  const value = Number(bytes || 0);

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  if (
    value <
    1024 * 1024 * 1024
  ) {
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

const formatDate = (
  date
) =>
  new Date(date).toLocaleDateString();

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
  ] = useState("updated");

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
            result.children.folders,
          files:
            result.children.files,
          path:
            result.path
        });
      } else {
        const result =
          await getRootChildren();

        setData({
          folders:
            result.folders,
          files:
            result.files,
          path: []
        });
      }
    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setLoadingData(false);
    }
  };

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
        err.message
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

  const openFolder = (
    folder
  ) => {
    setCurrentFolder(
      folder
    );

    setSection(
      "drive"
    );
  };

  const goHome = () => {
    setCurrentFolder(
      null
    );

    setSection(
      "drive"
    );
  };

  const refreshCurrent = async () => {
    if (
      section === "drive"
    ) {
      await loadDrive();
    }

    await loadDashboard();
  };

  const handleCreateFolder =
    async () => {
      const name =
        window.prompt(
          "Folder name"
        );

      if (!name) {
        return;
      }

      try {
        await createFolder(
          name,
          currentFolder?.id ||
            null
        );

        await refreshCurrent();
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  const handleRename =
    async (item) => {
      const name =
        window.prompt(
          "New name",
          item.name
        );

      if (
        !name ||
        name === item.name
      ) {
        return;
      }

      try {
        if (
          item.kind ===
          "folder"
        ) {
          await updateFolder(
            item.id,
            {
              name
            }
          );
        } else {
          await updateFile(
            item.id,
            {
              name
            }
          );
        }

        await refreshCurrent();
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  const handleDelete =
    async (item) => {
      if (
        !window.confirm(
          `Move "${item.name}" to trash?`
        )
      ) {
        return;
      }

      try {
        if (
          item.kind ===
          "folder"
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
          err.message
        );
      }
    };

  const handleDownload =
    async (file) => {
      try {
        const result =
          await downloadFile(
            file.id
          );

        window.open(
          result.downloadUrl,
          "_blank"
        );
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  const handleStar =
    async (file) => {
      try {
        if (file.starred) {
          await unstarFile(
            file.id
          );
        } else {
          await starFile(
            file.id
          );
        }

        await refreshCurrent();
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  const showSection =
    async (name) => {
      setSection(
        name
      );

      setCurrentFolder(
        null
      );

      setError("");

      try {
        if (
          name === "trash"
        ) {
          const result =
            await getTrash();

          setData({
            folders: [],
            files:
              result.files.map(
                (file) => ({
                  ...file,
                  kind: "file"
                })
              ),
            path: []
          });
        }

        if (
          name === "starred"
        ) {
          const result =
            await getStarredFiles();

          setData({
            folders: [],
            files:
              result.files.map(
                (file) => ({
                  ...file,
                  kind: "file"
                })
              ),
            path: []
          });
        }

        if (
          name === "recent"
        ) {
          const result =
            await getRecentFiles();

          setData({
            folders: [],
            files:
              result.files.map(
                (file) => ({
                  ...file,
                  kind: "file"
                })
              ),
            path: []
          });
        }

        if (
          name === "shared"
        ) {
          const result =
            await getReceivedShares();

          setData({
            folders: [],
            files:
              result.shares.map(
                (share) => ({
                  ...share,
                  id: share.resource_id,
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
        }
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  const handleSearch =
    async () => {
      if (!search.trim()) {
        showSection(
          "drive"
        );
        return;
      }

      try {
        const result =
          await searchFiles(
            search
          );

        setSection(
          "search"
        );

        setData({
          folders:
            result.folders.map(
              (folder) => ({
                ...folder,
                kind: "folder"
              })
            ),
          files:
            result.files.map(
              (file) => ({
                ...file,
                kind: "file"
              })
            ),
          path: []
        });
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  const sortedFolders =
    useMemo(() => {
      return [
        ...data.folders
      ].sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );
    }, [
      data.folders
    ]);

  const sortedFiles =
    useMemo(() => {
      return [
        ...data.files
      ].sort(
        (a, b) => {
          if (
            sort === "name"
          ) {
            return a.name.localeCompare(
              b.name
            );
          }

          if (
            sort === "size"
          ) {
            return (
              Number(
                b.size_bytes || 0
              ) -
              Number(
                a.size_bytes || 0
              )
            );
          }

          return (
            new Date(
              b.updated_at
            ) -
            new Date(
              a.updated_at
            )
          );
        }
      );
    }, [
      data.files,
      sort
    ]);

  const handleRestore =
    async (file) => {
      try {
        await restoreFile(
          file.id
        );

        await showSection(
          "trash"
        );
      } catch (err) {
        setError(
          err.message
        );
      }
    };

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
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  if (
    loading ||
    !user
  ) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading CloudNest...
        </p>
      </main>
    );
  }

  const percentage =
    usage?.percentage || 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">

          <div className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Cloud
                className="text-white"
                size={22}
              />
            </div>

            <div>
              <h1 className="font-bold">
                CloudNest
              </h1>

              <p className="text-xs text-slate-500">
                Cloud storage
              </p>
            </div>
          </div>

          <div className="px-4">
            <button
              onClick={handleCreateFolder}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800"
            >
              <FolderPlus size={18} />
              New folder
            </button>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() =>
                showSection("drive")
              }
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                section === "drive"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-50"
              }`}
            >
              <Home size={18} />
              My Drive
            </button>

            <button
              onClick={() =>
                showSection("shared")
              }
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                section === "shared"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-50"
              }`}
            >
              <Users size={18} />
              Shared
            </button>

            <button
              onClick={() =>
                showSection("starred")
              }
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                section === "starred"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-50"
              }`}
            >
              <Star size={18} />
              Starred
            </button>

            <button
              onClick={() =>
                showSection("recent")
              }
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                section === "recent"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-50"
              }`}
            >
              <Clock3 size={18} />
              Recent
            </button>

            <button
              onClick={() =>
                showSection("trash")
              }
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                section === "trash"
                  ? "bg-slate-100 font-medium"
                  : "hover:bg-slate-50"
              }`}
            >
              <Trash2 size={18} />
              Trash
            </button>
          </nav>

          <div className="mt-auto p-4">
            <div className="rounded-xl bg-slate-50 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive size={16} />
                <span className="text-sm font-medium">
                  Storage
                </span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900"
                  style={{
                    width: `${percentage}%`
                  }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {formatBytes(
                  usage?.usedBytes
                )}{" "}
                of{" "}
                {formatBytes(
                  usage?.limitBytes
                )}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm font-medium truncate">
                {user.name}
              </p>

              <p className="text-xs text-slate-500 truncate mb-3">
                {user.email}
              </p>

              <button
                onClick={async () => {
                  await logout();
                  router.push(
                    "/login"
                  );
                }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 min-w-0">

          <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">
                <div className="md:hidden w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Cloud
                    size={20}
                    className="text-white"
                  />
                </div>

                <h2 className="text-xl font-semibold">
                  {section === "drive"
                    ? currentFolder?.name ||
                      "My Drive"
                    : section ===
                        "starred"
                      ? "Starred"
                      : section ===
                          "recent"
                        ? "Recent"
                        : section ===
                            "shared"
                          ? "Shared"
                          : section ===
                              "trash"
                            ? "Trash"
                            : "Search results"}
                </h2>
              </div>

              <div className="flex items-center gap-2">

                <div className="flex-1 lg:w-80 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3">
                  <Search
                    size={18}
                    className="text-slate-400"
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
                  onClick={handleSearch}
                  className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm"
                >
                  Search
                </button>

              </div>
            </div>
          </header>

          <div className="p-4 md:p-8">

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
                <span>
                  {error}
                </span>

                <button
                  onClick={() =>
                    setError("")
                  }
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {section ===
              "drive" && (
              <div className="mb-6">

                <div className="flex items-center justify-between gap-4 mb-4">

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <button
                      onClick={goHome}
                      className="hover:text-slate-900"
                    >
                      My Drive
                    </button>

                    {data.path.map(
                      (
                        item,
                        index
                      ) => (
                        <span
                          key={
                            item.id
                          }
                          className="flex items-center gap-2"
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
                            {
                              item.name
                            }
                          </button>
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      onClick={() =>
                        setView(
                          "grid"
                        )
                      }
                      className={`p-2 rounded-lg ${
                        view ===
                        "grid"
                          ? "bg-slate-200"
                          : "hover:bg-slate-100"
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
                      className={`p-2 rounded-lg ${
                        view ===
                        "list"
                          ? "bg-slate-200"
                          : "hover:bg-slate-100"
                      }`}
                      aria-label="List view"
                    >
                      <List
                        size={18}
                      />
                    </button>

                    <button
                      onClick={() =>
                        setSort(
                          sort ===
                            "updated"
                            ? "name"
                            : sort ===
                                "name"
                              ? "size"
                              : "updated"
                        )
                      }
                      className="p-2 rounded-lg hover:bg-slate-100"
                      title="Sort"
                    >
                      <ArrowUpDown
                        size={18}
                      />
                    </button>

                  </div>
                </div>

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

            {loadingData &&
            section ===
              "drive" ? (
              <div className="py-20 text-center text-slate-500">
                Loading files...
              </div>
            ) : (
              <>
                {sortedFolders.length >
                  0 && (
                  <section className="mb-8">

                    <h3 className="font-semibold mb-3">
                      Folders
                    </h3>

                    <div className={
                      view ===
                      "grid"
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        : "space-y-2"
                    }>
                      {sortedFolders.map(
                        (folder) => (
                          <div
                            key={
                              folder.id
                            }
                            className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition"
                          >
                            <button
                              onClick={() =>
                                openFolder(
                                  folder
                                )
                              }
                              className="w-full text-left"
                            >
                              <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                                <Folder
                                  size={22}
                                />
                              </div>

                              <p className="font-medium truncate">
                                {
                                  folder.name
                                }
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                {formatDate(
                                  folder.updated_at
                                )}
                              </p>
                            </button>

                            <div className="flex items-center justify-end gap-1 mt-3">
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
                                <Pencil
                                  size={15}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete({
                                    ...folder,
                                    kind: "folder"
                                  })
                                }
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                title="Delete"
                              >
                                <Trash
                                  size={15}
                                />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {sortedFiles.length >
                  0 && (
                  <section>

                    <h3 className="font-semibold mb-3">
                      Files
                    </h3>

                    <div className={
                      view ===
                      "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        : "space-y-2"
                    }>

                      {sortedFiles.map(
                        (file) => (
                          <div
                            key={
                              file.id
                            }
                            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition"
                          >
                            <div className="flex items-start justify-between gap-3">

                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <FileIcon
                                    type={
                                      file.mime_type
                                    }
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium truncate">
                                    {
                                      file.name
                                    }
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {formatBytes(
                                      file.size_bytes
                                    )}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  setSelected(
                                    file
                                  )
                                }
                                className="p-2 rounded-lg hover:bg-slate-100"
                              >
                                <MoreVertical
                                  size={17}
                                />
                              </button>

                            </div>

                            <div className="flex items-center justify-between mt-4">

                              <button
                                onClick={() =>
                                  handleStar(
                                    file
                                  )
                                }
                                className="p-2 rounded-lg hover:bg-slate-100"
                                title="Star"
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

                              <button
                                onClick={() =>
                                  handleRename({
                                    ...file,
                                    kind: "file"
                                  })
                                }
                                className="p-2 rounded-lg hover:bg-slate-100"
                                title="Rename"
                              >
                                <Pencil
                                  size={17}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete({
                                    ...file,
                                    kind: "file"
                                  })
                                }
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                title="Delete"
                              >
                                <Trash
                                  size={17}
                                />
                              </button>

                            </div>
                          </div>
                        )
                      )}

                    </div>
                  </section>
                )}

                {sortedFolders.length ===
                  0 &&
                  sortedFiles.length ===
                    0 && (
                    <div className="py-20 text-center">

                      <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4">
                        <File
                          size={28}
                          className="text-slate-400"
                        />
                      </div>

                      <h3 className="font-semibold">
                        This folder is empty
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Upload a file or create a folder to get started.
                      </p>

                    </div>
                  )}
              </>
            )}

            {section ===
              "trash" && (
              <section className="mt-6">
                <h3 className="font-semibold mb-4">
                  Deleted files
                </h3>

                <div className="space-y-2">
                  {data.files.map(
                    (file) => (
                      <div
                        key={
                          file.id
                        }
                        className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Trash2
                            size={20}
                          />

                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {
                                file.name
                              }
                            </p>

                            <p className="text-xs text-slate-500">
                              {formatBytes(
                                file.size_bytes
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">

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
                            <Trash2
                              size={17}
                            />
                          </button>

                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          </div>
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">
                File actions
              </h3>

              <button
                onClick={() =>
                  setSelected(null)
                }
              >
                <X size={19} />
              </button>
            </div>

            <p className="font-medium break-all">
              {selected.name}
            </p>

            <div className="space-y-2 mt-5">

              <button
                onClick={() => {
                  setSelected(null);
                  handleDownload(
                    selected
                  );
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-100"
              >
                <Download
                  size={18}
                />
                Download
              </button>

              <button
                onClick={() => {
                  setSelected(null);
                  handleRename({
                    ...selected,
                    kind: "file"
                  });
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-100"
              >
                <Pencil
                  size={18}
                />
                Rename
              </button>

              <button
                onClick={() => {
                  setSelected(null);
                  setModal({
                    type: "share",
                    resource:
                      selected
                  });
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-100"
              >
                <Share2
                  size={18}
                />
                Share
              </button>

              <button
                onClick={() => {
                  setSelected(null);
                  setModal({
                    type: "link",
                    resource:
                      selected
                  });
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-100"
              >
                <Link2
                  size={18}
                />
                Create share link
              </button>

              <button
                onClick={() => {
                  setSelected(null);
                  handleDelete({
                    ...selected,
                    kind: "file"
                  });
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-red-600 hover:bg-red-50"
              >
                <Trash2
                  size={18}
                />
                Move to trash
              </button>

            </div>
          </div>
        </div>
      )}

      {modal && (
        <ShareModal
          modal={modal}
          onClose={() =>
            setModal(null)
          }
          user={user}
        />
      )}
    </main>
  );
}

function ShareModal({
  modal,
  onClose,
  user
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

  const handleShare =
    async () => {
      try {
        setError("");

        if (
          modal.type ===
          "link"
        ) {
          const {
            createLinkShare
          } =
            await import(
              "../../lib/api"
            );

          const data =
            await createLinkShare({
              resourceType:
                "file",
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

        const {
          createShare
        } =
          await import(
            "../../lib/api"
          );

        const {
          searchFiles
        } =
          await import(
            "../../lib/api"
          );

        const found =
          await searchFiles(
            email,
            "all",
            false
          );

        const target =
          [
            ...(found.files ||
              []),
            ...(found.folders ||
              [])
          ].find(
            (item) =>
              item.owner_id ===
                undefined &&
              item.email ===
                email
          );

        if (!target) {
          setError(
            "Enter the email of an existing CloudNest user."
          );

          return;
        }

        await createShare({
          resourceType:
            "file",
          resourceId:
            modal.resource.id,
          granteeUserId:
            target.id,
          role
        });

        setResult(
          "Resource shared successfully."
        );
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">
            {modal.type ===
            "link"
              ? "Create share link"
              : "Share file"}
          </h3>

          <button
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        {modal.type ===
        "share" ? (
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none"
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none"
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
            />
          </>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 break-all">
            {result}
          </div>
        )}

        <button
          onClick={handleShare}
          className="w-full mt-5 rounded-lg bg-slate-900 text-white py-3 font-medium"
        >
          {modal.type ===
          "link"
            ? "Create link"
            : "Share"}
        </button>

      </div>
    </div>
  );
}