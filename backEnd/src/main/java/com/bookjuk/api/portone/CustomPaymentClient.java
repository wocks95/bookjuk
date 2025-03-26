package com.bookjuk.api.portone;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import com.bookjuk.api.portone.response.CustomPayment;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.portone.sdk.server.errors.ForbiddenError;
import io.portone.sdk.server.errors.ForbiddenException;
import io.portone.sdk.server.errors.GetPaymentError;
import io.portone.sdk.server.errors.InvalidRequestError;
import io.portone.sdk.server.errors.InvalidRequestException;
import io.portone.sdk.server.errors.PaymentNotFoundError;
import io.portone.sdk.server.errors.PaymentNotFoundException;
import io.portone.sdk.server.errors.UnauthorizedError;
import io.portone.sdk.server.errors.UnauthorizedException;
import io.portone.sdk.server.errors.UnknownException;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * 포트원에서 제공하는 PaymentClient 로 getPayment 시 파싱 오류로
 * 자바코드로 변환 후 단건 내역 조회를 요청하는 클라이언트입니다.
 * 요청 결과는 CustomPayment 클래스로 받습니다.
 */
public class CustomPaymentClient {

  private final String       apiSecret;
  private final String       apiBase;
  private final String       storeId;
  private final OkHttpClient client;
  private final ObjectMapper objectMapper;

  public CustomPaymentClient(String apiSecret, String apiBase, String storeId) {
    this.apiSecret    = apiSecret;
    this.apiBase      = apiBase != null ? apiBase : "https://api.portone.io";
    this.storeId      = storeId;
    this.client       = new OkHttpClient();
    this.objectMapper = new ObjectMapper();
  }

  /**
   * 결제 단건 조회
   */
  public CompletableFuture<CustomPayment> getPayment(String paymentId) {
    return CompletableFuture.supplyAsync(() -> {
      try {
        // URL 생성
        HttpUrl.Builder urlBuilder = HttpUrl.parse(apiBase).newBuilder()
            .addPathSegment("payments")
            .addPathSegment(paymentId);
        if (storeId != null) {
          urlBuilder.addQueryParameter("storeId", storeId);
        }
        String url = urlBuilder.build().toString();

        // HTTP 요청 생성
        Request request = new Request.Builder()
            .url(url)
            .header("Authorization", "PortOne " + apiSecret)
            .header("Accept", "application/json")
            // .header("User-Agent", USER_AGENT)
            .get()
            .build();

        // 요청 실행
        try (Response response = client.newCall(request).execute()) {
          if (!response.isSuccessful()) {
            // HTTP 오류 처리
            String httpBody = response.body().string();
            handleErrorResponse(httpBody);
          }

          // 성공 응답 처리
          String httpBody = response.body().string();
          return objectMapper.readValue(httpBody, CustomPayment.class);
        }
      }
      catch (IOException e) {
        throw new RuntimeException("Failed to fetch payment: " + e.getMessage(), e);
      }
    });
  }

  /**
   * HTTP 오류 응답 처리
   */
  private void handleErrorResponse(String httpBody) {
    try {
      GetPaymentError.Recognized error =
          objectMapper.readValue(httpBody, GetPaymentError.Recognized.class);
      if (error instanceof ForbiddenError) {
        // 요청이 거절된 경우
        throw new ForbiddenException((ForbiddenError) error);
      }
      else if (error instanceof InvalidRequestError) {
        // 요청된 입력 정보가 유효하지 않은 경우
        throw new InvalidRequestException((InvalidRequestError) error);
      }
      else if (error instanceof PaymentNotFoundError) {
        // 결제 건이 존재하지 않는 경우
        throw new PaymentNotFoundException((PaymentNotFoundError) error);
      }
      else if (error instanceof UnauthorizedError) {
        // 인증 정보가 올바르지 않은 경우
        throw new UnauthorizedException((UnauthorizedError) error);
      }
      else {
        throw new UnknownException("Unknown API error: " + httpBody);
      }
    }
    catch (Exception e) {
      System.out.println(httpBody);
      e.printStackTrace();
    }
  }

  /**
   * 클라이언트 종료
   */
  public void close() {
    client.dispatcher().executorService().shutdown();
  }

}
