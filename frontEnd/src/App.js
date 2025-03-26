/**
 * 페이지 URL 매핑 관리
 *
 * Developer : 김리예
 */

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import React, { createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { UserContext } from './components/common/UserContext'; // Context 불러오기

import BasicLayout from './layouts/BasicLayout';
import IndexPage from './pages/IndexPage';

// 각 페이지별 라우터
import UserRoutes from './routes/UserRoutes';
import NoticeRoutes from './routes/NoticeRoutes';
import ProductRoutes from './routes/ProductRoutes';
import SecondhandRoutes from './routes/SecondhandRoutes';
import FaqRoutes from './routes/FaqRoutes';
import QnaRoutes from './routes/QnaRoutes';
import OrderRoutes from './routes/OrderRoutes';
import SearchRoutes from './routes/SearchRoutes';

// 관리자
import AdminRoutes from './routes/AdminRoutes';

// 장바구니
import CartUserPage from './pages/cart/CartUserPage';

function App() {
  const [loginFlag, setLoginFlag] = useState(false); // 로그인 상태
  const [cartItemCount, setCartItemCount] = useState(0); // 장바구니 아이템 개수

  // useEffect(() => {}, [loginFlag, cartItemCount]);

  return (
    <>
      <UserContext.Provider value={{ loginFlag, setLoginFlag, cartItemCount, setCartItemCount }}>
        <BrowserRouter>
          <Routes>
            <Route element={<BasicLayout />}>
              <Route path="/" element={<IndexPage />} />
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/product/*" element={<ProductRoutes />} />
              <Route path="/secondhand/*" element={<SecondhandRoutes />} />
              <Route path="/notice/*" element={<NoticeRoutes />} />
              <Route path="/faq/*" element={<FaqRoutes />} />
              <Route path="/qna/*" element={<QnaRoutes />} />
              <Route path="/order/*" element={<OrderRoutes />} />
              <Route path="/user/*" element={<UserRoutes />} />
              <Route path="/carts/user" element={<CartUserPage />} />
              <Route path="/search/*" element={<SearchRoutes />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserContext.Provider>
    </>
  );
}

export default App;
