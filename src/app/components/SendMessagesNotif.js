import useSWR, { mutate } from "swr";
import axios from "axios";
import { useEffect } from "react";
import { Table, Tag } from "antd";

const fetcher = async (url) => {
  const response = await axios.get(url, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });
  return response.data;
};

const StatusChecker = ({ idBroadcast, onCompleted }) => {
  const { data, error } = useSWR(
    idBroadcast
      ? `${process.env.NEXT_PUBLIC_API_URL}/broadcast-status/${idBroadcast}`
      : null,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (data && data.broadcastStatus.status === "completed") {
      mutate(
        idBroadcast
          ? `${process.env.NEXT_PUBLIC_API_URL}/broadcast-status/${idBroadcast}`
          : null,
        data,
        false
      );
    }
  }, [data, idBroadcast]);

  console.log("Fetched data:", data);
  if (!idBroadcast) {
    return null; // Tidak menjalankan SWR jika tidak ada idBroadcast
  }

  if (error) return <div>Error loading status</div>;
  if (!data) return <div>Loading...</div>;

  const columns = [
    {
      title: "Recipient Name",
      dataIndex: ["recipient", "name"],
      key: "name",
    },
    {
      title: "Recipient Number",
      dataIndex: ["recipient", "number"],
      key: "number",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  const completedData =
    data.broadcastStatus.status === "completed"
      ? data.broadcastStatus.results
      : [];
  const statusTag = () => {
    switch (data?.broadcastStatus.status) {
      case "completed":
        return <Tag color="success">Completed</Tag>;
      case "processing":
        return <Tag color="processing">Processing</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  return (
    <div>
      <h3>Status: {statusTag()}</h3>
      {data.broadcastStatus.status === "completed" && (
        <>
          <Table
            style={{ marginTop: 10 }}
            columns={columns}
            dataSource={completedData}
            pagination={false}
            rowKey={(record) => record.recipient.number}
          />
        </>
      )}
    </div>
  );
};

export default StatusChecker;
