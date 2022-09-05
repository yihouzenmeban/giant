import axios from 'axios';
import { stringify } from 'qs';
import {
  userId, province, userAgent, skuMap,
} from './config';
import { dealStrSub, decrypt } from './utils';

async function doStore(code: number) {
  return axios.post('https://e-gw.giant.com.cn/index.php/api/do_store', stringify({
    code,
    user_id: userId,
  }), {
    headers: {
      'User-Agent': userAgent,
    },
  });
}

async function isStock(shopno: number, skuId: number) {
  return axios.post('https://e-gw.giant.com.cn/index.php/api/sku_stock', stringify({
    sku: skuId,
    shopno,
    user_id: userId,
  }), {
    headers: {
      'User-Agent': userAgent,
    },
  }).then(({ data }) => {
    if (data.status === 1) {
      const dealStr = dealStrSub(data.data);
      const result = JSON.parse(decrypt(dealStr, 'nKB6qnkQimMG5Pv1CCPfz205YgQurfcZs1kZuuDtyim8EXmR', true));
      return result.stock;
    }

    return Promise.reject(new Error('需要更换 userid'));
  });
}

function getData(page: number) {
  const headers = {
    'User-Agent': userAgent,
  };

  axios.post('https://e-gw.giant.com.cn/index.php/api/store_list', stringify({
    per_page: 50,
    page,
    province,
    city: 1,
  }), {
    headers,
  }).then((res) => {
    if (res.status !== 503) {
      return Promise.resolve(res.data.data);
    }

    return Promise.reject(new Error('获取门店数据失败'));
  // eslint-disable-next-line max-len
  }).then((data) => {
    return data.reduce(async (promise: Promise<void>, item: { code: number, name: string }) => {
      return promise
        .then(() => doStore(item.code))
        .then(() => {
          return Object.keys(skuMap).reduce(async (result: Promise<void>, sku) => {
            return result.then(() => isStock(item.code, parseInt(sku, 10)).then((stock) => {
              if (stock > 0) {
                console.log(`${skuMap[sku as any as keyof typeof skuMap]}有货`, item.name, `库存: ${stock}`);
              }
            }).catch((err) => {
              console.log(err);
            }));
          }, Promise.resolve());
        });
    }, Promise.resolve());
  });
}

getData(1);
