/**
 * 관리자 URL 매핑 관리
 *
 * Developer : 김리예
 */

import { Route, Routes } from 'react-router-dom';
import AdminPage from '../pages/admin/AdminPage';
import LoginLogPage from '../pages/admin/log/LoginLogPage';
import DeleteLogPage from '../pages/admin/log/DeleteLogPage';
import AdminInquiryListPage from '../pages/admin/inquiry/AdminInquiryListPage';
import AdminInquiryDetailPage from '../pages/admin/inquiry/AdminInquiryDetailPage';
import AdminQnAListPage from '../pages/admin/qna/AdminQnAListPage';
import AdminQnADetailPage from '../pages/admin/qna/AdminQnADetailPage';
import AdminReviewListPage from '../pages/admin/review/AdminReviewListPage';
import AdminReviewDetailPage from '../pages/admin/review/AdminReviewDetailPage';
import AdminOrderListPage from '../pages/admin/order/AdminOrderListPage';
import AdminOrderDetailPage from '../pages/admin/order/AdminOrderDetailPage';
import AdminSecondHandListPage from '../pages/admin/secondhand/AdminSecondHandListPage';
import AdminSecondHandDetailPage from '../pages/admin/secondhand/AdminSecondHandDetailPage';

// 관리자 - 상품(김성율)
import AdminProductListPage from '../pages/admin/product/AdminProductListPage';
import AdminProductDetailPage from '../pages/admin/product/AdminProductDetailPage';
import AdminProductRegistPage from '../pages/admin/product/AdminProductRegistPage';
import AdminProductEditPage from '../pages/admin/product/AdminProductEditPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

const AdminRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminPage />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="/loginlog" element={<LoginLogPage />} />
          <Route path="/deletelog" element={<DeleteLogPage />} />
          <Route path="/product/list" element={<AdminProductListPage />} />
          <Route path="/product/regist" element={<AdminProductRegistPage />} />
          <Route path="/secondhand" element={<AdminSecondHandListPage />} />
          <Route path="/secondhand/:secondhandId" element={<AdminSecondHandDetailPage />} />
          <Route path="/product/detail/:productId" element={<AdminProductDetailPage />} />
          <Route path="/product/edit/:productId" element={<AdminProductEditPage />} />
          <Route path="/qna" element={<AdminQnAListPage />} />
          <Route path="/qna/:qnaId" element={<AdminQnADetailPage />} />
          <Route path="/inquiry" element={<AdminInquiryListPage />} />
          <Route path="/inquiry/:inquiryId" element={<AdminInquiryDetailPage />} />
          <Route path="/review" element={<AdminReviewListPage />} />
          <Route path="/review/:reviewId" element={<AdminReviewDetailPage />} />
          <Route path="/order" element={<AdminOrderListPage />} />
          <Route path="/order/:orderId" element={<AdminOrderDetailPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default AdminRoutes;
