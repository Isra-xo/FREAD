export const extractItems = (response) => {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

export const getTotalPages = (response) => response?.data?.totalPages ?? 1;
export const getTotalCount = (response) => response?.data?.totalCount ?? 0;