/**
 * Product 관련 API 호출 모음
 *
 * Developer : 이수정
 */

import { productApi, userApi } from './baseApi';

// 상품 상세 페이지
export const getProductDetail = async (productId) => {
  const response = await productApi.get(`/detail/${productId}`, { withCredentials: false });
  // console.log(response.data);
  return response.data;
}

// 상품 좋아요 페이지
export const getProductLike = async() => {
  const response = await userApi.get(`/wish`);
  // console.log(response.data);
  return response.data;
}