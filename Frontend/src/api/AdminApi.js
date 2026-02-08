
const API_BASE = import.meta.env.VITE_API_BASE || '';
const API_BASE_Local = "http://localhost:8000/api";
export async function AllAuditLog(
    pagenumber = 1,
    searchTerm = "",
    activeCategory = "ALL",
    startDate,
    endDate
) {
    const res = await fetch(
        `${API_BASE_Local}/auditlogs?page=${pagenumber}&search=${searchTerm}&category=${activeCategory}&start_date=${startDate}&end_date=${endDate}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return res.json();
}