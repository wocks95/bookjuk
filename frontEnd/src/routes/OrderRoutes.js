/**
 * 주문 URL 매핑 관리
 *
 * Developer : 조범희
 */

import { Route, Routes } from 'react-router-dom';
import OrderUserPage from '../pages/order/OrderUserPage';
import MyOrderPage from '../pages/order/MyOrderPage';
import OrderDetailPage from '../pages/order/OrderDetailPage';

const OrderRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/user" element={<OrderUserPage />} />
        <Route path="/myOrder" element={<MyOrderPage />} />
        <Route path="/Detail" element={<OrderDetailPage />} />
      </Routes>
    </>
  );
};

export default OrderRoutes;
