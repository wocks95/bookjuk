/**
 * 상품 URL 매핑 관리
 *
 * Developer : 이수정
 */

import { Route, Routes } from 'react-router-dom';
import ProductPage from '../pages/product/ProductPage';
import ProductDetailPage from '../pages/product/ProductDetailPage';

const ProductRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<ProductPage />} />
        {/* <Route path="/new" element={<ProductNewPage />} /> 
        <Route path="/popular" element={<ProductPopularPage />} /> */}
        <Route path="/detail/:productId" element={<ProductDetailPage />} />
      </Routes>
    </>
  );
};

export default ProductRoutes;
