"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "next/navigation";

import {
  Cloud,
  Download,
  Lock,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  AlertCircle
} from "lucide-react";

import {
  resolveLink
} from "../../../lib/api";


const formatBytes = (bytes) => {
  const value = Number(bytes || 0);

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
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


export default function SharedFilePage() {
  const params =
    useParams();

  const token =
    params?.token;


  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    resource,
    setResource
  ] = useState(null);

  const [
    resourceType,
    setResourceType
  ] = useState("");

  const [
    passwordRequired,
    setPasswordRequired
  ] = useState(false);

  const [
    password,
    setPassword
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    submitting,
    setSubmitting
  ] = useState(false);


  const loadLink = async (
    suppliedPassword = ""
  ) => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result =
        await resolveLink(
          token,
          suppliedPassword
        );

      setResource(
        result.resource
      );

      setResourceType(
        result.resourceType
      );

      setPasswordRequired(
        false
      );
    } catch (err) {
      const message =
        err.message ||
        "Unable to open this share link.";

      if (
        message
          .toLowerCase()
          .includes("password")
      ) {
        setPasswordRequired(
          true
        );
      } else {
        setError(
          message
        );
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadLink();
  }, [token]);


  const handlePasswordSubmit =
    async (event) => {
      event.preventDefault();

      if (!password.trim()) {
        setError(
          "Enter the share password."
        );

        return;
      }

      setSubmitting(true);
      setError("");

      try {
        await loadLink(
          password
        );
      } finally {
        setSubmitting(false);
      }
    };


  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4">
            <Cloud
              size={25}
              className="text-white animate-pulse"
            />
          </div>

          <p className="text-slate-500">
            Opening shared file...
          </p>

        </div>

      </main>
    );
  }


  if (passwordRequired) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-5">
            <Lock size={22} />
          </div>

          <h1 className="text-xl font-bold text-center">
            Password required
          </h1>

          <p className="text-sm text-slate-500 text-center mt-2">
            This shared file is protected by a password.
          </p>


          <form
            onSubmit={
              handlePasswordSubmit
            }
            className="mt-6"
          >

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter password"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />


            {error && (
              <div className="mt-3 rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-3 text-sm">
                {error}
              </div>
            )}


            <button
              type="submit"
              disabled={
                submitting
              }
              className="w-full mt-4 rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting
                ? "Checking..."
                : "Open file"}
            </button>

          </form>

        </div>

      </main>
    );
  }


  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

        <div className="w-full max-w-md bg-white rounded-2xl border border-red-200 shadow-sm p-7 text-center">

          <AlertCircle
            size={42}
            className="mx-auto mb-4 text-red-500"
          />

          <h1 className="text-xl font-bold">
            Unable to open shared file
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            {error}
          </p>

        </div>

      </main>
    );
  }


  if (
    resourceType !== "file" ||
    !resource
  ) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-7 text-center">

          <File
            size={42}
            className="mx-auto mb-4 text-slate-400"
          />

          <h1 className="text-xl font-bold">
            Shared resource
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            This shared resource is not a file preview.
          </p>

        </div>

      </main>
    );
  }


  const mime =
    resource.mime_type ||
    "";

  const url =
    resource.signedUrl;


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
      "application/json";


  const handleDownload = () => {
    if (!url) {
      return;
    }

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };


  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="bg-white border-b border-slate-200 px-5 py-4">

        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Cloud
                size={20}
                className="text-white"
              />
            </div>

            <div>

              <p className="font-bold">
                CloudNest
              </p>

              <p className="text-xs text-slate-500">
                Shared file
              </p>

            </div>

          </div>


          <button
            onClick={
              handleDownload
            }
            className="flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-slate-800"
          >
            <Download
              size={17}
            />

            Download
          </button>

        </div>

      </header>


      {/* CONTENT */}

      <div className="max-w-6xl mx-auto p-4 md:p-8">

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* FILE INFO */}

          <div className="px-5 py-4 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">

                {isImage ? (
                  <ImageIcon size={20} />
                ) : isVideo ? (
                  <Video size={20} />
                ) : isAudio ? (
                  <Music size={20} />
                ) : isPdf ? (
                  <FileText size={20} />
                ) : (
                  <File size={20} />
                )}

              </div>

              <div className="min-w-0">

                <h1 className="font-semibold truncate">
                  {resource.name}
                </h1>

                <p className="text-xs text-slate-500 mt-1">
                  {formatBytes(
                    resource.size_bytes
                  )}
                </p>

              </div>

            </div>

          </div>


          {/* PREVIEW */}

          <div className="min-h-[500px] bg-slate-100 flex items-center justify-center p-4">

            {isImage ? (
              <img
                src={url}
                alt={resource.name}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            ) : isVideo ? (
              <video
                src={url}
                controls
                className="max-w-full max-h-[75vh] rounded-xl"
              />
            ) : isAudio ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">

                <Music
                  size={50}
                  className="mx-auto mb-5"
                />

                <p className="font-semibold mb-5">
                  {resource.name}
                </p>

                <audio
                  src={url}
                  controls
                />

              </div>
            ) : isPdf ? (
              <iframe
                src={url}
                title={resource.name}
                className="w-full h-[75vh] rounded-xl bg-white"
              />
            ) : isText ? (
              <iframe
                src={url}
                title={resource.name}
                className="w-full h-[75vh] rounded-xl bg-white"
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">

                <File
                  size={48}
                  className="mx-auto mb-4 text-slate-400"
                />

                <h2 className="font-semibold text-lg">
                  Preview not available
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Download this file to open it.
                </p>

                <button
                  onClick={
                    handleDownload
                  }
                  className="mt-5 flex items-center gap-2 mx-auto rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium"
                >
                  <Download
                    size={17}
                  />

                  Download
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

    </main>
  );
}