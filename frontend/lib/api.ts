const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const authApi = {
  login: async (email: string, password: string) => {
    const form = new FormData();

    form.append("username", email);
    form.append("password", password);

    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Login failed:", res.status, text);
      throw new Error("Login failed");
    }

    return res.json();
  },

  verifyMFA: async (_tempToken: string, _totpCode: string) => {
    throw new Error("MFA not enabled yet");
  },

  me: async () => {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch current user");
    }

    return res.json();
  },

  logout: () => {
    localStorage.removeItem("tbi_access_token");
    window.location.href = "/login";
  },
};

function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("tbi_access_token") || "dev-token"
      : "dev-token";

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getPatients() {
  const res = await fetch(`${API_URL}/api/v1/patients/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch patients:", res.status, text);
    throw new Error(`Failed to fetch patients: ${res.status}`);
  }

  return res.json();
}

export async function createPatient(data: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  mrn: string;
  injury_date: string;
  case_status: string;
  priority: string;
}) {
  const priorityMap: Record<string, string> = {
    Low: "routine",
    Medium: "routine",
    High: "urgent",
    Urgent: "stat",
    routine: "routine",
    urgent: "urgent",
    stat: "stat",
  };

  const res = await fetch(`${API_URL}/api/v1/patients/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      first_name_encrypted: data.first_name,
      last_name_encrypted: data.last_name,
      date_of_birth_encrypted: data.date_of_birth,
      mrn: data.mrn,
      injury_date: data.injury_date,
      case_status: data.case_status,
      priority: priorityMap[data.priority] || "routine",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to create patient:", res.status, text);
    throw new Error(`Failed to create patient: ${res.status}`);
  }

  return res.json();
}

export async function getPatient(id: string) {
  const res = await fetch(`${API_URL}/api/v1/patients/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch patient:", res.status, text);
    throw new Error(`Failed to fetch patient: ${res.status}`);
  }

  return res.json();
}

export async function updatePatient(
  id: string,
  data: {
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    mrn: string;
    injury_date: string;
    case_status: string;
    priority: string;
    case_notes?: string;
  }
) {
  const priorityMap: Record<string, string> = {
    Low: "routine",
    Medium: "routine",
    High: "urgent",
    Urgent: "stat",
    routine: "routine",
    urgent: "urgent",
    stat: "stat",
  };

  const res = await fetch(`${API_URL}/api/v1/patients/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      first_name_encrypted: data.first_name,
      last_name_encrypted: data.last_name,
      date_of_birth_encrypted: data.date_of_birth || "",
      mrn: data.mrn,
      injury_date: data.injury_date,
      case_status: data.case_status,
      priority: priorityMap[data.priority] || "routine",
      case_notes: data.case_notes || "",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to update patient:", res.status, text);
    throw new Error(`Failed to update patient: ${res.status}`);
  }

  return res.json();
}

export async function deletePatient(id: string) {
  const res = await fetch(`${API_URL}/api/v1/patients/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to delete patient:", res.status, text);
    throw new Error(`Failed to delete patient: ${res.status}`);
  }

  return true;
}

export async function uploadDocument(
  patientId: string,
  file: File,
  providerName?: string
) {
  const formData = new FormData();

  formData.append("patient_id", patientId);
  formData.append("file", file);

  if (providerName) {
    formData.append("provider_name", providerName);
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("tbi_access_token") || "dev-token"
      : "dev-token";

  const res = await fetch(`${API_URL}/api/v1/documents/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to upload document:", res.status, text);
    throw new Error(`Failed to upload document: ${res.status}`);
  }

  return res.json();
}

export async function getPatientDocuments(patientId: string) {
  const res = await fetch(
    `${API_URL}/api/v1/documents/patient/${patientId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch patient documents:", res.status, text);
    throw new Error(`Failed to fetch patient documents: ${res.status}`);
  }

  return res.json();
}
export function getDocumentDownloadUrl(documentId: string) {
  return `${API_URL}/api/v1/documents/${documentId}/download`;
}
export async function createReport(data: {
  patient_id: string;
  extraction_id: string;
  report_type: "clinical_summary" | "legal_report";
}) {
  const res = await fetch(`${API_URL}/api/v1/reports/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to create report:", res.status, text);
    throw new Error(`Failed to create report: ${res.status}`);
  }

  return res.json();
}

export async function getReport(reportId: string) {
  const res = await fetch(`${API_URL}/api/v1/reports/${reportId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch report:", res.status, text);
    throw new Error(`Failed to fetch report: ${res.status}`);
  }

  return res.json();
}

export async function editReport(
  reportId: string,
  physicianEditedContent: string
) {
  const res = await fetch(
    `${API_URL}/api/v1/reports/${reportId}/edit`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        physician_edited_content: physicianEditedContent,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to edit report:", res.status, text);
    throw new Error(`Failed to edit report: ${res.status}`);
  }

  return res.json();
}

export async function approveReport(
  reportId: string,
  approved: boolean,
  rejectionReason?: string
) {
  const res = await fetch(
    `${API_URL}/api/v1/reports/${reportId}/approve`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        approved,
        rejection_reason: rejectionReason || null,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to approve report:", res.status, text);
    throw new Error(`Failed to approve report: ${res.status}`);
  }

  return res.json();
}

export async function getPatientReports(patientId: string) {
  const res = await fetch(
    `${API_URL}/api/v1/reports/patient/${patientId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch patient reports:", res.status, text);
    throw new Error(`Failed to fetch patient reports: ${res.status}`);
  }

  return res.json();
}