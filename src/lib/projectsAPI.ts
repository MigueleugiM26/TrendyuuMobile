import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/user-projects`;

async function authHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectType = "short_editor" | "canvas";

export interface CloudProjectSummary {
  id: string;
  name: string;
  thumbnail: string | null;
  timeline_limit: number;
  aspect_ratio: string | null;
  project_type: ProjectType;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
  has_password: boolean;
}

export interface CloudProjectDetail extends CloudProjectSummary {
  access_list: { email: string; granted_at: string }[];
  project_data: Record<string, unknown>;
}

export interface SaveProjectPayload {
  id?: string;
  name: string;
  thumbnail?: string | null;
  timeline_limit?: number;
  aspect_ratio?: string | null;
  project_type?: ProjectType;
  project_data: Record<string, unknown>;
}

export interface UpdateAccessPayload {
  emails: string[];
  password?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail: string = body?.detail ?? "";

    if (res.status === 403) {
      if (detail === "password_required")
        throw Object.assign(new Error("Password required"), {
          passwordRequired: true,
        });
      if (detail === "wrong_password")
        throw Object.assign(new Error("Wrong password"), {
          wrongPassword: true,
        });
    }

    throw new Error(detail || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function saveProject(
  payload: SaveProjectPayload,
): Promise<{ id: string; created: boolean; updated_at: string }> {
  const res = await fetch(`${BASE}/save`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function listProjects(
  project_type?: ProjectType,
): Promise<CloudProjectSummary[]> {
  const url = new URL(`${BASE}/all_projects`);
  if (project_type) url.searchParams.set("project_type", project_type);

  const res = await fetch(url.toString(), {
    headers: await authHeaders(),
  });
  return handleResponse(res);
}

export async function loadProject(
  projectId: string,
  password?: string,
): Promise<CloudProjectDetail> {
  const url = new URL(`${BASE}/${projectId}`);
  if (password) url.searchParams.set("password", password);

  const res = await fetch(url.toString(), {
    headers: await authHeaders(),
  });
  return handleResponse(res);
}

export async function updateProjectAccess(
  projectId: string,
  payload: UpdateAccessPayload,
): Promise<void> {
  const res = await fetch(`${BASE}/${projectId}/access`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  await handleResponse(res);
}

export async function deleteProject(projectId: string): Promise<void> {
  const res = await fetch(`${BASE}/${projectId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  await handleResponse(res);
}
