const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : {
              "Content-Type": "application/json"
            }),
        ...(options.headers || {})
      }
    }
  );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Something went wrong"
    );
  }

  return data;
};

export const registerUser = (payload) =>
  apiRequest(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

export const loginUser = (payload) =>
  apiRequest(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

export const logoutUser = () =>
  apiRequest(
    "/api/auth/logout",
    {
      method: "POST"
    }
  );

export const getCurrentUser = () =>
  apiRequest(
    "/api/auth/me"
  );

export const initializeUpload = (
  payload
) =>
  apiRequest(
    "/api/files/init",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

export const completeUpload = (
  fileId
) =>
  apiRequest(
    "/api/files/complete",
    {
      method: "POST",
      body: JSON.stringify({
        fileId
      })
    }
  );

export const getRootChildren = () =>
  apiRequest(
    "/api/folders/root/children"
  );

export const getFolder = (
  folderId
) =>
  apiRequest(
    `/api/folders/${folderId}`
  );

export const createFolder = (
  name,
  parentId = null
) =>
  apiRequest(
    "/api/folders",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        parentId
      })
    }
  );

export const updateFolder = (
  folderId,
  payload
) =>
  apiRequest(
    `/api/folders/${folderId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    }
  );

export const deleteFolder = (
  folderId
) =>
  apiRequest(
    `/api/folders/${folderId}`,
    {
      method: "DELETE"
    }
  );

export const restoreFolder = (
  folderId
) =>
  apiRequest(
    `/api/folders/${folderId}/restore`,
    {
      method: "POST"
    }
  );

export const getFiles = (
  folderId = null
) =>
  apiRequest(
    `/api/files${
      folderId
        ? `?folderId=${encodeURIComponent(folderId)}`
        : ""
    }`
  );

export const getFile = (
  fileId
) =>
  apiRequest(
    `/api/files/${fileId}`
  );

export const downloadFile = (
  fileId
) =>
  apiRequest(
    `/api/files/${fileId}/download`
  );

export const updateFile = (
  fileId,
  payload
) =>
  apiRequest(
    `/api/files/${fileId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    }
  );

export const deleteFile = (
  fileId
) =>
  apiRequest(
    `/api/files/${fileId}`,
    {
      method: "DELETE"
    }
  );

export const restoreFile = (
  fileId
) =>
  apiRequest(
    `/api/files/${fileId}/restore`,
    {
      method: "POST"
    }
  );

export const permanentlyDeleteFile = (
  fileId
) =>
  apiRequest(
    `/api/files/${fileId}/permanent`,
    {
      method: "DELETE"
    }
  );

export const getTrash = () =>
  apiRequest(
    "/api/files/trash"
  );

export const starFile = (
  fileId
) =>
  apiRequest(
    `/api/files/${fileId}/star`,
    {
      method: "POST"
    }
  );

export const unstarFile = (
  fileId
) =>
  apiRequest(
    `/api/files/${fileId}/star`,
    {
      method: "DELETE"
    }
  );

export const getStarredFiles = () =>
  apiRequest(
    "/api/files/starred"
  );

export const getRecentFiles = () =>
  apiRequest(
    "/api/files/recent"
  );

export const getVersions = (
  fileId
) =>
  apiRequest(
    `/api/files/${fileId}/versions`
  );

export const createShare = (
  payload
) =>
  apiRequest(
    "/api/shares",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

export const getShares = (
  resourceType,
  resourceId
) =>
  apiRequest(
    `/api/shares/${resourceType}/${resourceId}`
  );

export const deleteShare = (
 shareId
) =>
  apiRequest(
    `/api/shares/${shareId}`,
    {
      method: "DELETE"
    }
  );

export const getReceivedShares = () =>
  apiRequest(
    "/api/shares/received"
  );

export const createLinkShare = (
  payload
) =>
  apiRequest(
    "/api/link-shares",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

export const resolveLink = (
  token,
  password
) =>
  apiRequest(
    `/api/link/${token}`,
    {
      method: "GET",
      headers: password
        ? {
            "X-Share-Password":
              password
          }
        : {}
    }
  );

export const deleteLinkShare = (
 linkId
) =>
  apiRequest(
    `/api/link-shares/${linkId}`,
    {
      method: "DELETE"
    }
  );

export const searchFiles = (
  query,
  type = "all",
  starred = false
) =>
  apiRequest(
    `/api/search?q=${encodeURIComponent(
      query
    )}&type=${encodeURIComponent(
      type
    )}&starred=${starred}`
  );

export const getActivity = () =>
  apiRequest(
    "/api/activity"
  );

export const getUsage = () =>
  apiRequest(
    "/api/usage"
  );

export const getDashboardSummary = () =>
  apiRequest(
    "/api/summary"
  );
  
  export const findUser = (email) =>
  apiRequest(
    `/api/dashboard/users?email=${encodeURIComponent(email)}`
  );