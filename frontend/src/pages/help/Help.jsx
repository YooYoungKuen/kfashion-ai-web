import React from "react";
import "./Help.css";

export default function Help() {
  return (
    <section className="help">
      <div className="help-inner">
        {/* 헤더 */}
        <h1>
          문의사항
        </h1>
        <p className="desc">
          REVIA에 궁금한 점이 있으신가요?  
          아래 자주 묻는 질문(FAQ)을 확인하거나 문의를 남겨주세요.
        </p>

        {/* FAQ 섹션 */}
        <div className="faq-grid">
          <div className="faq-card">
            <h3>회원가입이 안돼요</h3>
            <p>
              이메일 인증이 완료되지 않았을 수 있습니다.  
              인증 메일이 도착하지 않았다면 스팸함을 확인해주세요.
            </p>
          </div>
          <div className="faq-card">
            <h3>AI 분석이 느려요</h3>
            <p>
              이미지 용량이 큰 경우 분석 시간이 다소 길어질 수 있습니다.  
              3MB 이하 이미지를 권장합니다.
            </p>
          </div>
          <div className="faq-card">
            <h3>추천이 마음에 안 들어요</h3>
            <p>
              REVIA의 AI는 학습 데이터를 기반으로 추천을 제공합니다.  
              취향에 맞는 피드백을 주시면 더욱 개선됩니다.
            </p>
          </div>
        </div>

        {/* 문의 섹션 */}
        <div className="contact-box">
          <h2>문의하기</h2>
          <p>아래 내용을 입력하시면 담당자가 확인 후 연락드립니다.</p>
          <form className="contact-form">
            <input type="text" placeholder="이름" required />
            <input type="email" placeholder="이메일" required />
            <textarea placeholder="문의 내용을 입력하세요..." required></textarea>
            <button type="submit" className="btn">문의 보내기</button>
          </form>
        </div>
      </div>
    </section>
  );
}
