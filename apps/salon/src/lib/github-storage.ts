import type { SalonData } from "@/types";

const REPO_OWNER = "alicercedigital";
const REPO_NAME = "what-do-you-do-next";
const BRANCH = "gh-pages";
const DATA_FILE = "data/salon-data.json";

const RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${DATA_FILE}`;
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`;

const DEFAULT_DATA: SalonData = {
  blockedSlots: [],
  bookings: [],
  updatedAt: new Date().toISOString(),
};

export async function readSalonData(): Promise<SalonData> {
  try {
    const res = await fetch(`${RAW_URL}?t=${Date.now()}`);
    if (!res.ok) return DEFAULT_DATA;
    return await res.json();
  } catch {
    return DEFAULT_DATA;
  }
}

export async function writeSalonData(
  data: SalonData,
  token: string,
): Promise<boolean> {
  try {
    // Get current SHA
    const getRes = await fetch(`${API_URL}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${token}` },
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const current = await getRes.json();
      sha = current.sha;
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    const putRes = await fetch(API_URL, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `atualizar dados do salão - ${new Date().toLocaleString("pt-BR")}`,
        content,
        sha,
        branch: BRANCH,
      }),
    });

    return putRes.ok;
  } catch {
    return false;
  }
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
