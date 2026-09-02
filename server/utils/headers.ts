import { getActiveMirror } from '../utils/mirorhost'

export const getAntiBlockHeaders = (passedHost) => {
  const targetHost = passedHost || getActiveMirror();
  const PH_IP = "49.144.0.1";

  return {
    "X-Client-Info": JSON.stringify({
      "timezone": "Asia/Manila",
      "app_name": "moviebox",
      "version": "1.6.3",
      "platform": "android"
    }),
    "User-Agent": "okhttp/4.12.0",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Host": targetHost, 
    "CF-IPCountry": "PH",
    "X-Forwarded-For": PH_IP,
    "CF-Connecting-IP": PH_IP,
    "X-Real-IP": PH_IP
  };
};

export const getDownloadHeaders = (passedHost, subjectId, detailPath = "detail") => {
  const PH_IP = "49.144.0.1";
  
  return {
    "User-Agent": "okhttp/4.12.0",
    "Content-Type": "application/json",
    "Accept": "*/*", 
    "Accept-Language": "en-US,en;q=0.9",
    "X-Client-Info": '{"timezone":"Asia/Manila"}',
    "X-Forwarded-For": PH_IP,
    "CF-Connecting-IP": PH_IP,
    "X-Real-IP": PH_IP,
    "CF-IPCountry": "PH",
    "Host": passedHost,
    "Origin": "https://fmoviesunblocked.net", 
    "Referer": `https://fmoviesunblocked.net/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}`, 
    "Connection": "keep-alive"
  };
};