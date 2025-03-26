import React, { useEffect, useState } from "react";
import { getIdFromSessionStorage } from "../../common/settings";
import {
  getMyOrderData,
  getAllCancelStatus,
  getAllCancelDefinitions,
  sendCancelRequest,
  getOrderDetailData,
  cancelCancelRequest,
} from "../../api/orderAPI";
import PageComp from "../common/PageComp";
import OrderNavigate from "../../hooks/OrderNavigate";
import { useSearchParams } from "react-router-dom";
import CustomNavigate from "../../hooks/CustomNavigate";
import "../../css/order/order.css";

/**
 * ErrorModal 컴포넌트
 */
const ErrorModal = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="error-modal"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1050,
        padding: "20px",
        backgroundColor: "rgba(255,255,255,0.9)",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    >
      {message}
    </div>
  );
};

/**
 * OrderCancellation 컴포넌트
 */
const OrderCancellation = ({
  orderId,
  userId,
  orderItemId,
  orderStatus,
  onRefresh, // 부모에서 전달받은 재조회 콜백
}) => {
  const CANCEL_REQUEST_STATUS = 2;
  const CANCEL_WITHDRAWAL_STATUS = 4;

  const [cancelReasonDto, setCancelReasonDto] = useState(null);
  const [loading, setLoading] = useState(true);

  // 주문 상세 정보 조회
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const data = await getOrderDetailData(orderId);
        let targetOrderItem = orderItemId
          ? data.results.order.orderItems.find(
              (item) => item.orderItemId === orderItemId
            )
          : data.results.order.orderItems[0];
        if (
          targetOrderItem &&
          targetOrderItem.cancelReasons &&
          targetOrderItem.cancelReasons.length > 0
        ) {
          const found = targetOrderItem.cancelReasons.find((cr) =>
            cr.cancelStatus?.cancelStatusId === CANCEL_REQUEST_STATUS
          );
          if (found) {
            setCancelReasonDto(found);
          }
        }
        console.log("cancelReasons:", targetOrderItem.cancelReasons);

      } catch (error) {
        console.error("주문 상세 정보 조회 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, orderItemId]);

  // 취소 철회 로직
  const handleCancelWithdrawal = async () => {
    const confirmed = window.confirm("정말 취소 철회를 진행하시겠습니까?");
    if (confirmed && cancelReasonDto) {
      try {
        const updatedCancelReasonDto = {
          cancelReasonId: cancelReasonDto.cancelReasonId,
          cancelStatus: {
            cancelStatusId: "4",
            statusName: "취소철회",
          },
        };
        console.log("취소 철회 요청 payload:", updatedCancelReasonDto);

        await cancelCancelRequest(updatedCancelReasonDto);
        alert("취소 철회 요청이 성공적으로 처리되었습니다.");
        // 성공 후 부모 컴포넌트에 데이터 재조회 요청
        onRefresh();
      } catch (error) {
        console.error("취소 철회 요청 처리 중 오류 발생:", error);
        alert("취소 철회 요청 처리 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) return <div>로딩중...</div>;
  if (!cancelReasonDto) return null;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ marginRight: "8px" }}>취소요청</span>
      <button
        type="button"
        onClick={handleCancelWithdrawal}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        ×
      </button>
    </div>
  );
};

/**
 * CancelRequestModal 컴포넌트
 */
const CancelRequestModal = ({
  order,
  onClose,
  onSubmit,
  cancelRequestStatus,
  onRefresh, // 부모에서 전달받은 재조회 콜백
}) => {
  const eligibleItems = order.orderItems.filter(
    (item) => item.orderStatus.statusName === "결제완료"
  );
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedCancelDefinitionId, setSelectedCancelDefinitionId] =
    useState("");
  const [customReason, setCustomReason] = useState("");
  const [cancelDefinitions, setCancelDefinitions] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    getAllCancelDefinitions()
      .then((jsonData) => {
        const definitions = jsonData.results.cancelDefinitions;
        setCancelDefinitions(definitions);
      })
      .catch((error) => {
        console.error("취소 사유 조회에 실패했습니다.", error);
      });
  }, []);

  const handleCheckboxChange = (productId, maxQuantity) => {
    setSelectedItems((prev) => {
      if (prev.hasOwnProperty(productId)) {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      } else {
        return { ...prev, [productId]: maxQuantity };
      }
    });
  };

  const handleCheckboxClick = (
    e,
    productId,
    maxQuantity,
    isAlreadyCancelled
  ) => {
    if (isAlreadyCancelled) {
      e.preventDefault();
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    } else {
      handleCheckboxChange(productId, maxQuantity);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(selectedItems).length === 0) {
      alert("취소할 상품을 선택해주세요.");
      return;
    }
    if (!selectedCancelDefinitionId) {
      alert("취소 사유를 선택해주세요.");
      return;
    }
    const selectedItemsArray = Object.keys(selectedItems).map((productId) => ({
      productId,
      quantity: selectedItems[productId],
    }));
    onSubmit(selectedItemsArray, selectedCancelDefinitionId, customReason);
    // 제출 후 모달 닫기
    onClose();
    // 데이터 재조회
    onRefresh();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div>
          <h4>취소 가능한 상품 목록</h4>
          <div
            className="cancel-items-container"
            style={{ maxHeight: "150px", overflowY: "auto" }}
          >
            {eligibleItems.map((item) => {
              const productId = item.product.productId;
              const isAlreadyCancelled =
                item.cancelReasons &&
                item.cancelReasons.some(
                  (cr) =>
                    (cr.cancelStatus &&
                      cr.cancelStatus.cancelStatusId ===
                        cancelRequestStatus?.cancelStatusId) ||
                    cr.cancelStatusId === cancelRequestStatus?.cancelStatusId
                );
              const isChecked = selectedItems.hasOwnProperty(productId);
              const quantitySelected = selectedItems[productId] || 1;
              return (
                <div key={productId} className="cancel-item">
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        className="form-check-input custom-checkbox me-2"
                        onClick={(e) =>
                          handleCheckboxClick(
                            e,
                            productId,
                            item.quantity,
                            isAlreadyCancelled
                          )
                        }
                        checked={isChecked}
                      />
                      <span>{item.product.productName}</span>
                    </div>
                    {isChecked && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <span style={{ marginRight: "10px" }}>
                          {(item.price * quantitySelected).toLocaleString()} 원
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={item.quantity}
                          value={quantitySelected}
                          onChange={(e) =>
                            handleQuantityChange(
                              productId,
                              Math.min(
                                Math.max(parseInt(e.target.value) || 1, 1),
                                item.quantity
                              )
                            )
                          }
                          style={{ width: "60px" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {eligibleItems.length === 0 && <p>취소 가능한 상품이 없습니다.</p>}
          </div>
          <div className="cancel-field">
            <label>취소 사유 선택:</label>
            <select
              value={selectedCancelDefinitionId}
              onChange={(e) => setSelectedCancelDefinitionId(e.target.value)}
              className="cancel-select"
            >
              <option value="">-- 사유 선택 --</option>
              {cancelDefinitions.map((cancelDef) => (
                <option
                  key={cancelDef.cancelDefinitionId}
                  value={cancelDef.cancelDefinitionId}
                >
                  {cancelDef.cancelReasonDefinition}
                </option>
              ))}
            </select>
          </div>
          <div className="cancel-field">
            <label>취소 사유 작성:</label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="추가 사유를 작성해주세요 (선택 사항)"
              className="cancel-textarea"
            />
          </div>
          <div className="cancel-btn-group">
            <button
              className="btn btn-secondary cancel-btn-margin"
              onClick={onClose}
            >
              취소
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              취소 요청
            </button>
          </div>
        </div>
        {showErrorModal && (
          <ErrorModal
            message="취소요청이 진행중인 상품은 취소요청 불가능합니다"
            onClose={() => setShowErrorModal(false)}
          />
        )}
      </div>
    </div>
  );
};

/**
 * MyOrderComp 컴포넌트
 */
const MyOrderComp = () => {
  const { goToOrderDetailPage, goToMyOrderListPage } = OrderNavigate();
  const { goToProductListDetailPage } = CustomNavigate();

  const userId = getIdFromSessionStorage() || 0;

  const [orders, setOrders] = useState([]);
  const [pageDto, setPageDto] = useState(null);
  const [pageList, setPageList] = useState([]);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelRequestStatus, setCancelRequestStatus] = useState(null);

  // 페이지 이동/정렬 관련
  const [queryParams] = useSearchParams();
  const page = queryParams.get("page") ? parseInt(queryParams.get("page")) : 1;
  const size = queryParams.get("size") ? parseInt(queryParams.get("size")) : 5;
  const sort = queryParams.get("sort") || "orderId,desc";

  // ★ 데이터 재조회 트리거 (refreshKey) 추가
  const [refreshKey, setRefreshKey] = useState(0);

  // 주문 데이터 조회
  useEffect(() => {
    getMyOrderData({ userId, page, size, sort })
      .then((jsonData) => {
        const results = jsonData.results;
        setOrders(results.orderList);
        setPageDto(results.pageDto);
        setPageList(results.pageList);
      })
      .catch((error) => {
        console.error("주문 데이터를 불러오는데 실패했습니다.", error);
      });
  }, [userId, page, size, sort, refreshKey]);
  // refreshKey가 변하면 재조회

  // 취소 상태 데이터 조회
  useEffect(() => {
    getAllCancelStatus()
      .then((jsonData) => {
        const statuses = jsonData.results.cancelStatus;
        if (statuses) {
          const cancelReqStatus = statuses.find(
            (status) => status.statusName === "취소요청"
          );
          if (cancelReqStatus) {
            setCancelRequestStatus(cancelReqStatus);
          }
        }
      })
      .catch((error) => {
        console.error("취소 상태 조회에 실패했습니다.", error);
      });
  }, []);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  // 리뷰 가능 여부
  const isReviewAllowed = (modifyDt) => {
    const now = new Date();
    const purchaseDate = new Date(modifyDt);
    const diffInDays = (now - purchaseDate) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  };

  // 리뷰 버튼
  const ReviewButton = ({ modifyDt, onReview }) => {
    const reviewAllowed = isReviewAllowed(modifyDt);
    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {
      if (!reviewAllowed) {
        setShowModal(true);
      } else {
        onReview();
      }
    };

    return (
      <div className="review-btn-container">
        <button
          className={`btn ${reviewAllowed ? "btn-primary" : "btn-secondary"}`}
          onClick={handleClick}
          style={{ cursor: reviewAllowed ? "pointer" : "not-allowed" }}
        >
          리뷰 작성
        </button>
        {showModal && (
          <ErrorModal
            message="구매 7일이 경과되어 리뷰작성이 불가능합니다"
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    );
  };

  // 취소 모달 열기/닫기
  const handleOpenCancelModal = (order) => setCancelModalOrder(order);
  const handleCloseCancelModal = () => setCancelModalOrder(null);

  // ★ 데이터 재조회 콜백
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // 취소 요청 처리
  const handleCancelRequestSubmit = (
    selectedItemsArray,
    cancelDefinition,
    customReason
  ) => {
    const cancelRequests = selectedItemsArray
      .map((item) => {
        const orderItem = cancelModalOrder.orderItems.find(
          (oi) =>
            oi.product.productId === parseInt(item.productId) &&
            oi.orderStatus.statusName === "결제완료"
        );
        if (!orderItem) return null;
        return {
          orderItem: orderItem,
          quantity: item.quantity,
          cancelDefinition: {
            cancelDefinitionId: parseInt(cancelDefinition.cancelDefinitionId),
          },
          cancelReason: customReason ? customReason : "",
          cancelStatus: cancelRequestStatus || {
            cancelStatusId: "2",
            statusName: "취소요청",
          },
        };
      })
      .filter((x) => x !== null);

    console.log("취소 요청 제출 payload:", cancelRequests);

    sendCancelRequest(cancelRequests)
      .then((response) => {
        console.log("취소 요청 성공:", response);
        // 모달을 닫고, 데이터 재조회
        setCancelModalOrder(null);
        handleRefresh();
      })
      .catch((error) => {
        console.error("취소 요청 실패:", error);
        alert("취소 요청 처리 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">주문 내역</h2>
      {orders.length === 0 ? (
        <div className="alert alert-info" role="alert">
          주문 내역이 존재하지 않습니다.
        </div>
      ) : (
        orders.map((order) => (
          <div className="card mb-4" key={order.orderId}>
            <div className="card-header">
              <div className="row">
                <div className="col-md-6 d-flex align-items-center">
                  <h5>주문번호: {order.orderId}</h5>
                </div>
                <div className="col-md-6 d-flex justify-content-end align-items-center">
                  <h6>{formatDate(order.createDt)}</h6>
                  <button
                    className="btn btn-link order-detail-btn"
                    onClick={() => goToOrderDetailPage(order.orderId)}
                  >
                    주문 상세보기
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item, idx) => {
                  const isCancellationRequested =
                    item.cancelReasons &&
                    item.cancelReasons.some(
                      (cr) =>
                        (cr.cancelStatus &&
                          cr.cancelStatus.cancelStatusId ===
                            cancelRequestStatus?.cancelStatusId) ||
                        cr.cancelStatusId ===
                          cancelRequestStatus?.cancelStatusId
                    );
                  return (
                    <div
                      className="row mb-2 align-items-center"
                      key={idx}
                      style={
                        isCancellationRequested
                          ? { backgroundColor: "#ffe6f2" }
                          : {}
                      }
                    >
                      <div
                        className="col-md-2 clickable"
                        onClick={() =>
                          goToProductListDetailPage(item.product.productId)
                        }
                      >
                        <img
                          src={item.product.productImage}
                          alt={item.product.productName}
                          className="order-product-img"
                        />
                      </div>
                      <div className="col-md-8">
                        <div
                          className="clickable"
                          onClick={() =>
                            goToProductListDetailPage(item.product.productId)
                          }
                        >
                          <h4>{item.product.productName}</h4>
                        </div>
                        <div className="row align-items-center">
                          <div className="col-md-3">{item.quantity} 개</div>
                          <div className="col-md-3">
                            총 {(item.quantity * item.price).toLocaleString()}{" "}
                            원
                          </div>
                          <div className="col-md-3">
                            진행상태 : {item.orderStatus.statusName}
                          </div>
                          <div className="col-md-3">
                            {isCancellationRequested && (
                              <OrderCancellation
                                orderId={order.orderId}
                                userId={order.user.userId}
                                orderItemId={item.orderItemId}
                                cancelStatus={item.orderStatus}
                                onRefresh={handleRefresh}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      {item.orderStatus.statusName === "배송완료" && (
                        <div className="col-md-2 d-flex align-items-center justify-content-center">
                          <ReviewButton
                            modifyDt={item.modifyDt}
                            onReview={() => {
                              console.log("리뷰 작성 페이지로 이동");
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="card-text">주문 항목이 없습니다.</p>
              )}
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <div className="low">
                합계 :{" "}
                {order.orderItems
                  .reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )
                  .toLocaleString()}{" "}
                원
              </div>
              {order.orderItems.some(
                (item) => item.orderStatus.statusName === "결제완료"
              ) && (
                <button
                  className="btn btn-warning"
                  onClick={() => handleOpenCancelModal(order)}
                >
                  주문취소
                </button>
              )}
            </div>
          </div>
        ))
      )}
      {orders.length !== 0 && pageDto && pageList.length !== 0 && (
        <PageComp
          serverData={{ results: { pageDto, pageList } }}
          goToListPage={goToMyOrderListPage}
          size={size}
          sort={sort}
        />
      )}
      {cancelModalOrder && (
        <CancelRequestModal
          order={cancelModalOrder}
          onClose={handleCloseCancelModal}
          onSubmit={handleCancelRequestSubmit}
          cancelRequestStatus={cancelRequestStatus}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default MyOrderComp;
