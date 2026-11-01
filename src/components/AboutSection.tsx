import React from 'react';
import { ArrowRight } from 'lucide-react';
interface AboutSectionProps { onStartCustomizing: () => void }
export const AboutSection: React.FC<AboutSectionProps> = ({ onStartCustomizing }) => <section className="page-width about-page">
  <p className="eyebrow">ABOUT ONLYFRAME / RESEARCH PROTOTYPE</p><h1>收藏，是喜歡的另一種表達。</h1>
  <p className="about-lead">一張小卡，可以是舞台上的心動、陪伴過你的角色，<br className="hidden sm:block" />也可以是一段想留下的遊戲回憶。</p>
  <div className="about-columns"><div><h2>給收藏一個日常的位置。</h2><p>ONLYFRAME 是收藏小卡客製化展示框的互動式研究原型，以 K-pop、動漫與遊戲收藏情境為出發點。從框色、文字，到背景與自由貼飾，讓使用者看見自己的設計選擇。</p><h2>從不同客製程度，探索使用體驗。</h2><p>本畢業專題探討客製化程度與收藏型消費者感受、價值感知及購買意願的關係。BASIC、CUSTOM、PREMIUM 三種方案維持不同的可調整權限，小卡上傳與即時預覽則是共同功能。</p></div><aside className="about-notice"><span className="eyebrow">PROTOTYPE NOTES</span><h2>關於這個研究原型</h2><p>本網站不進行實際販售。所有卡框畫面皆為概念效果示意，並非實體成品照片。</p><p>編輯器使用 85 × 115 mm 的示意外框與毫米座標。可設定小卡尺寸仍受原型範圍限制，實際適配性、材質、厚度、結構與製程均待打樣驗證。</p><p>網站展示標示為「設計範例」，不代表使用者投稿、評價或銷售紀錄。</p></aside></div>
  <button className="btn-primary mt-8" onClick={onStartCustomizing}>開始設計 <ArrowRight size={17} /></button>
</section>;
