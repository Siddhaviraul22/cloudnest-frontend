"use client";

import {
  useRef,
  useState
} from "react";

import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import {
  initializeUpload,
  completeUpload
} from "../lib/api";

import * as tus from "tus-js-client";

const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
  "cloudnest";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const CHUNK_SIZE =
  10 * 1024 * 1024;

const MAX_CONCURRENT_UPLOADS = 3;

const formatBytes = (bytes) => {
  if (!bytes) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(1)} ${units[index]}`;
};

export default function UploadDropzone({
  folderId = null,
  onUploaded
}) {
  const inputRef = useRef(null);

  const [uploads, setUploads] =
    useState([]);

  const [isDragging, setIsDragging] =
    useState(false);

  const updateUpload = (
    id,
    updates
  ) => {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              ...updates
            }
          : upload
      )
    );
  };

  const uploadWithTus = (
    file,
    uploadId,
    init
  ) => {
    return new Promise(
      (resolve, reject) => {
        if (!SUPABASE_URL) {
          reject(
            new Error(
              "NEXT_PUBLIC_SUPABASE_URL is not configured"
            )
          );

          return;
        }

        if (
          !init?.upload?.path ||
          !init?.upload?.token
        ) {
          reject(
            new Error(
              "Invalid resumable upload information received from the server"
            )
          );

          return;
        }

        const endpoint =
          `${SUPABASE_URL}/storage/v1/upload/resumable`;

        const upload =
          new tus.Upload(
            file,
            {
              endpoint,

              chunkSize:
                CHUNK_SIZE,

              retryDelays: [
                0,
                1000,
                3000,
                5000,
                10000
              ],

              headers: {
                "x-signature":
                  init.upload.token
              },

              metadata: {
                bucketName:
                  STORAGE_BUCKET,

                objectName:
                  init.upload.path,

                contentType:
                  file.type ||
                  "application/octet-stream"
              },

              onError: (error) => {
                console.error(
                  "TUS upload error:",
                  error
                );

                reject(
                  error instanceof Error
                    ? error
                    : new Error(
                        "Resumable upload failed"
                      )
                );
              },

              onProgress: (
                bytesUploaded,
                bytesTotal
              ) => {
                if (!bytesTotal) {
                  return;
                }

                const percentage =
                  (bytesUploaded /
                    bytesTotal) *
                  100;

                updateUpload(
                  uploadId,
                  {
                    progress:
                      percentage
                  }
                );
              },

              onSuccess: () => {
                resolve();
              }
            }
          );

        updateUpload(
          uploadId,
          {
            progress: 0
          }
        );

        upload.start();
      }
    );
  };

  const uploadFile = async (
    file
  ) => {
    const uploadId =
      `${Date.now()}-${Math.random()}`;

    setUploads((current) => [
      ...current,
      {
        id: uploadId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading"
      }
    ]);

    try {
      const init =
        await initializeUpload({
          name: file.name,
          mimeType:
            file.type ||
            "application/octet-stream",
          sizeBytes: file.size,
          folderId
        });

      if (
        !init?.fileId ||
        !init?.upload?.path ||
        !init?.upload?.token
      ) {
        throw new Error(
          "Invalid upload information received from the server"
        );
      }

      updateUpload(
        uploadId,
        {
          progress: 1
        }
      );

      await uploadWithTus(
        file,
        uploadId,
        init
      );

      updateUpload(
        uploadId,
        {
          progress: 95
        }
      );

      await completeUpload(
        init.fileId
      );

      updateUpload(
        uploadId,
        {
          progress: 100,
          status: "completed"
        }
      );

      if (onUploaded) {
        await onUploaded();
      }
    } catch (error) {
      console.error(
        "File upload error:",
        error
      );

      updateUpload(
        uploadId,
        {
          status: "error",
          error:
            error?.message ||
            "Upload failed"
        }
      );
    }
  };

  const handleFiles = async (
    fileList
  ) => {
    const files =
      Array.from(
        fileList || []
      );

    if (files.length === 0) {
      return;
    }

    let nextIndex = 0;

    const worker = async () => {
      while (true) {
        const currentIndex =
          nextIndex;

        nextIndex += 1;

        if (
          currentIndex >=
          files.length
        ) {
          return;
        }

        await uploadFile(
          files[currentIndex]
        );
      }
    };

    const workerCount =
      Math.min(
        MAX_CONCURRENT_UPLOADS,
        files.length
      );

    await Promise.all(
      Array.from(
        {
          length: workerCount
        },
        () => worker()
      )
    );
  };

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const handleDrop = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const files =
      event.dataTransfer?.files;

    handleFiles(files);
  };

  return (
    <div className="space-y-4">

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(
            event.target.files
          );

          event.target.value = "";
        }}
      />

      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() =>
          inputRef.current?.click()
        }
        className={`w-full rounded-2xl border-2 border-dashed p-8 cursor-pointer transition ${
          isDragging
            ? "border-slate-900 bg-slate-100"
            : "border-slate-300 bg-white hover:border-slate-500"
        }`}
      >
        <div className="flex flex-col items-center">

          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
              isDragging
                ? "bg-slate-900 text-white"
                : "bg-slate-100"
            }`}
          >
            <Upload size={22} />
          </div>

          <p className="font-medium text-slate-800">
            {isDragging
              ? "Drop files here"
              : "Drag & drop files here"}
          </p>

          <p className="text-sm text-slate-500 mt-1">
            or click to choose files
          </p>

          <p className="text-xs text-slate-400 mt-2">
            Images, videos, audio, PDFs and other supported files
          </p>

        </div>
      </div>

      {uploads.map(
        (upload) => (
          <div
            key={upload.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >

            <div className="flex items-center justify-between gap-4">

              <div className="min-w-0">

                <p className="font-medium text-slate-800 truncate">
                  {upload.name}
                </p>

                <p className="text-xs text-slate-500">
                  {formatBytes(
                    upload.size
                  )}
                </p>

              </div>

              {upload.status ===
                "completed" && (
                <CheckCircle2
                  size={20}
                  className="text-green-600"
                />
              )}

              {upload.status ===
                "error" && (
                <AlertCircle
                  size={20}
                  className="text-red-600"
                />
              )}

              {upload.status ===
                "uploading" && (
                <span className="text-sm">
                  {Math.round(
                    upload.progress
                  )}
                  %
                </span>
              )}

            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">

              <div
                className="h-full bg-slate-900 transition-all"
                style={{
                  width: `${upload.progress}%`
                }}
              />

            </div>

            {upload.error && (
              <div className="flex items-center gap-2 text-sm text-red-600 mt-2">

                <X size={15} />

                {upload.error}

              </div>
            )}

          </div>
        )
      )}

    </div>
  );
}