/**
 * FAQ URL 매핑 관리
 *
 * Developer : 김민희
 */

import { Route, Routes } from 'react-router-dom';
import FAQPage from '../pages/faq/FAQPage';
import FAQRegistPage from '../pages/faq/FAQRegistPage';
import FAQDetailPage from '../pages/faq/FAQDetailPage';
import FAQModifyPage from '../pages/faq/FAQModifyPage';

const FaqRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<FAQPage />} />
        <Route path="/regist" element={<FAQRegistPage />} />
        <Route path="/detail/:id" element={<FAQDetailPage />} />
        <Route path="/modify/:id" element={<FAQModifyPage />} />
      </Routes>
    </>
  );
};

export default FaqRoutes;
