import React, { useState } from "react";
import { Table, Input, Button, Space, Form } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
const TabelBroadcast = () => {
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataArray = new Uint8Array(e.target.result);
      const workbook = XLSX.read(dataArray, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      const importedData = worksheet.slice(1).map((row, index) => ({
        key: index,
        nama: row[0],
        nomor: row[1],
      }));

      setDataSource(importedData);
      setCount(importedData.length);
      setMessage(worksheet[1][2] || "");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleAdd = () => {
    const newData = {
      key: count,
      nama: "",
      nomor: "",
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
  };

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    setCount(newData.length);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setCount(0);
    setMessage("");
  };

  const handlePost = async () => {
    const formattedData = {
      numbers: dataSource.map((item) => item.nomor),
      message: message,
    };

    console.log(formattedData); // Periksa data yang diformat sebelum mengirim

    try {
      await axios.post("/api/save-data", formattedData);
      alert("Data has been successfully posted!");
    } catch (error) {
      console.error("There was an error posting the data:", error);
    }
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      editable: true,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleSave({ ...record, nama: e.target.value })}
        />
      ),
    },
    {
      title: "Nomor",
      dataIndex: "nomor",
      editable: true,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleSave({ ...record, nomor: e.target.value })}
        />
      ),
    },
    {
      title: "Aksi",
      dataIndex: "aksi",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Space>
            <Button
              type="danger"
              onClick={() => handleDelete(record.key)}
              icon={<DeleteOutlined />}
            >
              Hapus
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <div className="w-full sm:w-1/2 bg-white rounded-lg shadow-lg p-6">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        <PlusOutlined /> Tambah Baris
      </Button>
      <Button
        onClick={handleDeleteAll}
        type="primary"
        danger
        style={{ marginBottom: 16, marginLeft: 8 }}
      >
        Hapus Semua
      </Button>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowClassName="editable-row"
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
              <Form layout="vertical">
                <Form.Item label="Message">
                  <Input
                    placeholder="Pesan"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Form.Item>
              </Form>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div style={{ marginTop: 16 }}>
        <span>Jumlah Data: {count}</span>
      </div>
      <Button onClick={handlePost} type="primary" style={{ marginTop: 16 }}>
        Kirim Data
      </Button>
    </div>
  );
};

export default TabelBroadcast;
