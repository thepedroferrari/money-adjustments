// src/utils/firebaseFunctions.ts

export const addExpenseSet = async (groupId: string, expenseName: string) => {
  const response = await fetch("/.netlify/functions/add-expense-set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupId, expenseName }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }

  return await response.json();
};

export const inviteMember = async (
  groupId: string,
  email: string,
  invitedBy: string,
) => {
  const response = await fetch("/.netlify/functions/invite-member", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupId, email, invitedBy }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }

  return await response.json();
};

export const setGroup = async (groupId: string, userId: string) => {
  const response = await fetch("/.netlify/functions/set-group", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupId, userId }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }

  return await response.json();
};

export const saveUserProfile = async (userId: string, formData: any) => {
  const response = await fetch("/.netlify/functions/save-user-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, formData }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }

  return await response.json();
};

export const saveData = async (
  groupId: string,
  expenseName: string,
  data: any,
) => {
  const response = await fetch("/.netlify/functions/save-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupId, expenseName, data }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }

  return await response.json();
};

export const syncData = async (groupId: string, expenseName: string) => {
  const response = await fetch("/.netlify/functions/sync-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupId, expenseName }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }

  return await response.json();
};

export const deleteExpenseSet = async (
  groupId: string,
  expenseName: string,
) => {
  const response = await fetch("/.netlify/functions/delete-expense-set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupId, expenseName }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }

  return await response.json();
};
