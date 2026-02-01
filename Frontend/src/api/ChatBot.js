
const API_BASE = import.meta.env.VITE_API_BASE || '';
const API_BASE_Local = "http://localhost:8000/api";

async function sendMessage(text) {
    const userLng= localStorage.getItem("lng");
const userLat= localStorage.getItem("lat");
const token= localStorage.getItem("token");
const lang=localStorage.getItem("i18nextLng");
  const res = await fetch(`${API_BASE_Local}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: text,
      lat: userLat,
      lng: userLng,
      lang:lang,
    }),
  });

  return res.json();
}


async function uploadPrescription(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('lat', userLat);
  form.append('lng', userLng);

  const res = await fetch(`${API_BASE_Local}/prescription/read`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  return res.json();
}
export {sendMessage, uploadPrescription};