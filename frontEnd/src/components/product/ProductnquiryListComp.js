import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { getProductDetail } from '../../api/productRestAPI';
import { getIdFromSessionStorage } from '../../common/settings';

const ProductInquiryListComp = () => {

   // userId 받아와서 상품 문의 구현
   const userId = getIdFromSessionStorage();

   // 페이지 이동 함수
   const navigate = useNavigate();

  // 상품 id 추출
  const {productId} = useParams();

  // serverData
  const [serverData, setServerData] = useState({
    status: 0,
    message: '',
    results: {
      inquiries: [],
      product: {},
    },
  });

  useEffect(() => {
    getProductDetail(productId).then((jsonData) => {
      console.log(jsonData);
      setServerData(jsonData);
    });
  }, [productId]);

  // 상품 문의 버튼
  const handleProductInqButton = async () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    navigate(`/qna/regist?productId=${productId}`);
  }

  return (
    <>
      <div className="product-header">상품 문의</div>
      <button className='product-inquire' onClick={handleProductInqButton}>문의하기</button>
      <Table hover>
        {serverData?.results?.inquiries?.length === 0 ? (
          <div>문의 내역이 없습니다.</div>
        ) : (
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>상품</th>
              <th style={{ whiteSpace: 'nowrap' }}>문의 제목</th>
              <th style={{ whiteSpace: 'nowrap' }}>닉네임</th>
              <th style={{ whiteSpace: 'nowrap' }}>문의 일자</th>
              <th style={{ whiteSpace: 'nowrap' }}>답변</th>
            </tr>
          </thead>
        )}
        <tbody>
          {serverData?.results?.inquiries?.map((inquiries) => (
            <tr
              key={inquiries?.inquiryId}
              style={{ textAlign: 'center' }}
              >
              <td>{inquiries?.product?.productName}</td>
              <td>{inquiries?.inquiryTitle}</td>
              <td>{inquiries?.user?.userNickname}</td>
              <td>{inquiries?.createDt.replace('T', ' ')}</td>
              <td>{inquiries?.inquiryReplyYn === 'N' ? '미답변' : '답변'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};


export default ProductInquiryListComp;