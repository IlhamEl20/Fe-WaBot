"use client";
import Head from "next/head";
import dynamic from "next/dynamic";
import { Skeleton } from "antd";
import { useState } from "react";

const EditableTable = dynamic(() => import("./components/EditableTable"), {
  loading: () => (
    <div>
      <Skeleton active />
    </div>
  ),
  ssr: false,
});
const StatusChecker = dynamic(() => import("./components/SendMessagesNotif"), {
  loading: () => (
    <div>
      <Skeleton active />
    </div>
  ),
  ssr: false,
});
export default function Home() {
  const [idBroadcast, setIdBroadcast] = useState(null);

  const handleBroadcastCompleted = () => {
    setIdBroadcast(null);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-blue-950">
      <Head>
        <title>Broadcast Whatsapp</title>
        <meta name="description" content="Import, edit, and post Excel data" />
      </Head>
      <h1 className="text-4xl font-bold text-white mt-8 mb-4 ">
        Broadcast Whatsapp
      </h1>

      <div className="flex flex-col sm:flex-row w-full justify-center space-y-4 sm:space-y-0 sm:space-x-4 p-5">
        <EditableTable setIdBroadcast={setIdBroadcast} />
        <StatusChecker
          idBroadcast={idBroadcast}
          onCompleted={handleBroadcastCompleted}
        />
      </div>
    </main>
  );
}
