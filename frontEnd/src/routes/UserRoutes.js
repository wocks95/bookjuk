/**
 * 회원 URL 매핑 관리
 *
 * Developer : 김재찬
 */

import { Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/user/LoginPage';
import LogoutPage from '../pages/user/LogoutPage';
import SignUpPage from '../pages/user/SignUpPage';
import MyPage from '../pages/user/MyPage';
import UpdateUserPage from '../pages/user/UpdateUserPage';
import KakaoRedirectComp from '../components/user/Kakao/KakaoRedirectComp';
import KakaoEasySignup from '../components/user/Kakao/KakaoEasySignup';
import ProductLikePage from '../pages/product/ProductLikePage';
import CartUserPage from '../pages/cart/CartUserPage';
import OrderUserPage from '../pages/order/OrderUserPage';
import MyOrderPage from '../pages/order/MyOrderPage';
import OrderDetailPage from '../pages/order/OrderDetailPage';
import NaverRedirectComp from '../components/user/Naver/NaverRedirectComp';
import MyInfoPage from '../pages/user/MyInfoPage';
import AnonymousPage from '../pages/user/AnonymousPage';
import NaverEasySignup from '../components/user/Naver/NaverEasySignup';
import VerifyPassword from '../components/user/VerifyPassword';
import SecondhandMypagePage from '../pages/secondhand/SecondhandMypagePage';
import QnAMypagePage from '../pages/qna/QnAMypagePage';
import QnADetailMypagePage from '../pages/qna/QnADetailMypagePage';

const UserRoutes = () => {
  return (
    <>
      <Routes>
          <Route path="/" element={<MyPage />}>
            <Route path="/myinfo" element={<MyInfoPage />}/>
            <Route path="/verify" element={<VerifyPassword />} />
            <Route path="/order/myOrder" element={<MyOrderPage />} />
            <Route path="/wish/:userId" element={<ProductLikePage />} />
            <Route path="/secondhand/:userId" element={<SecondhandMypagePage />} />
            <Route path="/qna/:userId" element={<QnAMypagePage />} />
            <Route path="/qna/detail/:qnaId" element={<QnADetailMypagePage />} />            
          </Route>          
            <Route path="/carts/user" element={<CartUserPage />} />
            <Route path="/order/Detail" element={<OrderDetailPage />} />
            <Route path="/order/user" element={<OrderUserPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/update" element={<UpdateUserPage />} />
            <Route path="/anonymouspage" element={<AnonymousPage />}/>
            <Route path="/kakaoLogin" element={<KakaoRedirectComp />} />
            <Route path="/NaverLogin" element={<NaverRedirectComp />} />
            <Route path="/easySignup" element={<KakaoEasySignup />} />
            <Route path="/naverSignup" element={<NaverEasySignup />} />
      </Routes>
    </>
  );
};

export default UserRoutes;
