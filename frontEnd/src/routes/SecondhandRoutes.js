/**
 * 중고상품 URL 매핑 관리
 *
 * Developer : 김민희
 */

import { Route, Routes } from 'react-router-dom';
import SecondHandPage from '../pages/secondhand/SecondHandPage';
import SecondHandRegistPage from '../pages/secondhand/SecondHandRegistPage';
import SecondHandDetailPage from '../pages/secondhand/SecondHandDetailPage';
import SecondHandModifyPage from '../pages/secondhand/SecondHandModifyPage';

const SecondhandRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<SecondHandPage />} />
        <Route path="/regist" element={<SecondHandRegistPage />} />
        <Route path="/detail/:id" element={<SecondHandDetailPage />} />
        <Route path="/modify/:id" element={<SecondHandModifyPage />} />
      </Routes>
    </>
  );
};

export default SecondhandRoutes;
