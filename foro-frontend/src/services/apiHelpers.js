export const extractItems = (response) => {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.Items)) return data.Items;
  return [];
};

export const getTotalPages = (response) => {
  const data = response?.data;
  return data?.totalPages ?? data?.TotalPages ?? 1;
};

export const getTotalCount = (response) => {
  const data = response?.data;
  return data?.totalCount ?? data?.TotalCount ?? 0;
};