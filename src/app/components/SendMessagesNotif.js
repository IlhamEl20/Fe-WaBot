import useSWR from "swr";
import axios from "axios";
import { useEffect } from "react";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const StatusChecker = ({ idBroadcast, onCompleted }) => {
  const { data, error } = useSWR(
    idBroadcast
      ? `https://wa.frhan.site/broadcast-status/status/${idBroadcast}`
      : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    if (data && data.status === "completed") {
      onCompleted();
    }
  }, [data, onCompleted]);

  if (!idBroadcast) {
    return null; // Tidak menjalankan SWR jika tidak ada idBroadcast
  }

  if (error) return <div>Error loading status</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h3>Status: {data.status}</h3>
      {data.status === "completed" && <p>Broadcast completed!</p>}
    </div>
  );
};

export default StatusChecker;
