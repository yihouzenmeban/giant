import * as CryptoJS from 'crypto-js';

export function dealStrSub(val: string) {
  const numA = Math.ceil(val.length / 2);
  const str1 = val.substring(numA, val.length);
  const str2 = val.substring(0, numA);
  let str3 = str1.substring(1, 3);
  const str31 = str1.substring(1, 2);
  let str4 = str1.substring(4, 6);
  const str41 = str1.substring(4, 5);
  if (str31 === '0') {
    str3 = str1.substring(2, 3);
  }
  if (str41 === '0') {
    str4 = str1.substring(5, 6);
  }
  const str7 = str1.substring(6, str1.length);
  const str5 = str2 + str7;
  const str6 = str5.substring(parseInt(str4, 10), str5.length - parseInt(str3, 10));

  return str6;
}

export function decrypt(string: string, code: string, operation: boolean) {
  const newCode = CryptoJS.MD5(code).toString();
  const iv = CryptoJS.enc.Utf8.parse(newCode.substring(0, 16));
  const key = CryptoJS.enc.Utf8.parse(newCode.substring(16));

  if (operation) {
    return CryptoJS.AES.decrypt(string, key, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
  }

  return CryptoJS.AES.encrypt(string, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}
