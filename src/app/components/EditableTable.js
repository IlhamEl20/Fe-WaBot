import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Form,
  Upload,
  notification,
  DatePicker,
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import Instance from "../plugins/axiosInterceptors";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import "dayjs/locale/id";
import locale from "antd/es/date-picker/locale/id_ID";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timezone);

// Set locale to Indonesian
dayjs.locale("id");
const EditableTable = ({ setIdBroadcast }) => {
  const [dataSource, setDataSource] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [count, setCount] = useState(0);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [formattedMessage, setFormattedMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const handleFileUpload = ({ file }) => {
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
      setFilteredData(importedData);
      setCount(importedData.length);
    };

    reader.readAsArrayBuffer(file.originFileObj);
  };

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = dayjs(date)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss");
      setSelectedDate(formattedDate);
      console.log("Selected Date:", formattedDate);
    } else {
      setSelectedDate(null);
    }
  };
  const handleChange = (e) => {
    const originalMessage = e.target.value;
    const formattedMessage = originalMessage.replace(/\r?\n/g, "\n");

    setDisplayedMessage(originalMessage);
    setFormattedMessage(formattedMessage);
  };

  const handleAdd = () => {
    const newData = {
      key: count,
      nama: "",
      nomor: "",
    };

    // Validasi kolom nomor (hanya angka)
    const isNumber = /^\d+$/;
    if (newData.nomor && !isNumber.test(newData.nomor)) {
      return notification.error({
        message: "Invalid Input",
        description: "Kolom Nomor harus diisi dengan angka.",
      });
    }

    setDataSource([...dataSource, newData]);
    setFilteredData([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
    handleSearch(searchText, newData); // Update filtered data on save
  };

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    setFilteredData(newData);
    setCount(newData.length);
  };

  const handleDeleteAll = () => {
    setDataSource([]);
    setFilteredData([]);
    setCount(0);
  };

  const handlePost = async () => {
    if (dataSource.length === 0) {
      return notification.error({
        message: "Tidak ada data",
        description: "Jumlah data 0!",
      });
    }
    if (!formattedMessage) {
      return notification.error({
        message: "Message kosong!",
        description: "Pesan kosong harap isi pesan",
      });
    }
    const formattedData = {
      recipients: dataSource.map((item) => ({
        name: item.nama,
        number: item.nomor,
      })),
      messageText: formattedMessage,
    };

    console.log(formattedData); // Periksa data yang diformat sebelum mengirim
    try {
      const response = await Instance.post(`/broadcast`, formattedData);
      setIdBroadcast(response.data.idBroadcast);
      notification.success({
        message: "Data Posted",
        description: `Data has been successfully posted with ID ${response.data.idBroadcast}`,
        duration: 0,
        placement: "bottomRight",
      });
      handleDeleteAll();
      setDisplayedMessage("");
      setFormattedMessage("");
    } catch (error) {
      console.log("There was an error posting the data:", error);
      notification.error({
        message: "Posting Error",
        description: "There was an error posting the data.",
        placement: "bottomRight",
      });
    }
  };

  const handleSearch = (value, data = dataSource) => {
    const filtered = data.filter(
      (item) =>
        item.nama.toLowerCase().includes(value.toLowerCase()) ||
        item.nomor.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    setSearchText(value);
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      editable: true,
      render: (text, record) => (
        <Input
          placeholder="Nama Pemilik Nomor"
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
        <>
          <Input
            placeholder="Nomor Whatsapp"
            value={text}
            onChange={(e) => {
              const newData = { ...record, nomor: e.target.value };
              const isNumber = /^\d+$/;
              if (newData.nomor && !isNumber.test(newData.nomor)) {
                setValidationErrors({
                  ...validationErrors,
                  [record.key]: "Kolom Nomor harus diisi dengan angka.",
                });
              } else {
                const { [record.key]: removed, ...rest } = validationErrors;
                setValidationErrors(rest);
                handleSave(newData);
              }
            }}
            // type="number"
            // min="0"
            // step="1"
          />
          {validationErrors[record.key] && (
            <div style={{ color: "red", marginTop: 4 }}>
              {validationErrors[record.key]}
            </div>
          )}
        </>
      ),
    },
    {
      title: "Action",
      dataIndex: "aksi",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Space>
            <Button
              type="primary"
              danger
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
    <div className="w-4/5 sm:w-2/3 lg:w-3/5 bg-white rounded-lg shadow-lg p-5">
      <div className="flex flex-col space-y-4 p-4">
        <Upload
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          // fileList={dataSource}
          showUploadList={true}
          className="mb-4"
        >
          <Button icon={<UploadOutlined />}>Unggah File</Button>
        </Upload>
        <div className="flex space-x-4 justify-end">
          <Button
            onClick={handleAdd}
            type="primary"
            className="flex items-center space-x-2"
          >
            <PlusOutlined />
            <span>Tambah Baris</span>
          </Button>
          <Button
            onClick={handleDeleteAll}
            type="primary"
            danger
            className="flex items-center space-x-2"
          >
            <span>Hapus Semua</span>
          </Button>
        </div>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
          title={() => (
            <div className="mb-4">
              <Input
                placeholder="Cari Nama atau Nomor"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                prefix={<SearchOutlined />}
                className="w-full"
              />
            </div>
          )}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}>
                <Form layout="vertical">
                  <Form.Item label="Message" required>
                    <TextArea
                      placeholder="Pesan"
                      value={displayedMessage}
                      onChange={handleChange}
                    />
                  </Form.Item>
                  <Form.Item label="Waktu pengiriman pesan" required>
                    <ConfigProvider locale={locale}>
                      <DatePicker
                        showTime={{ format: "HH:mm" }}
                        format="YYYY-MM-DD HH:mm:ss"
                        onChange={handleDateChange}
                      />
                    </ConfigProvider>
                  </Form.Item>
                </Form>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
        <div className="mt-4">
          <span className="text-black">Jumlah Data: {count}</span>
        </div>
        <Button onClick={handlePost} type="primary" className="mt-4">
          Kirim Data
        </Button>
      </div>
    </div>
  );
};

export default EditableTable;
