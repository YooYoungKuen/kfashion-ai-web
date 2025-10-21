// =====================================================
// REVIA 홈 (Apple 감성 + 관성 스크롤 + 패럴랙스 + 광고 배너)
// =====================================================

import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import "./Home.css";

export default function Home() {
  const containerRef = useRef(null);

  // ✅ 스크롤 기반 패럴랙스
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.6]);
  const yVisual = useTransform(scrollYProgress, [0.2, 0.6], [100, 0]);
  const opacityVisual = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);

  // ✅ 관성 스크롤 효과
  useEffect(() => {
    const scrollContainer = containerRef.current;
    let current = 0;
    let target = 0;
    let ease = 0.08;

    const smoothScroll = () => {
      target = window.scrollY;
      current += (target - current) * ease;
      scrollContainer.style.transform = `translateY(-${current}px)`;
      requestAnimationFrame(smoothScroll);
    };

    const setBodyHeight = () => {
      document.body.style.height =
        scrollContainer.getBoundingClientRect().height + "px";
    };
    setBodyHeight();
    window.addEventListener("resize", setBodyHeight);

    requestAnimationFrame(smoothScroll);
    return () => window.removeEventListener("resize", setBodyHeight);
  }, []);

  return (
    <div className="scroll-wrapper" ref={containerRef}>
      {/* ---------------- HERO ---------------- */}
      <motion.section
        className="hero"
        style={{ y: yHero, opacity: opacityHero }}
      >
        <div className="hero-inner">
          <h1>
            <span>REVIA</span>
            <br />
            감각과 기술이 만나는 새로운 패션 인텔리전스
          </h1>
          <p>
            당신의 스타일은 데이터로 표현됩니다.
            <br />REVIA는 패션과 AI의 경계를 허물며 새로운 경험을 만듭니다.
          </p>
          <Link to="/recommend" className="hero-btn">
            나만의 코디 추천받기 →
          </Link>
        </div>
      </motion.section>

      {/* ---------------- VISUAL ---------------- */}
      <motion.section
        className="visual-wrapper"
        style={{ y: yVisual, opacity: opacityVisual }}
      >
        <img
          className="visual-image"
          src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600"
          alt="REVIA Visual"
        />
        <div className="visual-overlay" />
        <div className="visual-text">
          <h2>
            Beyond Fashion.
            <br />This is REVIA Intelligence.
          </h2>
          <p>감각을 기술로, 취향을 데이터로.</p>
        </div>
      </motion.section>

      {/* ---------------- FEATURE ---------------- */}
      <motion.section
        className="feature-section"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", duration: 1 }}
      >
        <div className="feature-grid">
          {[
            {
              num: "01",
              title: "AI 분석",
              desc: "이미지 속 색상, 패턴, 실루엣을 인식하고 당신만의 패션 언어로 표현합니다.",
            },
            {
              num: "02",
              title: "맞춤형 추천",
              desc: "AI가 취향과 트렌드를 학습해 당신에게 어울리는 코디를 제안합니다.",
            },
            {
              num: "03",
              title: "패션 인사이트",
              desc: "데이터 기반으로 새로운 패션 방향을 제시합니다.",
            },
          ].map((item) => (
            <motion.div
              key={item.num}
              className="feature-card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
            >
              <h3>{item.num}</h3>
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ---------------- 광고 배너 섹션 ---------------- */}
      <motion.section
        className="banner-section"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", duration: 1 }}
      >
        <div className="banner-grid">
          <div className="banner-card first">
            <div className="banner-content">
              <h2>신상 컬렉션 런칭</h2>
              <p>올겨울을 위한 트렌디한 무드, 지금 바로 만나보세요.</p>
              <button className="banner-btn">바로 보기 →</button>
            </div>
          </div>

          <div className="banner-card second">
            <div className="banner-content">
              <h2>AI 스타일 분석 이벤트</h2>
              <p>AI가 당신의 패션 DNA를 찾아드립니다.</p>
              <button className="banner-btn">참여하기 →</button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ---------------- CTA ---------------- */}
      <motion.section
        className="cta-section"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", duration: 1 }}
      >
        <h2>당신의 옷장에서, 새로운 가능성을</h2>
        <Link to="/recommend" className="cta-btn">
          REVIA 시작하기
        </Link>
      </motion.section>
    </div>
  );
}
