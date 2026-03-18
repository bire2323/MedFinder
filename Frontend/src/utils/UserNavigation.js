export const navigateByRole = (roles, navigate) => {
  if (roles?.includes('pharmacyAgent')) {
    navigate('/pharmacy-agent/dashboard', { replace: true });
  } else if (roles?.includes('hospitalAgent')) {
    navigate('/hospital-agent/dashboard', { replace: true });
  } else if (roles?.includes('admin')) {
    navigate('/admin/dashboard', { replace: true });
  } else if (roles?.includes('patient')) {
    navigate('/user/dashboard', { replace: true });
  } else {
    navigate('/', { replace: true });
  }
};