"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/** 베일을 아래로 갈수록 걷어내는 마스크 */
const FADE_DOWN =
  "linear-gradient(180deg, rgba(0,0,0,.97) 0%, rgba(0,0,0,.95) 34%, rgba(0,0,0,.8) 58%, rgba(0,0,0,.45) 78%, rgba(0,0,0,0) 100%)";

export type ParallaxProduct = {
  title: string;
  link: string;
  thumbnail: string;
};

export const HeroParallax = ({
  products,
  header,
  fade = true,
  veil,
  heightClass = "h-[300vh]",
  travelX = 1000,
  lift = [-700, 500],
  tilt = [15, 20],
}: {
  products: ParallaxProduct[];
  /** 상단 카피. 넘기지 않으면 기본 Header 를 쓴다. */
  header?: React.ReactNode;
  /** false 면 카드가 처음부터 불투명하다 — 카피와 겹칠 때 반투명하면 둘 다 흐려 보인다. */
  fade?: boolean;
  /** 카피가 놓이는 윗부분을 덮을 베일의 CSS background. 섹션 배경과 같은 값을 넘기면 자연스럽다. */
  veil?: string;
  /** 섹션 전체 높이. 기본값(300vh)은 스크롤이 길다. */
  heightClass?: string;
  /** 행이 좌우로 흐르는 거리(px). 크게 잡으면 카드가 화면 밖으로 빠져 빈 면이 생긴다. */
  travelX?: number;
  /** 카드 더미가 위아래로 움직이는 범위(px). */
  lift?: [number, number];
  /** 처음 기울기(도). 크게 잡으면 카드가 화면 밖으로 돌아나가 빈 면이 생긴다. [rotateX, rotateZ] */
  tilt?: [number, number];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, travelX]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -travelX]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [tilt[0], 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], fade ? [0.2, 1] : [1, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [tilt[1], 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], lift),
    springConfig
  );
  return (
    <div
      ref={ref}
      className={`${heightClass} pt-0 pb-24 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]`}
    >
      <div className="relative z-20">{header ?? <Header />}</div>
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="relative z-0"
      >
        <motion.div className="flex flex-row-reverse justify-center space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row justify-center mb-20 space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse justify-center space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* 카피가 놓이는 구간을 흰 베일로 덮는다. 위는 거의 불투명하고 아래로 갈수록 걷힌다 —
          카드가 사라지지 않으면서 글자만 또렷해진다. */}
      {veil && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[110vh]"
          style={{
            background: veil,
            /* 색은 섹션 배경 그대로 쓰고, 아래로 갈수록 마스크로 걷어낸다 */
            maskImage: FADE_DOWN,
            WebkitMaskImage: FADE_DOWN,
          }}
          aria-hidden
        />
      )}
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full  left-0 top-0">
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
        The Ultimate <br /> development studio
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
        We build beautiful products with the latest technologies and frameworks.
        We are a team of passionate developers and designers that love to build
        amazing products.
      </p>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: ParallaxProduct;
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-96 w-[30rem] relative flex-shrink-0"
    >
      <Link
        href={product.link}
        className="block group-hover/product:shadow-2xl "
      >
        <Image
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
        {product.title}
      </h2>
    </motion.div>
  );
};
