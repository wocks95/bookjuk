/**
 * Q&A URL 매핑 관리
 *
 * Developer : 김민희
 */

import { Route, Routes } from 'react-router-dom';
import QnAPage from '../pages/qna/QnAPage';
import QnARegistPage from '../pages/qna/QnARegistPage';
import QnaDetailPage from '../pages/qna/QnaDetailPage';
import QnaModifyPage from '../pages/qna/QnaModifyPage';

const QnaRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<QnAPage />} />
        <Route path="/regist" element={<QnARegistPage />} />
        <Route path="/detail/:id" element={<QnaDetailPage />} />
        <Route path="/modify/:id" element={<QnaModifyPage />} />
      </Routes>
    </>
  );
};

export default QnaRoutes;
