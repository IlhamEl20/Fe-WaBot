import axios from "axios";
// import Encrypt, { GetCookies } from "../services/helper";
// import cookie from "cookiejs";

// const api_dev = process.env.NEXT_PUBLIC_API_URL;
// const api_prod = process.env.NEXT_PUBLIC_API_URL;
const baseURL = process.env.NEXT_PUBLIC_API_URL;
//   process.env.REACT_APP_MODE === "development" ? api_dev : api_prod;

const Instance = axios.create({
  baseURL: baseURL,
});

const onRequest = (config) => {
  //   const accessToken = GetCookies("accessToken");

  //   if (accessToken) {
  //     config.headers["Authorization"] = `Bearer ${accessToken}`;
  //   }
  return config;
};

export const onResponseError = async (error) => {
  try {
    // if (
    //   error.response.data.message === "REFRESH_TOKEN_EXP" ||
    //   error.response.data.message === "INVALID_REFRESH_TOKEN"
    // ) {
    //   throw new Error("LOGOUT");
    // }
    if (error.response.status === 401) {
      //   let refreshToken = GetCookies("refreshToken");
      const response = await Instance.put("/auth/refresh-token", null, {
        headers: {
          refresh_token: refreshToken,
        },
      });
      if (!response) {
        throw new Error("LOGOUT");
      }
      // Simpan token baru di cookie
      //   cookie.set(
      //     {
      //       accessToken: response.data.access_token,
      //       refreshToken: response.data.refresh_token,
      //     },
      //     {
      //       expires: 1,
      //       path: "/",
      //       domain: "",
      //     }
      //   );
      // Mengirim ulang permintaan yang gagal dengan token yang diperbarui
      let originalRequest = error.config;
      originalRequest.headers["Authorization"] =
        "Bearer " + response.data.access_token;
      const ori = await axios(originalRequest);
      return ori;
    }
    //  else {
    //   Promise.reject(error);
    // }
  } catch (error) {
    // Redirect ke halaman logout jika terjadi kesalahan
    // if (error.message === "LOGOUT") {
    // window.location.href = "/Logout";
    // }
    console.log(error);
  }
};

Instance.interceptors.request.use(onRequest);
Instance.interceptors.response.use((response) => response, onResponseError);
export default Instance;
