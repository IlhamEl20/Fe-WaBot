import React from "react";
import { notification } from "antd";

const NotificationComponent = () => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (type, message, description) => {
    api[type]({
      message,
      description,
    });
  };

  return <div>{contextHolder}</div>;
};

export default NotificationComponent;
