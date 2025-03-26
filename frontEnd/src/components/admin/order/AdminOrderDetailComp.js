import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminNavigate from "../../../hooks/AdminNavigate";
import {
  getOrderDetail,
  getOrderStatusList,
  updateOrderItem,
} from "../../../api/adminAPI";
import { modifyDeliAddr } from "../../../api/deliAddrAPI"; // 배송지 수정 API
import { getAllCancelStatus } from "../../../api/orderAPI";
import AddressSearchComp from "../../order/AddressSearchComp";
import { Button, Modal, Form } from "react-bootstrap";
import "../../../css/admin/order.css";
import "../../../css/order/order.css";
import { toast } from "react-toastify";

// [추가] 취소요청 정의ID별 표시용(예시)
const getCancelReasonDefinitionName = (cancelDefinitionId) => {
  // 실제 로직에서는 cancelDefinitionId=1일 때 "단순변심",
  // 2일 때 "상품불량" 등으로 매핑하시면 됩니다.
  switch (cancelDefinitionId) {
    case 1:
      return "취소요청 정의1";
    case 2:
      return "취소요청 정의2";
    default:
      return "기타 사유";
  }
};

const AdminOrderDetailComp = () => {
  // URL 파라미터에서 주문 ID 추출 및 페이지 이동 훅 사용
  const { orderId } = useParams();
  const { goToOrderListPage } = AdminNavigate();

  // 주문 상세 정보 및 관련 데이터 상태
  const [serverData, setServerData] = useState(null);
  const [orderItemList, setOrderItemList] = useState([]);
  const [orderStatusList, setOrderStatusList] = useState([]);
  const [cancelStatuses, setCancelStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 주문 항목 수정 모달 상태 및 입력값 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);

  // 모달 내부에서 여러 취소 요청을 다룰 수 있도록 states 추가
  const [editReasonList, setEditReasonList] = useState([]); // 해당 orderItem의 cancelReasons 배열
  const [editSelectedReasonId, setEditSelectedReasonId] = useState(null); // 드롭다운에서 선택된 cancelReasonId

  // 모달 내부 필드(주문상태·취소상태·수량·관리자답변 등)
  const [editOrderStatus, setEditOrderStatus] = useState("");
  const [editCancelStatus, setEditCancelStatus] = useState("");
  const [editCancelQuantity, setEditCancelQuantity] = useState(0);
  const [editReturnReason, setEditReturnReason] = useState("");

  // 배송지(주소) 수정 모달 및 배송지 정보 상태
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);

  // 취소 요청 히스토리 펼침 여부 (orderItemId별)
  const [expandedCancelHistory, setExpandedCancelHistory] = useState({});

  // 데이터 병렬 로드
  useEffect(() => {
    if (!orderId) {
      setError("주문 번호가 없습니다.");
      setLoading(false);
      return;
    }

    Promise.all([
      getOrderDetail(orderId),
      getOrderStatusList(),
      getAllCancelStatus(),
    ])
      .then(([orderData, orderStatusData, cancelStatusData]) => {
        if (orderData?.results?.order) {
          setServerData(orderData);
          setOrderItemList(orderData.results.order.orderItems);
          if (orderData.results.order.deliAddr) {
            setShippingAddress(orderData.results.order.deliAddr);
          }
        } else {
          setError("주문 정보를 찾을 수 없습니다.");
        }
        if (orderStatusData?.results?.orderStatusList) {
          setOrderStatusList(orderStatusData.results.orderStatusList);
        }
        if (cancelStatusData?.results?.cancelStatus) {
          setCancelStatuses(cancelStatusData.results.cancelStatus);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로드 실패", err);
        setError("주문 상세 데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [orderId]);

  // 주문 항목 목록과 서버 데이터 동기화
  useEffect(() => {
    if (
      orderItemList.length > 0 &&
      serverData &&
      JSON.stringify(orderItemList) !==
        JSON.stringify(serverData.results.order.orderItems)
    ) {
      setServerData((prevData) => ({
        ...prevData,
        results: {
          ...prevData.results,
          order: {
            ...prevData.results.order,
            orderItems: orderItemList,
          },
        },
      }));
    }
  }, [orderItemList, serverData]);

  // 취소 상태 ID에 해당하는 상태명 반환 함수
  const getCancelStatusName = (cancelStatusId) => {
    const statusObj = cancelStatuses.find(
      (status) => status.cancelStatusId === cancelStatusId
    );
    return statusObj ? statusObj.statusName : "알 수 없음";
  };

  // 취소 요청 히스토리 토글
  const toggleCancelHistory = (orderItemId) => {
    setExpandedCancelHistory((prev) => ({
      ...prev,
      [orderItemId]: !prev[orderItemId],
    }));
  };

  // 주문 항목 수정 모달 열기
  const handleEditClick = (item) => {
    setSelectedOrderItem(item);
    // 주문 상태는 해당 아이템의 현재 상태로 초기화
    setEditOrderStatus(item.orderStatus.orderStatusId || "");

    // 해당 아이템의 취소 요청 내역( cancelReasons )을 state에 저장
    const reasons = item.cancelReasons || [];
    setEditReasonList(reasons);

    if (reasons.length > 0) {
      // (1) "취소요청"(cancelStatusId===2) 상태가 있는지 먼저 확인
      const pendingRequest = reasons.find(
        (r) => r.cancelStatus?.cancelStatusId === 2
      );
      if (pendingRequest) {
        // "취소요청" 상태가 있다면 그 요청을 기본값
        setEditSelectedReasonId(pendingRequest.cancelReasonId);
      } else {
        // 없다면 마지막 요청을 기본값
        setEditSelectedReasonId(reasons[reasons.length - 1].cancelReasonId);
      }
    } else {
      setEditSelectedReasonId(null);
    }

    setShowEditModal(true);
  };

  // cancelReasonId 드롭다운이 바뀌면 그에 맞춰 상태 업데이트
  const handleChangeCancelReasonId = (newReasonId) => {
    setEditSelectedReasonId(Number(newReasonId));
  };

  // editSelectedReasonId가 변할 때마다 해당 취소 요청 정보 세팅
  useEffect(() => {
    if (!editSelectedReasonId || editReasonList.length === 0) {
      setEditCancelStatus("");
      setEditCancelQuantity(0);
      setEditReturnReason("");
      return;
    }

    const selectedReasonObj = editReasonList.find(
      (r) => r.cancelReasonId === editSelectedReasonId
    );
    if (!selectedReasonObj) return;

    setEditCancelStatus(selectedReasonObj?.cancelStatus?.cancelStatusId || "");
    setEditCancelQuantity(selectedReasonObj?.quantity || 0);
    setEditReturnReason(selectedReasonObj?.returnReason || "");
  }, [editSelectedReasonId, editReasonList]);

  // 주문 항목 수정 모달 닫기
  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedOrderItem(null);
    setEditReasonList([]);
    setEditSelectedReasonId(null);
    setEditOrderStatus("");
    setEditCancelStatus("");
    setEditCancelQuantity(0);
    setEditReturnReason("");
  };

  // **[수정] 주문 항목 수정 저장 (payload 구조 변경)**
  const handleModalSave = () => {
    if (!selectedOrderItem) return;

    // 주문 상태명 찾기
    const matchedOrderStatus = orderStatusList.find(
      (status) => status.orderStatusId === Number(editOrderStatus)
    );

    // 현재 선택된 cancelReasonId에 해당하는 객체 찾기(업데이트 시)
    const reasonObj = editReasonList.find(
      (r) => r.cancelReasonId === editSelectedReasonId
    );

    // 취소 사유(cancelReason) 파트 구성
    let cancelReasonPayload = null;
    if (reasonObj) {
      // 기존 취소 요청이 있는 경우 -> 업데이트
      cancelReasonPayload = {
        cancelReasonId: reasonObj.cancelReasonId, // 기존 취소요청 ID
        cancelDefinition: {
          cancelDefinitionId: reasonObj.cancelDefinitionId,
          cancelReasonDefinition: getCancelReasonDefinitionName(
            reasonObj.cancelDefinitionId
          ),
        },
        quantity: parseInt(editCancelQuantity, 10),
        returnReason: editReturnReason || "",
        cancelStatus: editCancelStatus
          ? {
              cancelStatusId: Number(editCancelStatus),
              statusName: getCancelStatusName(Number(editCancelStatus)),
            }
          : null,
      };
    } else {
      // 기존 취소 요청이 없고 새로 생성하는 경우 -> 인서트
      // (기본 예시: cancelDefinitionId=1, 필요시 사용자 입력 로직 추가)
      cancelReasonPayload = {
        cancelReasonId: null, // 신규이므로 null
        cancelDefinition: {
          cancelDefinitionId: 1,
          cancelReasonDefinition: "취소요청 정의1",
        },
        quantity: parseInt(editCancelQuantity, 10),
        returnReason: editReturnReason || "",
        cancelStatus: editCancelStatus
          ? {
              cancelStatusId: Number(editCancelStatus),
              statusName: getCancelStatusName(Number(editCancelStatus)),
            }
          : null,
      };
    }

    // 최종으로 보낼 payload
    const payload = {
      order: { orderId: serverData.results.order.orderId },
      orderItem: {
        orderItemId: selectedOrderItem.orderItemId,
        orderStatus: {
          orderStatusId: Number(editOrderStatus),
          statusName: matchedOrderStatus
            ? matchedOrderStatus.statusName
            : "알 수 없음",
        },
      },
    };
    console.log("*******payload", payload);

    // 취소 관련 데이터가 전혀 없으면 cancelReason 자체를 넣지 않음
    // (ex: 일반 상태만 변경하고 싶을 때)
    // 여기서는 수량이 0이거나 editCancelStatus가 비어 있으면 "굳이 넣지 않는다" 식으로 조건화 가능
    // 지금은 예시로 reasonObj가 있든 없든 일단 "quantity가 0보다 크거나, 상태 선택됨" 같은 식으로 분기할 수도 있음
    // 사용 시 로직 맞춰 수정하세요.
    if (parseInt(editCancelQuantity, 10) > 0 || editCancelStatus) {
      payload.cancelReason = cancelReasonPayload;
    }

    // 실제 업데이트 API 호출
    updateOrderItem(payload)
      .then((jsonData) => {
        toast(jsonData.message || "수정 완료");
        // 저장 후 다시 리렌더링 (주문 상세정보 재조회)
        return getOrderDetail(orderId);
      })
      .then((orderData) => {
        setServerData(orderData);
        setOrderItemList(orderData.results.order.orderItems);
        handleModalClose();
      })
      .catch((error) => {
        toast(error.message);
      });
  };

  // 배송지 수정 모달 열기
  const handleAddressModalOpen = () => {
    setShowAddressModal(true);
  };

  // 배송지 수정 모달 닫기
  const handleAddressModalClose = () => {
    setShowAddressModal(false);
  };

  // AddressSearchComp에서 주소 선택 후 호출되는 콜백
  const handleAddressSelect = (address) => {
    const userId = serverData.results.order.user?.userId;
    modifyDeliAddr(shippingAddress.addrId, userId, address)
      .then(() => {
        toast("배송지가 수정되었습니다.");
        setShippingAddress(address);
        setServerData((prev) => ({
          ...prev,
          results: {
            ...prev.results,
            order: {
              ...prev.results.order,
              deliAddr: address,
            },
          },
        }));
        setShowAddressModal(false);
      })
      .catch((error) => {
        toast("배송지 수정에 실패했습니다.");
        console.error(error);
      });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">로딩중...</span>
        </div>
      </div>
    );
  }

  if (
    error ||
    !serverData ||
    !serverData.results ||
    !serverData.results.order
  ) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error || "주문 정보를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-detail container mt-5">
      <h2 className="mb-4">주문 상세 정보</h2>

      {/* 주문 기본 정보 */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-2">
            <div className="col-md-4">
              <strong>주문 번호:</strong>
            </div>
            <div className="col-md-8">{serverData.results.order.orderId}</div>
          </div>
          <div className="row mb-2">
            <div className="col-md-4">
              <strong>총 결제 금액:</strong>
            </div>
            <div className="col-md-8">
              {serverData.results.order.totalPrice} 원
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-md-4">
              <strong>주문 생성일:</strong>
            </div>
            <div className="col-md-8">
              {new Date(serverData.results.order.createDt).toLocaleString()}
            </div>
          </div>
          {serverData.results.order.modifyDt && (
            <div className="row mb-2">
              <div className="col-md-4">
                <strong>수정 일시:</strong>
              </div>
              <div className="col-md-8">
                {new Date(serverData.results.order.modifyDt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 배송지 정보 */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">배송지 정보</div>
        <div className="card-body">
          {serverData.results.order.deliAddr ? (
            <div className="row">
              <div className="col-md-8">
                <p>
                  <strong>{serverData.results.order.deliAddr.addrName}</strong>
                  님
                </p>
                <p>
                  <strong>연락처:</strong>{" "}
                  {serverData.results.order.deliAddr.receiverPhone}
                </p>
                <p>
                  <strong>우편번호:</strong>{" "}
                  {serverData.results.order.deliAddr.postcode}{" "}
                  <strong>주소:</strong>{" "}
                  {serverData.results.order.deliAddr.roadAddress}{" "}
                  {serverData.results.order.deliAddr.detailAddress}{" "}
                  {serverData.results.order.deliAddr.extraAddress}
                </p>
                {serverData.results.order.deliAddr.deliveryRequest && (
                  <p>
                    <strong>배송 요청사항:</strong>{" "}
                    {serverData.results.order.deliAddr.deliveryRequest}
                  </p>
                )}
              </div>
              <div className="col-md-4 d-flex align-items-center justify-content-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddressModalOpen}
                >
                  주소 수정
                </Button>
              </div>
            </div>
          ) : (
            <p>배송지 정보가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 주문 항목 목록 */}
      <div className="mb-4">
        <h3 className="mb-3">주문 항목</h3>
        {orderItemList.map((item) => (
          <div key={item.orderItemId} className="card mb-3">
            <div className="card-body">
              <div className="row">
                {/* 상품 이미지 */}
                <div className="col-md-3">
                  <img
                    src={item.product.productImage}
                    alt={item.product.productName}
                    className="order-product-img img-fluid rounded"
                  />
                </div>
                {/* 상품 정보 */}
                <div className="col-md-9">
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <strong>상품명:</strong>
                    </div>
                    <div className="col-md-8">{item.product.productName}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <strong>주문 상태:</strong>
                    </div>
                    <div className="col-md-8">
                      {item.orderStatus.statusName}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <strong>수량:</strong>
                    </div>
                    <div className="col-md-8">{item.quantity}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <strong>가격:</strong>
                    </div>
                    <div className="col-md-8">{item.price} 원</div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 d-flex justify-content-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditClick(item)}
                      >
                        수정
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* 취소 요청 영역 */}
              {item.cancelReasons && item.cancelReasons.length > 0 && (
                <div
                  className="row mt-3"
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <div className="col-12 d-flex justify-content-between align-items-center">
                    <div
                      className={
                        item.cancelReasons.some(
                          (r) =>
                            getCancelStatusName(
                              r.cancelStatus.cancelStatusId
                            ) === "취소요청"
                        )
                          ? "pink-background"
                          : ""
                      }
                    >
                      <strong>취소 히스토리:</strong>
                      {item.cancelReasons.some(
                        (r) =>
                          getCancelStatusName(r.cancelStatus.cancelStatusId) ===
                          "취소요청"
                      ) && (
                        <>
                          {" "}
                          (요청 건수:{" "}
                          {
                            item.cancelReasons.filter(
                              (r) =>
                                getCancelStatusName(
                                  r.cancelStatus.cancelStatusId
                                ) === "취소요청"
                            ).length
                          }
                          )
                        </>
                      )}
                    </div>
                    <div>
                      <Button
                        variant="link"
                        onClick={() => toggleCancelHistory(item.orderItemId)}
                      >
                        {expandedCancelHistory[item.orderItemId] ? "▲" : "▼"}
                      </Button>
                    </div>
                  </div>
                  {expandedCancelHistory[item.orderItemId] && (
                    <div className="col-12 mt-2">
                      {item.cancelReasons.map((reason, index) => (
                        <div
                          key={index}
                          className="border-bottom mb-2 pb-2"
                          style={{
                            backgroundColor:
                              getCancelStatusName(
                                reason.cancelStatus.cancelStatusId
                              ) === "취소요청"
                                ? "#ffe6e6" // 취소요청이면 핑크색
                                : "#e6e6e6", // 그 외(예: 취소철회 등)는 회색
                            padding: "5px",
                            borderRadius: "3px",
                          }}
                        >
                          {/* 요청번호 표시 */}
                          <div className="row">
                            <div className="col-md-4">
                              <strong>요청 번호:</strong>
                            </div>
                            <div className="col-md-8">
                              {reason.cancelReasonId}
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <strong>진행 상태:</strong>
                            </div>
                            <div className="col-md-8">
                              {getCancelStatusName(
                                reason.cancelStatus.cancelStatusId
                              )}
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <strong>요청 날짜:</strong>
                            </div>
                            <div className="col-md-8">
                              {new Date(reason.createDt).toLocaleString()}
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <strong>취소 사유:</strong>
                            </div>
                            <div className="col-md-8">
                              {reason.cancelReason}
                            </div>
                          </div>
                          {reason.returnReason && (
                            <div className="row">
                              <div className="col-md-4">
                                <strong>관리자 답변:</strong>
                              </div>
                              <div className="col-md-8">
                                {reason.returnReason}
                              </div>
                            </div>
                          )}
                          <div className="row">
                            <div className="col-md-4">
                              <strong>요청 수량:</strong>
                            </div>
                            <div className="col-md-8">{reason.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 주문 항목 수정 모달 */}
      <Modal show={showEditModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>주문 항목 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrderItem && (
            <Form>
              {editReasonList.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>취소 요청 번호 선택</Form.Label>
                  <Form.Select
                    value={editSelectedReasonId || ""}
                    onChange={(e) => handleChangeCancelReasonId(e.target.value)}
                  >
                    <option value="">(신규 취소 요청 생성)</option>
                    {editReasonList.map((r) => (
                      <option key={r.cancelReasonId} value={r.cancelReasonId}>
                        요청번호 {r.cancelReasonId}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>주문 상태</Form.Label>
                <Form.Select
                  value={editOrderStatus}
                  onChange={(e) => setEditOrderStatus(e.target.value)}
                >
                  {orderStatusList &&
                    orderStatusList.map((status) => (
                      <option
                        key={status.orderStatusId}
                        value={status.orderStatusId}
                      >
                        {status.statusName}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>취소 상태</Form.Label>
                <Form.Select
                  value={editCancelStatus}
                  onChange={(e) => setEditCancelStatus(e.target.value)}
                >
                  <option value="">(선택 안함)</option>
                  {cancelStatuses &&
                    cancelStatuses.map((status) => (
                      <option
                        key={status.cancelStatusId}
                        value={status.cancelStatusId}
                      >
                        {status.statusName}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>취소(요청) 수량</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={editCancelQuantity}
                  onChange={(e) => setEditCancelQuantity(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>관리자 답변(메모)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="관리자 답변 입력"
                  value={editReturnReason}
                  onChange={(e) => setEditReturnReason(e.target.value)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            저장
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 배송지 수정 모달 (AddressSearchComp 활용) */}
      <Modal show={showAddressModal} onHide={handleAddressModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>배송지 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {shippingAddress && (
            <AddressSearchComp
              initialAddress={shippingAddress}
              onAddressSelect={handleAddressSelect}
              onClose={handleAddressModalClose}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminOrderDetailComp;
