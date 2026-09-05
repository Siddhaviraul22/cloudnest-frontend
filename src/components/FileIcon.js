"use client";

import {
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Folder
} from "lucide-react";

export default function FileIcon({
  type,
  size = 22
}) {
  if (type === "folder") {
    return <Folder size={size} />;
  }

  if (!type) {
    return <File size={size} />;
  }

  if (type.startsWith("image/")) {
    return <Image size={size} />;
  }

  if (type.startsWith("video/")) {
    return <Video size={size} />;
  }

  if (type.startsWith("audio/")) {
    return <Music size={size} />;
  }

  if (
    type.includes("zip") ||
    type.includes("archive")
  ) {
    return <Archive size={size} />;
  }

  if (
    type === "application/pdf" ||
    type.startsWith("text/")
  ) {
    return <FileText size={size} />;
  }

  return <File size={size} />;
}