export const getDashboardPath = (roles, { chat = false } = {}) => {
  if (roles?.includes('pharmacyAgent')) {
    return chat ? '/pharmacy/dashboard/chats' : '/pharmacy/dashboard';
  }
  if (roles?.includes('hospitalAgent')) {
    return chat ? '/hospital/dashboard/chats' : '/hospital/dashboard';
  }
  if (roles?.includes('admin')) {
    return '/admin/dashboard';
  }
  return '/user/dashboard';
};

export const navigateByRole = (roles, navigate, { chat = false, state } = {}) => {
  const path = getDashboardPath(roles, { chat });
  navigate(path, { replace: true, state });
};

export const getBackgroundLocation = (location) => ({
  pathname: location.pathname,
  search: location.search,
  hash: location.hash,
});

export const resolveBackgroundLocation = (location) =>
  location.state?.backgroundLocation || location.state?.background || getBackgroundLocation(location);
